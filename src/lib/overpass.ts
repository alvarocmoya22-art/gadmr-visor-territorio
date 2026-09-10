import { AREA_OVERPASS, ESPEJOS_OVERPASS, FRESCURA } from '../config/riobamba'
import { CATEGORIAS, clasificar, POR_CLAVE, type ClaveCategoria } from './categorias'
import { mesesDesde } from './format'

export type Frescura = 'vigente' | 'por_vencer' | 'vencido' | 'sin_verificar'

export interface Punto {
  id: string
  tipo: 'node' | 'way' | 'relation'
  osmId: number
  lat: number
  lon: number
  nombre: string | null
  categoria: ClaveCategoria
  /** Etiqueta principal, p. ej. «amenity=pharmacy». */
  clase: string
  tags: Record<string, string>
  checkDate: string | undefined
  frescura: Frescura
  /** Campos clave de la categoría que faltan en la ficha. */
  faltantes: string[]
  completitud: number
  /** Plataforma que lo contiene; se asigna al cruzar con las capas municipales. */
  plataforma: string | null
  /** Barrio que lo contiene; se asigna igual que la plataforma. */
  barrio: string | null
}

export interface Resultado {
  puntos: Punto[]
  /** Marca de tiempo de la base OSM que respondió Overpass. */
  selloOsm: string | null
  obtenido: string
  espejo: string
  desdeCache: boolean
}

const CLAVE_CACHE = 'gadmr.overpass.v1'
const VIDA_CACHE_MS = 6 * 60 * 60 * 1000

/** Etiquetas que se conservan; el resto se descarta para no inflar la caché. */
const TAGS_RELEVANTES = [
  'name', 'amenity', 'shop', 'healthcare', 'highway', 'public_transport', 'leisure',
  'tourism', 'historic', 'office', 'operator', 'operator:type', 'brand', 'cuisine',
  'opening_hours', 'phone', 'contact:phone', 'website', 'contact:website', 'email',
  'addr:street', 'addr:housenumber', 'addr:city', 'wheelchair', 'shelter', 'access',
  'heritage', 'check_date', 'survey:date', 'source', 'description', 'level',
]

export function construirConsulta(): string {
  const cuerpo = CATEGORIAS.flatMap((c) => c.filtros)
    .map((f) => `  nwr${f}(area.rio);`)
    .join('\n')
  return `[out:json][timeout:180];
area(${AREA_OVERPASS})->.rio;
(
${cuerpo}
);
out tags center qt;`
}

interface ElementoOverpass {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

function claseDe(tags: Record<string, string>): string {
  for (const k of ['amenity', 'shop', 'healthcare', 'leisure', 'tourism', 'historic', 'office', 'public_transport', 'highway']) {
    if (tags[k]) return `${k}=${tags[k]}`
  }
  return '—'
}

function frescuraDe(checkDate: string | undefined): Frescura {
  const m = mesesDesde(checkDate)
  if (m === null) return 'sin_verificar'
  if (m <= FRESCURA.vigenteMeses) return 'vigente'
  if (m <= FRESCURA.porVencerMeses) return 'por_vencer'
  return 'vencido'
}

function normalizar(e: ElementoOverpass): Punto | null {
  const lat = e.lat ?? e.center?.lat
  const lon = e.lon ?? e.center?.lon
  if (lat === undefined || lon === undefined) return null

  const crudo = e.tags ?? {}
  const tags: Record<string, string> = {}
  for (const k of TAGS_RELEVANTES) if (crudo[k]) tags[k] = crudo[k]

  const categoria = clasificar(crudo)
  const camposClave = POR_CLAVE.get(categoria)?.camposClave ?? ['name']
  const faltantes = camposClave.filter((c) => !crudo[c])
  const checkDate = crudo['check_date'] ?? crudo['survey:date']

  return {
    id: `${e.type[0]}${e.id}`,
    tipo: e.type,
    osmId: e.id,
    lat,
    lon,
    nombre: crudo.name ?? null,
    categoria,
    clase: claseDe(crudo),
    tags,
    checkDate,
    frescura: frescuraDe(checkDate),
    faltantes,
    completitud: (camposClave.length - faltantes.length) / camposClave.length,
    plataforma: null,
    barrio: null,
  }
}

function leerCache(): Resultado | null {
  try {
    const bruto = localStorage.getItem(CLAVE_CACHE)
    if (!bruto) return null
    const guardado = JSON.parse(bruto) as Resultado
    if (Date.now() - new Date(guardado.obtenido).getTime() > VIDA_CACHE_MS) return null
    // La frescura se recalcula: depende de la fecha de hoy, no de la descarga.
    guardado.puntos = guardado.puntos.map((p) => ({ ...p, frescura: frescuraDe(p.checkDate) }))
    return { ...guardado, desdeCache: true }
  } catch {
    return null
  }
}

function escribirCache(r: Resultado) {
  try {
    localStorage.setItem(CLAVE_CACHE, JSON.stringify({ ...r, desdeCache: false }))
  } catch {
    /* cuota agotada o almacenamiento bloqueado: seguir sin caché */
  }
}

export function limpiarCache() {
  try {
    localStorage.removeItem(CLAVE_CACHE)
  } catch {
    /* nada que hacer */
  }
}

/**
 * Descarga los puntos del cantón. Rota entre espejos ante fallo o límite de
 * peticiones. `forzar` ignora la caché local de 6 h.
 */
export async function obtenerPuntos(forzar = false): Promise<Resultado> {
  if (!forzar) {
    const cache = leerCache()
    if (cache) return cache
  }

  const consulta = construirConsulta()
  let ultimoError: unknown = null

  for (const espejo of ESPEJOS_OVERPASS) {
    try {
      const resp = await fetch(espejo, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: consulta,
      })
      if (!resp.ok) {
        ultimoError = new Error(`${espejo} respondió ${resp.status}`)
        continue
      }
      const datos = (await resp.json()) as {
        elements: ElementoOverpass[]
        osm3s?: { timestamp_osm_base?: string }
      }
      const puntos = datos.elements
        .map(normalizar)
        .filter((p): p is Punto => p !== null)

      const resultado: Resultado = {
        puntos,
        selloOsm: datos.osm3s?.timestamp_osm_base ?? null,
        obtenido: new Date().toISOString(),
        espejo,
        desdeCache: false,
      }
      escribirCache(resultado)
      return resultado
    } catch (e) {
      ultimoError = e
    }
  }

  const cache = leerCache()
  if (cache) return cache
  throw new Error(
    `No se pudo consultar Overpass en ninguno de los ${ESPEJOS_OVERPASS.length} espejos. ` +
      `Último error: ${String(ultimoError)}`,
  )
}

export function aGeoJSON(puntos: Punto[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: puntos.map((p) => ({
      type: 'Feature',
      id: p.osmId,
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: {
        id: p.id,
        nombre: p.nombre ?? '',
        categoria: p.categoria,
        clase: p.clase,
        frescura: p.frescura,
        completitud: p.completitud,
        plataforma: p.plataforma ?? '',
        barrio: p.barrio ?? '',
      },
    })),
  }
}
