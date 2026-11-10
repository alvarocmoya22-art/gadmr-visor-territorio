"""La altitud de cada nodo de la red peatonal, para que las isocronas sepan subir.

    python scripts/altitud_red.py <carpeta 04_relieve>

Anade el campo `z` a `public/datos/red.json`: la altitud en metros de cada uno
de los 12.609 nodos. Con eso el Dijkstra puede calcular el desnivel de cada
arista y cobrar mas por subir que por bajar.

POR QUE LA ALTITUD DEL NODO Y NO LA PENDIENTE DE LA ARISTA. Porque la pendiente
tiene signo y depende de por donde se entre: la misma calle es subida en un
sentido y bajada en el otro. Guardando la cota de los extremos, el sentido lo
decide quien recorre el grafo. Y son 12.609 numeros en vez de 35.272.

EL MODELO ES DE SUPERFICIE, Y ESO SE NOTA. El Copernicus GLO-30 incluye
edificios y vegetacion, y su pixel mide 30 m: en una ciudad, dos nodos de la
misma calle pueden caer uno en el asfalto y otro en un tejado. Medido sobre la
red de Riobamba, el 3,2 % de las aristas de menos de 15 m salian con mas del
30 % de pendiente, frente al 0,0 % de las de mas de 120 m. No es el terreno,
es el pixel.

Contra eso, dos correcciones y las dos se declaran en el informe:

  1. MEDIANA DE 3x3 antes de muestrear. Un tejado es un pico aislado y la
     mediana de sus vecinos lo ignora; el terreno, que varia despacio, no se
     mueve. Baja el percentil 90 de la pendiente del 8,0 % al 7,3 %.

  2. TOPE DEL 30 %. La calle mas empinada del mundo ronda el 35 %. Por encima
     de eso no hay via urbana, hay un error de muestreo. Las que pasan el tope
     se cuentan y se dicen.

LOS NODOS SIN DATO SE QUEDAN LLANOS. El DEM esta recortado al canton y la red
de OSM se sale de el por el norte: 2.589 nodos no tienen cota. De esos, UNO
cae dentro del limite urbano, que es donde las isocronas de verdad corren. Las
aristas que los tocan mantienen la velocidad en llano, que es lo unico honesto
cuando no se sabe.
"""
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
RED = BASE / "red.json"

TOPE_PENDIENTE = 0.30  # por encima de esto no hay calle, hay ruido


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def mediana3(a):
    """Mediana de 3x3, ignorando los huecos. Quita tejados sin mover el terreno."""
    import numpy as np
    from numpy.lib.stride_tricks import sliding_window_view

    p = np.pad(a, 1, constant_values=np.nan)
    v = sliding_window_view(p, (3, 3)).reshape(a.shape[0], a.shape[1], 9)
    return np.nanmedian(v, axis=2)


def main(relieve: Path) -> None:
    import numpy as np
    import rasterio
    from pyproj import Transformer

    dem = relieve / "dem_copernicus_30m.tif"
    if not dem.exists():
        log(f"no existe {dem}")
        sys.exit(1)

    log("=== Altitud de la red peatonal ===")
    red = json.loads(RED.read_text(encoding="utf-8"))
    nodos = np.array(red["nodos"], dtype=float)
    log(f"  nodos: {len(nodos):,}  ·  aristas: {len(red['aristas']):,}")

    tr = Transformer.from_crs(4326, 32717, always_xy=True)
    x, y = tr.transform(nodos[:, 0], nodos[:, 1])

    with rasterio.open(dem) as r:
        log(f"  DEM: {r.width} x {r.height} px  ·  pixel {abs(r.transform.a):.0f} m  ·  {r.crs.to_string()}")
        banda = r.read(1).astype(float)
        banda[banda == r.nodata] = np.nan
        suave = mediana3(banda)
        filas, cols = rasterio.transform.rowcol(r.transform, x, y)

    filas = np.clip(np.asarray(filas), 0, suave.shape[0] - 1)
    cols = np.clip(np.asarray(cols), 0, suave.shape[1] - 1)
    z = suave[filas, cols]

    sin = ~np.isfinite(z)
    log(f"  nodos con altitud: {int((~sin).sum()):,}  ·  sin dato: {int(sin.sum()):,}")
    if (~sin).any():
        log(f"  altitud: {np.nanmin(z):,.0f} a {np.nanmax(z):,.0f} m")

    # ------------------------------------------------------- lo que se cobra
    a = np.array([e[0] for e in red["aristas"]])
    b = np.array([e[1] for e in red["aristas"]])
    L = np.array([e[2] for e in red["aristas"]], dtype=float)
    dz = z[b] - z[a]
    medible = np.isfinite(dz) & (L > 0)
    s = np.zeros(len(L))
    s[medible] = dz[medible] / L[medible]
    topadas = int((np.abs(s) > TOPE_PENDIENTE).sum())

    log()
    log(f"  aristas con pendiente medible: {int(medible.sum()):,} de {len(L):,}")
    ab = np.abs(s[medible])
    log(f"    mediana {np.median(ab) * 100:.1f} %  ·  p90 {np.percentile(ab, 90) * 100:.1f} %")
    log(f"    por encima del tope del {TOPE_PENDIENTE * 100:.0f} %: {topadas:,}"
        f"  ({topadas / max(len(L), 1) * 100:.1f} %)")
    log(f"  aristas que se quedan llanas por falta de cota: {int((~medible).sum()):,}")

    # El tope NO se aplica aqui: la pendiente nace de dos nodos y un largo, y
    # eso solo existe al recorrer una arista. Lo que viaja es la cota y el
    # valor del tope; quien lo aplica es `isocronas.ts`, que es quien calcula
    # la pendiente. Aqui se cuenta cuantas lo pasarian, para que el numero
    # salga en el informe y no haya que fiarse.
    z_pub = [None if not np.isfinite(v) else round(float(v), 1) for v in z]
    red["z"] = z_pub
    red["z_fuente"] = (
        "Copernicus DEM GLO-30, modelo de SUPERFICIE, suavizado con mediana 3x3. "
        f"Pendiente topada al {TOPE_PENDIENTE * 100:.0f} %. "
        "© DLR e.V. / Airbus, distribuido por Copernicus."
    )
    red["z_tope_pendiente"] = TOPE_PENDIENTE

    antes = RED.stat().st_size
    RED.write_text(json.dumps(red, separators=(",", ":")), encoding="utf-8")
    log()
    log(f"  red.json: {antes / 1024:,.0f} KB  ->  {RED.stat().st_size / 1024:,.0f} KB")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log("uso: python scripts/altitud_red.py <carpeta 04_relieve>")
        sys.exit(1)
    main(Path(sys.argv[1]))
