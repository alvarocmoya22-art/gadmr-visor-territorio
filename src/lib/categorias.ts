/**
 * Capas temáticas del levantamiento. El orden es fijo: la serie de color
 * sigue a la categoría, no a su tamaño, así filtrar no repinta el resto.
 * La novena posición siempre es «Otros».
 */

export type ClaveCategoria =
  | 'educacion'
  | 'salud'
  | 'movilidad'
  | 'comercio'
  | 'alimentacion'
  | 'espacio_publico'
  | 'institucional'
  | 'patrimonio'
  | 'otros'

export interface Categoria {
  clave: ClaveCategoria
  rotulo: string
  /** Índice de serie 1..8 del sistema GADM; 0 = «Otros». */
  serie: number
  /** Cláusulas Overpass; se expanden dentro del área del cantón. */
  filtros: string[]
  /** Etiquetas OSM que se consideran obligatorias en este tipo de ficha. */
  camposClave: string[]
}

export const CATEGORIAS: Categoria[] = [
  {
    clave: 'educacion',
    rotulo: 'Educación',
    serie: 1,
    filtros: ['["amenity"~"^(school|kindergarten|college|university|library)$"]'],
    camposClave: ['name', 'addr:street', 'operator:type'],
  },
  {
    clave: 'salud',
    rotulo: 'Salud',
    serie: 2,
    filtros: [
      '["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"]',
      '["healthcare"]',
    ],
    camposClave: ['name', 'addr:street', 'opening_hours', 'phone'],
  },
  {
    clave: 'movilidad',
    rotulo: 'Movilidad',
    serie: 3,
    filtros: [
      '["highway"="bus_stop"]',
      '["amenity"~"^(bus_station|parking|fuel|taxi|bicycle_parking|charging_station)$"]',
      '["public_transport"~"^(platform|station)$"]',
    ],
    camposClave: ['name', 'operator', 'shelter'],
  },
  {
    clave: 'comercio',
    rotulo: 'Comercio',
    serie: 4,
    filtros: ['["shop"]'],
    camposClave: ['name', 'addr:street', 'addr:housenumber', 'opening_hours'],
  },
  {
    clave: 'alimentacion',
    rotulo: 'Alimentación',
    serie: 5,
    filtros: ['["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court|ice_cream)$"]'],
    camposClave: ['name', 'addr:street', 'opening_hours', 'cuisine'],
  },
  {
    clave: 'espacio_publico',
    rotulo: 'Espacio público',
    serie: 6,
    filtros: [
      '["leisure"~"^(park|pitch|playground|sports_centre|garden|stadium)$"]',
      '["amenity"~"^(marketplace|toilets|drinking_water|bench)$"]',
    ],
    camposClave: ['name', 'operator', 'access'],
  },
  {
    clave: 'institucional',
    rotulo: 'Institucional',
    serie: 7,
    filtros: [
      '["amenity"~"^(townhall|police|fire_station|courthouse|post_office|community_centre|bank)$"]',
      '["office"="government"]',
    ],
    camposClave: ['name', 'addr:street', 'opening_hours', 'operator'],
  },
  {
    clave: 'patrimonio',
    rotulo: 'Patrimonio y turismo',
    serie: 8,
    filtros: [
      '["tourism"~"^(hotel|hostel|museum|attraction|artwork|viewpoint|information|guest_house)$"]',
      '["historic"]',
    ],
    camposClave: ['name', 'addr:street', 'heritage'],
  },
  {
    clave: 'otros',
    rotulo: 'Otros',
    serie: 0,
    filtros: [],
    camposClave: ['name'],
  },
]

export const POR_CLAVE = new Map(CATEGORIAS.map((c) => [c.clave, c]))

/** Variable CSS de la serie asignada a la categoría. */
export const colorSerie = (c: ClaveCategoria) => {
  const cat = POR_CLAVE.get(c)
  return cat && cat.serie > 0 ? `var(--gr-s${cat.serie})` : 'var(--gr-s-otros)'
}

/** Colores resueltos en tiempo de ejecución (MapLibre no lee var() de CSS). */
export function paletaResuelta(): Record<ClaveCategoria, string> {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim() || '#8496a4'
  return Object.fromEntries(
    CATEGORIAS.map((c) => [
      c.clave,
      c.serie > 0 ? leer(`--gr-s${c.serie}`) : leer('--gr-s-otros'),
    ]),
  ) as Record<ClaveCategoria, string>
}

/** Clasifica un elemento OSM en la primera categoría cuyo criterio cumple. */
export function clasificar(tags: Record<string, string>): ClaveCategoria {
  if (tags.amenity && /^(school|kindergarten|college|university|library)$/.test(tags.amenity))
    return 'educacion'
  if (
    tags.healthcare ||
    (tags.amenity && /^(hospital|clinic|doctors|dentist|pharmacy)$/.test(tags.amenity))
  )
    return 'salud'
  if (
    tags.highway === 'bus_stop' ||
    tags.public_transport ||
    (tags.amenity &&
      /^(bus_station|parking|fuel|taxi|bicycle_parking|charging_station)$/.test(tags.amenity))
  )
    return 'movilidad'
  if (tags.amenity && /^(restaurant|cafe|fast_food|bar|pub|food_court|ice_cream)$/.test(tags.amenity))
    return 'alimentacion'
  if (tags.shop) return 'comercio'
  if (
    (tags.leisure && /^(park|pitch|playground|sports_centre|garden|stadium)$/.test(tags.leisure)) ||
    (tags.amenity && /^(marketplace|toilets|drinking_water|bench)$/.test(tags.amenity))
  )
    return 'espacio_publico'
  if (
    tags.office === 'government' ||
    (tags.amenity &&
      /^(townhall|police|fire_station|courthouse|post_office|community_centre|bank)$/.test(
        tags.amenity,
      ))
  )
    return 'institucional'
  if (tags.historic || tags.tourism) return 'patrimonio'
  return 'otros'
}
