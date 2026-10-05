"""Población del Censo 2022 repartida a los barrios del GADM.

Produce `public/datos/poblacion.json`: los totales por barrio y por plataforma,
nada más. La capa de sectores del INEC NO se copia al proyecto ni se publica;
sus condiciones de uso son de copyright y el repositorio es público. Lo que
viaja al visor es un derivado estadístico agregado, con la fuente citada.

Método: reparto dasimétrico por edificios.

    población del sector ÷ edificios del sector = población por edificio
    edificio → barrio que lo contiene
    barrio = suma de sus edificios

Repartir proporcional al área supone que la gente está esparcida por igual
dentro del sector, y no lo está: un sector de borde urbano es mitad manzanas y
mitad terreno vacío. Los 95.232 puntos de edificio de la Geodatabase dicen
dónde hay construcción, así que la población va donde hay con qué habitarla.

Los sectores sin ningún edificio caen al reparto por área, que para ellos es
lo único disponible; el informe final dice cuánta población se repartió así.

Fuentes, ambas del INEC:
  - Geodatabase Nacional 2024, cantón 0601 (EPSG:31992), capa edif_p
  - Sectores anonimizados con indicadores del Censo 2022 (EPSG:32717)
"""
import io
import json
import warnings

warnings.filterwarnings("ignore")
import geopandas as gpd
import pandas as pd

SECTORES = r"C:/Users/alvar/Downloads/CapaSectores/sectores_anonimizados.gpkg"
GDB = r"C:/Users/alvar/Downloads/0601_RIOBAMBA/0601_riobamba.gpkg"
BASE = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"
CANTON = "0601"
M = 32717  # el mismo CRS métrico que usan las capas municipales


def log(msg):
    print(msg.encode("ascii", "replace").decode("ascii"))


log("=== Poblacion por barrio · Censo 2022 ===")

# ---------------------------------------------------------------- sectores
sec = gpd.read_file(SECTORES, where=f"canton='{CANTON}'").to_crs(M)
sec = sec.reset_index(drop=True)
sec["sec_id"] = sec.index
log(f"  sectores del canton {CANTON}: {len(sec)}  ·  {sec['pob_t'].sum():,.0f} hab")

# ---------------------------------------------------------------- edificios
edif = gpd.read_file(GDB, layer="edif_p").to_crs(M)
# La capa viene como MULTIPOINT; para un punto por edificio basta el
# representativo, que en un multipunto de un solo vertice es ese vertice.
edif["geometry"] = edif.geometry.representative_point()
log(f"  edificios: {len(edif):,}")

# Cada edificio hereda el sector que lo contiene.
edif = gpd.sjoin(edif[["geometry"]], sec[["sec_id", "geometry"]], how="left", predicate="within")
edif = edif.drop(columns="index_right")
sin_sector = int(edif["sec_id"].isna().sum())
edif = edif.dropna(subset=["sec_id"])
log(f"  edificios fuera de todo sector: {sin_sector:,} (se descartan)")

por_sector = edif.groupby("sec_id").size().rename("n_edif")
sec = sec.join(por_sector, on="sec_id")
sec["n_edif"] = sec["n_edif"].fillna(0).astype(int)

vacios = sec[sec["n_edif"] == 0]
log(f"  sectores sin edificios: {len(vacios)}  ·  {vacios['pob_t'].sum():,.0f} hab al reparto por area")

# Habitantes que representa cada edificio de su sector.
sec["pob_edif"] = sec["pob_t"] / sec["n_edif"].where(sec["n_edif"] > 0)
sec["viv_edif"] = sec["v_pres"] / sec["n_edif"].where(sec["n_edif"] > 0)
sec["pobsb_edif"] = sec["pob_serv_b"] / sec["n_edif"].where(sec["n_edif"] > 0)

edif = edif.merge(
    sec[["sec_id", "pob_edif", "viv_edif", "pobsb_edif"]], on="sec_id", how="left"
)

# ---------------------------------------------------------------- barrios
barrios = gpd.read_file(f"{BASE}/barrios.geojson").to_crs(M)
plataformas = gpd.read_file(f"{BASE}/plataformas.geojson").to_crs(M)
log(f"  barrios: {len(barrios)}  ·  plataformas: {len(plataformas)}")

# Cada rasgo es un barrio, y se identifica por su posicion en el archivo.
#
# Agrupar por nombre era un error: nueve nombres estan repetidos en la capa
# —dos «24 DE MAYO», dos «LA MERCED», dos «SAN FRANCISCO»...— y son barrios
# distintos, de 600 m a 5 km unos de otros. Al agruparlos, los dos recibian una
# sola cifra de poblacion y el visor la mostraba dos veces. `numero` tampoco
# vale de clave: dieciseis barrios comparten el 183.
#
# El visor hace lo mismo y lee esta misma posicion, asi que si se regenera
# `barrios.geojson` hay que regenerar tambien este archivo.
barrios["nombre"] = barrios["nombre"].fillna("Sin nombre")
barrios["bid"] = range(len(barrios))

edif_barrio = gpd.sjoin(
    edif, barrios[["bid", "nombre", "geometry"]], how="left", predicate="within"
).drop(columns="index_right")

agg = (
    edif_barrio.dropna(subset=["bid"])
    .groupby("bid")
    .agg(
        pob=("pob_edif", "sum"),
        viv=("viv_edif", "sum"),
        pob_serv_b=("pobsb_edif", "sum"),
        edificios=("pob_edif", "size"),
    )
)

# --------------------------------- sectores sin edificios, repartidos por area
if len(vacios):
    trozos = gpd.overlay(
        vacios[["sec_id", "pob_t", "v_pres", "pob_serv_b", "geometry"]],
        barrios[["bid", "geometry"]],
        how="intersection",
        keep_geom_type=True,
    )
    if len(trozos):
        areas = vacios.set_index("sec_id").geometry.area
        trozos["frac"] = trozos.geometry.area / trozos["sec_id"].map(areas)
        extra = trozos.groupby("bid").apply(
            lambda g: pd.Series(
                {
                    "pob": (g["pob_t"] * g["frac"]).sum(),
                    "viv": (g["v_pres"] * g["frac"]).sum(),
                    "pob_serv_b": (g["pob_serv_b"] * g["frac"]).sum(),
                    "edificios": 0,
                }
            )
        )
        agg = agg.add(extra, fill_value=0)
        log(f"  repartidos por area: {extra['pob'].sum():,.0f} hab en {len(extra)} barrios")

# ---------------------------------------------------------------- plataformas
edif_plat = gpd.sjoin(
    edif, plataformas[["clave", "geometry"]], how="left", predicate="within"
).drop(columns="index_right")
por_plat = (
    edif_plat.dropna(subset=["clave"])
    .groupby("clave")
    .agg(pob=("pob_edif", "sum"), viv=("viv_edif", "sum"))
)

nombres = dict(zip(barrios["bid"], barrios["nombre"]))

# ---------------------------------------------------------------- cuadre
pob_canton = float(sec["pob_t"].sum())
pob_barrios = float(agg["pob"].sum())
pob_urbano = float(por_plat["pob"].sum())
log("")
log(f"  poblacion del canton       : {pob_canton:>12,.0f}")
log(f"  asignada a algun barrio    : {pob_barrios:>12,.0f}  ({pob_barrios/pob_canton*100:.1f} %)")
log(f"  dentro de alguna plataforma: {pob_urbano:>12,.0f}  ({pob_urbano/pob_canton*100:.1f} %)")

salida = {
    "fuente": "INEC · Censo de Poblacion y Vivienda 2022, sectores censales anonimizados",
    "metodo": "reparto dasimetrico por edificios de la Geodatabase Nacional 2024 (INEC)",
    "canton": {"pob": round(pob_canton), "sectores": len(sec)},
    # La clave es la posicion del barrio en `barrios.geojson`; el nombre va
    # dentro solo para poder leer el archivo a ojo.
    "barrios": {
        str(int(bid)): {
            "nombre": nombres.get(int(bid), ""),
            "pob": round(r["pob"]),
            "viv": round(r["viv"]),
            "pobServB": round(r["pob_serv_b"]),
            "edificios": int(r["edificios"]),
        }
        for bid, r in agg.iterrows()
        if round(r["pob"]) > 0
    },
    "plataformas": {
        c: {"pob": round(r["pob"]), "viv": round(r["viv"])} for c, r in por_plat.iterrows()
    },
}

ruta = f"{BASE}/poblacion.json"
texto = json.dumps(salida, ensure_ascii=False, separators=(",", ":"))
io.open(ruta, "w", encoding="utf-8").write(texto)
log(f"\n  poblacion.json  {len(salida['barrios'])} barrios  {len(texto)/1024:.1f} KB")
log("listo")
