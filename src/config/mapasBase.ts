/**
 * Mapas base disponibles. Todos son teselas públicas sin credencial.
 *
 * Se declaran los cuatro a la vez en el estilo y solo se alterna su
 * visibilidad: cambiar el estilo entero obligaría a reconstruir todas las capas
 * de datos y a volver a cargar los GeoJSON.
 *
 * Antes de publicar el visor fuera de la red municipal conviene revisar la
 * política de uso de cada proveedor: la de OpenStreetMap, en particular, no
 * admite tráfico alto.
 */
export interface MapaBase {
  clave: string
  rotulo: string
  /** Para qué sirve mejor; se muestra en el selector. */
  nota: string
  teselas: string[]
  atribucion: string
  maxzoom: number
  /** Cierto si el fondo es oscuro: los rótulos claros necesitan saberlo. */
  oscuro?: boolean
}

export const MAPAS_BASE: MapaBase[] = [
  {
    clave: 'osm',
    rotulo: 'OpenStreetMap',
    nota: 'callejero con nombres y comercios',
    teselas: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    atribucion: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxzoom: 19,
  },
  {
    // Sustituye a CARTO Positron, que desde algun momento exige clave: sus
    // teselas siguen devolviendo 200, pero con la marca «API KEY REQUIRED»
    // impresa encima. Un 200 no basta para dar por bueno un mapa base.
    clave: 'humanitario',
    rotulo: 'Humanitario',
    nota: 'trazado limpio: resaltan los puntos y los límites',
    teselas: [
      'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    ],
    atribucion:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · teselas: <a href="https://www.hotosm.org/">HOT</a> / <a href="https://openstreetmap.fr/">OSM France</a>',
    maxzoom: 19,
  },
  {
    clave: 'satelite',
    rotulo: 'Satélite',
    nota: 'ortofoto: para ver construcción y ocupación real',
    teselas: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    atribucion: 'Imágenes: Esri, Maxar, Earthstar Geographics',
    maxzoom: 19,
    oscuro: true,
  },
  {
    clave: 'topografico',
    rotulo: 'Topográfico',
    nota: 'relieve y curvas de nivel; tarda unos segundos en cargar',
    teselas: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    atribucion:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM · © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxzoom: 17,
  },
]

export const MAPA_BASE_INICIAL = 'osm'

/** Identificador de la capa raster de un mapa base. */
export const capaDe = (clave: string) => `base-${clave}`
