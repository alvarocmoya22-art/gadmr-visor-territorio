# Visor de Territorio · GADM Riobamba

Tablero interno para dirigir y controlar el levantamiento territorial del cantón
Riobamba. Cruza tres fuentes —OpenStreetMap, la vista de calle de Mapillary y el
inventario propio del GADM— y responde a una sola pregunta de gestión: **qué
falta por levantar, dónde, y a quién le toca**.

No es un editor. Es de solo lectura, por decisión: los técnicos editan en campo
con Every Door, que escribe directo a OSM, y este visor mide el resultado.

## Cómo funciona el circuito

```
Técnico en campo          OpenStreetMap            Este tablero
  Every Door      ──────▶   base ODbL    ──────▶   Overpass API
  (POI + tags)              (check_date)           KPIs, cola, mapa
                                                        ▲
                            Mapillary    ──────▶   fotos de calle
                            (CC BY-SA)                  │
                                                        │
  Shapefiles GADM ──────▶   GeoJSON      ──────────────┘
  (plataformas,             public/datos     cotejo y reparto
   equipamientos)
```

Every Door escribe la etiqueta `check_date` cada vez que un técnico confirma un
punto en terreno. El tablero convierte esa etiqueta en el indicador de avance:

| Estado | Criterio | Lectura |
|---|---|---|
| Verificado | `check_date` de 12 meses o menos | levantado y al día |
| Por vencer | entre 12 y 36 meses | reprogramar |
| Vencido | más de 36 meses | vuelve a la cola |
| Sin verificar | sin `check_date` | nunca visitado en campo |

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre <http://localhost:5183>. Overpass es público y las capas del GADM viajan con
el proyecto. La única credencial es la de Mapillary, necesaria para la vista de
calle: ver [Mapillary necesita un token](#mapillary-necesita-un-token). La
primera consulta a OSM tarda entre 10 y 40 s; el resultado queda en caché local
6 h y «Actualizar desde OSM» la fuerza.

## Las capas del GADM

Origen: shapefiles del disco del GADM, todos en EPSG:32717 (UTM 17S) y UTF-8
correcto. Plataformas, parroquias y equipamientos salen de
`INFORMACION RIOBAMBA/PROYECTO PLATAFORMA/PLATAFORMAS`; los barrios, de
`gis_barrios_urb`, que llegó después con la capa ya actualizada. Las rutas están
al principio de `scripts/convertir_shapefiles.py`.

| Capa | Registros | Papel en el tablero |
|---|---|---|
| Plataformas | 18 (A–Q más Ñ) | **Unidad de asignación de campo**: filtro, encuadre y avance por sector |
| Parroquias urbanas | 5 | Contexto: Lizarzaburu, Velasco, Yaruquíes, Veloz, Maldonado |
| Barrios | 212 polígonos, 204 barrios | Contexto y filtro, con el nombre rotulado sobre el mapa |
| Equipamientos | 291 | Inventario propio, contrastado punto a punto contra OSM |

Se convierten con `scripts/convertir_shapefiles.py` (requiere `geopandas`), que
reproyecta a WGS84 y escribe en `public/datos/`. **Esa es la única vía de
actualización**: si llegan shapefiles nuevos se vuelve a correr el script, no se
editan los GeoJSON a mano.

El script descarta la columna `path` de los equipamientos, que traía rutas
absolutas del disco de quien armó la capa.

### El campo `Area` está en hectáreas

No en metros cuadrados, pese a lo que sugiere el nombre. La geometría de las 18
plataformas suma 29,3 km² y el campo suma 2.941,7: coinciden como hectáreas. El
script guarda además `area_ha_geom`, recalculada de la geometría, para que la
discrepancia sea visible si algún día deja de cuadrar.

### El `id` de los equipamientos no es único

Cada capa de origen (educativo, salud, recreativo…) reinicia su numeración, así
que hay `id` repetidos entre capas. El visor usa el índice de fila como clave
real. Conviene tenerlo presente antes de cruzar esta capa con cualquier otra.

## El cotejo con OSM

Cada equipamiento municipal se contrasta contra los puntos de OSM ya cargados, en
el navegador, cada vez que los datos se refrescan. No hay una tabla de
equivalencias que mantener: si alguien añade el sitio a OSM, el estado cambia
solo en la siguiente carga.

| Estado | Criterio | Color |
|---|---|---|
| Confirmado | punto OSM a ≤ 50 m **y** nombre parecido ≥ 0,5 | verde |
| Por verificar | hay algo a ≤ 50 m pero el nombre no cuadra | ámbar |
| Ausente | nada de OSM a 50 m | rojo |
| Sin nombre | el registro municipal no trae nombre | gris |

**Por qué se exige el nombre y no solo la cercanía.** Medido el 2026-09-09: con
solo la distancia, 281 de 291 equipamientos (96,6 %) darían por «registrados».
Exigiendo además que el nombre se parezca, bajan a 253 (86,9 %). En el centro de
Riobamba casi cualquier punto tiene algún vecino a 50 m, así que el criterio de
distancia por sí solo daría por levantado lo que no lo está.

**Sesgo conocido, pendiente de afinar.** El método penaliza a las entidades de
gran superficie: un parque o un campus son polígonos en OSM y se comparan por su
centroide, que puede quedar a más de 50 m del punto municipal. Por eso la ESPOCH
y varios parques salen como «ausentes» sin estarlo necesariamente. Cotejar contra
la geometría del polígono, y no contra su centroide, corregiría la mayor parte.

## Las tres cifras que no hay que confundir

El tablero distingue tres cosas que se parecen y no son lo mismo. Se separaron
porque se leían al revés: «Capas temáticas» parecía la lista de lo que faltaba,
cuando era justo lo contrario.

| Cifra | Qué es | Dónde |
|---|---|---|
| **Registros** | lo que ya existe en OpenStreetMap dentro del ámbito | KPI «Registros en vista» y columna *Registros* |
| **Levantados** | de esos, los confirmados en campo con Every Door (llevan `check_date`) | KPI «Levantados en campo» y columna *Levantados* |
| **Faltan** | el resto: sin `check_date` o vencido | KPI «Faltan por levantar» y columna *Faltan* |

A esas tres se suma una cuarta, de otra fuente: **Equip.**, los equipamientos
del inventario municipal que aún no se confirman contra OSM.

La tabla «Registros por plataforma» las muestra juntas, con fila de totales, de
modo que se pueda comparar las 18 de un vistazo.

## Los espejos de Overpass no van sincronizados

Esto causó el problema más difícil de ver de todo el proyecto: **la misma
plataforma mostraba 437 registros con 82,8 % levantado y al rato 57 con 0 %**.

No era el tablero: era qué espejo respondía.

El visor se quedaba con el primero que contestara. Si contestaba el atrasado, se
veía un Riobamba de tres meses antes —menos puntos y casi ningún `check_date`—
sin que nada lo indicara.

Ahora **recorre los espejos y se queda con el de la base más reciente**: acepta
el primero solo si viene con menos de 3 días de retraso, y si ninguno lo está usa
el menos atrasado **y lo avisa en pantalla**, diciendo cuántos días trae. Es
preferible una cifra vieja señalada como vieja que una cifra vieja disfrazada de
actual.

Por eso la cabecera muestra siempre la fecha de la base OSM que respondió: no es
un adorno, es lo que permite saber si dos personas están mirando lo mismo.

### Dos de los tres espejos nunca sirvieron

Comprobado contra Riobamba el 23/09/2026, consultando cada uno desde el
navegador:

| Espejo | Resultado | Qué se hizo |
|---|---|---|
| `overpass-api.de` | base al día, 764 ms… y `504` un minuto antes | se queda, el primero |
| `maps.mail.ru/osm/tools/overpass` | base al día, 12–28 s, CORS correcto | **se añade** |
| `overpass.kumi.systems` | sin respuesta; ya no figura entre las instancias públicas activas | se quita |
| `overpass.osm.ch` | `200` en medio segundo con **cero elementos** | se quita |

El de Suiza merece una explicación, porque durante meses pareció una avería:
**`overpass.osm.ch` solo sirve datos suizos**. Devolvía cero elementos para
Riobamba porque Riobamba no está en su base, no porque estuviera roto. El sello
inservible —`"34"`, luego `"117224"`— despistó todavía más. Nunca debió estar
en la lista.

También se probaron y descartaron `overpass.private.coffee` (falla tras 85 s),
`overpass.osm.jp`, `overpass.osm.ne.jp`, `overpass.nchc.org.tw` y
`overpass.monicz.dev`. Las demás instancias del wiki con cobertura mundial
exigen clave de pago.

### El bueno se cae a ratos, así que se reintenta

`overpass-api.de` va al día pero está sobrecargado —el propio wiki de OSM avisa
de que no se espere alta fiabilidad—. Un `502`, `503`, `504` o una caída de red
**ya no descartan el espejo**: se reintenta una vez más antes de pasar al
siguiente. Un `400` no se reintenta, que ahí la consulta está mal.

Y la copia atrasada **caduca a los 20 minutos en vez de a las 6 horas**. Un
único fallo del espejo bueno llegó a condenar toda una mañana a datos de 58 días
antes, aunque volviera a estar disponible al minuto siguiente. Una copia al día
sí conserva las 6 horas, para no machacar los espejos en cada recarga.

## Mapas base y filtro por barrio

El panel permite cambiar el **mapa base** entre cuatro fondos, todos con teselas
públicas y sin credencial:

| Mapa | Para qué |
|---|---|
| OpenStreetMap | callejero con nombres y comercios |
| Humanitario | trazado limpio: resaltan los puntos y los límites |
| Satélite | ortofoto (Esri): construcción y ocupación real |
| Topográfico | relieve y curvas de nivel; tarda unos segundos |

Los cuatro se declaran juntos en el estilo y solo se alterna su visibilidad:
cambiar de estilo entero obligaría a reconstruir todas las capas de datos y a
recargar los GeoJSON.

**Un 200 no basta para dar por bueno un mapa base.** Aquí figuraba CARTO
Positron, cuyas teselas siguen respondiendo `200` con 18 KB… que resultaron ser
la imagen con la marca «API KEY REQUIRED» impresa encima. Se vio al mirar el
mapa, no al comprobar el código de respuesta. Si se añade otro proveedor,
conviene abrir una tesela y verla.

Antes de publicar el visor fuera de la red municipal hay que revisar la política
de uso de cada proveedor: la de OpenStreetMap, en particular, no admite tráfico
alto.

### Buscador de calles

Escribir el nombre de una calle dice **por qué plataformas pasa**, encuadra el
mapa en ella y marca su punto medio. Cada plataforma es un botón: pulsarlo
filtra el tablero por ese sector.

Se listan **todas** las plataformas que cruza, no una. De las 1.017 calles
indexadas, **230 atraviesan dos o más**: decir que la Primera Constituyente «es
de la K» sería falso, pasa por I, J, K, Q y Ñ. La Avenida 9 de Octubre toca
cinco y Argentinos, seis.

El índice lo genera `scripts/indexar_calles.py` y vive en
`public/datos/calles.json` (156 KB). Se precalcula en vez de resolverlo en el
navegador por dos razones: la geometría completa son 2 MB que nadie necesita
para buscar un nombre, y el cruce calle-plataforma sale más fiable con
intersección real de líneas y polígonos que aproximándolo en JavaScript. Como
las calles de OSM cambian, conviene volver a correr el script cada cierto
tiempo:

```bash
python scripts/indexar_calles.py
```

**Se descartan los nombres-marcador de OSM.** En el cantón hay 373 segmentos
cuyo «nombre» es en realidad la ausencia de nombre: `Calle Sin Nombre` aparece
155 veces, y hay `ub`, `calle urbana`, `no tiene nombre` o `no se puede
responder`. No se filtra por longitud, ojo: en Riobamba hay calles reales que se
llaman Cuba, Loja, Roma, Napo o Tena.

198 calles quedan fuera de toda plataforma, porque las 18 cubren el área urbana
y no el territorio rural; el buscador lo dice en vez de callarlo.

### Filtro por barrio

Junto al de plataforma hay un **selector de barrio** que recorta igual los KPIs,
la cola de campo, el inventario y los conteos de la leyenda, resalta el barrio en
el mapa y encuadra la vista en él. Elegir uno enciende la capa de barrios: filtrar
por una zona que no se ve dibujada deja sin saber qué recorte se está mirando.

**El shapefile trae 212 polígonos pero solo 204 barrios.** Ocho no tienen nombre
y ocho vienen partidos en dos piezas (24 DE MAYO, TUBASEC, SAN JOSE DE TAPI,
SANTA FAZ, BOLIVAR CHIRIBOGA, SANTA ROSA, LA MERCED, SAN FRANCISCO). Las piezas
del mismo barrio se agrupan —filtrar por TUBASEC devuelve las dos— y a los
anónimos se les pone su número (`Sin nombre (n.º 141)`) para que se puedan
distinguir y filtrar. Sin eso, dos barrios distintos compartían identidad y el
filtro los mezclaba.

La capa se actualizó el 2026-09-14 desde `gis_barrios_urb/barrios_urb_actualizado.shp`:
entraron 17 barrios (COLINAS DEL SUR, EMANUEL 1 y 2, MARGASPAMBA, OROLOMA,
ROSASPAMBA, SAN FRANCISCO DE MACAJÍ, VILLA LA UNIÓN, entre otros) y se
corrigieron nombres —`COPERATIVA TIERRA NUEVA` pasó a `COOPERATIVA TIERRA
NUEVA`—. El área total apenas varía, de 2.928,8 a 2.929,3 ha, así que el cambio
es de detalle y nomenclatura, no de extensión.

**Al cambiar los barrios hay que reindexar las calles**, porque el buscador
guarda por qué barrios pasa cada una:

```bash
python scripts/convertir_shapefiles.py
python scripts/indexar_calles.py
```

## Análisis espacial con deck.gl

Pestaña **Espacial**: los mismos datos del visor, dibujados con deck.gl 9.4
sobre el mapa que ya existe. No es una vista aparte —se monta como overlay con
`MapboxOverlay`—, así que hereda filtros, límites municipales, buscador y
controles sin duplicar nada.

| Escenario | Capa | De dónde sale |
|---|---|---|
| Puntos por categoría | `ScatterplotLayer` | Registros de OSM filtrados, color por categoría o por estado |
| Densidad en hexágonos | `HexagonLayer` | Los mismos registros, agregados; radio de 75 a 500 m, 3D opcional |
| Asignación barrio → equipamiento | `ArcLayer` | Centro del barrio al equipamiento más cercano; grosor = población |
| Recorridos de campo | `TripsLayer` | **Bloqueado**, ver abajo |

**deck.gl se carga solo al abrir la pestaña.** El paquete pesa más que todo el
resto junto, así que va en `import()` dinámico: el bundle principal sube 14 KB
y los 858 KB de deck quedan en chunks aparte que solo descarga quien entre.

### Por qué «Recorridos» está bloqueado y no simulado

De los 2.899 registros solo **433 traen `check_date`**, en **17 días
distintos**, **ninguno con hora**, y **378 de esos 433 son del mismo día**.
Ordenar los puntos de una jornada para reconstruir por dónde pasó la brigada
sería inventarse un recorrido que el dato no contiene, así que el escenario
aparece deshabilitado y explica el motivo en pantalla.

La vía real son las **secuencias de Mapillary**, que sí llevan `captured_at`
por imagen. Queda pendiente de decidir porque la API limita cada consulta a
0,01 grados² y habría que trocear cada plataforma en varias peticiones.

### Los arcos no son viajes

No hay ninguna matriz origen-destino en el proyecto. Cada arco une el centro de
un barrio con el equipamiento más cercano **en línea recta**, y su grosor es la
población del Censo 2022. Sirve para ver qué equipamiento carga con cuánta
gente —es el análisis de cobertura dibujado como asignación de demanda—, no
para medir desplazamientos. La vista lo dice bajo las cifras.

### Añadir un escenario nuevo

1. En `src/config/deckEscenarios.ts`, añade la clave a `ClaveEscenario` y una
   entrada a `ESCENARIOS` con su rótulo, qué responde, de dónde salen los datos
   y `bloqueado: null`. Si el dato no da, pon el motivo en `bloqueado` en vez
   de inventarlo.
2. En `src/lib/deck/escenarios.ts`, escribe la función que devuelve la capa.
   Los colores se leen de `lib/deck/colores.ts`, nunca a mano: así siguen los
   tokens del sistema y el tema oscuro. Si el color depende de un control,
   declara ese control en `updateTriggers` o deck.gl no repintará.
3. En `src/components/Mapa.tsx`, añade el caso al `switch` que arma `lista`
   dentro del efecto del overlay.
4. En `src/components/PanelEspacial.tsx`, añade sus controles, sus cifras y
   **su tabla**: un mapa 3D no es legible con un lector de pantalla, así que la
   tabla es la vía alternativa, no un extra.
5. Si el escenario necesita un cálculo caro, hazlo en `lib/deck/escenarios.ts`
   y llámalo desde `App.tsx` solo cuando la pestaña esté abierta, como se hace
   con `resumenFlujos`.

### Lo que falta por validar

- **`check_date` como fecha de campo.** Se usa como «día en que se verificó»,
  que es como lo emplea el equipo, pero OSM no garantiza que quien puso la
  etiqueta fuera la brigada.
- **El umbral de 1.000 m** que pinta un arco en rojo es una elección mía, no
  una norma. Los radios normativos son los del Código Urbano y están en la
  pestaña Análisis.
- **El tope de 250 arcos.** Por encima la vista deja de leerse; se dibujan los
  barrios más poblados. Si hace falta el total exacto, está en la tabla.

## De dónde sale cada análisis

El visor tiene dos inventarios y no dicen lo mismo: el del GADM (291
equipamientos) y lo levantado en OpenStreetMap. Qué usa cada análisis:

| Análisis | Inventario del GADM | OpenStreetMap |
|---|---|---|
| Distancia al equipamiento más cercano | sí, con selector | sí, con selector |
| Cobertura por radio de servicio | sí, con selector | sí, con selector |
| Cruce de dos categorías | no | sí |
| Levantado en OSM y no inventariado | sí, como referencia | sí |
| Calor de registros y de pendientes | no | sí |
| Calor de equipamientos | sí | no |

Las **dos capas por barrio comparten tipo y fuente** a propósito. Si cada una
eligiera por su cuenta, el mapa podría afirmar a la vez que un barrio está a
900 m del equipamiento más cercano y que está cubierto, porque estarían
midiendo contra listas distintas.

Poder elegir la fuente no es un adorno. En la plataforma D, con equipamiento de
salud:

| Qué se cuenta | Puntos | Barrios sin ninguno | Distancia mediana |
|---|---|---|---|
| Solo el inventario del GADM | 0 | 25 de 25 | sin dato |
| Las dos fuentes | 27 | 14 | 148 m |

El inventario municipal no tiene ni un centro de salud dentro de la plataforma
D. Midiendo solo contra él, el mapa pinta un desierto sanitario que no existe:
lo que hay es un vacío de inventario, no de servicio.

## Los radios de cobertura salen de la ordenanza

No son una estimación ni un orden de magnitud: están tomados del **Código
Urbano de Riobamba, artículo 178, tabla 3** (Registro Oficial Edición Especial
N.º 885, 23 de mayo de 2023, págs. 151–160). La propia tabla dice para qué
sirve el radio de influencia: es «el referente urbano de implantación de los
equipamientos en urbanización nueva y **evaluatorio en las áreas urbanas
consolidadas**». Lo segundo es exactamente lo que hace el visor.

| Tipo del inventario | Barrial | Zonal | Cantonal |
|---|---|---|---|
| Educativo | 400 m (EE1) | 2.000 m (EE2) | sin radio (EE3) |
| Salud | 800 m (ES1) | 2.000 m (ES2) | sin radio (ES3) |
| Recreativo | 400 m (ED1) | 3.000 m (ED2) | sin radio (ED3) |
| Religioso / cultura | 400 m (EC1) | 2.000 m (ER2/EC2) | sin radio |
| Administrativo | 400 m (EG1, UPC) · 2.000 m (EG1, bomberos) | — | sin radio (EA1) |

Los niveles **cantonales no se ofrecen**, y no por falta de dato: la tabla les
pone «---» porque sirven a toda la ciudad y no tienen área de influencia local.
Medirlos con un radio inventado daría una cifra sin respaldo. El visor lo dice
en pantalla en vez de dejar el hueco.

### El nivel no es solo un número, también elige qué se cuenta

El radio barrial de 400 m es el de la escuela, no el de la universidad. Como el
inventario municipal **sí trae subtipo en lo educativo** —63 `school`, 20
`college`, 10 `kindergarten`, 6 `university`—, cada nivel cuenta solo los suyos:

- **EE1 Barrial**: `school` y `kindergarten`
- **EE2 Zonal**: `college`
- **EE3 Cantonal**: `university`

Lo mismo se aplica a los registros de OSM cuando se cuentan como servicio, por
su etiqueta `amenity`. En los demás tipos el inventario no trae subtipo, así que
todos los equipamientos se miden con el nivel que se elija; conviene tenerlo
presente al leer la cifra.

### Lo que sale al aplicarlo

Riobamba urbano, equipamiento **educativo barrial (EE1, 400 m)**, contando solo
el inventario del GADM:

- **63,8 % de la población cubierta** — 110.288 de 172.884 habitantes
- **62.596 personas fuera** del radio que fija la ordenanza
- 50,0 % de la superficie, con 69 equipamientos
- 29.305 personas viven en barrios sin ninguna cobertura

Sumando lo registrado en OpenStreetMap sube a 68,9 % (162 equipamientos: 69 del
inventario y 93 de OSM). La diferencia entre las dos cifras es la medida de lo
que le falta al inventario, no de lo que le falta a la ciudad.

## La población viene del Censo 2022, agregada

El análisis de cobertura mide habitantes, no solo hectáreas. La población sale
del **INEC, Censo de Población y Vivienda 2022**, de la capa de *sectores
censales anonimizados con indicadores*, que trae `pob_t` (población total),
`v_pres` (viviendas ocupadas), `p_hog` (tamaño del hogar) y los dos campos de
servicios básicos. El cantón 0601 tiene **1.029 sectores y 260.882 habitantes**;
dentro de las 18 plataformas viven **172.884**.

### Al repositorio solo llega el agregado

La capa del INEC **no se copia al proyecto**. Sus metadatos declaran
`accessConstraints: copyright` y `useConstraints: copyright` bajo las «Políticas
de uso de la información cartográfica estadística», y este repositorio es
público: publicar los sectores sería redistribuir el dato, que no es lo mismo
que usarlo. Lo que se versiona es `public/datos/poblacion.json` (14 KB), un
resumen por barrio y por plataforma, con la fuente citada en el propio archivo y
en la interfaz.

### Reparto dasimétrico, no proporcional al área

    población del sector ÷ edificios del sector = población por edificio
    edificio → barrio que lo contiene
    barrio = suma de sus edificios

Repartir proporcional al área supone que la gente está esparcida por igual
dentro del sector, y no lo está: un sector de borde urbano es mitad manzanas y
mitad terreno vacío. Los **95.232 puntos de edificio** de la Geodatabase
Nacional 2024 del INEC (capa `edif_p` del cantón 0601, EPSG:31992) dicen dónde
hay construcción, así que la población va donde hay con qué habitarla. Los dos
métodos dan 172.884 y 171.230 habitantes urbanos: un 1 % de diferencia que se
concentra, como era de esperar, en los barrios de borde.

Ninguno de los 95.232 edificios quedó fuera de un sector y ningún sector se
quedó sin edificios, así que no hizo falta el reparto por área de reserva.

**Dentro del barrio la población sí se reparte uniformemente** al calcular
cobertura. Es un supuesto, pero mucho más inocente que hacerlo a nivel de
sector: los barrios urbanos son pequeños y homogéneos.

### Regenerar

Requiere los dos archivos del INEC en el disco; las rutas están al principio del
script:

```bash
python scripts/poblacion_barrios.py
```

Hay que volver a correrlo **cada vez que cambien los barrios**, porque la
población se agrega por nombre de barrio.

## Descargar lo que se ve

Los dos botones de la cabecera exportan **el recorte activo**, no todo el
cantón: lo que quede tras los filtros de plataforma, barrio, categoría, estado y
búsqueda.

| Formato | Para qué |
|---|---|
| **GeoJSON** | abrirlo en cualquier sitio, conserva el texto tal cual |
| **Shapefile** | entregarlo a quien trabaja en QGIS o ArcGIS; sale en un ZIP |

Campos exportados: `id`, `nombre`, `categoria`, `clase`, `frescura`,
`check_date`, `completo` (porcentaje), `plataforma` y `barrio`. Están nombrados
a mano y ninguno pasa de 10 caracteres, que es el máximo del DBF: si se dejara
que la librería los recortara sola, `completitud` acabaría como `completitu`.

2.459 puntos salen en un ZIP de 131 KB en una décima de segundo.

### El DBF va en Latin-1, y el `.cpg` lo dice

`@mapbox/shp-write` escribe el DBF en **Latin-1**, no en UTF-8, y no genera
`.cpg`. El visor se lo añade declarando `ISO-8859-1`, que es la verdad.

Esto se descubrió porque declarar `UTF-8` «porque toca» **rompía el archivo**:
GDAL se creía la declaración, encontraba el byte `0xCD` de «MACAJÍ» y fallaba al
abrirlo. Comprobado leyendo el shapefile generado con geopandas —que es lo que
hay debajo de QGIS—: con `ISO-8859-1` abre limpio y `SAN FRANCISCO DE MACAJÍ`,
`VILLA LA UNIÓN` y la plataforma `Ñ` se leen bien.

La consecuencia a tener presente: un carácter fuera de Latin-1 no cabe en ese
DBF. Para nombres en español no es problema, y si apareciera alguno el visor lo
avisa por consola. **El GeoJSON no tiene esa limitación**: si el destino lo
admite, es el formato más fiel.

## Vista de calle: Mapillary

El panel derecho muestra **siempre** la vista de calle, en lo alto. Si hay un
punto o un equipamiento elegido, enseña el suyo; si no hay ninguno, sigue al
centro del mapa. Debajo aparecen las miniaturas de las demás fotos a menos de
60 m, ordenadas por cercanía, para cambiar de punto de vista.

**En el mapa se marca de dónde sale esa foto**: un punto con borde blanco y un
cono que apunta hacia donde miraba la cámara, según el rumbo que da Mapillary.
Sin esa marca la imagen no dice a qué sitio pertenece.

**Pinchar una foto del mapa la abre en el panel**, no en otra pestaña. Se puede
recorrer la ciudad clic a clic sin salir del tablero; elegir después un punto o
un equipamiento devuelve la vista a ese sitio.

**Se muestra como imagen fija, y el recorrido queda a un clic** («Recorrer la
calle»). Es deliberado: el *embed* de Mapillary carga sus controles enseguida
pero a veces deja el lienzo en negro varios segundos, o no llega a pintar —
comprobado también fuera del tablero, en una pestaña limpia, así que es cosa
suya. La imagen directa, en cambio, se ve siempre. Primero ver algo; explorar,
si hace falta.

Se usa el *embed* público en un `iframe`, no la librería `mapillary-js`: dentro
del visor ya se puede recorrer la secuencia, y así el tablero no carga una
dependencia más.

### De dónde sale la imagen del visor

Hay dos caminos, y el segundo salva al primero:

1. **Graph API** (`/images`) — da la foto más cercana con su fecha, distancia y
   miniaturas. Requiere que la aplicación de Mapillary tenga **permiso de
   lectura**.
2. **Teselas vectoriales** — la capa `image` trae el id de cada foto. Funciona
   aunque la Graph API no devuelva nada, y de ahí sale la imagen del visor.

Esto importa porque un token **sin permiso de lectura no da error**: la Graph API
responde `200` con `data: []`, como si no hubiera fotos en ninguna parte. Se
comprobó contra París y Berlín, con cobertura masiva, y también devolvían cero.
Si ve el aviso «Imagen tomada de las teselas del mapa», es exactamente ese caso:
entre en el panel de Mapillary, edite la aplicación y marque el permiso de
lectura. El visor funciona igual, pero sin fecha, distancia ni miniaturas.

### Las fotos pueden ser antiguas

La cobertura de Riobamba que se ha revisado es de **2017**. Para verificar si un
local sigue abierto no sirve: para eso está el trabajo de campo con Every Door.
Sirve para ubicarse, reconocer el sitio y preparar la ruta antes de salir.

Mapillary es la única fuente. Antes hubo también Panoramax y se retiró: **no
tiene recorridos en Riobamba** (5 fotos en todo el cantón, ninguna en la zona
urbana), mientras que Mapillary tiene la ciudad recorrida entera. Mantener una
integración que no devolvía nada solo añadía peticiones y ruido en la interfaz.

Si algún día el GADM levanta su propia instancia de Panoramax, habrá que volver a
cablearla: el código se quitó, no se dejó desactivado.

### Mapillary necesita un token

Mapillary exige credencial tanto para las teselas como para la Graph API.

```bash
cp .env.example .env.local   # y pegue el token dentro
```

El token se saca registrando una aplicación en
<https://www.mapillary.com/dashboard/developers> y empieza por `MLY|`. Es un
token **de cliente**: viaja al navegador y cualquiera que abra el visor puede
leerlo. Para uso interno es lo normal; no protege nada que no sea el cupo de la
propia cuenta. `.env.local` está en `.gitignore`.

Sin token el visor **funciona igual** en todo lo demás —OSM, plataformas,
equipamientos, cotejo—, pero no hay vista de calle: la capa no se añade y las
fichas lo dicen con un aviso en vez de quedarse mudas.

### Límite de área de la Graph API

Desde enero de 2026 Mapillary rechaza las consultas cuyo bbox supere **0,01
grados cuadrados**. Un radio de 60 m alrededor de un punto cabe de sobra, pero el
cantón entero no: por eso la cobertura general se ve por teselas vectoriales y no
hay un KPI que cuente las fotos de Mapillary del cantón. Contarlo exigiría barrer
el territorio en cientos de peticiones, y no aportaría a la gestión.

## Estado verificado el 2026-09-09

| Comprobación | Resultado |
|---|---|
| Puntos leídos del cantón | 2.501 |
| Con `check_date` vigente | 39 (1,6 %) |
| Completitud media de ficha | 36,0 % |
| Equipamientos del GADM por verificar | 82 de 291 |
| Cobertura Mapillary en Riobamba | ciudad recorrida (verificado en su visor) |

El 98,4 % del cantón no ha sido verificado nunca en campo: esa es la línea base
sobre la que se mide el avance, no un defecto del tablero.

### El reparto por plataforma es muy desigual

Medido sobre las mismas fuentes: la plataforma K concentra 479 puntos y la A
apenas 6. Antes de asignar una plataforma por técnico conviene mirar la columna
«Pendiente» de la tabla de avance: repartir por sector sin mirar la carga
significa repartir muy desigual. Además, 570 de los 2.872 puntos del cantón caen
fuera de toda plataforma, porque las plataformas cubren el área urbana y no el
territorio rural.

## Qué mira cada parámetro

- `src/config/riobamba.ts` — `RELACION_CANTON = 108867` (límite del cantón en
  OSM, confirmado contra Nominatim), los espejos de Overpass y los umbrales de
  frescura. **Validar** los 12 y 36 meses con la Dirección: son un supuesto de
  trabajo, no una norma citada.
- `src/lib/municipal.ts` — `RADIO_COTEJO_M` (50 m) y `UMBRAL_NOMBRE` (0,5).
- `src/lib/mapillary.ts` — el radio de búsqueda de fotos y el límite de área que
  impone su API.
- `src/lib/categorias.ts` — las capas temáticas y sus `camposClave`. Esa lista
  debería coincidir con el preset que se configure en Every Door: lo que el
  tablero reporta como faltante es lo que el técnico verá como campo vacío.

## Decisiones que conviene conocer

**Solo lectura.** Editar OSM desde aquí exigiría cuentas OSM por técnico y
abriría un problema de licencia: cualquier dato municipal que se suba queda bajo
ODbL, y los datos derivados también. Every Door ya resuelve la edición y su
trazabilidad.

**Sin base de datos propia.** El estado del levantamiento vive en OSM, en
`check_date`. No hay una segunda fuente que mantener sincronizada.

**El mapa base es el estándar de OSM.** Sirve para desarrollo y uso interno de
pocos usuarios. Para uso masivo o publicación externa, la política de uso de
`tile.openstreetmap.org` obliga a cambiar a un proveedor propio o contratado; se
cambia en `crearEstiloBase()` dentro de `src/components/Mapa.tsx`.

**Los colores del mapa se eligen contra el mapa base, no contra el tema.** El
raster de OSM es siempre claro, tambien cuando la interfaz esta en oscuro, asi
que un tono pensado «para tema oscuro» se pierde justo encima. Por eso el limite
de barrio (`--gr-limite-barrio`, magenta oscuro) y los filetes blancos que lo
acompañan no cambian con el tema. Ese color esta fuera de las ocho series
tematicas a proposito: un limite administrativo no es una categoria de dato y no
debe leerse como tal.

**Las etiquetas de barrio necesitan un servidor de tipografías.** MapLibre no
dibuja texto sin *glyphs*, así que el estilo apunta a los del proyecto MapLibre
(`demotiles.maplibre.org`). Si ese servicio dejara de estar disponible, los
nombres de barrio desaparecen y el resto del mapa sigue igual. Ojo al declarar
la fuente: ese servidor **no sirve pilas de varias fuentes** —pedirle
`Open Sans Semibold,Noto Sans Regular` devuelve 404—, por eso se declara una
sola. Con 197 barrios no hace falta filtrar a mano: MapLibre descarta las
etiquetas que chocan entre sí, y solo aparecen a partir del zoom 13.

**Los rótulos de plataforma son marcadores HTML**, no una capa de símbolos del
mapa. Así el visor no depende de un servidor de glyphs solo para dibujar 18
letras.

**El estilo del mapa se construye por instancia**, con `crearEstiloBase()`, no
como una constante compartida. MapLibre consume el objeto de estilo que recibe,
asi que reutilizarlo entre montajes deja al segundo mapa sin estilo y su evento
`load` no llega a dispararse: el mapa aparece en blanco y sin errores visibles.
Por la misma razon el mapa tiene un manejador de `error` que escribe en consola.

**El estado «mapa listo» es estado de React, no un `ref`.** Con un `ref` mas un
evento propio habia una carrera: si el evento ya habia ocurrido cuando un efecto
se suscribia, ese efecto no corria nunca y su capa quedaba sin dibujar.

**Los colores del mapa se repintan al cambiar de tema.** MapLibre resuelve los
colores una sola vez, asi que sin `aplicarColoresTema()` el mapa se quedaria con
la paleta del tema con el que cargo.

**El botón «Abrir en el teléfono»** usa un enlace `geo:`. **Validar en un
dispositivo Android** que Every Door aparezca entre las aplicaciones ofrecidas;
no está comprobado.

## Accesibilidad

El mapa no es la única vía: la tabla lateral contiene los mismos puntos,
ordenados por prioridad de campo y navegables por teclado. Ninguna categoría se
distingue solo por color — todas llevan rótulo y conteo, y cada estado lleva
texto además de color. Contrastes verificados en tema claro y oscuro.

## Licencias

Los datos de OpenStreetMap son **ODbL**: cualquier publicación derivada debe
atribuir y mantener la licencia. Las fotografías de Mapillary son **CC BY-SA
4.0**: se pueden mostrar y reutilizar citando autoría y manteniendo la licencia,
pero eso no permite incorporarlas a un producto cerrado sin más.

### Las capas del GADM están publicadas en este repositorio

Este repositorio es **público**, así que los GeoJSON de plataformas, parroquias,
barrios y equipamientos son descargables por cualquiera. Se publicaron por
decisión expresa del responsable del proyecto. Quien los reutilice debería
contrastarlos con el GADM Riobamba antes de darlos por vigentes: proceden de
shapefiles de trabajo, no de una publicación oficial de datos abiertos, y el
cotejo con OSM que hace el visor deja ver que tienen erratas (nombres repetidos,
registros sin nombre, barrios partidos en dos piezas).

El código no lleva archivo de licencia: sin uno, se aplica «todos los derechos
reservados» por defecto. Si se quiere que otros puedan reutilizarlo, hay que
añadir una licencia explícita. Las capas del GADM Riobamba son de **uso
interno**; antes de cualquier despliegue público hay que revisar qué se expone y
con qué autorización.
