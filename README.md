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

Origen: shapefiles en `INFORMACION RIOBAMBA/PROYECTO PLATAFORMA/PLATAFORMAS`,
todos en EPSG:32717 (UTM 17S) y UTF-8 correcto.

| Capa | Registros | Papel en el tablero |
|---|---|---|
| Plataformas | 18 (A–Q más Ñ) | **Unidad de asignación de campo**: filtro, encuadre y avance por sector |
| Parroquias urbanas | 5 | Contexto: Lizarzaburu, Velasco, Yaruquíes, Veloz, Maldonado |
| Barrios | 197 polígonos, 190 barrios | Contexto y filtro, con el nombre rotulado sobre el mapa |
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

### Filtro por barrio

Junto al de plataforma hay un **selector de barrio** que recorta igual los KPIs,
la cola de campo, el inventario y los conteos de la leyenda, resalta el barrio en
el mapa y encuadra la vista en él. Elegir uno enciende la capa de barrios: filtrar
por una zona que no se ve dibujada deja sin saber qué recorte se está mirando.

**El shapefile trae 197 polígonos pero solo 190 barrios.** Nueve no tienen nombre
y siete vienen partidos en dos piezas (TUBASEC, SAN JOSE DE TAPI, SANTA FAZ,
BOLIVAR CHIRIBOGA, SANTA ROSA, LA MERCED, SAN FRANCISCO). Las piezas del mismo
barrio se agrupan —filtrar por TUBASEC devuelve las dos— y a los anónimos se les
pone su número (`Sin nombre (n.º 141)`) para que se puedan distinguir y filtrar.
Sin eso, dos barrios distintos compartían identidad y el filtro los mezclaba.

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
pero eso no permite incorporarlas a un producto cerrado sin más. Las capas del GADM Riobamba son de **uso
interno**; antes de cualquier despliegue público hay que revisar qué se expone y
con qué autorización.
