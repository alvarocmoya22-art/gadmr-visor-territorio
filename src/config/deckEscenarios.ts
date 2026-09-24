/**
 * Configuración de los escenarios de visualización avanzada (deck.gl).
 *
 * Aquí vive TODO el mapeo de campos: qué dato alimenta cada capa y de qué
 * propiedad sale cada cosa. Si mañana cambia el origen de los datos, se toca
 * este archivo y no las capas.
 *
 * Lo marcado como **VALIDAR** es una decisión que tomé por necesidad de tener
 * algo que dibujar, no un hecho comprobado con el GADM. Está señalado para que
 * se confirme antes de que una cifra salga de aquí hacia un informe.
 *
 * De dónde salen los datos: de lo que el visor ya tiene cargado en memoria
 * —Overpass y los GeoJSON municipales—, no de ninguna consulta nueva. Por eso
 * los escenarios respetan los filtros sin trabajo extra.
 */
import type { ClaveCategoria } from '../lib/categorias'

export type ClaveEscenario = 'puntos' | 'densidad' | 'flujos' | 'recorridos'

export interface Escenario {
  clave: ClaveEscenario
  rotulo: string
  /** Qué responde, en una línea, para el selector. */
  resumen: string
  /** De dónde salen los datos, dicho tal cual al usuario. */
  origen: string
  /** Cuando no se puede dibujar, por qué. null si está disponible. */
  bloqueado: string | null
}

/**
 * Los cuatro escenarios.
 *
 * «Recorridos» va bloqueado y no simulado: de los 2.899 registros solo 433
 * traen `check_date`, en 17 días distintos, **ninguno con hora**, y 378 de
 * esos 433 son del mismo día. Ordenar los puntos de una jornada para
 * reconstruir por dónde pasó la brigada sería inventarse un recorrido que el
 * dato no contiene. La única fuente real de trayectoria con tiempo son las
 * secuencias de Mapillary (`captured_at` por imagen); queda como trabajo
 * futuro porque la API limita cada consulta a 0,01 grados² y haría falta
 * trocear cada plataforma en varias peticiones.
 */
export const ESCENARIOS: Escenario[] = [
  {
    clave: 'puntos',
    rotulo: 'Puntos por categoría',
    resumen: 'Cada registro en su sitio, con el color de su categoría.',
    origen: 'Registros de OpenStreetMap y equipamientos del GADM, los que dejan ver los filtros.',
    bloqueado: null,
  },
  {
    clave: 'densidad',
    rotulo: 'Densidad en hexágonos (3D)',
    resumen: 'Agrega los registros en celdas y las levanta según lo que haya dentro.',
    origen: 'Los mismos registros, agregados en hexágonos del radio que se elija.',
    bloqueado: null,
  },
  {
    clave: 'flujos',
    rotulo: 'Asignación barrio → equipamiento',
    resumen: 'Un arco de cada barrio al equipamiento que le queda más cerca.',
    origen:
      'Centro de cada barrio y equipamiento más cercano del tipo elegido; el grosor es la población del Censo 2022.',
    bloqueado: null,
  },
  {
    clave: 'recorridos',
    rotulo: 'Recorridos de campo',
    resumen: 'Animación del trayecto de las brigadas.',
    origen: 'Haría falta trayectoria con hora, y el dato no la tiene.',
    bloqueado:
      'De 2.899 registros solo 433 traen fecha de verificación, sin hora, y 378 son del mismo día. ' +
      'Reconstruir el recorrido a partir de eso sería inventarlo. La vía real son las secuencias ' +
      'de Mapillary, que sí llevan hora de captura; está pendiente de decidir.',
  },
]

// ───────────────────────────────────────────────── mapeo de campos

/**
 * Qué propiedad de cada registro alimenta cada cosa.
 *
 * Los nombres son los del tipo `Punto` de `lib/overpass.ts` y los de
 * `EquipamientoMunicipal` de `lib/municipal.ts`, así que están confirmados por
 * el propio código; no hay adivinanza de nombres aquí.
 */
export const CAMPOS = {
  punto: {
    lon: 'lon',
    lat: 'lat',
    categoria: 'categoria',
    nombre: 'nombre',
    clase: 'clase',
    /** Para poder colorear o filtrar por estado del levantamiento. */
    frescura: 'frescura',
    barrio: 'barrio',
    plataforma: 'plataforma',
    /**
     * VALIDAR: `checkDate` es la fecha declarada en OSM con la etiqueta
     * `check_date`. Se toma como «fecha de verificación en campo», que es como
     * la usa el equipo, pero OSM no garantiza que quien la puso fuera la
     * brigada ni que sea el día del recorrido.
     */
    fecha: 'checkDate',
  },
  equipamiento: {
    lon: 'lon',
    lat: 'lat',
    tipo: 'tipo',
    nombre: 'nombre',
    /** Barrio calculado por geometría, no el declarado en el shapefile. */
    barrio: 'barrioLimite',
  },
  barrio: {
    nombre: 'nombre',
    /** Punto interior, no el centroide: en barrios en L el centroide cae fuera. */
    centro: 'centro',
    /** Habitantes del Censo 2022 repartidos por edificios. */
    volumen: 'pob',
  },
} as const

// ───────────────────────────────────────────────── parámetros de las capas

/** Radios de hexágono que ofrece el control, en metros. */
export const RADIOS_HEXAGONO = [75, 150, 300, 500]
export const RADIO_HEXAGONO_INICIAL = 150

/**
 * Qué levanta los hexágonos.
 *
 * `pendientes` es el que tiene uso operativo: la altura pasa a ser cuánto
 * queda por verificar en cada celda, no cuánto hay.
 */
export type PesoDensidad = 'registros' | 'pendientes'

/**
 * Altura del hexágono más alto, en metros de mundo.
 *
 * Es el techo de una escala relativa, no una medida: la celda más poblada mide
 * esto y las demás se reparten por debajo. Se fija bajo a propósito —el ancho
 * del área urbana son unos 15 km— porque con columnas de más de un kilómetro
 * el 3D tapa el mapa que se supone que está explicando.
 */
export const ELEVACION_MAXIMA = 450

/** Inclinación de la cámara al entrar en un escenario 3D. */
export const PITCH_3D = 50

/**
 * Categorías que se ofrecen para colorear los puntos. Es el mismo orden de
 * serie del sistema de diseño, así que el color de una categoría no cambia
 * entre esta vista y el resto del visor.
 */
export type ColorPor = 'categoria' | 'frescura'

/** VALIDAR: umbral en metros por encima del cual el arco se marca en alerta. */
export const ARCO_ALERTA_M = 1000

/** Cuántos arcos se dibujan como mucho, para que la vista siga siendo legible. */
export const MAX_ARCOS = 250

/** Categorías de OSM que nunca aportan al análisis de equipamiento. */
export const CATEGORIAS_IGNORADAS: ClaveCategoria[] = []
