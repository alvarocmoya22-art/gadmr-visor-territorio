"""Construye el índice de calles que usa el buscador del visor.

Descarga de OpenStreetMap las vías con nombre del cantón, agrupa los segmentos
por nombre y calcula, con geometría real, por qué plataformas y barrios pasa
cada calle. El resultado va a `public/datos/calles.json`.

Se precalcula, en vez de resolverlo en el navegador, por dos razones: la
geometría completa son 2 MB que nadie necesita descargar para buscar un nombre,
y el cruce calle-plataforma sale más fiable con intersección real de líneas y
polígonos que aproximándolo en JavaScript.

Uso:
    python scripts/indexar_calles.py            # descarga de Overpass
    python scripts/indexar_calles.py cache.json # reutiliza una descarga previa

Conviene volver a correrlo cada cierto tiempo: las calles de OSM cambian.
"""
import io
import json
import sys
import unicodedata
import urllib.request

import geopandas as gpd
from shapely.geometry import LineString

RAIZ = __file__.rsplit("scripts", 1)[0].rstrip("/\\")
DESTINO = f"{RAIZ}/public/datos/calles.json"
PLATAFORMAS = f"{RAIZ}/public/datos/plataformas.geojson"
BARRIOS = f"{RAIZ}/public/datos/barrios.geojson"
AREA_OVERPASS = 3600108867

CONSULTA = f"""[out:json][timeout:300];
area({AREA_OVERPASS})->.rio;
way["highway"]["name"](area.rio);
out tags geom;"""

# Nombres que en OSM marcan «esta via no tiene nombre». No son calles que
# alguien vaya a buscar, y ensucian el listado: solo «Calle Sin Nombre»
# aparece 155 veces. Ojo: NO se filtra por longitud, porque en Riobamba hay
# calles reales que se llaman Cuba, Loja, Roma, Napo o Tena.
MARCADORES_SIN_NOMBRE = {
    "calle sin nombre", "callejon sin nombre", "calle urbana", "sin nombre",
    "s.n.", "s/n", "sn", "no tiene", "no tiene nombre", "no hay nombre",
    "nose", "no se puede responder", "avenida principal", "carretera menor",
    "carretero menor", "carreteros menor", "carretera lateral menor",
    "camino", "camino rural", "linea de camino", "ub", "y", "esquinera",
    "partidero", "garaje institucional", "via", "pasaje",
}


def normalizar(s: str) -> str:
    """Minúsculas y sin tildes, para comparar nombres escritos de varias formas."""
    s = unicodedata.normalize("NFKD", s.strip().lower())
    return "".join(c for c in s if not unicodedata.combining(c))


def es_nombre_util(nombre: str) -> bool:
    return normalizar(nombre) not in MARCADORES_SIN_NOMBRE


def descargar() -> dict:
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=CONSULTA.encode("utf-8"),
        headers={"Content-Type": "text/plain;charset=UTF-8"},
    )
    with urllib.request.urlopen(req, timeout=420) as r:
        return json.loads(r.read().decode("utf-8"))


def main() -> None:
    if len(sys.argv) > 1:
        datos = json.load(io.open(sys.argv[1], encoding="utf-8"))
        print(f"OSM leido de {sys.argv[1]}")
    else:
        datos = descargar()
        print("OSM descargado de Overpass")

    sello = datos.get("osm3s", {}).get("timestamp_osm_base")

    # Un registro por segmento; los segmentos de una misma calle se unen luego.
    filas, descartados = [], 0
    for e in datos["elements"]:
        nombre = (e.get("tags") or {}).get("name")
        geom = e.get("geometry")
        if not nombre or not geom or len(geom) < 2:
            continue
        if not es_nombre_util(nombre):
            descartados += 1
            continue
        filas.append(
            {
                "nombre": nombre.strip(),
                "clase": (e.get("tags") or {}).get("highway", ""),
                "geometry": LineString([(p["lon"], p["lat"]) for p in geom]),
            }
        )

    calles = gpd.GeoDataFrame(filas, geometry="geometry", crs=4326)
    print(f"segmentos utiles: {len(calles)} (descartados por nombre-marcador: {descartados})")

    plataformas = gpd.read_file(PLATAFORMAS)[["clave", "geometry"]]
    barrios = gpd.read_file(BARRIOS)[["nombre", "geometry"]].rename(
        columns={"nombre": "barrio"}
    )

    # Intersección real: una calle larga cruza varias plataformas y hay que
    # nombrarlas todas, no quedarse con una.
    en_plataforma = gpd.sjoin(calles, plataformas, how="left", predicate="intersects")
    en_barrio = gpd.sjoin(calles, barrios, how="left", predicate="intersects")

    plat_por_fila: dict[int, set[str]] = {}
    for i, clave in zip(en_plataforma.index, en_plataforma["clave"]):
        if isinstance(clave, str):
            plat_por_fila.setdefault(i, set()).add(clave)
    barrio_por_fila: dict[int, set[str]] = {}
    for i, b in zip(en_barrio.index, en_barrio["barrio"]):
        if isinstance(b, str):
            barrio_por_fila.setdefault(i, set()).add(b)

    # Agrupar por nombre
    porNombre: dict[str, dict] = {}
    for i, fila in calles.iterrows():
        n = fila["nombre"]
        reg = porNombre.setdefault(
            n,
            {"n": n, "p": set(), "b": set(), "clases": set(), "segmentos": 0, "geoms": []},
        )
        reg["p"] |= plat_por_fila.get(i, set())
        reg["b"] |= barrio_por_fila.get(i, set())
        if fila["clase"]:
            reg["clases"].add(fila["clase"])
        reg["segmentos"] += 1
        reg["geoms"].append(fila["geometry"])

    salida = []
    for reg in porNombre.values():
        union = gpd.GeoSeries(reg["geoms"], crs=4326).union_all()
        o, s, e, nte = union.bounds
        centro = union.interpolate(0.5, normalized=True)  # punto sobre la propia via
        salida.append(
            {
                "n": reg["n"],
                "p": sorted(reg["p"]),
                "b": sorted(reg["b"]),
                "c": [round(centro.x, 6), round(centro.y, 6)],
                "bb": [round(o, 6), round(s, 6), round(e, 6), round(nte, 6)],
                "s": reg["segmentos"],
            }
        )
    salida.sort(key=lambda r: normalizar(r["n"]))

    io.open(DESTINO, "w", encoding="utf-8").write(
        json.dumps(
            {"generado": sello, "calles": salida}, ensure_ascii=False, separators=(",", ":")
        )
    )
    kb = len(io.open(DESTINO, encoding="utf-8").read().encode("utf-8")) / 1024
    print(f"calles indexadas: {len(salida)}  ->  {DESTINO}  ({kb:.0f} KB)")
    sin_plataforma = sum(1 for r in salida if not r["p"])
    print(f"  sin plataforma (zona rural): {sin_plataforma}")
    print(f"  que cruzan 2+ plataformas:   {sum(1 for r in salida if len(r['p']) > 1)}")


if __name__ == "__main__":
    main()
