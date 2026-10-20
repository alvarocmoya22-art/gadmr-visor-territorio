# -*- coding: utf-8 -*-
"""Publica las parroquias del cantón: las cinco urbanas y las once rurales.

El visor ya publicaba `parroquias.geojson` con las cinco urbanas, que es lo
que trae el shapefile de PLATAFORMAS. Las rurales no estaban en ningún
shapefile: solo viven en la base institucional, en `gis_organiparro_a_phdu`.

Ese es el motivo de que este script sea el primero del visor que lee de la
base y no de un archivo. Lo que escribe sigue siendo un GeoJSON estático que
se publica con el resto: la base hace falta para GENERAR la capa, no para
usarla, que era justo la condición.

**La tabla de la base trae Riobamba como una sola parroquia**, que es la
división oficial del INEC: el cantón son doce parroquias y la urbana es una.
Aquí esa se abre en las cinco urbanas del shapefile, porque es el reparto con
el que se trabaja en Planificación.

Y no basta con cambiar una por cinco: la parroquia Riobamba mide 6.195 ha y
las cinco urbanas solo cubren 3.095. Las otras 3.100 son el área rural de la
propia parroquia —donde no hay ni plataformas ni barrios, pero sí catastro y
vías—, y quedarían fuera de todo filtro sin que nada lo dijera. Así que se
publican como una pieza más, que es lo que son. Quedan diecisiete y el cantón
cierra entero.

No se toca `parroquias.geojson`: el visor lo usa para su propio filtro y
cambiarle el contenido le cambiaría la lista por debajo. Esto es una capa
nueva al lado.

    python scripts/parroquias_canton.py

Necesita el servicio de capas levantado (`pg_featureserv` en el 9000), que es
de donde saca las rurales sin pedir credenciales.
"""
import io
import json
import urllib.request

import geopandas as gpd

ORIGEN_URB = (
    r"C:/Users/alvar/OneDrive/INFORMACION RIOBAMBA/PROYECTO PLATAFORMA"
    r"/PLATAFORMAS/PARROQUIAS_URB_CARGA.shp"
)
SERVICIO = "http://localhost:9000/collections/public.gis_organiparro_a_phdu/items"
DESTINO = (
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio"
    r"/public/datos/parroquias_canton.geojson"
)

# La urbana de la tabla oficial, que aquí se reemplaza por las cinco de siempre.
URBANA_OFICIAL = "Riobamba"


def rurales() -> gpd.GeoDataFrame:
    with urllib.request.urlopen(f"{SERVICIO}?limit=200&f=json", timeout=180) as r:
        crudo = json.load(r)
    g = gpd.GeoDataFrame.from_features(crudo["features"], crs=4326)
    g = g.rename(columns={"dpa_despar": "nombre", "dpa_parroq": "clave"})
    fuera = g["nombre"] == URBANA_OFICIAL
    print(f"  tabla oficial: {len(g)} parroquias, se aparta «{URBANA_OFICIAL}»")
    return g.loc[~fuera, ["clave", "nombre", "geometry"]].copy()


def urbanas() -> gpd.GeoDataFrame:
    g = gpd.read_file(ORIGEN_URB)
    g = g.rename(columns={"Label": "nombre", "PARROQUIA": "clave"})
    return g[["clave", "nombre", "geometry"]].to_crs(4326)


def resto_de_riobamba(urb: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """Lo que queda de la parroquia Riobamba al quitarle las cinco urbanas."""
    with urllib.request.urlopen(f"{SERVICIO}?limit=200&f=json", timeout=180) as r:
        crudo = json.load(r)
    g = gpd.GeoDataFrame.from_features(crudo["features"], crs=4326)
    oficial = g.loc[g["dpa_despar"] == URBANA_OFICIAL]
    sobra = oficial.to_crs(32717).geometry.union_all().difference(
        urb.to_crs(32717).geometry.union_all()
    )
    # Fuera las astillas del recorte.
    #
    # Las urbanas vienen de un shapefile y la parroquia oficial de la base:
    # sus límites no coinciden al milímetro, así que la resta deja 146 esquirlas
    # de menos de media hectárea pegadas al borde. No son territorio, son el
    # desajuste entre dos dibujos del mismo límite.
    from shapely.geometry import MultiPolygon

    partes = list(getattr(sobra, "geoms", [sobra]))
    buenas = [x for x in partes if x.area / 10000 >= 0.5]
    tirado = sum(x.area for x in partes if x.area / 10000 < 0.5) / 10000
    print(
        f"  area rural de Riobamba: {len(buenas)} piezas"
        f" (se tiran {len(partes) - len(buenas)} astillas, {tirado:.2f} ha)"
    )
    sobra = MultiPolygon(buenas) if len(buenas) > 1 else buenas[0]
    return gpd.GeoDataFrame(
        {"clave": ["060150R"], "nombre": ["Riobamba · área rural"]},
        geometry=[sobra],
        crs=32717,
    ).to_crs(4326)


u = urbanas()
r = rurales()
resto = resto_de_riobamba(u)
u["tipo"] = "urbana"
r["tipo"] = "rural"
resto["tipo"] = "rural"
print(f"  urbanas: {len(u)}   rurales: {len(r)}   + el área rural de Riobamba")

todo = gpd.GeoDataFrame(
    __import__("pandas").concat([u, r, resto], ignore_index=True), crs=4326
)

# Simplificado en metros, como el resto de capas del visor: sin esto son
# 1,7 MB de vértices para dibujar dieciséis contornos.
todo["geometry"] = todo.to_crs(32717).geometry.simplify(5).to_crs(4326)

# La superficie, medida sobre la proyección métrica local y no sobre grados.
metrico = todo.to_crs(32717)
todo["area_ha"] = (metrico.geometry.area / 10000).round(2)

# --- Comprobaciones, que es la parte que importa -------------------------
union_urb = metrico.loc[todo["tipo"] == "urbana"].geometry.union_all()
union_rur = metrico.loc[todo["tipo"] == "rural"].geometry.union_all()
solape = union_urb.intersection(union_rur).area / 10000
hueco = union_urb.union(union_rur)
print(f"  solape urbano/rural: {solape:.1f} ha")
print(f"  superficie total   : {hueco.area / 10000:,.0f} ha")
print(f"  piezas sueltas     : {len(getattr(hueco, 'geoms', [hueco]))}")

todo["geometry"] = todo.geometry.set_precision(1e-6)
texto = todo[["clave", "nombre", "tipo", "area_ha", "geometry"]].to_json(
    drop_id=True, to_wgs84=True
)
io.open(DESTINO, "w", encoding="utf-8").write(texto)
kb = len(texto.encode("utf-8")) / 1024
print(f"  parroquias_canton.geojson  {len(todo)} registros  {kb:.1f} KB")
