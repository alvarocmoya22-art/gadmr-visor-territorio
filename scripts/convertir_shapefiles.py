"""Convierte los shapefiles municipales a GeoJSON WGS84 para el visor web.

Todo llega en EPSG:32717 (UTM 17S). MapLibre necesita EPSG:4326.
"""
import io
import json
import geopandas as gpd

ORIGEN = r"C:/Users/alvar/OneDrive/INFORMACION RIOBAMBA/PROYECTO PLATAFORMA/PLATAFORMAS"
# Los barrios llegaron despues, actualizados y en su propia carpeta.
ORIGEN_BARRIOS = r"C:/Users/alvar/OneDrive/Escritorio/default/gis_barrios_urb"
# El levantamiento del entorno sustituye al inventario de equipamientos viejo:
# 1.094 registros con tipologia y uso segun la Tabla 3 del Codigo Urbano.
ORIGEN_ENTORNO = r"C:/Users/alvar/OneDrive/Escritorio/default/gis_levantamiento_entorno"
DESTINO = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"
LOG = []


def log(msg):
    LOG.append(msg)
    print(msg.encode("ascii", "replace").decode("ascii"))


def escribir(gdf, nombre, tolerancia_m=0):
    """Reproyecta a 4326, simplifica en metros y escribe GeoJSON compacto."""
    g = gdf.copy()
    if tolerancia_m:
        g["geometry"] = g.geometry.simplify(tolerancia_m)  # en metros: aun en UTM
    g = g.to_crs(4326)
    g["geometry"] = g.geometry.set_precision(1e-6)
    ruta = f"{DESTINO}/{nombre}.geojson"
    texto = g.to_json(drop_id=True, to_wgs84=True)
    # compactar: to_json ya es minificado
    io.open(ruta, "w", encoding="utf-8").write(texto)
    kb = len(texto.encode("utf-8")) / 1024
    log(f"  {nombre}.geojson  {len(g):4d} registros  {kb:7.1f} KB")
    return g


log("=== Conversion a GeoJSON WGS84 ===")

# --- Plataformas: division operativa del levantamiento
p = gpd.read_file(f"{ORIGEN}/PLATAFOR_CARGA.shp")
p = p.rename(columns={"No": "numero", "Nombre": "nombre", "Area": "area_ha"})
p["clave"] = p["nombre"].str.replace("PLATAFORMA ", "", regex=False)
p["area_ha_geom"] = (p.geometry.area / 10000).round(2)
# Punto interior garantizado (no el centroide, que puede caer fuera en formas
# concavas): ahi va el rotulo de la plataforma en el mapa.
rot = p.geometry.representative_point().to_crs(4326)
p["rotulo_lon"] = rot.x.round(6)
p["rotulo_lat"] = rot.y.round(6)
escribir(p[["numero", "clave", "nombre", "area_ha", "area_ha_geom",
            "rotulo_lon", "rotulo_lat", "geometry"]], "plataformas", 2)

# --- Parroquias urbanas
q = gpd.read_file(f"{ORIGEN}/PARROQUIAS_URB_CARGA.shp")
q = q.rename(columns={"Label": "nombre", "PARROQUIA": "clave", "AREA": "area_ha"})
escribir(q[["clave", "nombre", "area_ha", "geometry"]], "parroquias", 2)

# --- Barrios
b = gpd.read_file(f"{ORIGEN_BARRIOS}/barrios_urb_actualizado.shp")
b = b.rename(columns={"Barrio": "nombre", "AREA_HA_": "area_ha", "NUMERO": "numero",
                      "BARRIOS_14": "catastro_2014"})
b["nombre"] = b["nombre"].fillna("Sin nombre")
# El AREA_HA_ del shapefile no es de fiar: 17 barrios declaran los mismos
# 62,28 ha cuando miden entre 1 y 11. Se calcula de la geometria, como ya se
# hace con las plataformas, y el visor usa esa.
b["area_ha_geom"] = (b.geometry.area / 10000).round(2)
malos = int((b["area_ha"] - b["area_ha_geom"]).abs().gt(1).sum())
log(f"  barrios con area declarada fuera de sitio: {malos} de {len(b)}")
escribir(b[["numero", "nombre", "area_ha", "area_ha_geom", "catastro_2014", "geometry"]],
         "barrios", 3)

# --- Equipamientos: levantamiento del entorno
#
# Sustituye al inventario anterior de 291 registros. Lo importante no es que
# sean mas: es que trae `tipologia` (Barrial, Zonal, Cantonal) y `tipo_eleme`
# con los doce usos de la Tabla 3 del Codigo Urbano, asi que el radio de
# influencia se aplica al equipamiento que corresponde sin tener que deducirlo.
e = gpd.read_file(f"{ORIGEN_ENTORNO}/levantamiento_entorno.shp").to_crs(4326)
e = e.rename(columns={
    "tipo_eleme": "tipo",
    "elemento": "elemento",
    "nombre_equ": "nombre",
    "tipo_equip": "gestion",
    "tipologia": "tipologia",
    "estado": "estado",
    "plataforma": "plataforma_dec",
    "parroquia_": "parroquia",
    "observacio": "observaciones",
    "globalid": "id",
})

# Tres registros llegaron con coordenadas imposibles —latitud -90 y longitudes
# de 107 y 132—, que son fallos de captura del GPS. No se pueden ubicar, asi
# que se descartan y se listan en el log para que se corrijan en origen.
e["lon"] = e.geometry.x
e["lat"] = e.geometry.y
fuera = ~e["lon"].between(-79.2, -78.3) | ~e["lat"].between(-2.2, -1.4)
if fuera.any():
    log(f"  equipamientos con coordenadas fuera del canton: {int(fuera.sum())} (descartados)")
    for _, r in e[fuera].iterrows():
        log(f"      {r['nombre'][:40]:42} {r['lon']:12.5f} {r['lat']:11.5f}  [{r['tipo']}]")
e = e[~fuera].copy()

# Varios equipamientos comparten posicion exacta: en un parque se levanta un
# punto de referencia y se le cuelgan la casa comunal, las canchas y la parada.
# Es legitimo, pero conviene saber cuantos son porque inflan la densidad.
coubicados = int(e.duplicated(subset=["lon", "lat"], keep=False).sum())
if coubicados:
    log(f"  equipamientos que comparten posicion con otro: {coubicados}")

# Registros de prueba que quedaron en la capa oficial. Se detectan por el
# nombre exacto o por una observacion que empieza por «prueba»; no vale con
# buscar la palabra suelta porque «Salon del Reino de los tesTIGOs de Jehova»
# contiene «test» y es un equipamiento real.
_nom = e["nombre"].fillna("").astype(str).str.strip().str.lower()
_obs = e["observaciones"].fillna("").astype(str).str.strip().str.lower()
ensayo = _nom.eq("prueba") | _obs.str.startswith("prueba") | _obs.eq("xxxxx")
if ensayo.any():
    log(f"  registros de prueba descartados: {int(ensayo.sum())}")
    for _, r in e[ensayo].iterrows():
        log(f"      {str(r['nombre'])[:30]:32} [{r['tipo']}]  obs: {str(r['observaciones'])[:24]}")
    e = e[~ensayo].copy()

e["nombre"] = e["nombre"].fillna("").astype(str).str.strip()
for c in ("tipo", "tipologia", "gestion", "estado", "elemento", "parroquia"):
    e[c] = e[c].fillna("").astype(str).str.strip()
e["observaciones"] = e["observaciones"].fillna("").astype(str).str.strip()

log(f"  usos: {e['tipo'].nunique()} · tipologias: {sorted(t for t in e['tipologia'].unique() if t)}")
escribir(
    e[["id", "nombre", "tipo", "elemento", "tipologia", "gestion", "estado",
       "parroquia", "observaciones", "geometry"]],
    "equipamientos",
)

io.open(f"{DESTINO}/../../_conversion.log", "w", encoding="utf-8").write("\n".join(LOG))
log("listo")
