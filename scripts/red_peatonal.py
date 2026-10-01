"""Grafo de la red caminable de Riobamba, para calcular isócronas.

El visor mide en línea recta, y por calle siempre se anda más: una manzana
cerrada, una quebrada o una vía sin acera convierten 400 m de radio en 700 m
de recorrido. Con este grafo, el alcance de un equipamiento deja de ser un
círculo y pasa a ser por dónde se puede llegar de verdad.

Qué produce: `public/datos/red.json`, con los nodos de decisión —cruces y
extremos— y las aristas que los unen, cada una con su longitud real y su
polilínea para poder dibujarla.

Los vértices intermedios de una calle no son nodos del grafo: no se decide
nada en ellos. Colapsarlos reduce el grafo a la mitad sin perder ni un metro,
porque la longitud de la arista sigue siendo la de la polilínea completa.

Se descarga del mismo Overpass que el resto del visor, con la misma lista de
espejos y el mismo reintento: el primero se cae a ratos.
"""
import io
import json
import math
import time
import urllib.request
from collections import Counter, defaultdict

DESTINO = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"

# Caja del área urbana con margen: las isócronas de un equipamiento del borde
# salen del área, y cortar el grafo en el límite las dejaría truncadas.
CAJA = (-1.73, -78.72, -1.60, -78.58)

ESPEJOS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

# Vías por las que se puede caminar. Se dejan fuera las de coche puro
# —motorway, trunk y sus enlaces— porque nadie va andando por ahí y meterlas
# daría alcances que no existen.
CAMINABLES = (
    "footway|path|pedestrian|steps|living_street|residential|unclassified"
    "|service|tertiary|secondary|primary|track|road"
)

CONSULTA = f"""[out:json][timeout:180];
way["highway"~"^({CAMINABLES})$"]({CAJA[0]},{CAJA[1]},{CAJA[2]},{CAJA[3]});
out geom;"""


def log(msg):
    print(msg.encode("ascii", "replace").decode("ascii"))


def descargar() -> dict:
    ultimo = None
    for intento in range(1, 4):
        for url in ESPEJOS:
            try:
                t0 = time.time()
                req = urllib.request.Request(
                    url,
                    data=CONSULTA.encode("utf-8"),
                    headers={
                        "Content-Type": "text/plain;charset=UTF-8",
                        "User-Agent": "gadmr-visor-territorio/1.0",
                    },
                )
                crudo = urllib.request.urlopen(req, timeout=240).read()
                log(f"  {url.split('/')[2]}: {len(crudo) / 1048576:.1f} MB en {time.time() - t0:.0f} s")
                return json.loads(crudo)
            except Exception as e:  # noqa: BLE001
                ultimo = e
                log(f"  {url.split('/')[2]} no respondio: {str(e)[:60]}")
        time.sleep(4)
    raise SystemExit(f"Ningun espejo respondio. Ultimo error: {ultimo}")


def metros(a, b) -> float:
    """Distancia equirectangular; a escala de manzana sobra de precisa."""
    rad = math.pi / 180
    x = (b[0] - a[0]) * rad * math.cos((a[1] + b[1]) / 2 * rad)
    y = (b[1] - a[1]) * rad
    return math.sqrt(x * x + y * y) * 6371000


log("=== Red caminable de Riobamba ===")
datos = descargar()
vias = [e for e in datos.get("elements", []) if e.get("geometry")]
log(f"  vias: {len(vias):,}  vertices: {sum(len(v['geometry']) for v in vias):,}")

# ── nodos de decisión: los que comparten dos o más vías, más los extremos
apariciones = Counter()
for v in vias:
    for p in v["geometry"]:
        apariciones[(round(p["lon"], 6), round(p["lat"], 6))] += 1

decision = set()
for v in vias:
    g = v["geometry"]
    for i, p in enumerate(g):
        c = (round(p["lon"], 6), round(p["lat"], 6))
        if i == 0 or i == len(g) - 1 or apariciones[c] > 1:
            decision.add(c)

log(f"  nodos de decision: {len(decision):,} de {len(apariciones):,} vertices distintos")

indice: dict[tuple, int] = {}
nodos: list[list[float]] = []


def id_de(c: tuple) -> int:
    if c not in indice:
        indice[c] = len(nodos)
        nodos.append([c[0], c[1]])
    return indice[c]


# ── aristas: tramos de vía entre dos nodos de decisión
aristas: list[list] = []
for v in vias:
    g = [(round(p["lon"], 6), round(p["lat"], 6)) for p in v["geometry"]]
    inicio = 0
    for i in range(1, len(g)):
        if g[i] not in decision:
            continue
        tramo = g[inicio : i + 1]
        largo = sum(metros(tramo[k], tramo[k + 1]) for k in range(len(tramo) - 1))
        if largo > 0 and tramo[0] != tramo[-1]:
            aristas.append(
                [
                    id_de(tramo[0]),
                    id_de(tramo[-1]),
                    round(largo, 1),
                    [[round(x, 5), round(y, 5)] for x, y in tramo],
                ]
            )
        inicio = i

# ── cuántos trozos sueltos hay: si la red está partida, una isócrona puede
# quedarse encerrada en su isla sin que se note.
vecinos = defaultdict(list)
for a, b, *_ in aristas:
    vecinos[a].append(b)
    vecinos[b].append(a)

visto = set()
islas = []
for n in range(len(nodos)):
    if n in visto:
        continue
    pila, tam = [n], 0
    visto.add(n)
    while pila:
        x = pila.pop()
        tam += 1
        for y in vecinos[x]:
            if y not in visto:
                visto.add(y)
                pila.append(y)
    islas.append(tam)
islas.sort(reverse=True)
log(f"  aristas: {len(aristas):,}")
log(f"  componentes conexas: {len(islas)} · la mayor tiene {islas[0]:,} nodos ({islas[0]/len(nodos)*100:.1f} %)")
if len(islas) > 1:
    log(f"  trozos sueltos: {len(islas)-1}, el mayor de {islas[1]:,} nodos")

salida = {
    "fuente": "OpenStreetMap, vias caminables del area urbana de Riobamba",
    "caja": list(CAJA),
    "nodos": nodos,
    "aristas": aristas,
}
ruta = f"{DESTINO}/red.json"
texto = json.dumps(salida, separators=(",", ":"))
io.open(ruta, "w", encoding="utf-8").write(texto)
log(f"\n  red.json  {len(texto)/1048576:.2f} MB")
log("listo")
