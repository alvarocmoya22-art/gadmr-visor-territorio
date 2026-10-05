# -*- coding: utf-8 -*-
"""Mapa del cantón: los proyectos de 2026 sobre la clasificación del suelo.

El visor sólo mira el área urbana —las 18 plataformas— y ahí se quedan fuera 16
de los 36 proyectos, que están en parroquias rurales. Este mapa es la vista que
al visor le falta: todo el cantón, con la clasificación del suelo debajo y las
obras encima.

Sale un PNG para pegar y un PDF vectorial para imprimir.

    python scripts/mapa_proyectos_suelo.py
"""
import json
from pathlib import Path

import geopandas as gpd
import matplotlib

matplotlib.use("Agg")
import matplotlib.patheffects as pe
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.patches import Patch

CLASE = Path(r"C:/Users/alvar/OneDrive/Escritorio/default/clase/clasea.shp")
PROYECTOS = Path(
    r"C:/Users/alvar/OneDrive/Escritorio/default/gadmr-visor-territorio/public/datos/proyectos.geojson"
)
SALIDA = Path(r"C:/Users/alvar/OneDrive/Escritorio/default/clase")

# Se trabaja en UTM 17S: la escala gráfica y las distancias sólo tienen sentido
# en metros, no en grados.
CRS = 32717

# Paleta del sistema de diseño del GADM, tema claro.
TINTA = "#16202a"
TINTA_2 = "#44525e"
TINTA_3 = "#73808b"
LINEA = "#c9d2da"
FONDO = "#ffffff"
SUELO_URBANO = "#dbe7f1"
SUELO_RURAL = "#eef1ec"

#: Color y marca de cada tipo de obra. La marca importa tanto como el color:
#: impreso en blanco y negro, o leído por quien no distingue bien los colores,
#: el color solo no basta.
OBRAS = {
    "parque": ("Parque y espacio público", "#2f8f5b", "o"),
    "cultura": ("Equipamiento cultural", "#6a4fa3", "s"),
    "deporte": ("Cancha, estadio, coliseo", "#1f7a8c", "^"),
    "via": ("Vialidad", "#c9752b", "D"),
    "red": ("Alcantarillado y drenaje", "#2c6fb5", "v"),
    "funerario": ("Cementerio", "#7a6a5f", "P"),
    "dotacion": ("Dotación cantonal", "#8c5a3c", "h"),
    "estudio": ("Estudio o consultoría", "#8d98a3", "X"),
    "otro": ("Otras obras", "#b8577e", "*"),
}


def pesos(n):
    """Dólares en formato es-EC: punto de miles, coma de decimales.

    El signo va escapado porque matplotlib lee `$…$` como fórmula matemática:
    sin escapar, dos cifras en la misma línea convierten lo que hay entre ellas
    en cursiva de ecuación y la frase se vuelve ilegible.
    """
    return r"\$ " + f"{n:,.0f}".replace(",", ".")


def numero(n):
    return f"{n:,.0f}".replace(",", ".")


suelo = gpd.read_file(CLASE).to_crs(CRS)
suelo["clase"] = suelo["FIRST_clas"].str.strip().str.lower()

datos = json.loads(PROYECTOS.read_text(encoding="utf-8"))
pr = gpd.GeoDataFrame.from_features(datos["features"], crs=4326).to_crs(CRS)

urbano = suelo[suelo["clase"] == "urbano"].union_all()
pr["suelo"] = ["Urbano" if urbano.contains(p) else "Rural" for p in pr.geometry]

# Por proyecto y no por punto: una obra con dos sitios no vale el doble.
obras = pr.drop_duplicates("item")
plata = obras.groupby("suelo")["monto"].sum()
colector = obras.loc[obras["monto"].idxmax()]

# El mapa y la leyenda en dos paneles, no uno encima del otro: una leyenda
# flotando sobre el territorio tapa justo lo que se quiere leer, y en esta
# comarca lo que tapaba eran parroquias enteras.
fig = plt.figure(figsize=(14.2, 11.0), dpi=200)
rejilla = fig.add_gridspec(
    1, 2, width_ratios=[1, 0.34], wspace=0.0,
    left=0.035, right=0.975, top=0.905, bottom=0.105,
)
ax = fig.add_subplot(rejilla[0, 0])
panel = fig.add_subplot(rejilla[0, 1])
panel.set_axis_off()
fig.patch.set_facecolor(FONDO)
ax.set_facecolor(FONDO)

suelo[suelo["clase"] == "rural"].plot(ax=ax, color=SUELO_RURAL, edgecolor="none", zorder=1)
suelo[suelo["clase"] == "urbano"].plot(ax=ax, color=SUELO_URBANO, edgecolor="none", zorder=2)

# Límites: los de parroquia finos, el del suelo urbano marcado, porque es la
# línea que decide qué entra en el visor y qué no.
parroquias = suelo.dissolve(by="FIRST_parr").reset_index()
parroquias.boundary.plot(ax=ax, color=LINEA, linewidth=0.8, zorder=3)
suelo[suelo["clase"] == "urbano"].boundary.plot(ax=ax, color="#5b8db8", linewidth=1.4, zorder=4)

for _, r in parroquias.iterrows():
    punto = r.geometry.representative_point()
    ax.annotate(
        str(r["FIRST_parr"]).upper(),
        (punto.x, punto.y),
        ha="center",
        va="center",
        fontsize=7.5,
        color=TINTA_3,
        zorder=5,
        path_effects=[pe.withStroke(linewidth=2.5, foreground=FONDO)],
    )

# Los proyectos. El anillo oscuro marca los que crean alcance de equipamiento:
# es la distinción que usa el análisis del visor y conviene que el mapa impreso
# y la pantalla digan lo mismo.
for clave, (_, color, marca) in OBRAS.items():
    sel = pr[pr["icono"] == clave]
    if sel.empty:
        continue
    for aporta, borde, grosor in ((True, TINTA, 1.4), (False, FONDO, 0.8)):
        trozo = sel[sel["aporta"] == aporta]
        if trozo.empty:
            continue
        ax.scatter(
            trozo.geometry.x,
            trozo.geometry.y,
            s=150 if marca == "*" else 95,
            marker=marca,
            c=color,
            edgecolors=borde,
            linewidths=grosor,
            zorder=7 if aporta else 6,
        )

# El colector es el 57 % de toda la inversión del plan: si el mapa no lo dice,
# el lector reparte el dinero a ojo entre los puntos y se equivoca.
ax.annotate(
    f"Colector nororiental\n{pesos(colector['monto'])} · 57 % del plan",
    xy=(colector.geometry.x, colector.geometry.y),
    xytext=(colector.geometry.x + 7000, colector.geometry.y + 4200),
    fontsize=8.5,
    color=TINTA,
    ha="left",
    arrowprops={"arrowstyle": "-", "color": TINTA_2, "linewidth": 0.9},
    bbox={"boxstyle": "round,pad=0.35", "facecolor": FONDO, "edgecolor": LINEA, "linewidth": 0.8},
    zorder=9,
)

# Escala gráfica, en metros porque el mapa está proyectado.
x0, y0, x1, y1 = suelo.total_bounds
largo = 5000
bx, by = x0 + (x1 - x0) * 0.04, y0 + (y1 - y0) * 0.04
ax.plot([bx, bx + largo], [by, by], color=TINTA, linewidth=2.6, solid_capstyle="butt", zorder=9)
ax.plot([bx, bx + largo / 2], [by, by], color=FONDO, linewidth=1.4, solid_capstyle="butt", zorder=10)
ax.annotate("0", (bx, by + 500), fontsize=7, color=TINTA_2, ha="center")
ax.annotate("5 km", (bx + largo, by + 500), fontsize=7, color=TINTA_2, ha="center")

# Norte.
nx, ny = x1 - (x1 - x0) * 0.05, y1 - (y1 - y0) * 0.09
ax.annotate(
    "N",
    xy=(nx, ny),
    xytext=(nx, ny - (y1 - y0) * 0.045),
    fontsize=10,
    color=TINTA,
    ha="center",
    arrowprops={"arrowstyle": "-|>", "color": TINTA, "linewidth": 1.4},
)

leyenda_suelo = [
    Patch(facecolor=SUELO_URBANO, edgecolor="#5b8db8", linewidth=1.2, label="Suelo urbano"),
    Patch(facecolor=SUELO_RURAL, edgecolor=LINEA, label="Suelo rural"),
]
leyenda_obra = [
    Line2D([], [], linestyle="none", marker=m, markersize=8, markerfacecolor=c,
           markeredgecolor=FONDO, label=r)
    for r, c, m in OBRAS.values()
]
leyenda_alcance = [
    Line2D([], [], linestyle="none", marker="o", markersize=9, markerfacecolor="#9aa6b1",
           markeredgecolor=TINTA, markeredgewidth=1.4, label="Crea alcance de equipamiento"),
]

# Los tres bloques se apilan en el panel, de arriba abajo y alineados a la
# izquierda, con una regla fina que lo separa del mapa.
uno = panel.legend(
    handles=leyenda_suelo, title="Clasificación del suelo", loc="upper left",
    bbox_to_anchor=(0.08, 1.0), frameon=False, fontsize=9, title_fontsize=9.5, alignment="left",
)
panel.add_artist(uno)
dos = panel.legend(
    handles=leyenda_obra, title="Tipo de obra", loc="upper left",
    bbox_to_anchor=(0.08, 0.88), frameon=False, fontsize=9, title_fontsize=9.5, alignment="left",
)
panel.add_artist(dos)
panel.legend(
    handles=leyenda_alcance, title="Para el análisis de cobertura", loc="upper left",
    bbox_to_anchor=(0.08, 0.50), frameon=False, fontsize=9, title_fontsize=9.5, alignment="left",
)
panel.annotate(
    "Los demás son inversión, pero no\ncrean cobertura peatonal: vialidad,\nredes, estudios y dotación cantonal.",
    xy=(0.08, 0.40), xycoords="axes fraction", fontsize=8, color=TINTA_3,
    ha="left", va="top", linespacing=1.5,
)

ax.set_axis_off()
ax.set_aspect("equal")

# Título y subtítulo con `fig.text` y anclados arriba: `suptitle` se centra en
# la coordenada que recibe y crece hacia abajo, de modo que acababa pisando la
# línea siguiente.
fig.text(
    0.06, 0.982, "Proyectos 2026 sobre la clasificación del suelo",
    ha="left", va="top", fontsize=17, color=TINTA, fontweight="bold",
)
fig.text(
    0.06, 0.948,
    "Cantón Riobamba · Jefatura de Diseño de la Obra Pública · Reforma Presupuestaria N.° 9",
    ha="left", va="top", fontsize=10, color=TINTA_2,
)

urb, rur = plata.get("Urbano", 0), plata.get("Rural", 0)
sin_colector = rur - colector["monto"]
fig.text(
    0.06, 0.055,
    f"{numero(len(obras))} proyectos  ·  {numero((obras['suelo'] == 'Urbano').sum())} en suelo urbano "
    f"({pesos(urb)})  ·  {numero((obras['suelo'] == 'Rural').sum())} en suelo rural ({pesos(rur)})\n"
    f"El suelo urbano es el 3,6 % del cantón. Descontado el colector nororiental, la inversión rural "
    f"baja a {pesos(sin_colector)} y queda por debajo de la urbana.",
    ha="left", fontsize=9, color=TINTA_2, linespacing=1.6,
)
fig.text(
    0.06, 0.022,
    "Clasificación del suelo y límites parroquiales: GADM Riobamba  ·  Proyectos: tablero de la "
    "Jefatura de Diseño de la Obra Pública, agosto 2026  ·  EPSG:32717",
    ha="left", fontsize=7.5, color=TINTA_3,
)

# La regla que separa el mapa del panel, en coordenadas de figura.
corte = rejilla[0, 1].get_position(fig).x0 - 0.012
fig.add_artist(Line2D([corte, corte], [0.13, 0.88], color=LINEA, linewidth=1.0))

for ext in ("png", "pdf"):
    ruta = SALIDA / f"mapa_proyectos_2026.{ext}"
    fig.savefig(ruta, facecolor=FONDO)
    print(f"  {ruta.name}: {ruta.stat().st_size / 1024:.0f} KB")
plt.close(fig)
