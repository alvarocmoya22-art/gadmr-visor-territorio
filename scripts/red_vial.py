# -*- coding: utf-8 -*-
"""Publica la red vial oficial del cantón, la del GADPCH.

Sale de la geodatabase de la Prefectura de Chimborazo, que es quien tiene
competencia sobre la vialidad rural. Son dos capas y no tres:

  - **Red_provincial_2019**, la red rural del cantón, con su capa de rodadura
    y la parroquia de cada tramo; y
  - **Red_Vial_Estatal_MTOP_ACT2024**, las estatales que lo cruzan —la
    Panamericana, Riobamba-Penipe, Riobamba-Alausí—.

`RED_TIPO_III_IV_MOD_JERARQUIZADO` se deja fuera a propósito: **es la misma
geometría que la provincial**. Comprobado, 611 de sus 666 km van a menos de
diez metros de ella, así que publicarla al lado dibujaría cada vía dos veces y
duplicaría los kilómetros de cualquier cuenta. Lo que sí tiene y la provincial
no —`NOMBRE_EJE`, `CODIGO_VIA`, la jerarquización— se podrá unir por geometría
el día que haga falta; traerla entera para eso sería pagar el doble de peso.

Se RECORTA al cantón, al revés que en el resto del visor. Aquí el recorte no
falsea nada: lo que se quiere saber es cuántos kilómetros de red hay en
Riobamba, no cuánto mide una vía que sigue hasta Alausí. Las trece estatales
miden 279 km enteras y 94 dentro; dibujarlas enteras sacaría el mapa del
cantón.

    python scripts/red_vial.py

Lee la geodatabase del disco; no hace falta ningún servicio levantado.
"""
import io
import warnings

warnings.filterwarnings("ignore")
import geopandas as gpd
import pandas as pd
from shapely import force_2d

GDB = r"C:/Users/alvar/OneDrive/Escritorio/GADPCH/EJES_VIALES_GADPCH.gdb"
CANTON = (
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio"
    r"/public/datos/parroquias_canton.geojson"
)
DESTINO = (
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio"
    r"/public/datos/red_vial.geojson"
)

# De los seis valores del origen, cinco son superficies y el sexto es el vacío.
RODADURAS = {"ASFALTO", "ADOQUINADO", "EMPEDRADO", "LASTRADO", "TIERRA"}


def limpio(s: pd.Series) -> pd.Series:
    return s.astype(str).str.strip().replace({"nan": "", "None": ""})


canton = gpd.read_file(CANTON).to_crs(32717).union_all()

prov = gpd.read_file(GDB, layer="Red_provincial_2019").to_crs(32717)
prov = gpd.GeoDataFrame(
    {
        "nombre": limpio(prov["TRAMO"]),
        "tipo": "provincial",
        "rodadura": limpio(prov["CAPA_RODAD"]),
        "parroquia": limpio(prov["DPA_DESPAR"]).str.title(),
    },
    geometry=prov.geometry,
    crs=32717,
)

est = gpd.read_file(GDB, layer="Red_Vial_Estatal_MTOP_ACT2024").to_crs(32717)
est = gpd.GeoDataFrame(
    {
        "nombre": limpio(est["NOMBRE"]),
        "tipo": "estatal",
        "rodadura": limpio(est["RODADURA"]),
        "parroquia": "",
    },
    geometry=est.geometry,
    crs=32717,
)

red = gpd.GeoDataFrame(pd.concat([prov, est], ignore_index=True), crs=32717)

# Fuera la Z: las estatales vienen en 3D y un GeoJSON con altura pesa un tercio
# más sin que el visor la use para nada.
red["geometry"] = force_2d(red.geometry)

# El recorte, y solo se queda lo que deja algo dentro.
red["geometry"] = red.geometry.intersection(canton)
red = red.loc[~red.geometry.is_empty & red.geometry.notna()].copy()

# Simplificado en metros, como el resto de capas del visor.
red["geometry"] = red.geometry.simplify(5)
red = red.loc[~red.geometry.is_empty].copy()

red["km"] = (red.geometry.length / 1000).round(3)
red["rodadura"] = red["rodadura"].where(red["rodadura"].isin(RODADURAS), "")

print(f"  tramos: {len(red)}   kilometros: {red['km'].sum():,.0f}")
for tipo, sub in red.groupby("tipo"):
    print(f"    {tipo:<11} {len(sub):>5} tramos {sub['km'].sum():>8,.0f} km")
print("  por capa de rodadura:")
for rod, sub in red.groupby(red["rodadura"].replace({"": "sin dato"})):
    print(f"    {rod.lower():<12} {len(sub):>5} tramos {sub['km'].sum():>8,.0f} km")
print(f"  tramos sin nombre: {(red['nombre'] == '').sum()}")

red = red.to_crs(4326)
red["geometry"] = red.geometry.set_precision(1e-6)
texto = red[["nombre", "tipo", "rodadura", "parroquia", "km", "geometry"]].to_json(
    drop_id=True, to_wgs84=True
)
io.open(DESTINO, "w", encoding="utf-8").write(texto)
print(f"  red_vial.geojson  {len(red)} registros  "
      f"{len(texto.encode('utf-8')) / 1024:.0f} KB")
