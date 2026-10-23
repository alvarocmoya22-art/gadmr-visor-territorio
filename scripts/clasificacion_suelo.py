# -*- coding: utf-8 -*-
"""Publica la clasificación del suelo del cantón: urbano y rural.

Es el reparto oficial, y el único que separa bien las dos cosas:

    RURAL    27 piezas   96.318 ha
    URBANO   14 piezas    3.556 ha
    -----------------------------
             41 piezas   99.874 ha,  sin un metro de solape

Lo urbano NO es solo la ciudad. Son 3.095 ha de casco más trece cabeceras de
parroquias rurales que suman 461 ha —Licán 98, San Luis con tres núcleos 91,
Cubijíes 55, Licto 44, San Juan 42, Calpi 41, Quimiag 31, Punín 24, Pungalá
23, Flores 7, Cacha 5—. Esos manchones sueltos repartidos por el cantón son
suelo urbano igual que el centro de Riobamba, y dejarlos fuera de «lo urbano»
es perder la mitad de las parroquias.

Sale de `gis_clasifica_a_phdu`. Comprobado: el «Urbano» de esta tabla y
`gis_limite_urbn_a_phdu` son la misma geometría.

    python scripts/clasificacion_suelo.py

Necesita el servicio de capas levantado (`pg_featureserv` en el 9000).
"""
import io
import json
import urllib.request

import geopandas as gpd

SERVICIO = "http://localhost:9000/collections/public.gis_clasifica_a_phdu/items"
DESTINO = (
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio"
    r"/public/datos/clasificacion_suelo.geojson"
)

with urllib.request.urlopen(f"{SERVICIO}?limit=500&f=json", timeout=300) as r:
    crudo = json.load(r)

g = gpd.GeoDataFrame.from_features(crudo["features"], crs=4326)
g = g.rename(columns={"first_clas": "clase", "first_parr": "parroquia"})
g["clase"] = g["clase"].astype(str).str.strip().str.lower()

# Simplificado en metros como el resto de capas del visor.
g["geometry"] = g.to_crs(32717).geometry.simplify(5).to_crs(4326)

# Y lo rural se recorta contra lo urbano, DESPUÉS de simplificar.
#
# En la base las dos clases no se solapan ni un metro, pero simplificar mueve
# las líneas y reaparecen 0,67 ha montadas. Recortar antes no sirve: lo que se
# redibuja después vuelve a cruzarse.
_m = g.to_crs(32717)
_urb = _m.loc[g["clase"] == "urbano"].geometry.union_all()
_rec = _m.geometry.where(g["clase"] == "urbano", _m.geometry.difference(_urb))
g["geometry"] = gpd.GeoSeries(_rec, crs=32717).to_crs(4326)

metrico = g.to_crs(32717)
g["area_ha"] = (metrico.geometry.area / 10000).round(2)

for clase, sub in g.groupby("clase"):
    print(f"  {clase:<8} {len(sub):>3} piezas {sub['area_ha'].sum():>10,.0f} ha")
u = metrico.loc[g["clase"] == "urbano"].geometry.union_all()
r_ = metrico.loc[g["clase"] == "rural"].geometry.union_all()
print(f"  total    {len(g):>3} piezas {g['area_ha'].sum():>10,.0f} ha")
print(f"  solape entre clases: {u.intersection(r_).area / 10000:.2f} ha")

g["geometry"] = g.geometry.set_precision(1e-6)
texto = g[["clase", "parroquia", "area_ha", "geometry"]].to_json(
    drop_id=True, to_wgs84=True
)
io.open(DESTINO, "w", encoding="utf-8").write(texto)
print(f"  clasificacion_suelo.geojson  {len(g)} registros  "
      f"{len(texto.encode('utf-8')) / 1024:.1f} KB")
