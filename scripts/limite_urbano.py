# -*- coding: utf-8 -*-
"""Publica el límite urbano del cantón: la ciudad y las cabeceras parroquiales.

Lo urbano de Riobamba no es solo la ciudad. La clasificación del suelo
reconoce catorce piezas de suelo urbano:

  - **Urbano**, una sola pieza de 3.095 ha, que es el casco; y
  - **Urbano Parroquial**, trece piezas que suman 461 ha, que son las
    cabeceras de las parroquias rurales —Licán, Cubijíes, Licto, San Juan,
    Calpi, Quimiag, Punín, Pungalá, Flores, Cacha y San Luis, esta última con
    tres núcleos—.

Eso es lo que permite bajar por la rama rural sin que se acabe en la
parroquia: dentro de una parroquia rural hay un pedazo urbano, y es donde
está su gente.

Sale de `gis_limite_urbn_a_phdu`. Comprobado contra `gis_clasifica_a_phdu`:
la unión de estas catorce piezas y el «Urbano» de la clasificación son la
misma geometría, con una diferencia de 0,00 ha.

    python scripts/limite_urbano.py

Necesita el servicio de capas levantado (`pg_featureserv` en el 9000).
"""
import io
import json
import urllib.request

import geopandas as gpd

SERVICIO = "http://localhost:9000/collections/public.gis_limite_urbn_a_phdu/items"
DESTINO = (
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio"
    r"/public/datos/limite_urbano.geojson"
)

with urllib.request.urlopen(f"{SERVICIO}?limit=500&f=json", timeout=240) as r:
    crudo = json.load(r)

g = gpd.GeoDataFrame.from_features(crudo["features"], crs=4326)
g = g.rename(columns={"identidad": "clase", "parroquia": "parroquia"})

# «Urbano» / «Urbano Parroquial» con mayúsculas desiguales en el origen; aquí
# se deja una sola forma para poder preguntar por ella sin adivinar.
g["clase"] = (
    g["clase"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map(lambda x: "cabecera" if "parroquial" in x else "ciudad")
)

metrico = g.to_crs(32717)
g["area_ha"] = (metrico.geometry.area / 10000).round(2)

print(f"  piezas: {len(g)}")
for clase, sub in g.groupby("clase"):
    print(f"    {clase:<10} {len(sub):>3} piezas {sub['area_ha'].sum():>9,.0f} ha")
print(f"  total urbano: {g['area_ha'].sum():,.0f} ha")

g["geometry"] = g.to_crs(32717).geometry.simplify(5).to_crs(4326)
g["geometry"] = g.geometry.set_precision(1e-6)
texto = g[["clase", "parroquia", "area_ha", "geometry"]].to_json(
    drop_id=True, to_wgs84=True
)
io.open(DESTINO, "w", encoding="utf-8").write(texto)
kb = len(texto.encode("utf-8")) / 1024
print(f"  limite_urbano.geojson  {len(g)} registros  {kb:.1f} KB")
