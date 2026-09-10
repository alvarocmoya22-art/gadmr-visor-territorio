"""Convierte los shapefiles municipales a GeoJSON WGS84 para el visor web.

Todo llega en EPSG:32717 (UTM 17S). MapLibre necesita EPSG:4326.
"""
import io
import json
import geopandas as gpd

ORIGEN = r"C:/Users/alvar/OneDrive/INFORMACION RIOBAMBA/PROYECTO PLATAFORMA/PLATAFORMAS"
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
b = gpd.read_file(f"{ORIGEN}/BARRIOS_CARGA.shp")
b = b.rename(columns={"Barrio": "nombre", "AREA_HA_": "area_ha", "NUMERO": "numero",
                      "BARRIOS_14": "catastro_2014"})
b["nombre"] = b["nombre"].fillna("Sin nombre")
escribir(b[["numero", "nombre", "area_ha", "catastro_2014", "geometry"]], "barrios", 3)

# --- Equipamientos municipales (se descarta `path`: rutas del disco del autor)
e = gpd.read_file(f"{ORIGEN}/EQUIPAMIENTOS_CARGA.shp")
e = e.rename(columns={"nam": "nombre", "equipa": "tipo", "decr": "subtipo",
                      "barrio": "barrio", "layer": "capa_origen"})
e["nombre"] = e["nombre"].fillna(e["name"]).fillna("")
e["tipo"] = e["tipo"].str.strip().str.replace(r"\s*/\s*", " / ", regex=True)
escribir(e[["id", "nombre", "tipo", "subtipo", "barrio", "capa_origen", "geometry"]], "equipamientos")

io.open(f"{DESTINO}/../../_conversion.log", "w", encoding="utf-8").write("\n".join(LOG))
log("listo")
