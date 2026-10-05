# -*- coding: utf-8 -*-
"""Convierte el catastro municipal a GeoJSON para el visor.

**Lo primero, porque condiciona todo lo demás: el shapefile trae el nombre
completo del propietario de cada predio.** El repositorio de este visor es
público, así que ese campo no sale de aquí, ni `observacio` con sus números de
trámite y adjudicación. Lo que se publica es la geometría del predio, su clave
catastral, su superficie y su estado: el plano catastral, que es documento
público, sin el registro de quién posee qué, que no lo es.

Si alguna vez hace falta el propietario en pantalla, no es cuestión de añadir la
columna: hay que servirlo desde un sitio con control de acceso, no desde un
GeoJSON estático en GitHub Pages.

Dos arreglos más que hace sobre la marcha, porque el origen los trae:

  - **Quince predios vienen en UTM** aunque el `.prj` declare WGS84. Se detectan
    por magnitud —una abscisa UTM pasa de 180— y se reproyectan.
  - **Anillos con el sentido de giro al revés.** GDAL los corrige al leer y
    aquí se escriben ya corregidos.

    python scripts/catastro.py
"""
import io
import warnings

import geopandas as gpd
import pandas as pd
import shapely
from shapely.ops import unary_union

warnings.filterwarnings("ignore")

ORIGEN = r"C:/Users/alvar/OneDrive/Escritorio/default/CATASTRO_28_4_2026/CATASTRO_28_4_2026.shp"
DESTINO = r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos"

#: Lo único que se publica. Todo lo demás se queda fuera a propósito.
CAMPOS = ["claves", "area", "tipo_catas", "estado"]

#: Campos del origen que NO pueden salir del municipio.
RESERVADOS = ["nombre", "observacio", "observac_1", "claves_aux", "actualizad"]

LOG = []


def log(msg):
    LOG.append(msg)
    print(msg.encode("ascii", "replace").decode("ascii"))


log("=== Catastro municipal ===")

# Se leen solo las columnas que se van a publicar, y no por ahorrar: el DBF
# tiene al menos un valor de texto con un caracter multibyte partido por la
# mitad —el campo esta truncado al ancho fijo— y leerlo entero revienta la
# decodificacion. Como esos campos son justo los reservados, no hay nada que
# recuperar.
# `read_info` lee la cabecera sin decodificar ni un valor; abrir una fila
# bastaria para toparse con el caracter partido.
from pyogrio import read_info

campos = list(read_info(ORIGEN)["fields"])
presentes = [c for c in RESERVADOS if c in campos]
if presentes:
    log(f"  campos reservados que no se leen: {', '.join(presentes)}")

g = gpd.read_file(ORIGEN, columns=[c for c in CAMPOS if c in campos])
log(f"  predios en el origen: {len(g):,}")

# Los que vienen en UTM: una abscisa en grados nunca pasa de 180.
caja = g.bounds
enUtm = (caja["maxx"] > 180) | (caja["maxy"] > 90)
if enUtm.any():
    log(f"  predios con coordenadas en UTM pese al .prj: {int(enUtm.sum())}, se reproyectan")
    sueltos = gpd.GeoDataFrame(g[enUtm].copy(), geometry="geometry", crs=32717).to_crs(4326)
    g = pd.concat([g[~enUtm].set_crs(4326, allow_override=True), sueltos])

g = gpd.GeoDataFrame(g, geometry="geometry", crs=4326)

# Solo el área urbana: el visor mira las 18 plataformas y los 33.000 predios
# rurales restantes no se dibujarian nunca.
plataformas = gpd.read_file(f"{DESTINO}/plataformas.geojson")
urbano = unary_union(list(plataformas.geometry))
dentro = g[g.geometry.representative_point().within(urbano)].copy()
log(f"  dentro de las 18 plataformas: {len(dentro):,}  (fuera: {len(g) - len(dentro):,})")

salida = dentro[[c for c in CAMPOS if c in dentro.columns] + ["geometry"]].copy()
if "area" in salida.columns:
    salida["area"] = pd.to_numeric(salida["area"], errors="coerce").round(1)

# El catastro trae geometrias invalidas —anillos que se cruzan, huecos sin
# contorno al que pertenecer—. Se reparan antes de tocar nada: redondear las
# coordenadas de un poligono roto lo rompe mas.
malas = ~salida.geometry.is_valid
if malas.any():
    log(f"  geometrias invalidas en el origen: {int(malas.sum())}, se reparan")
    salida.loc[malas, "geometry"] = salida.loc[malas, "geometry"].make_valid()

# Seis decimales son once centimetros: de sobra para un plano catastral y la
# mitad de bytes que la precision que trae el origen. Si alguna sigue sin dejarse
# redondear, se queda con su precision original antes que perderla.
def redondear(geom):
    try:
        return shapely.set_precision(geom, 1e-6)
    except Exception:
        return geom


salida["geometry"] = salida.geometry.apply(redondear)
salida = salida[~salida.geometry.is_empty & salida.geometry.notna()]
# `make_valid` puede devolver colecciones; al visor solo le sirven poligonos.
salida = salida[salida.geom_type.isin(["Polygon", "MultiPolygon"])]

texto = salida.to_json(drop_id=True, to_wgs84=True)
ruta = f"{DESTINO}/catastro.geojson"
io.open(ruta, "w", encoding="utf-8").write(texto)
mb = len(texto.encode("utf-8")) / 1024 / 1024
log(f"  vertices: {int(salida.geometry.count_coordinates().sum()):,}")
log(f"  catastro.geojson  {len(salida):,} predios  {mb:.2f} MB")

for campo in RESERVADOS:
    assert campo not in texto, f"el campo reservado {campo} se ha colado en la salida"
log("  comprobado: ningun campo reservado aparece en el archivo")
