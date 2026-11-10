"""La cobertura del suelo del canton, para el visor.

    python scripts/cobertura_suelo.py <carpeta 01_cobertura_worldcover>

Escribe:
    public/datos/cobertura_2021.png    la imagen, ya coloreada y en Mercator
    public/datos/cobertura_2021.json   los limites, la leyenda y las cifras

DE DONDE SALE. ESA WorldCover 2021 v200, de la Agencia Espacial Europea, a 10 m
y a partir de Sentinel-1 y Sentinel-2. Licencia CC BY 4.0, citando «© ESA
WorldCover project 2021». La paleta y los rotulos se leen del `.qml` que
acompana al raster, no se escriben aqui: si manana cambian ahi, cambian aqui.

NO HAY QUE RASTERIZAR NADA: ya es un raster. Lo que hacia falta era publicarlo
de forma que un navegador lo pueda dibujar, porque un GeoTIFF no lo abre
ninguno.

POR QUE UNA IMAGEN Y NO TESELAS. La edificacion fueron teselas porque son
166.530 objetos y el navegador solo necesita los que mira. Aqui es al reves: es
UNA superficie continua que cubre el canton entero y se mira entera. Una imagen
suelta con sus cuatro esquinas es todo lo que hace falta, y MapLibre la coloca
sin pedir nada mas.

SE REPROYECTA A MERCATOR ANTES DE EXPORTAR. La fuente esta en UTM 17S y el mapa
dibuja en Mercator; una imagen en UTM colocada por sus cuatro esquinas se
deforma por dentro, y la mancha construida quedaria desplazada respecto a las
calles. Reproyectada, las esquinas bastan y lo de dentro cae donde debe.

SE REMUESTREA AL VECINO MAS CERCANO, nunca promediando. Los valores son
codigos de clase: la media entre «bosque» (10) y «cultivos» (40) daria 25, que
es «arbustal», una clase que no estaba ahi. Y se limita el ancho a 4.096 px
porque por encima de eso hay telefonos que no pueden con la textura.

LAS CIFRAS POR UNIDAD SON LO QUE DE VERDAD SE BUSCA. Saber que el canton es
47,8 % herbazal no cambia ninguna decision; saber que parte de una plataforma
concreta esta construida, si. Se cruza el raster con las plataformas y con las
parroquias contando pixeles, que a 10 m es exacto de sobra.
"""
import json
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def _proj_propio() -> None:
    """Que GDAL use SU copia de PROJ y no la de PostgreSQL.

    En esta maquina `PROJ_LIB` y `GDAL_DATA` apuntan a lo que instalo
    PostgreSQL con PostGIS, y esa base de PROJ es de una version anterior:
    GDAL la lee, no la entiende y falla con «DATABASE.LAYOUT.VERSION.MINOR = 2
    whereas a number >= 6 is expected» en cuanto se pide una reproyeccion.

    No se tocan las variables del sistema —PostgreSQL las necesita tal como
    estan—: se cambian solo para este proceso y antes de importar rasterio,
    porque GDAL las lee una vez al cargarse.
    """
    import site

    for paquete, variables in (("rasterio", ("PROJ_LIB", "PROJ_DATA")),):
        for raiz in site.getsitepackages():
            datos = Path(raiz) / paquete / "proj_data"
            if datos.is_dir():
                for v in variables:
                    os.environ[v] = str(datos)
                gdal = Path(raiz) / paquete / "gdal_data"
                if gdal.is_dir():
                    os.environ["GDAL_DATA"] = str(gdal)
                return


_proj_propio()

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
ANCHO_MAX = 4096


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def leer_paleta(qml: Path) -> dict:
    """La paleta y los rotulos, del propio .qml de QGIS."""
    raiz = ET.parse(qml).getroot()
    paleta = {}
    for e in raiz.iter("paletteEntry"):
        paleta[int(e.get("value"))] = {
            "color": e.get("color"),
            "rotulo": e.get("label"),
        }
    return paleta


def main(carpeta: Path) -> None:
    import numpy as np
    import rasterio
    from rasterio.warp import calculate_default_transform, reproject, Resampling
    from PIL import Image
    import geopandas as gpd
    from rasterio.features import rasterize

    tif = carpeta / "worldcover_2021_riobamba_10m.tif"
    qml = carpeta / "worldcover_2021_riobamba_10m.qml"
    for r in (tif, qml):
        if not r.exists():
            log(f"no existe {r}")
            sys.exit(1)

    log("=== Cobertura del suelo · ESA WorldCover 2021 ===")
    paleta = leer_paleta(qml)
    log(f"  paleta leida del .qml: {len(paleta)} clases")

    with rasterio.open(tif) as src:
        log(f"  origen: {src.width} x {src.height} px  ·  {abs(src.transform.a):.0f} m  ·  {src.crs.to_string()}")

        # ------------------------------------------------- cifras, en el CRS metrico
        banda = src.read(1)
        px_m2 = abs(src.transform.a) * abs(src.transform.e)
        total_px = int((banda != 0).sum())

        unidades = {}
        for clave, archivo, campo in (
            ("plataformas", "plataformas.geojson", "clave"),
            ("parroquias", "parroquias_canton.geojson", "nombre"),
        ):
            ruta = BASE / archivo
            if not ruta.exists():
                log(f"  falta {archivo}; se salta esa escala")
                continue
            capa = gpd.read_file(ruta).to_crs(src.crs)
            filas = []
            for _, f in capa.iterrows():
                mascara = rasterize(
                    [(f.geometry, 1)], out_shape=banda.shape,
                    transform=src.transform, fill=0, dtype="uint8",
                )
                dentro = banda[(mascara == 1) & (banda != 0)]
                if dentro.size == 0:
                    continue
                v, c = np.unique(dentro, return_counts=True)
                filas.append({
                    "nombre": str(f[campo]),
                    "ha": round(float(dentro.size * px_m2 / 10000), 1),
                    "clases": {
                        int(a): round(float(b / dentro.size * 100), 1)
                        for a, b in zip(v.tolist(), c.tolist())
                    },
                })
            filas.sort(key=lambda u: -u["clases"].get(50, 0))
            unidades[clave] = filas
            log(f"  {clave}: {len(filas)} unidades cruzadas")
            for u in filas[:3]:
                log(f"      {u['nombre']:<24} construido {u['clases'].get(50, 0):>5.1f} %")

        v, c = np.unique(banda[banda != 0], return_counts=True)
        canton = {
            int(a): {
                "ha": round(float(b * px_m2 / 10000), 1),
                "pct": round(float(b / total_px * 100), 2),
            }
            for a, b in zip(v.tolist(), c.tolist())
        }

        # ------------------------------------------------ la imagen, en Mercator
        escala = min(1.0, ANCHO_MAX / src.width)
        destino_crs = "EPSG:3857"
        tr, ancho, alto = calculate_default_transform(
            src.crs, destino_crs, src.width, src.height, *src.bounds,
        )
        if ancho > ANCHO_MAX:
            k = ANCHO_MAX / ancho
            ancho, alto = int(ancho * k), int(alto * k)
            tr = rasterio.Affine(tr.a / k, tr.b, tr.c, tr.d, tr.e / k, tr.f)
        salida = np.zeros((alto, ancho), dtype="uint8")
        reproject(
            source=banda, destination=salida,
            src_transform=src.transform, src_crs=src.crs,
            dst_transform=tr, dst_crs=destino_crs,
            resampling=Resampling.nearest,  # son códigos de clase, no medidas
            src_nodata=0, dst_nodata=0,
        )
        log(f"  imagen: {ancho} x {alto} px  ·  {abs(tr.a):.1f} m por pixel en Mercator")

        oeste, norte = tr * (0, 0)
        este, sur = tr * (ancho, alto)

    # --------------------------------------------------------- a color
    rgba = np.zeros((alto, ancho, 4), dtype="uint8")
    for valor, d in paleta.items():
        h = d["color"].lstrip("#")
        m = salida == valor
        rgba[m, 0], rgba[m, 1], rgba[m, 2] = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        rgba[m, 3] = 255
    sin = int((salida == 0).sum())
    log(f"  pixeles sin clase, transparentes: {sin:,}  ({sin / salida.size * 100:.0f} %)")

    BASE.mkdir(parents=True, exist_ok=True)
    png = BASE / "cobertura_2021.png"
    Image.fromarray(rgba, "RGBA").save(png, optimize=True)

    # Las cuatro esquinas en lon/lat, que es lo que pide MapLibre.
    from pyproj import Transformer
    t = Transformer.from_crs(destino_crs, 4326, always_xy=True)
    (lo, la) = t.transform(oeste, norte)
    (le, ls) = t.transform(este, sur)

    ficha = {
        "fuente": "ESA WorldCover 2021 v200 · 10 m · Sentinel-1 y Sentinel-2",
        "licencia": "CC BY 4.0 · © ESA WorldCover project 2021",
        "imagen": "datos/cobertura_2021.png",
        # En el orden que pide MapLibre: arriba-izq, arriba-der, abajo-der, abajo-izq.
        "esquinas": [[lo, la], [le, la], [le, ls], [lo, ls]],
        "paleta": {str(k): v for k, v in paleta.items()},
        "canton": {str(k): v for k, v in canton.items()},
        "unidades": unidades,
    }
    (BASE / "cobertura_2021.json").write_text(
        json.dumps(ficha, ensure_ascii=False), encoding="utf-8")

    log()
    log(f"  cobertura_2021.png   {png.stat().st_size / 1024:,.0f} KB")
    log(f"  cobertura_2021.json  {(BASE / 'cobertura_2021.json').stat().st_size / 1024:,.0f} KB")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log("uso: python scripts/cobertura_suelo.py <carpeta 01_cobertura_worldcover>")
        sys.exit(1)
    main(Path(sys.argv[1]))
