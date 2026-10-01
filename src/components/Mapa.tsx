import { useEffect, useRef, useState } from 'react'
import maplibregl, { type ExpressionSpecification, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { VISTA_INICIAL } from '../config/riobamba'
import { capaDe, capaRotulosDe, MAPAS_BASE, MAPA_BASE_INICIAL } from '../config/mapasBase'
import { ICONOS_PROYECTO, imagenDeIcono, nombreIcono } from '../config/iconosProyecto'
import { CATEGORIAS, paletaResuelta, POR_CLAVE, type ClaveCategoria } from '../lib/categorias'
import { paletaUsos } from '../lib/usos'
import { aGeoJSON, type Punto } from '../lib/overpass'
import {
  aGeoJSONEquipamientos,
  URBANO,
  type CapasMunicipales,
  type EquipamientoMunicipal,
} from '../lib/municipal'
import { urlTeselas as urlTeselasMapillary } from '../lib/mapillary'
import { distanciaM } from '../lib/geo'
import type { Calle } from '../lib/calles'
import type { Barrio } from '../lib/municipal'
import {
  PITCH_3D,
  type AlturaBarrio,
  type ClaveEscenario,
  type ColorBarrio,
  type ColorPor,
  type PesoDensidad,
} from '../config/deckEscenarios'

/** Lo que el escenario avanzado necesita para dibujarse. */
export interface Espacial {
  escenario: ClaveEscenario
  colorPor: ColorPor
  radio: number
  peso: PesoDensidad
  extruido: boolean
  tipoEquipamiento: string
  altura: AlturaBarrio
  colorBarrio: ColorBarrio
  barrios: Barrio[]
  /** Isócrona ya resuelta; null mientras se calcula o si no toca. */
  isocrona: {
    red: { aristas: [number, number, number, number[][]][] }
    alcanzables: { arista: number; minutos: number }[]
    tramos: number[]
    bandas: { minutos: number; piezas: [number, number][][][] }[]
  } | null
  /** Dibujar tambien las calles alcanzables encima de la mancha. */
  verCalles: boolean
}

/** Qué densidad se dibuja como mapa de calor. */
export type MapaCalor = 'ninguno' | 'registros' | 'pendientes' | 'equipamientos'

/** Cruce de dos categorías, tal como lo necesita el mapa para resaltarlo. */
export interface CruceMapa {
  a: ClaveCategoria
  b: ClaveCategoria
  /** Ids de los puntos de A sin ningún B dentro del umbral. */
  desatendidos: string[]
}

export interface CapasVisibles {
  /** Los registros de OpenStreetMap: el dato principal del visor. */
  osm: boolean
  mapillary: boolean
  plataformas: boolean
  parroquias: boolean
  barrios: boolean
  equipamientos: boolean
  /** Volumen construido de OpenStreetMap, extruido. */
  edificios: boolean
  /** Dónde van los proyectos del plan de 2026. */
  proyectos: boolean
}

interface Props {
  puntos: Punto[]
  equipamientos: EquipamientoMunicipal[]
  capasMunicipales: CapasMunicipales | null
  seleccionado: Punto | null
  plataformaActiva: string | null
  capas: CapasVisibles
  onSeleccionar: (id: string | null) => void
  onSeleccionarEquipamiento: (id: string) => void
  onFotoMapillary: (id: string, lon: number, lat: number) => void
  /** Foto de Mapillary mas cercana, leida de las teselas (id y posicion). */
  onFotoCercana: (foto: { id: string; lon: number; lat: number } | null) => void
  /** Centro del mapa, para la vista de calle cuando no hay seleccion. */
  onCentro: (lon: number, lat: number) => void
  /** Foto que se muestra en el panel; se marca en el mapa. */
  fotoMostrada: { lon: number; lat: number; rumbo?: number } | null
  /** Clave del mapa base activo. */
  mapaBase: string
  /** Barrio filtrado, para resaltarlo y encuadrarlo. */
  barrioActivo: string | null
  /** Mapa de calor activo; se alimenta de las capas ya filtradas. */
  mapaCalor: MapaCalor
  /** Coropleta de distancia al equipamiento más cercano; null para no dibujarla. */
  deficit: GeoJSON.FeatureCollection | null
  /** Coropleta de parte del barrio dentro del radio de servicio. */
  cobertura: GeoJSON.FeatureCollection | null
  /** Círculos de alcance de cada equipamiento, para enseñar de dónde sale. */
  alcance: GeoJSON.FeatureCollection | null
  /** Cruce activo de dos categorías; null cuando no hay ninguno. */
  cruce: CruceMapa | null
  /** Escenario de visualización avanzada; null mientras no se abre la pestaña. */
  espacial: Espacial | null
  /** Qué tiñe los anillos del inventario: el cotejo con OSM o el uso. */
  colorEquip: 'cotejo' | 'uso'
  /** Pinchar un barrio de la coropleta lo pone en el filtro. */
  onElegirBarrio: (nombre: string) => void
  /** Calle buscada: el mapa la encuadra y la marca. */
  calleElegida: Calle | null
}

const VACIO: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

/**
 * Texto del globo de deck.gl. Devuelve HTML porque es lo que espera la
 * libreria; el contenido sale de campos propios, nunca de texto externo.
 */
function textoTooltip(objeto: unknown): { html: string } | null {
  if (!objeto || typeof objeto !== 'object') return null
  const o = objeto as Record<string, unknown>
  const num = (n: number) => new Intl.NumberFormat('es-EC').format(Math.round(n))

  // Punto de OSM
  if (typeof o.categoria === 'string' && typeof o.clase === 'string') {
    const cat = POR_CLAVE.get(o.categoria as ClaveCategoria)?.rotulo ?? String(o.categoria)
    return {
      html: `<b>${escapar(String(o.nombre || 'Sin nombre'))}</b><br>${escapar(cat)} · ${escapar(String(o.clase))}`,
    }
  }
  // Arco de asignacion
  if (typeof o.barrio === 'string' && typeof o.poblacion === 'number') {
    return {
      html:
        `<b>${escapar(o.barrio)}</b><br>${num(o.poblacion)} hab<br>` +
        `a ${num(o.distancia as number)} m de ${escapar(String(o.equipamiento))}`,
    }
  }
  // Pieza de barrio
  if (typeof o.nombre === 'string' && typeof o.poblacion === 'number' && 'servicios' in o) {
    const d = o.distancia as number | null
    return {
      html:
        `<b>${escapar(o.nombre)}</b><br>${num(o.poblacion)} hab · ${num(o.viviendas as number)} viviendas<br>` +
        (d === null ? 'sin equipamiento del tipo' : `a ${num(d)} m del más cercano`),
    }
  }
  // Celda del hexagono
  if (Array.isArray(o.points)) {
    return { html: `<b>${num(o.points.length)}</b> registros en la celda` }
  }
  return null
}

/** El globo se pinta como HTML, asi que lo que entra se escapa. */
function escapar(t: string): string {
  return t.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  )
}

/**
 * Rampa del mapa de calor: la secuencial del sistema GADM, con el extremo bajo
 * transparente para que el mapa base siga leyendose donde no hay densidad.
 * Un mapa de calor opaco tapa justo el contexto que da sentido a la mancha.
 */
const RAMPA_CALOR = [
  'interpolate', ['linear'], ['heatmap-density'],
  0, 'rgba(220,233,244,0)',
  0.2, 'rgba(179,207,231,0.55)',
  0.4, 'rgba(127,174,214,0.7)',
  0.6, 'rgba(74,136,190,0.8)',
  0.8, 'rgba(31,95,148,0.88)',
  1, 'rgba(10,56,96,0.95)',
] as unknown as ExpressionSpecification

/**
 * Rampa del calor de lo pendiente. Va en cálidos a propósito: el azul dice
 * «aquí hay cosas» y este tiene que decir «aquí falta trabajo», que no es lo
 * mismo y no debe leerse igual de un vistazo.
 */
const RAMPA_PENDIENTES = [
  'interpolate', ['linear'], ['heatmap-density'],
  0, 'rgba(255,241,214,0)',
  0.2, 'rgba(250,214,140,0.55)',
  0.4, 'rgba(240,166,74,0.72)',
  0.6, 'rgba(219,108,44,0.82)',
  0.8, 'rgba(178,58,30,0.9)',
  1, 'rgba(120,28,18,0.95)',
] as unknown as ExpressionSpecification

/**
 * Escala del déficit, en metros al equipamiento más cercano. Cinco tramos de
 * la secuencial del sistema; los cortes van cada 250 m porque es la distancia
 * que se anda en tres minutos y hace de unidad legible a pie.
 */
const COLORES_DEFICIT = ['#dce9f4', '#b3cfe7', '#7faed6', '#4a88be', '#1f5f94']
const ESCALA_DEFICIT = [
  'step', ['get', 'distancia'],
  COLORES_DEFICIT[0],
  250, COLORES_DEFICIT[1],
  500, COLORES_DEFICIT[2],
  750, COLORES_DEFICIT[3],
  1000, COLORES_DEFICIT[4],
] as unknown as ExpressionSpecification

/**
 * Escala de cobertura, en porcentaje de barrio dentro del radio de servicio.
 * Verde y no azul para que no se confunda con la coropleta de distancia: son
 * dos preguntas distintas y no deben leerse como la misma.
 */
const COLORES_COBERTURA = ['#eef4ef', '#c9e3d0', '#95c9a8', '#55a87a', '#1b6046']
const ESCALA_COBERTURA = [
  'step', ['get', 'cubierto'],
  COLORES_COBERTURA[0],
  20, COLORES_COBERTURA[1],
  40, COLORES_COBERTURA[2],
  60, COLORES_COBERTURA[3],
  80, COLORES_COBERTURA[4],
] as unknown as ExpressionSpecification

/** Color de la capa de fotografia de calle; en la leyenda va rotulada. */
const COLOR_MAPILLARY = '#7f8c14'

/**
 * Inclinacion de la camara con la edificacion encendida.
 *
 * Un modelo en tres dimensiones visto en planta es un mapa de manchas: sin
 * inclinar no se ve lo unico que esa capa aporta.
 */
const PITCH_EDIFICIOS = 55

/**
 * Se construye uno nuevo por mapa a proposito: MapLibre consume el objeto de
 * estilo que recibe, asi que compartir una constante entre montajes deja al
 * segundo mapa sin estilo y su evento 'load' no llega a dispararse nunca.
 */
function crearEstiloBase(): StyleSpecification {
  return {
    version: 8,
    // MapLibre no dibuja texto sin glyphs. Se usan los del propio proyecto
    // MapLibre; si algun dia dejaran de servirse, las etiquetas de barrio
    // desaparecen pero el resto del mapa sigue igual.
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    // Todos los mapas base se declaran juntos y solo se alterna su
    // visibilidad: cambiar de estilo obligaria a rehacer todas las capas.
    // Los que sirven los rotulos aparte anaden una segunda capa encima.
    sources: Object.fromEntries(
      MAPAS_BASE.flatMap((b) => {
        const fuente = {
          type: 'raster' as const,
          tileSize: 256,
          maxzoom: b.maxzoom,
          attribution: `${b.atribucion} · límites y equipamientos: GADM Riobamba`,
        }
        const pares: [string, typeof fuente & { tiles: string[] }][] = [
          [capaDe(b.clave), { ...fuente, tiles: b.teselas }],
        ]
        if (b.rotulos) pares.push([capaRotulosDe(b.clave), { ...fuente, tiles: b.rotulos }])
        return pares
      }),
    ),
    layers: MAPAS_BASE.flatMap((b) => {
      const visibility = b.clave === MAPA_BASE_INICIAL ? ('visible' as const) : ('none' as const)
      const capas = [
        {
          id: capaDe(b.clave),
          type: 'raster' as const,
          source: capaDe(b.clave),
          layout: { visibility },
        },
      ]
      if (b.rotulos) {
        capas.push({
          id: capaRotulosDe(b.clave),
          type: 'raster' as const,
          source: capaRotulosDe(b.clave),
          layout: { visibility },
        })
      }
      return capas
    }),
  }
}

/** Encuadre del ámbito elegido: una plataforma, o todas si es el urbano. */
function cajaDelAmbito(
  activa: string | null,
  capas: CapasMunicipales | null,
): [number, number, number, number] | null {
  const lista = capas?.plataformas ?? []
  if (!activa || lista.length === 0) return null
  const cajas =
    activa === URBANO ? lista.map((p) => p.caja) : lista.filter((p) => p.clave === activa).map((p) => p.caja)
  if (cajas.length === 0) return null
  return [
    Math.min(...cajas.map((c) => c[0])),
    Math.min(...cajas.map((c) => c[1])),
    Math.max(...cajas.map((c) => c[2])),
    Math.max(...cajas.map((c) => c[3])),
  ]
}

function expresionColor(): ExpressionSpecification {
  const paleta = paletaResuelta()
  const pares = CATEGORIAS.flatMap((c) => [c.clave, paleta[c.clave]])
  return ['match', ['get', 'categoria'], ...pares, paleta.otros] as unknown as ExpressionSpecification
}

/** Color del equipamiento segun su uso; la paleta ampliada del sistema. */
function expresionUso(): ExpressionSpecification {
  const paleta = paletaUsos()
  const pares = Object.entries(paleta).flat()
  const raiz = getComputedStyle(document.documentElement)
  return [
    'match',
    ['get', 'tipo'],
    ...pares,
    raiz.getPropertyValue('--gr-s-otros').trim() || '#8496a4',
  ] as unknown as ExpressionSpecification
}

/** Los colores semánticos marcan estado, nunca categoría. */
function colorEstadoCotejo(): ExpressionSpecification {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim()
  return [
    'match',
    ['get', 'estado'],
    'confirmado', leer('--gr-ok'),
    'dudoso', leer('--gr-aviso'),
    'ausente', leer('--gr-error'),
    leer('--gr-tinta-3'),
  ] as unknown as ExpressionSpecification
}

/**
 * Relee los tokens del tema activo y los vuelve a pintar en el mapa.
 * MapLibre resuelve los colores una sola vez, así que sin esto un cambio de
 * tema dejaría el mapa con la paleta del tema anterior.
 */
function aplicarColoresTema(m: maplibregl.Map) {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim()
  const azul = leer('--gr-info')
  const tinta3 = leer('--gr-tinta-3')

  const pintar = (capa: string, prop: string, valor: unknown) => {
    if (m.getLayer(capa)) m.setPaintProperty(capa, prop, valor as never)
  }

  pintar('barrios-linea', 'line-color', leer('--gr-limite-barrio'))
  pintar('barrios-relleno', 'fill-color', leer('--gr-limite-barrio'))
  pintar('barrios-etiqueta', 'text-color', leer('--gr-limite-barrio'))
  pintar('parroquias-linea', 'line-color', tinta3)
  pintar('plataformas-relleno', 'fill-color', azul)
  pintar('plataformas-halo', 'line-color', leer('--gr-superficie'))
  pintar('plataformas-linea', 'line-color', azul)
  pintar('pois-halo', 'circle-stroke-color', azul)
  pintar('pois', 'circle-color', expresionColor())
  pintar('equipamientos', 'circle-stroke-color', colorEstadoCotejo())
}

/**
 * Foto de Mapillary mas cercana a un punto, leida de las teselas ya cargadas.
 * Devuelve null si no hay ninguna dentro de `maxM`.
 */
function fotoMasCercana(
  m: maplibregl.Map,
  lon: number,
  lat: number,
  maxM: number,
): { id: string; lon: number; lat: number } | null {
  if (!m.getSource('mapillary')) return null
  const rasgos = m.querySourceFeatures('mapillary', { sourceLayer: 'image' })
  let mejor: { id: string; lon: number; lat: number; d: number } | null = null
  for (const r of rasgos) {
    const g = r.geometry as GeoJSON.Point | undefined
    const id = r.properties?.id
    if (!g || g.type !== 'Point' || id === undefined) continue
    const d = distanciaM(lon, lat, g.coordinates[0], g.coordinates[1])
    if (!mejor || d < mejor.d)
      mejor = { id: String(id), lon: g.coordinates[0], lat: g.coordinates[1], d }
  }
  return mejor && mejor.d <= maxM ? { id: mejor.id, lon: mejor.lon, lat: mejor.lat } : null
}

export default function Mapa({
  puntos,
  equipamientos,
  capasMunicipales,
  seleccionado,
  plataformaActiva,
  capas,
  onSeleccionar,
  onSeleccionarEquipamiento,
  onFotoMapillary,
  onFotoCercana,
  onCentro,
  fotoMostrada,
  mapaBase,
  barrioActivo,
  calleElegida,
  mapaCalor,
  deficit,
  cobertura,
  alcance,
  cruce,
  espacial,
  colorEquip,
  onElegirBarrio,
}: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<maplibregl.Map | null>(null)
  const [mapaListo, setMapaListo] = useState(false)
  const rotulos = useRef<maplibregl.Marker[]>([])
  const marcaFoto = useRef<maplibregl.Marker | null>(null)
  const marcaCalle = useRef<maplibregl.Marker | null>(null)
  const cb = useRef({ onSeleccionar, onSeleccionarEquipamiento, onFotoMapillary, onFotoCercana, onCentro, onElegirBarrio })
  cb.current = { onSeleccionar, onSeleccionarEquipamiento, onFotoMapillary, onFotoCercana, onCentro, onElegirBarrio }

  /**
   * Ejecuta `fn` solo con el mapa ya cargado. `mapaListo` es estado, no ref, a
   * proposito: cuando pasa a true React vuelve a correr todos los efectos que
   * dependen de el, sin que haya que encolar nada ni arriesgar perder el aviso.
   */
  const cuandoListo = (fn: (m: maplibregl.Map) => void) => {
    const m = mapa.current
    if (!m || !mapaListo) return
    fn(m)
  }

  useEffect(() => {
    if (!contenedor.current || mapa.current) return

    const m = new maplibregl.Map({
      container: contenedor.current,
      style: crearEstiloBase(),
      center: VISTA_INICIAL.centro,
      zoom: VISTA_INICIAL.zoom,
      maxZoom: 19,
      attributionControl: { compact: true },
      locale: {
        'NavigationControl.ZoomIn': 'Acercar',
        'NavigationControl.ZoomOut': 'Alejar',
        'NavigationControl.ResetBearing': 'Restablecer el norte',
      },
    })
    mapa.current = m
    /*
     * Asa del mapa para la consola, solo en desarrollo. Vite la elimina del
     * paquete publicado.
     *
     * No es un lujo: en React 18 en adelante el componente se monta dos veces
     * en desarrollo, asi que llega a haber dos mapas y uno esta muerto. Sin
     * una referencia explicita, depurar una capa consiste en adivinar cual de
     * los dos se esta mirando, que es justo lo que paso con la edificacion.
     */
    if (import.meta.env.DEV) {
      ;(window as unknown as { mapaVisor?: maplibregl.Map }).mapaVisor = m
    }
    m.on('error', (e) => {
      console.error('[mapa]', e.error?.message ?? e)
    })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    m.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-left')

    m.on('load', () => {
      const raiz = getComputedStyle(document.documentElement)
      const azul = raiz.getPropertyValue('--gr-info').trim()
      const tinta3 = raiz.getPropertyValue('--gr-tinta-3').trim()
      const limiteBarrio = raiz.getPropertyValue('--gr-limite-barrio').trim()

      /*
       * ── Edificacion en tres dimensiones.
       *
       * Va la primera de todas, por debajo incluso de la coropleta: es el
       * suelo construido sobre el que ocurre lo demas, no una capa de analisis.
       * Arranca vacia y sin descargar nada; el GeoJSON pesa megas y solo se
       * pide cuando alguien enciende la capa.
       *
       * La altura sale de OpenStreetMap: `height` cuando esta, y si no los
       * pisos por tres metros. El 83 % del area urbana la trae, que es lo que
       * hace que esto se parezca a Riobamba y no a un bloque plano repetido.
       */
      m.addSource('edificios', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'edificios-3d',
        type: 'fill-extrusion',
        source: 'edificios',
        layout: { visibility: 'none' },
        paint: {
          /*
           * Mas alto, mas claro. Lo que no tiene dato va raso y en un tono
           * aparte, para que se vea que es huella sin volumen y no un edificio
           * de una planta: son dos cosas distintas y el mapa no debe
           * confundirlas.
           */
          'fill-extrusion-color': [
            'case',
            ['!', ['get', 'medido']],
            tinta3,
            [
              'interpolate',
              ['linear'],
              ['get', 'altura'],
              3, raiz.getPropertyValue('--gr-s1').trim() || '#5b7d95',
              12, raiz.getPropertyValue('--gr-s2').trim() || '#7fa8c4',
              30, raiz.getPropertyValue('--gr-s3').trim() || '#b3cfe7',
            ],
          ],
          'fill-extrusion-height': ['get', 'altura'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
        },
      })

      // ── Déficit de equipamiento por barrio. Se declara la primera para
      // que quede por debajo de los límites y de los puntos: es un fondo que
      // colorea el territorio, no una capa que deba taparlo.
      m.addSource('deficit', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'deficit-relleno',
        type: 'fill',
        source: 'deficit',
        layout: { visibility: 'none' },
        paint: { 'fill-color': ESCALA_DEFICIT, 'fill-opacity': 0.72 },
      })
      m.addLayer({
        id: 'deficit-linea',
        type: 'line',
        source: 'deficit',
        layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 1, 'line-opacity': 0.8 },
      })

      // ── Cobertura por radio de servicio. Comparte sitio con el déficit:
      // las dos pintan los mismos barrios y solo una puede estar encendida.
      m.addSource('cobertura', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'cobertura-relleno',
        type: 'fill',
        source: 'cobertura',
        layout: { visibility: 'none' },
        paint: { 'fill-color': ESCALA_COBERTURA, 'fill-opacity': 0.72 },
      })
      m.addLayer({
        id: 'cobertura-linea',
        type: 'line',
        source: 'cobertura',
        layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 1, 'line-opacity': 0.8 },
      })

      // ── Límites municipales, de más grande a más pequeño
      m.addSource('barrios', { type: 'geojson', data: VACIO })
      // Filete claro por debajo: el mapa base mezcla grises, amarillos y
      // rosados, y sobre esa mezcla una linea sola se pierde.
      m.addLayer({
        id: 'barrios-relleno',
        type: 'fill',
        source: 'barrios',
        filter: ['==', ['get', 'nombre'], ''],
        paint: { 'fill-color': limiteBarrio, 'fill-opacity': 0.16 },
      })
      m.addLayer({
        id: 'barrios-halo',
        type: 'line',
        source: 'barrios',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: {
          // Blanco fijo, no el color de superficie: el mapa base es claro
          // siempre, tambien cuando la interfaz esta en tema oscuro.
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 5],
          'line-opacity': 0.7,
        },
      })
      m.addLayer({
        id: 'barrios-linea',
        type: 'line',
        source: 'barrios',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: {
          'line-color': limiteBarrio,
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1.4, 16, 2.4],
          'line-opacity': 0.95,
        },
      })
      // Nombre de cada barrio. MapLibre reparte y descarta las que chocan, asi
      // que con 197 barrios el mapa no se satura: aparecen al acercarse.
      m.addLayer({
        id: 'barrios-etiqueta',
        type: 'symbol',
        source: 'barrios',
        minzoom: 13,
        layout: {
          visibility: 'none',
          'text-field': ['get', 'nombre'],
          // Una sola fuente: este servidor no sirve pilas combinadas (da 404).
          'text-font': ['Open Sans Semibold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 9, 17, 13],
          'text-max-width': 8,
          'text-padding': 4,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': limiteBarrio,
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.6,
        },
      })

      m.addSource('parroquias', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'parroquias-linea',
        type: 'line',
        source: 'parroquias',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: { 'line-color': tinta3, 'line-width': 1.6, 'line-dasharray': [3, 2] },
      })

      m.addSource('plataformas', { type: 'geojson', data: VACIO, promoteId: 'clave' })
      m.addLayer({
        id: 'plataformas-relleno',
        type: 'fill',
        source: 'plataformas',
        filter: ['==', ['get', 'clave'], ''],
        layout: { visibility: 'none' },
        paint: { 'fill-color': azul, 'fill-opacity': 0.16 },
      })
      // Filete claro por debajo: sin él, el azul se pierde sobre las calles
      // amarillas y los tejados rosados del mapa base.
      m.addLayer({
        id: 'plataformas-halo',
        type: 'line',
        source: 'plataformas',
        layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': raiz.getPropertyValue('--gr-superficie').trim(),
          'line-width': 6,
          'line-opacity': 0.7,
        },
      })
      m.addLayer({
        id: 'plataformas-linea',
        type: 'line',
        source: 'plataformas',
        layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': azul,
          'line-width': 2.6,
          'line-opacity': 0.95,
        },
      })

      // ── Mapillary: solo si hay token. Sus teselas lo exigen y sin el
      // devuelven 401, asi que ni siquiera se anade la fuente.
      const teselasMly = urlTeselasMapillary()
      if (teselasMly) {
        m.addSource('mapillary', {
          type: 'vector',
          tiles: [teselasMly],
          minzoom: 0,
          maxzoom: 14,
          attribution: '<a href="https://www.mapillary.com">Mapillary</a>',
        })
        m.addLayer({
          id: 'mly-secuencias',
          type: 'line',
          source: 'mapillary',
          'source-layer': 'sequence',
          layout: { 'line-cap': 'round', 'line-join': 'round', visibility: 'none' },
          paint: {
            'line-color': COLOR_MAPILLARY,
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 3.5],
            'line-opacity': 0.7,
          },
        })
        m.addLayer({
          id: 'mly-fotos',
          type: 'circle',
          source: 'mapillary',
          'source-layer': 'image',
          minzoom: 14,
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 2.5, 19, 5.5],
            'circle-color': COLOR_MAPILLARY,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      // ── Puntos OSM
      m.addSource('pois', { type: 'geojson', data: VACIO, promoteId: 'id' })
      m.addLayer({
        id: 'pois-halo',
        type: 'circle',
        source: 'pois',
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 10, 18, 20],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 3,
          'circle-stroke-color': azul,
        },
      })
      m.addLayer({
        id: 'pois',
        type: 'circle',
        source: 'pois',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 14, 5, 18, 9],
          'circle-color': expresionColor(),
          'circle-opacity': 0.9,
          'circle-stroke-width': ['case', ['==', ['get', 'frescura'], 'vigente'], 2, 1],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'frescura'], 'vigente'],
            '#ffffff',
            'rgba(15,25,34,0.45)',
          ],
        },
      })

      // ── Inventario municipal: anillos huecos, para no confundirlos con OSM
      m.addSource('equipamientos', { type: 'geojson', data: VACIO, promoteId: 'id' })
      m.addLayer({
        id: 'equipamientos',
        type: 'circle',
        source: 'equipamientos',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 5, 14, 7, 18, 12],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': colorEstadoCotejo(),
        },
      })

      /*
       * ── Proyectos del plan de 2026.
       *
       * Rombo relleno, no anillo: el anillo ya es el inventario construido y
       * confundir lo que existe con lo que esta previsto seria el peor error
       * que puede cometer este mapa. Los que crean alcance van encendidos y
       * los que no —vialidad, redes, estudios, dotacion cantonal— van
       * apagados, porque siguen siendo inversion y merecen verse, pero no son
       * lo mismo.
       */
      m.addSource('proyectos', { type: 'geojson', data: VACIO, promoteId: 'id' })
      m.addLayer({
        id: 'proyectos',
        type: 'circle',
        source: 'proyectos',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 5, 14, 8, 18, 13],
          'circle-color': [
            'case',
            ['get', 'aporta'],
            raiz.getPropertyValue('--gr-ok').trim() || '#2f8f5b',
            tinta3,
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': raiz.getPropertyValue('--gr-superficie').trim() || '#ffffff',
        },
      })
      /*
       * Los iconos se registran una vez, en blanco: a dieciseis pixeles lo
       * unico que se lee es la silueta, y un icono bicolor a ese tamano es una
       * mancha. El color va en el disco de debajo.
       */
      /*
       * Blanco literal y no un token del sistema: el icono va encima de un
       * disco de color saturado, no sobre el fondo, asi que no debe cambiar
       * con el tema. Con `--gr-superficie` saldria azul oscuro en tema oscuro
       * y desapareceria sobre el disco gris.
       */
      for (const [clave, trazado] of Object.entries(ICONOS_PROYECTO)) {
        const imagen = imagenDeIcono(trazado, '#ffffff')
        if (imagen && !m.hasImage(nombreIcono(clave))) {
          m.addImage(nombreIcono(clave), imagen, { pixelRatio: 2 })
        }
      }
      m.addLayer({
        id: 'proyectos-icono',
        type: 'symbol',
        source: 'proyectos',
        layout: {
          visibility: 'none',
          'icon-image': ['concat', 'proyecto-', ['get', 'icono']],
          // El icono ocupa algo menos que el disco para que quede un reborde
          // del color, que es lo que se ve de lejos.
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.32, 14, 0.5, 18, 0.8],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      })

      m.addLayer({
        id: 'proyectos-etiqueta',
        type: 'symbol',
        source: 'proyectos',
        // Solo de cerca: con el mapa entero a la vista, cuarenta rotulos
        // encima de los puntos tapan justo lo que se quiere mirar.
        minzoom: 14,
        layout: {
          visibility: 'none',
          'text-field': ['get', 'corto'],
          'text-size': 11,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-max-width': 12,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': raiz.getPropertyValue('--gr-tinta-1').trim() || '#e8eef4',
          'text-halo-color': raiz.getPropertyValue('--gr-fondo').trim() || '#10151b',
          'text-halo-width': 1.5,
        },
      })

      // ── Alcance de cada equipamiento. Va en linea y sin relleno: con
      // trescientos circulos superpuestos, el relleno se acumula y la mancha
      // acaba diciendo mas de los solapes que de la cobertura.
      m.addSource('alcance', { type: 'geojson', data: VACIO })
      m.addLayer({
        id: 'alcance-linea',
        type: 'line',
        source: 'alcance',
        layout: { visibility: 'none' },
        paint: {
          'line-color': '#1b6046',
          'line-width': 1,
          'line-opacity': 0.55,
          'line-dasharray': [2, 2],
        },
      })

      // ── Mapas de calor. Se alimentan de las mismas fuentes que los
      // puntos, asi que respetan los filtros sin ningun trabajo extra.
      // Van debajo de 'pois-halo' para que la mancha no tape los puntos.
      const calor = (
        id: string,
        fuente: string,
      ): maplibregl.HeatmapLayerSpecification => ({
        id,
        type: 'heatmap',
        source: fuente,
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': 1,
          // Con pocos puntos hace falta más intensidad para que se vea algo.
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 11, 1, 16, 3],
          'heatmap-color': RAMPA_CALOR,
          // El radio crece con el zoom: si no, al acercarse la mancha se
          // deshace en puntitos y deja de leerse como densidad.
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 11, 14, 14, 26, 18, 55],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.85, 18, 0.55],
        },
      })
      m.addLayer(calor('calor-registros', 'pois'), 'pois-halo')
      m.addLayer(calor('calor-equipamientos', 'equipamientos'), 'pois-halo')
      // El de pendientes es el mismo calor con otro peso: solo suman los
      // registros sin verificar o con la verificación vencida.
      const pendientes = calor('calor-pendientes', 'pois')
      pendientes.paint = {
        ...pendientes.paint,
        'heatmap-weight': [
          'case',
          ['in', ['get', 'frescura'], ['literal', ['sin_verificar', 'vencido']]],
          1,
          0,
        ] as unknown as ExpressionSpecification,
        'heatmap-color': RAMPA_PENDIENTES,
      }
      m.addLayer(pendientes, 'pois-halo')

      // ── Cruce de categorías: anillo sobre los puntos de A que se quedan
      // fuera del umbral. Va encima de los puntos para que no lo tapen.
      m.addLayer({
        id: 'cruce-alerta',
        type: 'circle',
        source: 'pois',
        filter: ['in', ['get', 'id'], ['literal', []]],
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 6, 14, 9, 18, 15],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#b23a1e',
        },
      })

      // La coropleta se explica sola al pasar por encima: un color sin cifra
      // no dice cuántos metros son, y ese es justo el dato que se busca.
      const globo = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
      m.on('mousemove', 'deficit-relleno', (e) => {
        const f = e.features?.[0]
        if (!f) return
        m.getCanvas().style.cursor = 'pointer'
        const d = Number(f.properties?.distancia ?? 0)
        const n = Number(f.properties?.equipamientos ?? 0)
        globo
          .setLngLat(e.lngLat)
          .setHTML(
            `<b>${String(f.properties?.nombre ?? '')}</b><br>` +
              `${n === 0 ? 'sin equipamiento propio' : `${n} equipamiento${n > 1 ? 's' : ''}`}<br>` +
              `${d >= 99999 ? 'ninguno a la vista' : `${d} m al más cercano`}`,
          )
          .addTo(m)
      })
      m.on('mousemove', 'cobertura-relleno', (e) => {
        const f = e.features?.[0]
        if (!f) return
        m.getCanvas().style.cursor = 'pointer'
        const pct = Number(f.properties?.cubierto ?? 0)
        globo
          .setLngLat(e.lngLat)
          .setHTML(
            `<b>${String(f.properties?.nombre ?? '')}</b><br>` +
              `${pct} % del barrio dentro del radio`,
          )
          .addTo(m)
      })
      m.on('mouseleave', 'cobertura-relleno', () => {
        m.getCanvas().style.cursor = ''
        globo.remove()
      })
      m.on('click', 'cobertura-relleno', (e) => {
        const encima = ['pois', 'equipamientos', 'mly-fotos'].filter((c) => m.getLayer(c))
        if (m.queryRenderedFeatures(e.point, { layers: encima }).length > 0) return
        const f = e.features?.[0]
        if (f) cb.current.onElegirBarrio(String(f.properties?.nombre ?? ''))
      })

      m.on('mouseleave', 'deficit-relleno', () => {
        m.getCanvas().style.cursor = ''
        globo.remove()
      })
      m.on('click', 'deficit-relleno', (e) => {
        // La coropleta ocupa todo el fondo, asi que un clic sobre un punto cae
        // tambien sobre ella. Manda el punto: si no, pinchar una ficha
        // cambiaria ademas el filtro de barrio sin haberlo pedido.
        const encima = ['pois', 'equipamientos', 'mly-fotos'].filter((c) => m.getLayer(c))
        if (m.queryRenderedFeatures(e.point, { layers: encima }).length > 0) return
        const f = e.features?.[0]
        if (f) cb.current.onElegirBarrio(String(f.properties?.nombre ?? ''))
      })

      m.on('click', 'pois', (e) => {
        const f = e.features?.[0]
        if (f) cb.current.onSeleccionar(String(f.properties?.id ?? ''))
      })
      m.on('click', 'equipamientos', (e) => {
        const f = e.features?.[0]
        if (f) cb.current.onSeleccionarEquipamiento(String(f.properties?.id ?? ''))
      })
      m.on('click', 'mly-fotos', (e) => {
        const f = e.features?.[0]
        const c = (f?.geometry as GeoJSON.Point | undefined)?.coordinates
        if (c) cb.current.onFotoMapillary(String(f?.properties?.id ?? ''), c[0], c[1])
      })
      m.on('click', (e) => {
        const capasClicables = ['pois', 'equipamientos', 'mly-fotos'].filter((c) =>
          m.getLayer(c),
        )
        const hit = m.queryRenderedFeatures(e.point, { layers: capasClicables })
        if (hit.length === 0) cb.current.onSeleccionar(null)
      })
      for (const capa of ['pois', 'equipamientos', 'mly-fotos']) {
        if (!m.getLayer(capa)) continue
        m.on('mouseenter', capa, () => {
          m.getCanvas().style.cursor = 'pointer'
        })
        m.on('mouseleave', capa, () => {
          m.getCanvas().style.cursor = ''
        })
      }

      setMapaListo(true)
    })

    /*
     * MapLibre mide el contenedor al crearse y no vuelve a mirarlo. Con el
     * mapa dentro de una columna flexible —cifras debajo, panel al lado— el
     * alto cambia despues del montaje y el lienzo se quedaba a su tamano
     * inicial: 71 x 338 pixeles dentro de un hueco de 975 x 606. Observar el
     * contenedor lo arregla para cualquier cambio de tamano, venga de un
     * cambio de layout o de que el usuario redimensione la ventana.
     */
    const observador = new ResizeObserver(() => m.resize())
    observador.observe(contenedor.current)

    /*
     * Volver a medir cuando la pestana se hace visible.
     *
     * Un mapa montado en una pestana de fondo se inicializa contra un
     * contenedor de tamano cero, y al mostrarla el contenedor recupera su
     * tamano sin cambiar de caja, asi que el observador no se entera: el
     * lienzo se queda en unos pocos pixeles y el mapa aparece en blanco.
     */
    const alVerse = () => {
      if (document.visibilityState === 'visible') requestAnimationFrame(() => m.resize())
    }
    document.addEventListener('visibilitychange', alVerse)
    // Y una vez mas cuando el mapa termina de cargar, por el mismo motivo.
    m.once('load', () => requestAnimationFrame(() => m.resize()))

    return () => {
      document.removeEventListener('visibilitychange', alVerse)
      observador.disconnect()
      for (const r of rotulos.current) r.remove()
      rotulos.current = []
      marcaFoto.current?.remove()
      marcaFoto.current = null
      marcaCalle.current?.remove()
      marcaCalle.current = null
      m.remove()
      mapa.current = null
      setMapaListo(false)
    }
  }, [])

  // Mapa base elegido
  useEffect(() => {
    cuandoListo((m) => {
      for (const b of MAPAS_BASE) {
        const ver = b.clave === mapaBase ? 'visible' : 'none'
        for (const capa of [capaDe(b.clave), capaRotulosDe(b.clave)]) {
          if (m.getLayer(capa)) m.setLayoutProperty(capa, 'visibility', ver)
        }
      }
    })
  }, [mapaBase, mapaListo])

  // Cambio de tema: el usuario puede elegirlo, o venir del sistema.
  useEffect(() => {
    const repintar = () => cuandoListo(aplicarColoresTema)
    const observador = new MutationObserver(repintar)
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    consulta.addEventListener('change', repintar)
    return () => {
      observador.disconnect()
      consulta.removeEventListener('change', repintar)
    }
  }, [mapaListo])

  // Puntos de OSM
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('pois') as maplibregl.GeoJSONSource | undefined)?.setData(aGeoJSON(puntos))
    })
  }, [puntos, mapaListo])

  // Capas municipales y rótulos de plataforma
  useEffect(() => {
    if (!capasMunicipales) return
    cuandoListo((m) => {
      ;(m.getSource('plataformas') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.plataformasGeo,
      )
      ;(m.getSource('parroquias') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.parroquias,
      )
      ;(m.getSource('barrios') as maplibregl.GeoJSONSource | undefined)?.setData(
        capasMunicipales.barrios,
      )

      // Rótulo por plataforma como marcador HTML: evita depender de un
      // servidor de glyphs solo para 18 letras.
      for (const r of rotulos.current) r.remove()
      rotulos.current = capasMunicipales.plataformas.map((p) => {
        const el = document.createElement('div')
        el.className = 'gr-rotulo-plataforma'
        el.textContent = p.clave
        el.title = `${p.nombre} · ${p.areaHa.toFixed(1)} ha`
        return new maplibregl.Marker({ element: el }).setLngLat(p.rotulo).addTo(m)
      })
    })
  }, [capasMunicipales, mapaListo])

  // Inventario municipal (su color depende del cotejo, que cambia con OSM)
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('equipamientos') as maplibregl.GeoJSONSource | undefined)?.setData(
        aGeoJSONEquipamientos(equipamientos),
      )
    })
  }, [equipamientos, mapaListo])

  /*
   * Los proyectos del plan. El rotulo se recorta aqui y no en el estilo: un
   * nombre de contratacion publica ocupa dos lineas de pantalla y en el mapa
   * solo hace falta reconocerlo.
   */
  useEffect(() => {
    cuandoListo((m) => {
      const lista = capasMunicipales?.proyectos ?? []
      const geo: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: lista.map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
          properties: {
            id: p.id,
            nombre: p.nombre,
            corto: p.nombre.length > 46 ? `${p.nombre.slice(0, 44).trimEnd()}…` : p.nombre,
            uso: p.uso ?? '',
            icono: p.icono,
            aporta: p.aporta,
            nota: p.nota,
            monto: p.monto,
            estado: p.estado,
          },
        })),
      }
      ;(m.getSource('proyectos') as maplibregl.GeoJSONSource | undefined)?.setData(geo)
    })
  }, [capasMunicipales, mapaListo])

  // Coropleta del déficit: se recalcula fuera y aquí solo se dibuja.
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('deficit') as maplibregl.GeoJSONSource | undefined)?.setData(deficit ?? VACIO)
    })
  }, [deficit, mapaListo])

  /*
   * Escenarios avanzados con deck.gl.
   *
   * El paquete pesa mas que todo el resto del visor junto, asi que se importa
   * solo al abrir la pestana: quien no la abra no lo descarga. El overlay se
   * monta sobre el mismo mapa, de modo que los escenarios heredan los filtros,
   * los limites municipales y los controles sin duplicar nada.
   */
  const overlay = useRef<{ setProps: (p: unknown) => void; finalize?: () => void } | null>(null)

  useEffect(() => {
    let vivo = true
    const m = mapa.current
    if (!m || !mapaListo) return

    if (!espacial) {
      // Al salir del escenario se retira el overlay y se deshace la
      // inclinacion: dejar el mapa torcido al volver a la vista normal
      // desconcierta a quien no sabe que la movio el 3D.
      if (overlay.current) {
        m.removeControl(overlay.current as unknown as maplibregl.IControl)
        overlay.current = null
        // La edificacion tambien vive de la inclinacion: si esta encendida,
        // enderezar el mapa al salir del escenario la dejaria en planta.
        if (m.getPitch() !== 0 && !capas.edificios) m.easeTo({ pitch: 0, duration: 400 })
      }
      return
    }

    // `capas` pasa a ser el modulo de deck dentro de este ambito, asi que el
    // prop del mismo nombre se lee aqui fuera.
    const hayEdificacion = capas.edificios
    void (async () => {
      const [{ MapboxOverlay }, capas] = await Promise.all([
        import('@deck.gl/mapbox'),
        import('../lib/deck/escenarios'),
      ])
      if (!vivo || !mapa.current) return

      const puntosDeck = puntos
      const lista =
        espacial.escenario === 'puntos'
          ? [capas.capaPuntos(puntosDeck, espacial.colorPor)]
          : espacial.escenario === 'densidad'
            ? [
                capas.capaDensidad(
                  puntosDeck,
                  equipamientos,
                  espacial.radio,
                  espacial.peso,
                  espacial.extruido,
                ),
              ]
            : espacial.escenario === 'isocronas'
              ? espacial.isocrona
                ? [
                    // La mancha primero y las calles encima: al reves el
                    // relleno taparia justo la red que lo explica.
                    capas.capaBandas(espacial.isocrona.bandas, espacial.isocrona.tramos),
                    ...(espacial.verCalles
                      ? [
                          capas.capaIsocronas(
                            espacial.isocrona.red,
                            espacial.isocrona.alcanzables,
                            espacial.isocrona.tramos,
                          ),
                        ]
                      : []),
                  ]
                : []
            : espacial.escenario === 'barrios'
              ? [
                  capas.capaBarrios(
                    capas.piezasDeBarrios(
                      espacial.barrios,
                      equipamientos,
                      espacial.tipoEquipamiento,
                    ),
                    espacial.altura,
                    espacial.colorBarrio,
                    espacial.extruido,
                  ),
                ]
            : espacial.escenario === 'flujos'
              ? [
                  capas.capaFlujos(
                    capas.asignar(espacial.barrios, equipamientos, espacial.tipoEquipamiento),
                  ),
                ]
              : []

      if (!overlay.current) {
        const nuevo = new MapboxOverlay({
          interleaved: false,
          layers: lista,
          getTooltip: (info: { object?: unknown }) => textoTooltip(info.object),
        })
        m.addControl(nuevo as unknown as maplibregl.IControl)
        overlay.current = nuevo as unknown as typeof overlay.current
      } else {
        overlay.current.setProps({ layers: lista })
      }

      const quiere3D =
        (espacial.escenario === 'densidad' || espacial.escenario === 'barrios') &&
        espacial.extruido
      if (quiere3D && m.getPitch() < 10) {
        /*
         * Alejar si se estaba muy cerca. Los bloques miden cientos de metros
         * de alto: al inclinar la camara desde un zoom de calle, se queda
         * dentro de uno y la pantalla entera se vuelve gris sin que se
         * entienda por que.
         */
        const zoom = m.getZoom()
        m.easeTo({ pitch: PITCH_3D, zoom: zoom > 15 ? 13.5 : zoom, duration: 600 })
      }
      if (!quiere3D && !hayEdificacion && m.getPitch() > 10) {
        m.easeTo({ pitch: 0, duration: 400 })
      }
    })()

    return () => {
      vivo = false
    }
  }, [espacial, puntos, equipamientos, capas.edificios, mapaListo])

  /*
   * Que tiñe los anillos del inventario. El cotejo dice cuanto esta verificado
   * contra OSM; el uso convierte la capa en una leyenda de los doce usos del
   * Codigo Urbano. La forma —anillo hueco— no cambia nunca, porque es lo que
   * distingue el inventario de los puntos de OSM.
   */
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('equipamientos')) return
      m.setPaintProperty(
        'equipamientos',
        'circle-stroke-color',
        colorEquip === 'uso' ? expresionUso() : colorEstadoCotejo(),
      )
    })
  }, [colorEquip, mapaListo])

  // Cobertura y alcance: se calculan fuera y aquí solo se dibujan.
  useEffect(() => {
    cuandoListo((m) => {
      ;(m.getSource('cobertura') as maplibregl.GeoJSONSource | undefined)?.setData(
        cobertura ?? VACIO,
      )
      ;(m.getSource('alcance') as maplibregl.GeoJSONSource | undefined)?.setData(alcance ?? VACIO)
    })
  }, [cobertura, alcance, mapaListo])

  // Puntos de A que quedan fuera del umbral del cruce.
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('cruce-alerta')) return
      m.setFilter('cruce-alerta', [
        'in',
        ['get', 'id'],
        ['literal', cruce?.desatendidos ?? []],
      ] as unknown as ExpressionSpecification)
    })
  }, [cruce, mapaListo])

  /*
   * La edificacion se descarga la primera vez que alguien la enciende, no al
   * abrir el visor: es megabyte y medio que no tiene por que pagar quien no la
   * va a mirar. Despues se queda en la fuente y encenderla es instantaneo.
   *
   * Al encenderla tambien se inclina la camara. Un modelo en tres dimensiones
   * visto en planta es un mapa de manchas: sin inclinar no se ve lo unico que
   * esta capa aporta.
   */
  /*
   * La edificacion se descarga la primera vez que alguien la enciende, no al
   * abrir el visor: es megabyte y medio que no tiene por que pagar quien no la
   * va a mirar.
   *
   * Descargar y poner van en dos efectos distintos a proposito. El mapa puede
   * no tener el estilo listo cuando la descarga termina —en una pestana de
   * fondo el navegador no pinta, y sin pintar MapLibre no acaba de cargar—, y
   * si se intentara poner los datos ahi mismo se perderian sin ruido: la capa
   * quedaria encendida y vacia, que es justo lo que parece un fallo de datos
   * sin serlo.
   */
  const edificiosGeo = useRef<GeoJSON.FeatureCollection | null>(null)
  const [edificiosListos, setEdificiosListos] = useState(false)

  useEffect(() => {
    if (!capas.edificios || edificiosGeo.current) return
    let vivo = true
    void (async () => {
      try {
        const resp = await fetch(`${import.meta.env.BASE_URL}datos/edificios.geojson`, {
          cache: 'force-cache',
        })
        if (!resp.ok || !vivo) return
        edificiosGeo.current = (await resp.json()) as GeoJSON.FeatureCollection
        if (vivo) setEdificiosListos(true)
      } catch {
        // Sin edificacion el visor sigue entero; no hay nada que avisar.
      }
    })()
    return () => {
      vivo = false
    }
  }, [capas.edificios])

  useEffect(() => {
    if (!edificiosListos || !edificiosGeo.current) return
    cuandoListo((m) => {
      const fuente = m.getSource('edificios') as maplibregl.GeoJSONSource | undefined
      if (fuente && edificiosGeo.current) fuente.setData(edificiosGeo.current)
    })
  }, [edificiosListos, mapaListo])

  /*
   * Al encender la capa se inclina la camara. Un modelo en tres dimensiones
   * visto en planta es un mapa de manchas: sin inclinar no se ve lo unico que
   * esta capa aporta.
   */
  useEffect(() => {
    if (!capas.edificios) return
    cuandoListo((m) => {
      if (m.getPitch() < 20) m.easeTo({ pitch: PITCH_EDIFICIOS, duration: 700 })
    })
  }, [capas.edificios, mapaListo])

  // Visibilidad de capas
  useEffect(() => {
    cuandoListo((m) => {
      const poner = (capa: string, visible: boolean) => {
        if (m.getLayer(capa)) m.setLayoutProperty(capa, 'visibility', visible ? 'visible' : 'none')
      }
      // El halo del punto elegido y el anillo del cruce cuelgan de los
      // puntos: apagarlos y dejar sus adornos flotando no tendria sentido.
      poner('pois', capas.osm)
      poner('pois-halo', capas.osm)
      poner('mly-secuencias', capas.mapillary)
      poner('mly-fotos', capas.mapillary)
      poner('plataformas-relleno', capas.plataformas)
      poner('plataformas-halo', capas.plataformas)
      poner('plataformas-linea', capas.plataformas)
      poner('parroquias-linea', capas.parroquias)
      poner('barrios-relleno', capas.barrios)
      poner('barrios-halo', capas.barrios)
      poner('barrios-linea', capas.barrios)
      poner('barrios-etiqueta', capas.barrios)
      poner('equipamientos', capas.equipamientos)
      poner('edificios-3d', capas.edificios)
      poner('proyectos', capas.proyectos)
      poner('proyectos-icono', capas.proyectos)
      poner('proyectos-etiqueta', capas.proyectos)
      poner('calor-registros', mapaCalor === 'registros')
      poner('calor-pendientes', mapaCalor === 'pendientes')
      poner('calor-equipamientos', mapaCalor === 'equipamientos')
      poner('deficit-relleno', deficit !== null)
      poner('deficit-linea', deficit !== null)
      poner('cobertura-relleno', cobertura !== null)
      poner('cobertura-linea', cobertura !== null)
      poner('alcance-linea', alcance !== null)
      poner('cruce-alerta', cruce !== null && capas.osm)

      /*
       * Opacidad de los puntos. Son tres situaciones y una sola propiedad:
       * con un cruce activo mandan las dos categorías cruzadas y el resto se
       * apaga; con el calor encendido se atenúan todos, porque a 400 registros
       * el punterío tapa por completo la mancha que se quiere leer; y sin nada
       * de eso, se ven como siempre.
       */
      const opacidad: ExpressionSpecification | number = cruce
        ? ([
            'case',
            ['in', ['get', 'categoria'], ['literal', [cruce.a, cruce.b]]],
            0.95,
            0.12,
          ] as unknown as ExpressionSpecification)
        : mapaCalor !== 'ninguno'
          ? 0.3
          : 0.9
      m.setPaintProperty('pois', 'circle-opacity', opacidad)
      m.setPaintProperty('pois', 'circle-stroke-opacity', opacidad)
      for (const r of rotulos.current) {
        r.getElement().style.display = capas.plataformas ? '' : 'none'
      }
    })
  }, [capas, mapaCalor, deficit, cobertura, alcance, cruce, mapaListo])

  /**
   * Plataforma activa: se rellena, se engruesa su contorno, las demás se
   * atenúan y el mapa se encuadra en ella. Sin el contraste entre activa y
   * resto, filtrar por plataforma no se distingue de no filtrar.
   */
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('plataformas-relleno')) return
      // Con el ámbito urbano no hay una plataforma que destacar: se miran
      // todas a la vez, así que se dibujan como cuando no hay filtro.
      const activa = plataformaActiva === URBANO ? '' : (plataformaActiva ?? '')
      const esActiva = ['==', ['get', 'clave'], activa]

      m.setFilter('plataformas-relleno', esActiva as never)
      m.setPaintProperty('plataformas-linea', 'line-width', (
        activa ? ['case', esActiva, 5, 1.6] : 2.6
      ) as never)
      m.setPaintProperty('plataformas-linea', 'line-opacity', (
        activa ? ['case', esActiva, 1, 0.35] : 0.95
      ) as never)
      m.setPaintProperty('plataformas-halo', 'line-width', (
        activa ? ['case', esActiva, 9, 4] : 6
      ) as never)
      m.setPaintProperty('plataformas-halo', 'line-opacity', (
        activa ? ['case', esActiva, 0.85, 0.25] : 0.7
      ) as never)

      // El rótulo de la plataforma elegida también se destaca.
      for (const r of rotulos.current) {
        const el = r.getElement()
        const suya = el.textContent === activa
        el.classList.toggle('gr-rotulo-plataforma--activa', !!activa && suya)
        el.style.opacity = activa && !suya ? '0.4' : '1'
      }

      const caja = cajaDelAmbito(plataformaActiva, capasMunicipales)
      if (caja) {
        /*
         * `pitch` explicito: sin el, `fitBounds` endereza la camara, y
         * reencuadrar un ambito dejaria la edificacion en planta cada vez.
         * Cambiar de ambito mueve el encuadre, no el punto de vista.
         *
         * Con la edificacion encendida se toma la inclinacion que le toca y no
         * la que haya en ese instante: las dos cosas se disparan a la vez al
         * abrir el visor, y leer un angulo a mitad de la animacion lo congela
         * en el valor de salida.
         */
        m.fitBounds(caja, {
          padding: 40,
          pitch: capas.edificios ? Math.max(m.getPitch(), PITCH_EDIFICIOS) : m.getPitch(),
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
        })
      }
    })
  }, [plataformaActiva, capasMunicipales, capas.edificios, mapaListo])

  /**
   * Calle buscada: se encuadra su envolvente y se marca su punto medio. No se
   * dibuja su trazado porque el indice no lo guarda: la geometria completa de
   * las 1.017 calles son 2 MB que no hacen falta para ubicarla.
   */
  useEffect(() => {
    const m = mapa.current
    if (!m || !mapaListo) return
    if (!calleElegida) {
      marcaCalle.current?.remove()
      marcaCalle.current = null
      return
    }
    const [o, s, e, n] = calleElegida.caja
    m.fitBounds([o, s, e, n], {
      padding: 60,
      maxZoom: 17,
      pitch: m.getPitch(),
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
    })
    if (!marcaCalle.current) {
      const el = document.createElement('div')
      el.className = 'gr-marca-calle'
      marcaCalle.current = new maplibregl.Marker({ element: el })
        .setLngLat(calleElegida.centro)
        .addTo(m)
    } else {
      marcaCalle.current.setLngLat(calleElegida.centro)
    }
    marcaCalle.current.getElement().title = calleElegida.nombre
  }, [calleElegida, mapaListo])

  /**
   * Barrio filtrado: se rellena y el mapa se encuadra en el. El relleno solo
   * aparece si la capa de barrios esta encendida, para no dibujar una mancha
   * suelta sin su contorno.
   */
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('barrios-relleno')) return
      m.setFilter('barrios-relleno', ['==', ['get', 'nombre'], barrioActivo ?? ''])
      const b = capasMunicipales?.barriosLista.find((x) => x.nombre === barrioActivo)
      if (b) {
        m.fitBounds([b.caja[0], b.caja[1], b.caja[2], b.caja[3]], {
          padding: 50,
          pitch: m.getPitch(),
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700,
        })
      }
    })
  }, [barrioActivo, capasMunicipales, mapaListo])

  /**
   * Marca en el mapa de donde sale la foto que se ve en el panel, y hacia
   * donde apunta la camara. Sin esto, la imagen no dice a que sitio pertenece.
   */
  useEffect(() => {
    const m = mapa.current
    if (!m || !mapaListo) return
    if (!fotoMostrada) {
      marcaFoto.current?.remove()
      marcaFoto.current = null
      return
    }
    if (!marcaFoto.current) {
      const el = document.createElement('div')
      el.className = 'gr-marca-foto'
      el.innerHTML = '<span class="gr-marca-foto__cono"></span><span class="gr-marca-foto__punto"></span>'
      el.title = 'Aqui se tomo la foto que se ve en el panel'
      // La posicion va antes de addTo: MapLibre la lee al montar el marcador.
      marcaFoto.current = new maplibregl.Marker({ element: el })
        .setLngLat([fotoMostrada.lon, fotoMostrada.lat])
        .addTo(m)
    } else {
      marcaFoto.current.setLngLat([fotoMostrada.lon, fotoMostrada.lat])
    }
    const cono = marcaFoto.current.getElement().querySelector<HTMLElement>('.gr-marca-foto__cono')
    if (cono) {
      // El cono solo se dibuja si se conoce el rumbo de la camara.
      cono.style.display = fotoMostrada.rumbo === undefined ? 'none' : ''
      cono.style.transform = `rotate(${fotoMostrada.rumbo ?? 0}deg)`
    }
  }, [fotoMostrada, mapaListo])

  /**
   * Sin punto elegido, la vista de calle del panel sigue al centro del mapa:
   * asi siempre hay algo que mirar, sin tener que seleccionar nada primero.
   */
  useEffect(() => {
    const m = mapa.current
    if (!m || !mapaListo || seleccionado) return
    const actualizar = () => {
      const c = m.getCenter()
      cb.current.onCentro(c.lng, c.lat)
      cb.current.onFotoCercana(fotoMasCercana(m, c.lng, c.lat, 150))
    }
    m.on('moveend', actualizar)
    m.on('idle', actualizar)
    actualizar()
    return () => {
      m.off('moveend', actualizar)
      m.off('idle', actualizar)
    }
  }, [seleccionado, mapaListo])

  // Selección
  useEffect(() => {
    cuandoListo((m) => {
      if (!m.getLayer('pois-halo')) return
      m.setFilter('pois-halo', ['==', ['get', 'id'], seleccionado?.id ?? ''])
      if (!seleccionado) return
      m.easeTo({
        center: [seleccionado.lon, seleccionado.lat],
        zoom: Math.max(m.getZoom(), 17),
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600,
      })
      // Las teselas traen el id de cada foto, y funcionan aunque la Graph API
      // no devuelva nada: de ahi sale la imagen que abre el visor del panel.
      m.once('idle', () => {
        cb.current.onFotoCercana(fotoMasCercana(m, seleccionado.lon, seleccionado.lat, 80))
      })
    })
  }, [seleccionado, mapaListo])

  return (
    <div
      ref={contenedor}
      className="h-full w-full"
      role="application"
      aria-label="Mapa del canton Riobamba con los puntos levantados. La tabla lateral contiene los mismos datos en forma navegable por teclado."
    />
  )
}
