# -*- coding: utf-8 -*-
"""Trae los proyectos del tablero de la Jefatura de Diseño de la Obra Pública.

Origen: https://gadmr-phdu.github.io/Proyectos/, que lee una tabla de Supabase
con clave publicable y RLS. Aquí se lee la misma tabla y se deja una foto en
`public/datos/proyectos.geojson`, igual que el resto de capas del visor: el
visor sigue siendo estático y no depende de que ese servicio esté en pie.

El tablero cambia con cada reforma presupuestaria —hoy va por la novena—, así
que esto se vuelve a correr cuando haga falta y el GeoJSON se actualiza.

Lo importante no es traer los 36 registros, que es trivial, sino decidir cuáles
**crean alcance de equipamiento** y cuáles no. Un adoquinado, un colector o una
consultoría son inversión real y no mueven ni un metro la cobertura de un
parque o de una escuela; meterlos en el análisis de alcance lo falsearía. Esa
decisión vive en `CLASIFICACION`, a la vista y editable, y lo que no esté ahí
sale marcado para que alguien lo clasifique en vez de colarse con un valor por
omisión.
"""
import io
import json
import re
import urllib.request

import geopandas as gpd
import pandas as pd

# La clave publicable del tablero: la misma que sirve su propia página, apta
# para lectura con RLS activo. No es un secreto y no abre nada que no esté ya
# publicado.
SUPABASE = "https://vpihwoyucfkqocytmfbn.supabase.co"
CLAVE = "sb_publishable_OBZbkKmVFjNIw7NFAT-9Yw_Dek3133m"

DESTINO = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"

# Las coordenadas del tablero vienen en UTM 17S, como todo lo municipal.
CRS_ORIGEN = 32717

#: Qué es cada proyecto y a qué escala sirve, por número de ítem.
#:
#: `uso` y `tipologia` son los de la Tabla 3 del Código Urbano, para que el
#: radio de influencia salga de la ordenanza y no de un criterio propio.
#:
#: `escala` es la distinción que de verdad decide si un proyecto entra en el
#: análisis de alcance:
#:
#:   «proximidad»  Equipamiento al que se va andando desde la casa. Es lo único
#:                 que tiene sentido medir con una isócrona por plataforma, y lo
#:                 único que suma alcance.
#:   «ciudad»      Dotación de escala cantonal: el cementerio general, el centro
#:                 de rescate animal, un centro de privación de libertad. Son
#:                 equipamiento y son inversión, pero sirven al cantón entero y
#:                 nadie los usa a diario a pie. Medirlos por alcance peatonal
#:                 de plataforma diría poco y engañaría bastante.
#:   None          No es equipamiento: vialidad, redes, estudios, consultorías.
#:
#: De ahí sale `aporta`, que es lo que el visor consulta.
CLASIFICACION = {
    28: ("Recreativo y Deporte", "Zonal", "proximidad", "Parque nuevo de 10.357 m²"),
    37: ("Recreativo y Deporte", "Barrial", "proximidad", "Parque de barrio nuevo"),
    4: ("Recreativo y Deporte", "Zonal", "proximidad", "Boulevard: espacio público nuevo"),
    27: ("Cultural", "Cantonal", "proximidad", "Equipamiento cultural nuevo, 5.425 m²"),
    26: ("Cultural", "Zonal", "proximidad", "Equipamiento cultural nuevo, 1.500 m²"),
    8: ("Recreativo y Deporte", "Zonal", "proximidad", "La Matilde: se habilita el espacio exterior"),
    3: ("Cultural", "Zonal", "proximidad", "Espacios cívico-culturales (Pluma y León Dormido)"),
    5: ("Servicios Funerarios", "Cantonal", "ciudad", "Cementerio general: dotación de todo el cantón"),
    32: ("Especial", "Cantonal", "ciudad", "Centro de rescate animal: dotación de todo el cantón"),
    9: ("Especial", "Cantonal", "ciudad", "Centro de privación de libertad: escala provincial"),
    2: ("Recreativo y Deporte", "Barrial", None, "Mejora parques que ya están inventariados"),
    31: ("Cultural", "Cantonal", None, "Readecuación de algo que ya existe"),
    1: (None, None, None, "Alcantarillado: red, no equipamiento"),
    6: (None, None, None, "Vialidad"),
    7: (None, None, None, "Vialidad"),
    30: (None, None, None, "Consultoría: todavía no es obra"),
    36: (None, None, None, "Estudio eléctrico"),
    38: (None, None, None, "Estudio: despiece de un monumento"),
}

#: Icono de cada proyecto en el mapa.
#:
#: El color del punto ya dice si el proyecto crea alcance o no; el icono dice
#: **de que obra se trata**, que es la otra pregunta que uno se hace al ver un
#: punto en el mapa. Son dos lecturas distintas y por eso van en dos canales
#: distintos.
#:
#: Cuando el proyecto esta clasificado, el icono sale de su uso, que es dato. En
#: los que no lo estan sale de una regla sobre el nombre, y eso es una pista
#: visual, no un hecho: por eso de aqui no sale ninguna cifra. Equivocar el
#: icono de un adoquinado rural despista un segundo; equivocar `aporta` falsea
#: un analisis, y por eso esa decision sigue siendo explicita y a mano.
PALABRAS_ICONO = [
    (("adoquinado", "asfaltado", "vial", "bordillo", "puente", "rehabilitacion urbana", "calle"), "via"),
    (("alcantarillado", "colector", "drenaje", "agua"), "red"),
    (("consultoria", "estudio", "estudios", "despiece", "disenos"), "estudio"),
    (("cancha", "estadio", "graderio", "coliseo", "cubierta", "vestidores", "cerramiento"), "deporte"),
    (("cementerio", "boveda"), "funerario"),
    (("mercado", "centro turistico", "bateria"), "otro"),
]


def sin_tildes(t):
    import unicodedata

    return "".join(
        c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn"
    )


def icono_de(nombre, uso, escala):
    texto = sin_tildes(nombre)
    # El cementerio antes que nada: es dotacion de ciudad y ademas tiene icono
    # propio, y con el orden al reves saldria como un edificio cualquiera.
    if "cementerio" in texto or "boveda" in texto:
        return "funerario"
    if escala == "ciudad":
        return "dotacion"
    if uso == "Cultural":
        return "cultura"
    if uso == "Recreativo y Deporte":
        return "deporte" if any(p in texto for p in ("cancha", "estadio", "graderio", "coliseo")) else "parque"
    for palabras, icono in PALABRAS_ICONO:
        if any(p in texto for p in palabras):
            return icono
    return "otro"


LOG = []


def log(msg):
    LOG.append(msg)
    print(msg.encode("ascii", "replace").decode("ascii"))


def traer():
    """Lee la tabla completa del tablero."""
    url = f"{SUPABASE}/rest/v1/proyectos?select=*&limit=1000"
    pedido = urllib.request.Request(
        url, headers={"apikey": CLAVE, "Authorization": f"Bearer {CLAVE}"}
    )
    with urllib.request.urlopen(pedido, timeout=60) as r:
        return json.load(r)


def numero(v):
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    return n if n else None


# Riobamba en UTM 17S. Sirve para distinguir una abscisa de una ordenada y para
# descartar lo que no puede estar en el canton.
CAJA_UTM = (730000, 9780000, 790000, 9840000)


def sitios(bruto_x, bruto_y):
    """Saca los puntos de los campos de coordenadas, que no traen un solo par.

    El tablero guarda las coordenadas como texto libre, y ahi aparecen tres
    cosas distintas:

      - Un par suelto, que es el caso facil.
      - Varios sitios rotulados —«PLUMA 759315.77» y debajo «LEON DORMIDO
        758864.39»—, porque un proyecto puede intervenir en dos plazas a la vez.
        Cada sitio es un punto propio: medirlos como uno solo pondria la mitad
        de la obra donde no esta.
      - Los vertices de un trazado o de un predio, sin rotulo. Ahi no hay varios
        sitios, hay una geometria: se representa por su centro.

    Devuelve una lista de `(rotulo, x, y)`, ya con la abscisa y la ordenada en
    su sitio aunque vengan cambiadas, que tambien pasa.
    """
    tx, ty = str(bruto_x or ""), str(bruto_y or "")
    nx = [float(n) for n in re.findall(r"-?\d+\.?\d*", tx) if float(n)]
    ny = [float(n) for n in re.findall(r"-?\d+\.?\d*", ty) if float(n)]
    if not nx or len(nx) != len(ny):
        return []

    # Un rótulo es una línea con letras: «PLUMA», «LEÓN DORMIDO», «LA MADRE».
    rotulos = [r.strip() for r in re.findall(r"(?m)^\s*([^\W\d_][^\d\r\n]{1,40})\s*$", tx)]
    pares = []
    for i, (a, b) in enumerate(zip(nx, ny)):
        # La ordenada en UTM 17S sur pasa de nueve millones y la abscisa no, asi
        # que no hace falta creerse la etiqueta de la columna para ordenarlas.
        x, y = (a, b) if b > a else (b, a)
        if not (CAJA_UTM[0] <= x <= CAJA_UTM[2] and CAJA_UTM[1] <= y <= CAJA_UTM[3]):
            continue
        pares.append((rotulos[i] if i < len(rotulos) else "", x, y))

    if not pares:
        return []
    # Sin rotulos y con varios puntos no son sitios distintos: son los vertices
    # de una misma cosa, y lo que corresponde es su centro.
    if len(pares) > 1 and not any(r for r, _, _ in pares):
        cx = sum(x for _, x, _ in pares) / len(pares)
        cy = sum(y for _, _, y in pares) / len(pares)
        return [("", cx, cy)]
    return pares


log("=== Proyectos de la Jefatura de Diseno de la Obra Publica ===")
filas = traer()
log(f"  tabla leida: {len(filas)} proyectos")

con_xy = []
sin_xy = []
varios = 0
for p in filas:
    puntos = sitios(p.get("coordenadas_x"), p.get("coordenadas_y"))
    if len(puntos) > 1:
        varios += 1
    uso, tipologia, escala, nota = CLASIFICACION.get(p["item"], (None, None, None, ""))
    comun = {
        "item": p["item"],
        "proyecto": (p.get("proyecto") or "").strip(),
        "categoria": p.get("categoria"),
        "parroquia": (p.get("parroquia") or "").strip().upper(),
        "monto": numero(p.get("monto")),
        "estado": p.get("estado_dashboard"),
        "uso": uso,
        "tipologia": tipologia,
        "escala": escala,
        "icono": icono_de((p.get("proyecto") or ""), uso, escala),
        # Solo lo de proximidad suma alcance peatonal.
        "aporta": escala == "proximidad",
        "nota": nota,
        "clasificado": p["item"] in CLASIFICACION,
    }
    if not puntos:
        sin_xy.append({**comun, "sitio": ""})
        continue
    for rotulo, x, y in puntos:
        con_xy.append({**comun, "sitio": rotulo, "x": x, "y": y})

if varios:
    log(f"  proyectos con mas de un sitio: {varios}, cada sitio va como punto propio")
if sin_xy:
    log(f"  SIN COORDENADA: {len(sin_xy)}, no se pueden ubicar")
    for p in sin_xy:
        log(f"     item {p['item']:>2}  {p['parroquia']:<12} {p['proyecto'][:58]}")

# Los rurales no entran en el analisis por plataforma, asi que no clasificarlos
# no cuesta nada; los urbanos si, y por eso se listan uno a uno.
# Por item y no por punto: un proyecto con dos sitios se clasifica una vez.
vistos = set()
sin_clasificar = []
for p in con_xy + sin_xy:
    if p["clasificado"] or p["item"] in vistos:
        continue
    vistos.add(p["item"])
    sin_clasificar.append(p)
URBANAS = {"RIOBAMBA", "LIZARZABURU", "VELASCO", "MALDONADO", "VELOZ", "YARUQUIES"}
urbanos_sin = [p for p in sin_clasificar if p["parroquia"] in URBANAS]
if urbanos_sin:
    log(f"  POR CLASIFICAR, y son urbanos: {len(urbanos_sin)}")
    for p in urbanos_sin:
        log(f"     item {p['item']:>2}  {p['proyecto'][:70]}")
    log("     (van como «no aporta» hasta que se les asigne uso en CLASIFICACION)")
if len(sin_clasificar) > len(urbanos_sin):
    log(f"  sin clasificar y rurales: {len(sin_clasificar) - len(urbanos_sin)}, no afectan al analisis")

g = gpd.GeoDataFrame(
    pd.DataFrame(con_xy).drop(columns=["x", "y", "clasificado"]),
    geometry=gpd.points_from_xy([p["x"] for p in con_xy], [p["y"] for p in con_xy]),
    crs=CRS_ORIGEN,
).to_crs(4326)

# Plataforma y barrio por geometria, no por lo declarado: la parroquia del
# tablero es administrativa y no dice en que plataforma de levantamiento cae.
for capa, campo in (("plataformas", "clave"), ("barrios", "nombre")):
    limites = gpd.read_file(f"{DESTINO}/{capa}.geojson")[[campo, "geometry"]]
    g = gpd.sjoin(g, limites.rename(columns={campo: capa[:-1]}), how="left", predicate="within")
    g = g.drop(columns=["index_right"])

g["plataforma"] = g["plataforma"].where(g["plataforma"].notna(), None)
g["barrio"] = g["barrio"].where(g["barrio"].notna(), None)

urbanos = g[g["plataforma"].notna()]
aportan = urbanos[urbanos["aporta"]]
log(f"  puntos ubicados: {len(g)} de {len(filas) - len(sin_xy)} proyectos")
log(f"  dentro de una plataforma: {len(urbanos)}")
log(f"  de esos, crean alcance nuevo: {len(aportan)}")
ciudad = urbanos[urbanos["escala"] == "ciudad"]
for _, r in aportan.sort_values("plataforma").iterrows():
    log(f"     {r['plataforma']}  {r['uso']:<22} {r['proyecto'][:52]}")

if len(ciudad):
    log(f"  de escala cantonal, no se miden por alcance peatonal: {len(ciudad)}")
    for _, r in ciudad.iterrows():
        log(f"     {r['plataforma']}  {r['nota']}")

vacias = sorted(
    set(gpd.read_file(f"{DESTINO}/plataformas.geojson")["clave"]) - set(aportan["plataforma"])
)
log(f"  plataformas sin ningun proyecto que cree alcance: {len(vacias)} -> {', '.join(vacias)}")

g["geometry"] = g.geometry.set_precision(1e-6)
texto = g.to_json(drop_id=True, to_wgs84=True)
io.open(f"{DESTINO}/proyectos.geojson", "w", encoding="utf-8").write(texto)
log(f"  proyectos.geojson  {len(g):3d} registros  {len(texto.encode('utf-8')) / 1024:6.1f} KB")
