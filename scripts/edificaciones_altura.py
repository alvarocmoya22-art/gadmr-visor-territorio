"""La edificacion del canton en tres dimensiones, como teselas vectoriales.

    python scripts/edificaciones_altura.py <ruta al .shp o .gpkg>

Escribe `public/datos/edificaciones_2023.pmtiles`: las edificaciones del canton
con su altura estimada, listas para la capa de extrusion.

DE DONDE SALE. Google Open Buildings v3 (huellas, imagenes 2023) cruzado con
Open Buildings 2.5D Temporal v1 (alturas), recortado al canton. Viene de la
carpeta de datos libres de Riobamba, que lo documenta asi:

    «Datos libres de referencia, NO cartografia oficial: sirven como insumo y
    para priorizar revisiones, no reemplazan la ortofoto ni el levantamiento
    institucional.»

    «Las alturas son estimaciones de un modelo sobre imagenes de 10 m; el error
    tipico es de unos 1,5-2 m. Sirven para analisis por zonas y para priorizar
    inspecciones, NO para certificar el numero de pisos de un predio.»

Eso viaja con el dato a todas partes: a la leyenda, a la ficha y al README. Una
altura de modelo que se presenta como medida es peor que no tenerla.

Licencia CC BY 4.0, atribucion a Google Open Buildings.

POR QUE TESELAS Y NO GEOJSON. Son 166.530 edificaciones con altura. En GeoJSON
pesan 56 MB que el navegador se baja enteros antes de dibujar nada, y
simplificar no ayuda: el peso son los objetos, no los vertices. En PMTiles son
14 MB en UN archivo, servible como estatico desde GitHub Pages sin servidor ni
base de datos, y el navegador pide solo las teselas que caben en pantalla:
unos cientos de kilobytes al abrir.

LAS QUE NO TIENEN ALTURA SE QUEDAN FUERA. Son 21.660, y traen altura 0 y
presencia 0 porque el modelo 2.5D no detecto nada, no porque el edificio sea
raso. Extruirlas a cero las dibujaria como suelo; publicarlas con tres metros
seria inventar. Se cuentan en el informe y no se publican.
"""
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
SALIDA = BASE / "edificaciones_2023.pmtiles"

# Hasta z16: una edificacion de 48 m2 —la mediana— no se distingue mas alla, y
# cada zoom extra multiplica el archivo. Desde z11 para que al abrir el canton
# se vea la mancha construida sin pedir nada mas.
ZOOM_MIN, ZOOM_MAX = 11, 16


def log(m=""):
    print(str(m).encode("ascii", "replace").decode("ascii"), flush=True)


def main(origen: Path) -> None:
    import geopandas as gpd
    import pyogrio

    log("=== Edificacion 2023 en tres dimensiones ===")
    g = gpd.read_file(origen)
    log(f"  leidas: {len(g):,}  ·  {g.crs}")

    falta = [c for c in ("alt_med_m", "pisos_est", "confiab", "area_m2") if c not in g.columns]
    if falta:
        log(f"  ERROR: a la capa le faltan campos: {', '.join(falta)}")
        sys.exit(1)

    reparto = g["confiab"].value_counts().to_dict()
    log(f"  confianza: {reparto}")

    sin = g[g["confiab"] == "sin dato"]
    g = g[g["confiab"] != "sin dato"].copy()
    log(f"  sin altura, quedan fuera: {len(sin):,}")
    log(f"  se publican: {len(g):,}")

    # Una altura de modelo con un decimal ya es mas precision de la que tiene:
    # el error declarado es de metro y medio.
    g["alt_med_m"] = g["alt_med_m"].round(1)
    g["area_m2"] = g["area_m2"].round(0).astype(int)
    g = g[["alt_med_m", "pisos_est", "confiab", "area_m2", "geometry"]].to_crs(4326)

    alt = g["alt_med_m"]
    log(f"  altura: mediana {alt.median():.1f} m  ·  max {alt.max():.1f} m")
    log(f"  pisos: mediana {g['pisos_est'].median():.0f}  ·  max {g['pisos_est'].max()}")

    if SALIDA.exists():
        SALIDA.unlink()
    BASE.mkdir(parents=True, exist_ok=True)
    pyogrio.write_dataframe(
        g,
        SALIDA,
        driver="PMTiles",
        layer="edificaciones",
        MINZOOM=str(ZOOM_MIN),
        MAXZOOM=str(ZOOM_MAX),
        SIMPLIFICATION="2",
        SIMPLIFICATION_MAX_ZOOM="0",  # al maximo zoom, sin simplificar
        NAME="Edificacion 2023 · Riobamba",
        DESCRIPTION="Google Open Buildings v3 + 2.5D Temporal 2023. CC BY 4.0. "
                    "Alturas estimadas, error tipico 1,5-2 m. No es cartografia oficial.",
    )
    mb = SALIDA.stat().st_size / 1048576
    log()
    log(f"  {SALIDA.name}  {mb:,.1f} MB  ·  z{ZOOM_MIN}-{ZOOM_MAX}  ·  capa «edificaciones»")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log("uso: python scripts/edificaciones_altura.py <edificaciones_altura_pisos_2023.shp>")
        log("sale de la carpeta de datos libres: 08_alturas_pisos_2023/")
        sys.exit(1)
    ruta = Path(sys.argv[1])
    if not ruta.exists():
        log(f"no existe: {ruta}")
        sys.exit(1)
    main(ruta)
