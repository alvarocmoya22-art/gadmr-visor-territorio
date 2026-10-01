# -*- coding: utf-8 -*-
"""Extrae la edificación de OpenStreetMap para verla en tres dimensiones.

Riobamba está inusualmente bien mapeada en esto: de los 7.004 edificios del
área urbana, 5.516 —el 79 %— traen `building:levels` o `height`. Con esa
proporción el volumen que se dibuja se parece a la ciudad real y no es un
bloque plano de seis metros repetido; por debajo de la mitad no habría valido
la pena.

El archivo sale de aquí y no se consulta en vivo, igual que el resto de capas:
el visor sigue siendo estático. Y se carga solo cuando alguien enciende la capa,
igual que la red peatonal, porque son dos megas que no tiene por qué descargar
quien no los va a usar.

Volver a correrlo cuando el levantamiento en campo haya añadido edificación:

    python scripts/edificios_osm.py
"""
import io
import json
import time
import urllib.error
import urllib.request

from shapely.geometry import shape
from shapely.ops import unary_union

DESTINO = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"

# Los mismos espejos que usa el visor, y por el mismo motivo: el principal se
# cae a ratos y overpass.osm.ch solo sirve Suiza, que no es un detalle menor.
ESPEJOS = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

#: Altura de un piso, en metros.
#:
#: Tres metros es la planta corriente en Riobamba. Solo se usa para los que
#: declaran pisos y no altura, que son la mayoria: es una conversion declarada,
#: no una medida.
METROS_POR_PISO = 3.0

#: Altura de un edificio sin dato, en metros.
#:
#: Un piso bajo. Es a proposito el minimo creible: asi lo que no se sabe se ve
#: raso y no compite con lo que si esta medido. Dibujarlo a la media de la
#: ciudad seria inventar volumen donde solo hay una huella.
ALTURA_SIN_DATO = 3.0

LOG = []


def log(msg):
    LOG.append(msg)
    print(msg.encode("ascii", "replace").decode("ascii"))


def consultar(consulta, intentos=3):
    """Pregunta a Overpass, rotando espejos y reintentando."""
    ultimo = None
    for intento in range(intentos):
        for espejo in ESPEJOS:
            try:
                pedido = urllib.request.Request(
                    espejo,
                    data=consulta.encode("utf-8"),
                    headers={"User-Agent": "gadmr-visor-territorio/0.1 (GADM Riobamba)"},
                )
                with urllib.request.urlopen(pedido, timeout=300) as r:
                    return json.loads(r.read().decode("utf-8"))
            except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
                ultimo = f"{espejo}: {e}"
                log(f"  espejo sin respuesta ({e.__class__.__name__}), probando otro")
        time.sleep(5 * (intento + 1))
    raise RuntimeError(f"Overpass no respondio en ningun espejo. Ultimo: {ultimo}")


def altura_de(etiquetas):
    """Metros de alto, y de donde sale el dato."""
    bruto = (etiquetas.get("height") or "").strip().replace(",", ".")
    if bruto:
        try:
            # «12 m» y «12» son los dos corrientes; lo demas no se adivina.
            n = float(bruto.split()[0])
            if 1 <= n <= 200:
                return round(n, 1), "altura"
        except ValueError:
            pass
    pisos = (etiquetas.get("building:levels") or "").strip().replace(",", ".")
    if pisos:
        try:
            n = float(pisos)
            if 1 <= n <= 60:
                return round(n * METROS_POR_PISO, 1), "pisos"
        except ValueError:
            pass
    return ALTURA_SIN_DATO, "sin dato"


log("=== Edificacion de OpenStreetMap ===")

limites = json.load(open(f"{DESTINO}/plataformas.geojson", encoding="utf-8"))
urbano = unary_union([shape(f["geometry"]) for f in limites["features"]])
oeste, sur, este, norte = urbano.bounds
caja = f"{sur:.5f},{oeste:.5f},{norte:.5f},{este:.5f}"
log(f"  caja del urbano: {caja}")

datos = consultar(
    f'[out:json][timeout:600];way["building"]({caja});out geom;'
)
sello = datos.get("osm3s", {}).get("timestamp_osm_base", "")
log(f"  base OSM al {sello}")

rasgos = []
fuentes = {"altura": 0, "pisos": 0, "sin dato": 0}
fuera = 0
for e in datos.get("elements", []):
    geom = e.get("geometry") or []
    if len(geom) < 4:
        continue
    anillo = [[round(p["lon"], 6), round(p["lat"], 6)] for p in geom]
    if anillo[0] != anillo[-1]:
        anillo.append(anillo[0])

    # La caja es un rectangulo y las plataformas no: lo que cae entre medias es
    # suelo rural que no toca a este visor.
    centro = (
        sum(p[0] for p in anillo[:-1]) / (len(anillo) - 1),
        sum(p[1] for p in anillo[:-1]) / (len(anillo) - 1),
    )
    if not urbano.contains(shape({"type": "Point", "coordinates": centro})):
        fuera += 1
        continue

    etiquetas = e.get("tags", {})
    altura, fuente = altura_de(etiquetas)
    fuentes[fuente] += 1
    rasgos.append(
        {
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [anillo]},
            "properties": {
                "altura": altura,
                # Para poder decir en pantalla que esta medido y que es relleno.
                "medido": fuente != "sin dato",
                "clase": etiquetas.get("building", "yes"),
            },
        }
    )

log(f"  edificios dentro de las plataformas: {len(rasgos):,}  (fuera de ellas: {fuera:,})")
log(f"     con altura declarada: {fuentes['altura']:,}")
log(f"     con pisos declarados: {fuentes['pisos']:,}")
log(f"     sin dato, a {ALTURA_SIN_DATO:.0f} m: {fuentes['sin dato']:,}")
medidos = fuentes["altura"] + fuentes["pisos"]
if rasgos:
    log(f"     o sea, {medidos / len(rasgos) * 100:.0f} % con volumen real")

salida = {
    "type": "FeatureCollection",
    "sello": sello,
    "features": rasgos,
}
texto = json.dumps(salida, ensure_ascii=False, separators=(",", ":"))
io.open(f"{DESTINO}/edificios.geojson", "w", encoding="utf-8").write(texto)
log(f"  edificios.geojson  {len(rasgos):,} registros  {len(texto.encode('utf-8')) / 1024 / 1024:.2f} MB")
