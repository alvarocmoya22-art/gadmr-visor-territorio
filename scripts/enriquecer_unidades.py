"""Le pega a cada unidad del territorio lo que hay encima y lo que hay construido.

    python scripts/enriquecer_unidades.py <08_alturas_pisos> <01_cobertura_worldcover>

Anade columnas a las capas de plataformas, barrios, parroquias y clasificacion
del suelo que el visor ya publica. No crea capas nuevas: las que hay pasan a
traer mas que decir.

POR QUE ASI Y NO COMO CAPAS SUELTAS. CHASKI lee GeoJSON, shapefile y CSV: ni
teselas ni rasteres. La cobertura del suelo es una imagen y ahi no entra nunca;
la edificacion 2023 entraria, pero son 88.462 poligonos y 26,5 MB solo del
area urbana, frente a los 15 MB del catastro, que ya es la capa mas pesada del
catalogo. CHASKI carga el archivo entero en memoria y le corre geometria
encima: publicar eso no seria un favor.

Lo que de verdad se analiza no es cada edificio ni cada pixel, es el agregado
por unidad —cuanto de esta plataforma esta construido, cuanto volumen tiene
levantado, de cuantos pisos—. Eso cabe en unas columnas, se filtra, se pinta y
se cruza, que es justo lo que CHASKI sabe hacer.

QUE SE ANADE:

    cob_construido_pct   % de la unidad que WorldCover ve como construido
    cob_cultivos_pct     % de cultivos
    cob_bosque_pct       % de bosque
    cob_herbazal_pct     % de herbazal y pastizal
    edif_n               edificaciones con altura dentro
    edif_volumen_m3      suma de huella por altura
    edif_pisos_medio     media de pisos estimados
    edif_techo_m2        suma de huella por pisos: superficie de piso

LAS COLUMNAS SE PIERDEN SI SE REGENERA LA CAPA. `clasificacion_suelo.py` y el
reparto de poblacion reescriben estos mismos archivos, asi que este script va
DESPUES de ellos, no antes. Si una capa sale sin estas columnas, es que se
regenero y hay que volver a pasar por aqui.

NINGUNA DE LAS DOS FUENTES ES CARTOGRAFIA OFICIAL. WorldCover es un modelo
sobre Sentinel a 10 m; las alturas, un modelo sobre imagenes con error tipico
de 1,5 a 2 m. Sirven para comparar unidades entre si y para priorizar, no para
certificar nada de un predio. Las dos son CC BY 4.0.
"""
import json
import os
import sys
from pathlib import Path


def _proj_propio() -> None:
    """Que GDAL use SU copia de PROJ y no la de PostgreSQL.

    En esta maquina `PROJ_LIB` y `GDAL_DATA` apuntan a lo que instalo
    PostgreSQL con PostGIS, de una version anterior, y GDAL falla al
    reproyectar. Se cambian solo para este proceso.
    """
    import site

    for raiz in site.getsitepackages():
        datos = Path(raiz) / "rasterio" / "proj_data"
        if datos.is_dir():
            os.environ["PROJ_LIB"] = os.environ["PROJ_DATA"] = str(datos)
            gdal = Path(raiz) / "rasterio" / "gdal_data"
            if gdal.is_dir():
                os.environ["GDAL_DATA"] = str(gdal)
            return


_proj_propio()

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
M = 32717

# Las capas que reciben columnas. Solo unidades grandes: un pixel de WorldCover
# mide 10 m y la manzana mediana 48 m2, asi que por manzana serian cinco
# pixeles y el porcentaje no diria nada.
CAPAS = ["plataformas.geojson", "barrios.geojson", "parroquias_canton.geojson",
         "clasificacion_suelo.geojson"]

COBERTURA = {10: "bosque", 20: "arbustal", 30: "herbazal", 40: "cultivos",
             50: "construido", 60: "desnudo", 70: "nieve", 80: "agua", 90: "humedal"}
PUBLICAN = ("construido", "cultivos", "bosque", "herbazal")

# Minimo de pixeles para que un porcentaje signifique algo.
#
# Veinticinco pixeles de 10 m son 2.500 m2. Por debajo de eso el reparto lo
# decide un pixel suelto: en la clasificacion del suelo hay once astillas que
# deja el recorte entre urbano y rural —la menor, 0,01 ha, un solo pixel— y
# cinco salian «100 % construido» sin una sola edificacion dentro. Eso no es
# una medicion, es el tamano de la celda. Esas unidades se quedan sin
# porcentaje, vacias y no en cero, y el informe dice cuantas son.
MINIMO_PX = 25


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def main(alturas: Path, cobertura: Path) -> None:
    import geopandas as gpd
    import numpy as np
    import rasterio
    from rasterio.features import rasterize

    tif = cobertura / "worldcover_2021_riobamba_10m.tif"
    shp = alturas / "edificaciones_altura_pisos_2023.shp"
    for r in (tif, shp):
        if not r.exists():
            log(f"no existe {r}")
            sys.exit(1)

    log("=== Lo que hay encima y lo que hay construido, por unidad ===")

    edif = gpd.read_file(shp)
    edif = edif[edif["confiab"] != "sin dato"].to_crs(M)
    edif["_vol"] = edif["area_m2"] * edif["alt_med_m"]
    edif["_techo"] = edif["area_m2"] * edif["pisos_est"]
    puntos = edif.copy()
    puntos["geometry"] = puntos.geometry.representative_point()
    log(f"  edificaciones con altura: {len(edif):,}")

    with rasterio.open(tif) as src:
        banda = src.read(1)
        tr, forma, crs_r = src.transform, banda.shape, src.crs
    log(f"  cobertura: {forma[1]} x {forma[0]} px a 10 m")
    log()

    for archivo in CAPAS:
        ruta = BASE / archivo
        if not ruta.exists():
            log(f"  falta {archivo}; se salta")
            continue
        capa = gpd.read_file(ruta)
        crs0 = capa.crs
        met = capa.to_crs(crs_r)

        cols = {f"cob_{c}_pct": [] for c in PUBLICAN}
        cols.update({"edif_n": [], "edif_volumen_m3": [],
                     "edif_pisos_medio": [], "edif_techo_m2": []})

        dentro = gpd.sjoin(puntos, met[["geometry"]], how="left", predicate="within")
        porUnidad = dentro.groupby("index_right")
        chicas: list[float] = []

        for i, f in met.iterrows():
            # --- cobertura: se cuentan pixeles, que a 10 m es exacto de sobra
            masc = rasterize([(f.geometry, 1)], out_shape=forma, transform=tr,
                             fill=0, dtype="uint8")
            px = banda[(masc == 1) & (banda != 0)]
            if px.size >= MINIMO_PX:
                v, c = np.unique(px, return_counts=True)
                reparto = {COBERTURA.get(int(a), "otro"): b / px.size * 100
                           for a, b in zip(v.tolist(), c.tolist())}
                for c in PUBLICAN:
                    cols[f"cob_{c}_pct"].append(round(float(reparto.get(c, 0.0)), 1))
            else:
                chicas.append(float(f.geometry.area / 10000))
                for c in PUBLICAN:
                    cols[f"cob_{c}_pct"].append(None)

            # --- edificacion
            if i in porUnidad.groups:
                g = porUnidad.get_group(i)
                cols["edif_n"].append(int(len(g)))
                cols["edif_volumen_m3"].append(int(round(float(g["_vol"].sum()))))
                cols["edif_pisos_medio"].append(round(float(g["pisos_est"].mean()), 2))
                cols["edif_techo_m2"].append(int(round(float(g["_techo"].sum()))))
            else:
                # Sin edificaciones dentro no es cero construido: es que no hay
                # ninguna detectada. Se deja vacio, como el resto del proyecto.
                cols["edif_n"].append(0)
                for k in ("edif_volumen_m3", "edif_pisos_medio", "edif_techo_m2"):
                    cols[k].append(None)

        for k, v in cols.items():
            capa[k] = v
        capa = capa.to_crs(crs0)
        capa.to_file(ruta, driver="GeoJSON", COORDINATE_PRECISION=6)

        top = capa.nlargest(3, "cob_construido_pct")
        nombre = "nombre" if "nombre" in capa.columns else capa.columns[0]
        log(f"  {archivo:<30} {len(capa):>3} unidades  ·  {ruta.stat().st_size/1024:>7,.0f} KB")
        if chicas:
            log(f"      sin porcentaje por ser menores de {MINIMO_PX} pixeles: "
                f"{len(chicas)}  (la menor, {min(chicas):.2f} ha)")
        for _, u in top.iterrows():
            log(f"      {str(u[nombre])[:24]:<24} construido {u['cob_construido_pct']:>5.1f} %"
                f"  ·  {u['edif_n']:>6,} edif")

    log()
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        log("uso: python scripts/enriquecer_unidades.py <08_alturas_pisos> <01_cobertura_worldcover>")
        sys.exit(1)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
