"""Las manzanas de Riobamba con la poblacion del Censo 2022.

Produce `public/datos/manzanas.geojson`: 3.757 manzanas del canton 0601 con
`poblacion`, `viviendas` y `densidad_hab_km2`.

Es la pieza mas fina que hay para repartir poblacion. Los barrios cubren solo
el casco y cada uno se traga cientos de edificios; la manzana se pega a donde
esta la gente de verdad, y a esa escala la densidad empieza a decir algo que
se pueda usar para decidir.

DE DONDE SALEN. Del geovisualizador del INEC
<https://geovisualizador.inec.gob.ec/?geo=manzanas>, que las sirve con boton de
descarga. El archivo que da es NACIONAL: 236.299 manzanas y 125 MB. Aqui se
filtra al canton por el prefijo del codigo, porque 125 MB no los abre un
navegador y porque de todas formas solo interesan las de casa.

EL CODIGO LLEVA DENTRO LA DIVISION. Son 15 digitos: provincia (2), canton (2),
parroquia (2), zona, sector y manzana. De ahi sale `parroquia_cod` sin cruzar
nada con nadie.

QUE DICE EL INEC DE ESTA CARTOGRAFIA. Que se emplea para operativos de campo
con fines estadisticos, que no tiene precision metrica y que no determina
jurisdicciones oficiales. Vale para repartir poblacion —es la misma familia de
datos que los sectores censales— pero no para medir superficies ni para
discutir un limite. Por eso la capa no trae area y la densidad se calcula
sobre la geometria solo como orden de magnitud.

LA POBLACION la pega `poblacion_en_capa.py`, con el mismo reparto dasimetrico
por edificios que usan los barrios y las plataformas. Que sea el mismo metodo
es lo que permite sumar por un lado y por el otro sin que los totales se
contradigan.

    python scripts/manzanas.py "C:/Users/alvar/Downloads/manzanas (1).geojson"
"""
import subprocess
import sys
import tempfile
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import pyogrio

BASE = Path(__file__).resolve().parent.parent / "public" / "datos"
AQUI = Path(__file__).resolve().parent
CANTON = "0601"


def log(m):
    print(m.encode("ascii", "replace").decode("ascii"), flush=True)


def main(nacional: Path) -> None:
    log("=== Manzanas de Riobamba ===")

    # El filtro va en la lectura y no despues: leer 236.299 manzanas para
    # quedarse con 3.757 es gastar memoria en lo que no se va a usar.
    g = pyogrio.read_dataframe(nacional, where=f"manzanas LIKE '{CANTON}%'")
    log(f"  del canton {CANTON}: {len(g):,} manzanas  ·  {g.crs}")

    g = g[["manzanas", "geometry"]].rename(columns={"manzanas": "codigo"})
    g = g.reset_index(drop=True)
    g["parroquia_cod"] = g["codigo"].str[:6]
    log(f"  parroquias presentes: {g['parroquia_cod'].nunique()}")

    with tempfile.TemporaryDirectory() as tmp:
        crudo = Path(tmp) / "manzanas_0601.geojson"
        g.to_file(crudo, driver="GeoJSON")
        salida = BASE / "manzanas.geojson"
        # Se llama al otro script en vez de copiar su cuerpo aqui: si el
        # metodo cambia, tiene que cambiar en un solo sitio o las capas
        # dejarian de cuadrar entre si sin que nadie lo note.
        subprocess.run(
            [sys.executable, "-I", str(AQUI / "poblacion_en_capa.py"), str(crudo), str(salida)],
            check=True,
        )

    log(f"\n  manzanas.geojson  {salida.stat().st_size/1024:,.0f} KB")
    log("listo")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        log("uso: python scripts/manzanas.py <manzanas_nacional.geojson>")
        log("descargalo de https://geovisualizador.inec.gob.ec/?geo=manzanas")
        sys.exit(1)
    ruta = Path(sys.argv[1])
    if not ruta.exists():
        log(f"no existe: {ruta}")
        sys.exit(1)
    main(ruta)
