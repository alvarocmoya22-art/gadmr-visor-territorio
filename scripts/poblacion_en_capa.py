"""Le pega la poblacion del Censo 2022 a cualquier capa de poligonos.

    python scripts/poblacion_en_capa.py mi_capa.geojson

Escribe al lado `mi_capa_con_poblacion.geojson` con tres columnas mas:
`poblacion`, `viviendas` y `densidad_hab_km2`. Lo demas de la tabla viaja
intacto. El archivo de salida se puede soltar directo en CHASKI.

Es el mismo metodo con el que se calculo la poblacion de los barrios y las
plataformas que ya publica el visor, asi que las cifras cuadran entre si: si
alguien suma por barrio y suma por esta capa, los totales hablan de lo mismo.

Metodo: reparto dasimetrico por edificios.

    poblacion del sector / edificios del sector = poblacion por edificio
    edificio -> poligono que lo contiene
    poligono = suma de sus edificios

Repartir proporcional al area supone que la gente esta esparcida por igual
dentro del sector, y no lo esta: un sector de borde urbano es mitad manzanas y
mitad terreno vacio. Los 95.232 puntos de edificio de la Geodatabase dicen
donde hay construccion, asi que la poblacion va donde hay con que habitarla.

Los sectores sin ningun edificio caen al reparto por area, que para ellos es
lo unico disponible; el informe final dice cuanta poblacion se repartio asi.

POR QUE SECTORES Y NO BARRIOS. Los sectores cubren el canton entero —260.882
habitantes—; los barrios urbanos solo el casco, 172.885. Con una capa que
asome al area rural, ir por barrios devolveria ceros que parecen un dato.

LA CAPA SE LEE, NO SE COPIA. La de sectores del INEC no entra en el
repositorio: sus condiciones de uso son de copyright y esto es publico. Lo que
sale de aqui es un derivado agregado sobre la capa de quien lo corra, con la
fuente citada en el propio archivo.

Fuentes, ambas del INEC:
  - Geodatabase Nacional 2024, canton 0601 (EPSG:31992), capa edif_p
  - Sectores anonimizados con indicadores del Censo 2022 (EPSG:32717)
"""
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import geopandas as gpd
import pandas as pd

SECTORES = r"C:/Users/alvar/Downloads/CapaSectores/sectores_anonimizados.gpkg"
GDB = r"C:/Users/alvar/Downloads/0601_RIOBAMBA/0601_riobamba.gpkg"
CANTON = "0601"
M = 32717  # el mismo CRS metrico que usan las capas municipales


def log(msg):
    print(msg.encode("ascii", "replace").decode("ascii"))


def main(entrada: Path, salida: Path, capa: str | None) -> None:
    log("=== Poblacion en capa  ·  Censo 2022, reparto por edificios ===")

    # ------------------------------------------------------------ la capa
    suya = gpd.read_file(entrada, layer=capa) if capa else gpd.read_file(entrada)
    if suya.crs is None:
        # Sin CRS no hay forma de saber que mide cada coordenada. Se asume
        # WGS84 porque es lo que trae un GeoJSON, y se dice en voz alta: si la
        # capa venia en UTM, el resultado seria basura silenciosa.
        log("  AVISO: la capa no declara CRS; se asume EPSG:4326 (WGS84).")
        suya = suya.set_crs(4326)
    original_crs = suya.crs
    log(f"  capa: {len(suya)} rasgos  ·  {original_crs.to_string()}")

    areas = suya.geom_type.value_counts().to_dict()
    log(f"  geometrias: {areas}")
    if not suya.geom_type.isin(["Polygon", "MultiPolygon"]).any():
        log("")
        log("  ERROR: esta capa no trae poligonos, y la poblacion se reparte")
        log("  por area. Una capa de puntos o de lineas no tiene dentro.")
        sys.exit(1)

    suya = suya.to_crs(M)
    suya["_fid"] = range(len(suya))

    # Poligonos que se pisan: un edificio caeria en los dos y la poblacion se
    # contaria dos veces. No se arregla solo, asi que se avisa con nombre.
    unidos = suya.geometry.union_all()
    if abs(suya.geometry.area.sum() - unidos.area) > 1.0:
        solape = suya.geometry.area.sum() - unidos.area
        log("")
        log(f"  AVISO: los poligonos se solapan en {solape/10000:,.1f} ha.")
        log("  Un edificio dentro de dos poligonos suma en los dos, asi que el")
        log("  total de esta capa saldra por encima de la poblacion real.")

    # ------------------------------------------------------------ sectores
    sec = gpd.read_file(SECTORES, where=f"canton='{CANTON}'").to_crs(M)
    sec = sec.reset_index(drop=True)
    sec["sec_id"] = sec.index
    pob_canton = float(sec["pob_t"].sum())
    log(f"  sectores del canton {CANTON}: {len(sec)}  ·  {pob_canton:,.0f} hab")

    # ----------------------------------------------------------- edificios
    edif = gpd.read_file(GDB, layer="edif_p").to_crs(M)
    # La capa viene como MULTIPOINT; para un punto por edificio basta el
    # representativo, que en un multipunto de un solo vertice es ese vertice.
    edif["geometry"] = edif.geometry.representative_point()
    log(f"  edificios: {len(edif):,}")

    edif = gpd.sjoin(
        edif[["geometry"]], sec[["sec_id", "geometry"]], how="left", predicate="within"
    ).drop(columns="index_right")
    edif = edif.dropna(subset=["sec_id"])

    por_sector = edif.groupby("sec_id").size().rename("n_edif")
    sec = sec.join(por_sector, on="sec_id")
    sec["n_edif"] = sec["n_edif"].fillna(0).astype(int)

    vacios = sec[sec["n_edif"] == 0]
    log(
        f"  sectores sin edificios: {len(vacios)}"
        f"  ·  {vacios['pob_t'].sum():,.0f} hab al reparto por area"
    )

    sec["pob_edif"] = sec["pob_t"] / sec["n_edif"].where(sec["n_edif"] > 0)
    sec["viv_edif"] = sec["v_pres"] / sec["n_edif"].where(sec["n_edif"] > 0)
    edif = edif.merge(sec[["sec_id", "pob_edif", "viv_edif"]], on="sec_id", how="left")

    # ------------------------------------------- cada edificio, a su poligono
    dentro = gpd.sjoin(
        edif, suya[["_fid", "geometry"]], how="left", predicate="within"
    ).drop(columns="index_right")

    agg = (
        dentro.dropna(subset=["_fid"])
        .groupby("_fid")
        .agg(
            poblacion=("pob_edif", "sum"),
            viviendas=("viv_edif", "sum"),
            edificios=("pob_edif", "size"),
        )
    )

    # ------------------------------ sectores sin edificios, repartidos por area
    if len(vacios):
        trozos = gpd.overlay(
            vacios[["sec_id", "pob_t", "v_pres", "geometry"]],
            suya[["_fid", "geometry"]],
            how="intersection",
            keep_geom_type=True,
        )
        if len(trozos):
            sup = vacios.set_index("sec_id").geometry.area
            trozos["frac"] = trozos.geometry.area / trozos["sec_id"].map(sup)
            extra = trozos.groupby("_fid").apply(
                lambda g: pd.Series(
                    {
                        "poblacion": (g["pob_t"] * g["frac"]).sum(),
                        "viviendas": (g["v_pres"] * g["frac"]).sum(),
                        "edificios": 0,
                    }
                )
            )
            agg = agg.add(extra, fill_value=0)
            log(
                f"  repartidos por area: {extra['poblacion'].sum():,.0f} hab"
                f" en {len(extra)} rasgos"
            )

    # ---------------------------------------------------------------- pegar
    suya = suya.join(agg, on="_fid")

    # A lo que no le cayo ningun edificio NO se le pone cero: un cero afirma
    # «aqui no vive nadie», y lo que pasa puede ser que el poligono este fuera
    # del canton, donde no hay sectores que repartir.
    con = suya["poblacion"].notna()
    suya.loc[con, "poblacion"] = suya.loc[con, "poblacion"].round().astype("Int64")
    suya.loc[con, "viviendas"] = suya.loc[con, "viviendas"].round().astype("Int64")
    km2 = suya.geometry.area / 1e6
    suya["densidad_hab_km2"] = (suya["poblacion"] / km2.where(km2 > 0)).round()

    suya = suya.drop(columns=["_fid", "edificios"], errors="ignore")
    suya = suya.to_crs(original_crs)
    suya.to_file(salida, driver="GeoJSON")

    # --------------------------------------------------------------- cuadre
    total = float(agg["poblacion"].sum())
    log("")
    log(f"  poblacion del canton   : {pob_canton:>12,.0f}")
    log(f"  asignada a esta capa   : {total:>12,.0f}  ({total/pob_canton*100:.1f} %)")
    log(f"  rasgos con poblacion   : {int(con.sum()):>12,}  de {len(suya):,}")
    sin = len(suya) - int(con.sum())
    if sin:
        log(f"  rasgos sin ningun dato : {sin:>12,}  (quedan vacios, no a cero)")
    log("")
    log(f"  {salida.name}")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log(__doc__.split("\n\n")[1].strip())
        sys.exit(1)
    entrada = Path(sys.argv[1])
    if not entrada.exists():
        log(f"no existe: {entrada}")
        sys.exit(1)
    destino = (
        Path(sys.argv[2])
        if len(sys.argv) > 2
        else entrada.with_name(f"{entrada.stem}_con_poblacion.geojson")
    )
    main(entrada, destino, sys.argv[3] if len(sys.argv) > 3 else None)
