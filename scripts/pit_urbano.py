# -*- coding: utf-8 -*-
"""Los poligonos de intervencion territorial del suelo urbano.

    python scripts/pit_urbano.py <ruta al pit_urbano.shp>

Escribe `public/datos/pit_urbano.geojson`: los 170 PIT del area urbana con su
tratamiento y su normativa —lote minimo, edificabilidad, alturas, COS, retiros
y los cuatro grupos de usos—, que es el cuerpo del PUGS y lo unico que contesta
«que se puede hacer en este predio».

TRES ARREGLOS, Y NADA MAS. Lo que entra es el shapefile del equipo de
planificacion y no se reinterpreta: se corrige lo que el FORMATO estropeo al
exportarlo, no lo que dice.

1. LA CODIFICACION. El `.cpg` declara UTF-8 y el DBF lo es, pero GDAL se niega
   a leerlo porque dos valores estan cortados a mitad de caracter. Se lee en
   ISO-8859-1 —que nunca falla, porque mapea los 256 bytes— y se vuelve a
   decodificar como UTF-8. Las tildes de CONSOLIDACION, PROTECCION y RENOVACION
   salen enteras; lo unico que no se puede recuperar es lo que ya venia cortado.

2. «---» NO ES UN VALOR, ES UN HUECO. La capa escribe «---» donde la norma no
   dice nada. Publicado tal cual, es texto: `edif_max` pasaria por un campo de
   texto con 170 valores, de los que solo 115 son numeros, y CHASKI no lo
   ofreceria para filtrar por numero —exige que nueve de cada diez lo sean—.
   Vacio, esos 55 dejan de contar y el campo queda numerico al cien por cien.
   Y es ademas lo que de verdad pasa: no es un cero, es que no aplica.

   Los numeros se quedan como texto a proposito. Unos pocos no son un numero
   sino un rango —`edif_bas` trae un «1-8», `altura_min` tres como «12 - 18»,
   `cos_total` un «160-320» y un «400%»— y convertir la columna los perderia.
   Como texto no se pierde ninguno, y CHASKI compara numeros escritos como
   texto sin problema: el que es un rango simplemente no pasa un filtro
   numerico, que es lo correcto.

3. UNA TILDE. Un registro trae «CONSERVACION» y los otros veinte
   «CONSERVACION» con tilde. Son el mismo tratamiento, no hay otra lectura, y
   sin unificar cualquier conteo da siete categorias donde hay seis. Se unifica
   aqui y el archivo del disco no se toca.

LOS NOMBRES CORTADOS SE DEVUELVEN ENTEROS. El DBF corta los nombres de campo a
diez caracteres, asi que `tratamient` o `u_prohibid` no son nombres: son
mutilaciones. Se devuelve la palabra completa SOLO donde no hay otra lectura
posible. `porc_admis` y `f_min` se quedan como vienen, porque adivinar que
significan seria inventar una etiqueta sobre normativa.

LO QUE NO SE PUEDE ARREGLAR AQUI, Y ES LO MAS SERIO DE ESTA CAPA. Un campo de
texto en shapefile no pasa de 254 bytes, y las listas de usos no caben: 140 de
los 170 PIT traen el USO PROHIBIDO cortado, y 110 el restringido. No es un
detalle de formato. Una ficha que enseña media lista de prohibiciones dice que
algo esta permitido cuando a lo mejor esta prohibido dos palabras mas alla.

Aqui no se puede recuperar —el final no llego— asi que se hace lo unico
honrado: se detecta cual viene al tope del campo, se marca el valor con puntos
suspensivos y se publica la columna `texto_cortado` diciendo cuales. La ficha
del visor avisa, y en CHASKI se puede filtrar por ello.

Se arregla en el origen, exportando a GeoPackage en vez de a shapefile. Y
entonces esta cuenta baja a cero sola.
"""
import os
import sys
from pathlib import Path

os.environ.setdefault("SHAPE_ENCODING", "ISO-8859-1")

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
SALIDA = BASE / "pit_urbano.geojson"

# Lo que la capa escribe donde la norma no dice nada.
HUECO = {"---", "--", "-", "", "nan", "None", "N/A", "n/a"}

# Solo donde la palabra completa es la unica lectura posible.
NOMBRES = {
    "tratamient": "tratamiento",
    "implantac": "implantacion",
    "r_posterio": "r_posterior",
    "u_principa": "u_principal",
    "u_compleme": "u_complementario",
    "u_restring": "u_restringido",
    "u_prohibid": "u_prohibido",
    "observacio": "observaciones",
    "considerac": "consideraciones",
    # Confirmado por el equipo de planificacion: es el COS total maximo, el que
    # corresponde a la edificabilidad maxima, frente a `cos_total` que es el de
    # la basica. Cuadra con cos_pb x edif_max en 108 de las 115 filas que traen
    # los tres, asi que el nombre viene de quien hizo la capa y no del calculo.
    "cos_total_": "cos_total_max",
}

# Seis decimales son once centimetros. La capa se digitalizo sobre manzanas,
# no sobre un levantamiento topografico; el septimo decimal seria ruido con
# aspecto de precision.
DECIMALES = 6


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def campos_al_tope(dbf: Path, minimo: int = 100) -> dict[str, set[int]]:
    """Por campo, que registros llenan su ancho hasta el ultimo byte.

    Un valor que ocupa exactamente el ancho del campo y no deja ni un espacio
    de relleno es, casi siempre, un valor que no cabia. No es una prueba —puede
    medir justo— pero con 140 de 170 en el mismo campo no hay duda, y tratarlo
    como posible corte es la lectura prudente: equivocarse hacia «aqui puede
    faltar texto» no hace daño, al reves no.

    Se lee el DBF a mano porque ni geopandas ni pyogrio dan el ancho de los
    campos, y sin el ancho no hay forma de saber si un texto estaba al tope.
    """
    import struct

    b = dbf.read_bytes()
    n = struct.unpack("<I", b[4:8])[0]
    cabecera = struct.unpack("<H", b[8:10])[0]
    largo = struct.unpack("<H", b[10:12])[0]

    campos, off = [], 32
    while b[off] != 0x0D:
        d = b[off : off + 32]
        campos.append((d[:11].rstrip(b"\x00").decode("ascii"), d[16]))
        off += 32

    al_tope: dict[str, set[int]] = {}
    for i in range(n):
        reg = b[cabecera + i * largo : cabecera + (i + 1) * largo]
        pos = 1  # el primer byte dice si el registro esta borrado
        for nombre, ancho in campos:
            crudo = reg[pos : pos + ancho]
            pos += ancho
            if ancho >= minimo and len(crudo.rstrip(b" ")) == ancho:
                al_tope.setdefault(nombre, set()).add(i)
    return al_tope


def repara(v):
    """Devuelve el texto tal como se escribio, o None si es un hueco."""
    if not isinstance(v, str):
        return v
    # ISO-8859-1 mapea los 256 bytes, asi que esto recupera los originales.
    arreglado = v.encode("latin-1", "replace").decode("utf-8", "replace").strip()
    # Lo que quedo cortado a mitad de caracter se marca con puntos suspensivos
    # en vez de con el rombo de reemplazo: dice lo mismo —aqui falta texto— y
    # se lee en una ficha, que es donde va a acabar.
    if arreglado.endswith("�"):
        arreglado = arreglado.rstrip("�").rstrip() + "…"
    return None if arreglado in HUECO else arreglado


def redondea(geom, n=DECIMALES):
    import shapely
    return shapely.set_precision(geom, 10 ** -n)


def main(origen: Path) -> None:
    import geopandas as gpd

    log("=== Poligonos de intervencion territorial, suelo urbano ===")
    g = gpd.read_file(origen)
    log(f"  leidos: {len(g)}  ·  {g.crs}")

    texto = [c for c in g.columns if c != "geometry"]
    for c in texto:
        g[c] = g[c].map(repara)

    # --- lo que el formato se comio, dicho en voz alta ---------------------
    # --- lo que el formato se comio ----------------------------------------
    # El ancho de los campos solo esta en el DBF. Si el origen ya no es un
    # shapefile —porque se exporto a GeoPackage, que es como deberia venir—
    # este problema no existe y no hay nada que marcar.
    dbf = origen.with_suffix(".dbf")
    al_tope = campos_al_tope(dbf) if dbf.exists() else {}
    if not dbf.exists():
        log("  el origen no es shapefile: no hay tope de 254 bytes que vigilar")
    cuales: list[list[str]] = [[] for _ in range(len(g))]
    for campo, filas in al_tope.items():
        for i in filas:
            cuales[i].append(NOMBRES.get(campo, campo))
            v = g.iat[i, g.columns.get_loc(campo)]
            if isinstance(v, str) and not v.endswith("…"):
                g.iat[i, g.columns.get_loc(campo)] = v + "…"

    g["texto_cortado"] = [", ".join(sorted(c)) if c else None for c in cuales]

    if al_tope:
        log("")
        log("  AVISO: texto CORTADO en el origen, al tope de los 254 bytes que")
        log("  admite un campo de texto en shapefile. Por campo:")
        for campo, filas in sorted(al_tope.items(), key=lambda x: -len(x[1])):
            log(f"    {NOMBRES.get(campo, campo):<18} {len(filas):>3} de {len(g)}")
        tocados = sum(1 for c in cuales if c)
        log(f"  {tocados} de los {len(g)} PIT tienen al menos un campo cortado.")
        log("  El final del texto no esta en este archivo y no se puede")
        log("  reconstruir: se marca con «…» y se publica en `texto_cortado`.")
        log("  Se arregla exportando el original a GeoPackage, no a shapefile.")
        log("")

    # --- la tilde que parte una categoria en dos ---------------------------
    antes = g["tratamient"].value_counts().to_dict()
    g["tratamient"] = g["tratamient"].replace({"CONSERVACION": "CONSERVACIÓN"})
    if len(antes) != len(g["tratamient"].value_counts()):
        log("  tratamiento: «CONSERVACION» sin tilde unificado con «CONSERVACIÓN»")

    g = g.rename(columns=NOMBRES)

    # --- geometria ---------------------------------------------------------
    sin_valido = (~g.is_valid).sum()
    if sin_valido:
        log(f"  {sin_valido} geometrias invalidas, se reparan")
        g["geometry"] = g.geometry.buffer(0)

    g["area_ha"] = (g.geometry.area / 10_000).round(2)
    g = g.to_crs(4326)
    g["geometry"] = g.geometry.map(redondea)

    # --- lo que se publica -------------------------------------------------
    log(f"  superficie: {g['area_ha'].sum():,.1f} ha  ·  "
        f"menor {g['area_ha'].min():,.2f} ha  ·  mayor {g['area_ha'].max():,.1f} ha")
    log(f"  tratamientos: {len(g['tratamiento'].unique())}")
    for k, v in g["tratamiento"].value_counts().items():
        log(f"    {k:<24} {v:>3}")
    log(f"  subclasificacion: {g['subc_suelo'].value_counts().to_dict()}")

    BASE.mkdir(parents=True, exist_ok=True)
    if SALIDA.exists():
        SALIDA.unlink()
    g.to_file(SALIDA, driver="GeoJSON", coordinate_precision=DECIMALES)

    kb = SALIDA.stat().st_size / 1024
    log("")
    log(f"  {SALIDA.name}  {kb:,.0f} KB  ·  {len(g)} poligonos  ·  "
        f"{len([c for c in g.columns if c != 'geometry'])} campos")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log("uso: python scripts/pit_urbano.py <pit_urbano.shp>")
        sys.exit(1)
    ruta = Path(sys.argv[1])
    if not ruta.exists():
        log(f"no existe: {ruta}")
        sys.exit(1)
    main(ruta)
