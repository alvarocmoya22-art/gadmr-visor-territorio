"""Un modelo IFC de proyecto, convertido a glTF para que el mapa lo dibuje.

    python scripts/modelo_ifc.py <archivo.ifc> <nombre-salida>

Escribe:
    public/datos/<nombre>.glb     la geometria, en metros y centrada
    public/datos/<nombre>.json    la ficha: medidas, piezas y de donde sale

POR QUE EL IFC Y NO LOS OTROS CUATRO. El estudio entrego el mismo proyecto en
IFC, STEP, RVT, DWG y DGN. El RVT es cerrado: sin Revit no se abre. El DWG y el
DGN son la planta en dos dimensiones. El STEP pesa 210 MB —cuatro veces el
IFC— y llega sin materiales ni nombres de pieza. El IFC trae geometria Y
semantica, es norma abierta y lo lee cualquiera dentro de diez anos.

NO SE ESCRIBEN NORMALES, Y ES A PROPOSITO. Al soldar vertices —que es lo que
hace que el archivo quepa— IfcOpenShell descarta las normales. Escribirlas en
cero pinta el modelo COMPLETAMENTE NEGRO, que fue el primer resultado. Un glTF
sin el atributo NORMAL obliga al visor a calcularlas por cara, que es el
sombreado que le corresponde a un edificio —aristas vivas, no superficies
suavizadas— y ademas ahorra un tercio del archivo.

SE DESCARTAN LOS CONJUNTOS SUELTOS. El archivo del Parque Guayaquil traia,
ademas del parque, dos edificaciones de 41 x 11 m separadas de el y ajenas a la
intervencion. Se agrupan las piezas por contacto en planta —dos piezas a menos
de 3 m son del mismo conjunto— y se publica solo el mayor. Lo descartado se
dice en pantalla y queda escrito en la ficha; no se borra en silencio.

EL IFC NO SABE DONDE ESTA. Este venia con la latitud y longitud por defecto de
Archicad, que apuntan a Madrid. La georreferencia NO se toma del archivo: va
en `src/config/modelos3d.ts`, puesta a mano sobre la ortofoto. Un modelo mal
ubicado es peor que ninguno, porque sobre un mapa la gente lo mide.
"""
import json
import collections
import multiprocessing
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
CELDA = 3.0  # m: por debajo de esta distancia dos piezas son el mismo conjunto


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def leer_piezas(ifc_abierto):
    """Cada producto con su malla y su caja, ya en coordenadas del mundo."""
    import numpy as np
    import ifcopenshell.geom

    ajustes = ifcopenshell.geom.settings()
    ajustes.set("use-world-coords", True)
    ajustes.set("weld-vertices", True)

    it = ifcopenshell.geom.iterator(ajustes, ifc_abierto, multiprocessing.cpu_count())
    piezas = []
    if it.initialize():
        while True:
            sh = it.get()
            g = sh.geometry
            if len(g.verts) and len(g.faces):
                v = np.array(g.verts, dtype=np.float32).reshape(-1, 3)
                piezas.append({
                    "v": v,
                    "i": np.array(g.faces, dtype=np.uint32).reshape(-1, 3),
                    "mats": g.materials,
                    "mid": (np.array(g.material_ids, dtype=np.int64)
                            if len(g.material_ids) else None),
                    "min": v.min(0),
                    "max": v.max(0),
                })
            if not it.next():
                break
    return piezas


def conjuntos_en_planta(piezas):
    """Agrupa las piezas que se tocan vistas desde arriba, de mayor a menor."""
    import numpy as np

    esquina = np.min([p["min"] for p in piezas], axis=0)
    celdas = collections.defaultdict(list)
    for k, p in enumerate(piezas):
        a = ((p["min"][:2] - esquina[:2]) // CELDA).astype(int)
        b = ((p["max"][:2] - esquina[:2]) // CELDA).astype(int)
        for x in range(a[0], b[0] + 1):
            for y in range(a[1], b[1] + 1):
                celdas[(x, y)].append(k)

    padre = list(range(len(piezas)))

    def raiz(i):
        while padre[i] != i:
            padre[i] = padre[padre[i]]
            i = padre[i]
        return i

    def unir(a, b):
        ra, rb = raiz(a), raiz(b)
        if ra != rb:
            padre[rb] = ra

    for c, lista in celdas.items():
        for otro in lista[1:]:
            unir(lista[0], otro)
        for d in ((1, 0), (0, 1), (1, 1), (1, -1)):
            vecina = (c[0] + d[0], c[1] + d[1])
            if vecina in celdas:
                unir(lista[0], celdas[vecina][0])

    grupos = collections.defaultdict(list)
    for k in range(len(piezas)):
        grupos[raiz(k)].append(k)
    return sorted(grupos.values(), key=len, reverse=True)


def color_de(material):
    """El color difuso y la opacidad, a prueba de los NaN que exporta Archicad."""
    def num(x, por_defecto):
        try:
            val = float(x() if callable(x) else x)
        except (TypeError, ValueError):
            return por_defecto
        return por_defecto if val != val else min(1.0, max(0.0, val))

    col = tuple(round(num(getattr(material.diffuse, c), 0.72), 3) for c in ("r", "g", "b"))
    return col + (round(1.0 - num(getattr(material, "transparency", 0.0), 0.0), 2),)


def main(ifc: Path, nombre: str) -> None:
    import numpy as np
    import ifcopenshell
    from pygltflib import (GLTF2, Scene, Node, Mesh, Primitive, Attributes, Accessor,
                           BufferView, Buffer, Material, PbrMetallicRoughness,
                           ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, FLOAT, UNSIGNED_INT)

    f = ifcopenshell.open(str(ifc))
    log(f"=== {ifc.name} ===")
    log(f"  esquema {f.schema}")

    piezas = leer_piezas(f)
    log(f"  piezas con geometria: {len(piezas):,}")
    if not piezas:
        log("  el archivo no trae geometria")
        sys.exit(1)

    orden = conjuntos_en_planta(piezas)
    log(f"  conjuntos que no se tocan: {len(orden)}")
    descartado = []
    for k, grupo in enumerate(orden):
        a = np.min([piezas[i]["min"] for i in grupo], axis=0)
        b = np.max([piezas[i]["max"] for i in grupo], axis=0)
        med = f"{b[0] - a[0]:>6.0f} x {b[1] - a[1]:>5.0f} m"
        log(f"    {'se publica ' if k == 0 else 'se descarta'}  {len(grupo):>4} piezas  {med}")
        if k:
            descartado.append({"piezas": len(grupo),
                               "medidas_m": [round(float(b[0] - a[0]), 1),
                                             round(float(b[1] - a[1]), 1)]})
    quedan = orden[0]

    # ------------------------------------------- un lote de triangulos por color
    grupos = collections.defaultdict(lambda: {"v": [], "i": [], "off": 0})
    n_tri = 0
    for k in quedan:
        p = piezas[k]
        v, idx, mats = p["v"], p["i"], p["mats"]
        mids = p["mid"] if p["mid"] is not None and len(p["mid"]) == len(idx) else None
        for mid in (np.unique(mids) if mids is not None else [-1]):
            sel = idx[mids == mid] if mids is not None else idx
            clave = color_de(mats[int(mid)]) if 0 <= mid < len(mats) else (0.72, 0.72, 0.70, 1.0)
            d = grupos[clave]
            usados = np.unique(sel)
            nuevo = {int(o): j for j, o in enumerate(usados)}
            d["v"].append(v[usados])
            d["i"].append(np.vectorize(nuevo.get)(sel).astype(np.uint32) + d["off"])
            d["off"] += len(usados)
            n_tri += len(sel)

    todos = np.vstack([np.vstack(d["v"]) for d in grupos.values()])
    mn, mx = todos.min(0), todos.max(0)
    medidas = [float(mx[0] - mn[0]), float(mx[1] - mn[1]), float(mx[2] - mn[2])]
    log(f"  triangulos: {n_tri:,}  ·  colores: {len(grupos)}")
    log(f"  huella: {medidas[0]:,.1f} x {medidas[1]:,.1f} m  ·  alto {medidas[2]:,.1f} m")
    centro = np.array([(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, mn[2]], dtype=np.float32)

    blob = bytearray()
    vistas, accs, prims, materiales = [], [], [], []

    def anade(arr, destino):
        datos = arr.tobytes()
        while len(blob) % 4:
            blob.append(0)
        off = len(blob)
        blob.extend(datos)
        vistas.append(BufferView(buffer=0, byteOffset=off, byteLength=len(datos), target=destino))
        return len(vistas) - 1

    for clave, d in sorted(grupos.items(), key=lambda kv: -sum(len(a) for a in kv[1]["i"])):
        # De Z-arriba (IFC) a Y-arriba (glTF), centrado, y con el suelo en y = 0.
        V = np.vstack(d["v"]) - centro
        V = np.column_stack([V[:, 0], V[:, 2], -V[:, 1]]).astype(np.float32)
        I = np.vstack(d["i"]).ravel().astype(np.uint32)
        bvV, bvI = anade(V, ARRAY_BUFFER), anade(I, ELEMENT_ARRAY_BUFFER)
        aV = len(accs)
        accs.append(Accessor(bufferView=bvV, componentType=FLOAT, count=len(V), type="VEC3",
                             min=V.min(0).tolist(), max=V.max(0).tolist()))
        aI = len(accs)
        accs.append(Accessor(bufferView=bvI, componentType=UNSIGNED_INT, count=len(I),
                             type="SCALAR"))
        r, g, b, alfa = clave
        materiales.append(Material(
            pbrMetallicRoughness=PbrMetallicRoughness(
                baseColorFactor=[r, g, b, alfa], metallicFactor=0.0, roughnessFactor=0.85),
            alphaMode="BLEND" if alfa < 1 else "OPAQUE", doubleSided=True))
        prims.append(Primitive(attributes=Attributes(POSITION=aV), indices=aI,
                               material=len(materiales) - 1))

    gltf = GLTF2(scene=0, scenes=[Scene(nodes=[0])], nodes=[Node(mesh=0)],
                 meshes=[Mesh(primitives=prims)], materials=materiales,
                 accessors=accs, bufferViews=vistas, buffers=[Buffer(byteLength=len(blob))])
    gltf.set_binary_blob(bytes(blob))
    BASE.mkdir(parents=True, exist_ok=True)
    glb = BASE / f"{nombre}.glb"
    gltf.save_binary(str(glb))

    proyecto = f.by_type("IfcProject")
    cabecera = getattr(getattr(f, "header", None), "file_name", None)
    ficha = {
        "archivo": f"datos/{nombre}.glb",
        "origen": ifc.name,
        "esquema": f.schema,
        "programa": getattr(cabecera, "originating_system", None),
        "fecha_export": getattr(cabecera, "time_stamp", None),
        "proyecto": proyecto[0].Name if proyecto else None,
        "piezas": len(quedan),
        "triangulos": int(n_tri),
        "medidas_m": [round(x, 1) for x in medidas],
        "descartado": descartado,
        "georreferencia": "no viene en el IFC; se fija a mano en src/config/modelos3d.ts",
    }
    (BASE / f"{nombre}.json").write_text(
        json.dumps(ficha, ensure_ascii=False, indent=1), encoding="utf-8")

    log()
    log(f"  {glb.name}   {glb.stat().st_size / 1048576:,.1f} MB")
    log(f"  {nombre}.json")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        log("uso: python scripts/modelo_ifc.py <archivo.ifc> <nombre-salida>")
        sys.exit(1)
    ruta = Path(sys.argv[1])
    if not ruta.exists():
        log(f"no existe: {ruta}")
        sys.exit(1)
    main(ruta, sys.argv[2])
