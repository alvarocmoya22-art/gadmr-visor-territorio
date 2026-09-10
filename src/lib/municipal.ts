/**
 * Capas del GADM Riobamba: plataformas, parroquias urbanas, barrios y el
 * inventario de equipamientos.
 *
 * Origen: shapefiles en EPSG:32717 (UTM 17S) convertidos a GeoJSON WGS84 por
 * `scripts/convertir_shapefiles.py`. Ese script es la única vía de actualización:
 * si llegan shapefiles nuevos, se vuelve a correr, no se editan los GeoJSON.
 */
import { cajaDe, distanciaM, enCaja, enPoligono, normalizar, poligonosDe, similitud, type Anillo, type Caja } from './geo'
import type { Punto } from './overpass'

export interface Plataforma {
  clave: string
  nombre: string
  areaHa: number
  rotulo: [number, number]
  poligonos: Anillo[][]
  caja: Caja
}

export interface Barrio {
  nombre: string
  areaHa: number
  poligonos: Anillo[][]
  caja: Caja
  /** Cuantos poligonos sueltos componen el barrio. */
  piezas: number
}

export interface EquipamientoMunicipal {
  id: string
  nombre: string
  tipo: string
  subtipo: string | null
  barrio: string | null
  lon: number
  lat: number
  /** Plataforma que lo contiene, si cae dentro de alguna. */
  plataforma: string | null
  /** Barrio que lo contiene, si cae dentro de alguno. */
  barrioLimite: string | null
  cotejo: Cotejo
}

/** Resultado de contrastar un equipamiento municipal contra OSM. */
export interface Cotejo {
  estado: 'confirmado' | 'dudoso' | 'ausente' | 'sin_nombre'
  /** Punto OSM más cercano dentro del radio, si lo hay. */
  osmId: string | null
  osmNombre: string | null
  distancia: number | null
  parecido: number
}

export interface CapasMunicipales {
  plataformas: Plataforma[]
  barriosLista: Barrio[]
  equipamientos: EquipamientoMunicipal[]
  parroquias: GeoJSON.FeatureCollection
  barrios: GeoJSON.FeatureCollection
  plataformasGeo: GeoJSON.FeatureCollection
}

/** Radio dentro del cual dos registros pueden ser el mismo sitio. */
export const RADIO_COTEJO_M = 50
/** Por debajo de este parecido de nombre la coincidencia no se da por buena. */
export const UMBRAL_NOMBRE = 0.5

async function traer(nombre: string): Promise<GeoJSON.FeatureCollection> {
  const resp = await fetch(`${import.meta.env.BASE_URL}datos/${nombre}.geojson`)
  if (!resp.ok) throw new Error(`No se pudo cargar ${nombre}.geojson (${resp.status})`)
  return (await resp.json()) as GeoJSON.FeatureCollection
}

/**
 * Da a cada barrio un nombre con el que se pueda filtrar, MODIFICANDO el
 * GeoJSON que tambien se dibuja, para que lista, filtro y resaltado coincidan.
 *
 * El shapefile trae 197 poligonos pero solo 182 nombres: nueve no tienen
 * nombre y siete barrios vienen partidos en dos piezas. A los anonimos se les
 * pone su numero, que si es unico; las piezas del mismo barrio se dejan con su
 * nombre y se agrupan despues.
 */
function nombrarBarrios(fc: GeoJSON.FeatureCollection): void {
  for (const f of fc.features) {
    const p = (f.properties ??= {})
    const nombre = String(p.nombre ?? '').trim()
    if (!nombre || nombre === 'Sin nombre') {
      p.nombre = `Sin nombre (n.º ${p.numero ?? '?'})`
    }
  }
}

/** Un barrio por nombre: las piezas sueltas del mismo barrio se unen. */
function aBarrios(fc: GeoJSON.FeatureCollection): Barrio[] {
  const porNombre = new Map<string, Barrio>()
  for (const f of fc.features) {
    const p = f.properties ?? {}
    const nombre = String(p.nombre ?? 'Sin nombre')
    const poligonos = poligonosDe(f.geometry)
    const ya = porNombre.get(nombre)
    if (ya) {
      ya.poligonos.push(...poligonos)
      ya.areaHa += Number(p.area_ha ?? 0)
      ya.caja = cajaDe(ya.poligonos.flat())
      ya.piezas++
    } else {
      porNombre.set(nombre, {
        nombre,
        areaHa: Number(p.area_ha ?? 0),
        poligonos,
        caja: cajaDe(poligonos.flat()),
        piezas: 1,
      })
    }
  }
  return [...porNombre.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

function aPlataformas(fc: GeoJSON.FeatureCollection): Plataforma[] {
  return fc.features
    .map((f) => {
      const p = f.properties ?? {}
      const poligonos = poligonosDe(f.geometry)
      return {
        clave: String(p.clave ?? ''),
        nombre: String(p.nombre ?? ''),
        areaHa: Number(p.area_ha ?? 0),
        rotulo: [Number(p.rotulo_lon), Number(p.rotulo_lat)] as [number, number],
        poligonos,
        caja: cajaDe(poligonos.flat()),
      }
    })
    .sort((a, b) => a.clave.localeCompare(b.clave, 'es'))
}

/** Primera zona que contiene el punto, o null si cae fuera de todas. */
function zonaDe<T extends { poligonos: Anillo[][]; caja: Caja }>(
  lon: number,
  lat: number,
  zonas: T[],
  nombreDe: (z: T) => string,
): string | null {
  for (const z of zonas) {
    if (!enCaja(lon, lat, z.caja)) continue // descarte barato antes del cruce de rayos
    for (const poly of z.poligonos) {
      if (enPoligono(lon, lat, poly)) return nombreDe(z)
    }
  }
  return null
}

export const plataformaDe = (lon: number, lat: number, plataformas: Plataforma[]) =>
  zonaDe(lon, lat, plataformas, (p) => p.clave)

export const barrioDe = (lon: number, lat: number, barrios: Barrio[]) =>
  zonaDe(lon, lat, barrios, (b) => b.nombre)

/**
 * Contrasta un equipamiento municipal con los puntos de OSM.
 *
 * «confirmado» exige cercanía y nombre parecido. Solo la cercanía no basta: en
 * el centro de Riobamba casi cualquier punto tiene algún vecino a 50 m, así que
 * ese criterio por sí solo daría por registrado lo que no lo está.
 */
export function cotejar(eq: { nombre: string; lon: number; lat: number }, osm: Punto[]): Cotejo {
  const nombreEq = normalizar(eq.nombre)
  let mejor: { p: Punto; d: number } | null = null
  let mejorParecido = 0
  let mejorPorNombre: { p: Punto; d: number } | null = null

  for (const p of osm) {
    const d = distanciaM(eq.lon, eq.lat, p.lon, p.lat)
    if (d > RADIO_COTEJO_M) continue
    if (!mejor || d < mejor.d) mejor = { p, d }
    if (nombreEq && p.nombre) {
      const s = similitud(nombreEq, normalizar(p.nombre))
      if (s > mejorParecido) {
        mejorParecido = s
        mejorPorNombre = { p, d }
      }
    }
  }

  if (!mejor) {
    return { estado: 'ausente', osmId: null, osmNombre: null, distancia: null, parecido: 0 }
  }
  if (!nombreEq) {
    return {
      estado: 'sin_nombre',
      osmId: mejor.p.id,
      osmNombre: mejor.p.nombre,
      distancia: mejor.d,
      parecido: 0,
    }
  }
  const elegido = mejorParecido >= UMBRAL_NOMBRE && mejorPorNombre ? mejorPorNombre : mejor
  return {
    estado: mejorParecido >= UMBRAL_NOMBRE ? 'confirmado' : 'dudoso',
    osmId: elegido.p.id,
    osmNombre: elegido.p.nombre,
    distancia: elegido.d,
    parecido: mejorParecido,
  }
}

export async function cargarCapas(): Promise<CapasMunicipales> {
  const [plataformasGeo, parroquias, barrios, equipamientosGeo] = await Promise.all([
    traer('plataformas'),
    traer('parroquias'),
    traer('barrios'),
    traer('equipamientos'),
  ])

  const plataformas = aPlataformas(plataformasGeo)
  nombrarBarrios(barrios)
  const barriosLista = aBarrios(barrios)

  const equipamientos: EquipamientoMunicipal[] = equipamientosGeo.features.map((f, i) => {
    const p = f.properties ?? {}
    const c = (f.geometry as GeoJSON.Point).coordinates
    return {
      // `id` se repite entre capas de origen, así que el índice es la clave real.
      id: `m${i}`,
      nombre: String(p.nombre ?? '').trim(),
      tipo: String(p.tipo ?? 'sin tipo'),
      subtipo: p.subtipo ? String(p.subtipo) : null,
      barrio: p.barrio ? String(p.barrio) : null,
      lon: c[0],
      lat: c[1],
      plataforma: plataformaDe(c[0], c[1], plataformas),
      barrioLimite: barrioDe(c[0], c[1], barriosLista),
      cotejo: { estado: 'ausente', osmId: null, osmNombre: null, distancia: null, parecido: 0 },
    }
  })

  return { plataformas, barriosLista, equipamientos, parroquias, barrios, plataformasGeo }
}

/** Vuelve a cotejar todo el inventario contra los puntos de OSM recién cargados. */
export function cotejarInventario(
  equipamientos: EquipamientoMunicipal[],
  osm: Punto[],
): EquipamientoMunicipal[] {
  return equipamientos.map((e) => ({ ...e, cotejo: cotejar(e, osm) }))
}

export interface AvancePlataforma {
  clave: string
  areaHa: number
  puntosOsm: number
  verificados: number
  equipamientos: number
  porVerificar: number
}

export function avancePorPlataforma(
  plataformas: Plataforma[],
  puntos: Punto[],
  equipamientos: EquipamientoMunicipal[],
): AvancePlataforma[] {
  const base = new Map<string, AvancePlataforma>(
    plataformas.map((p) => [
      p.clave,
      {
        clave: p.clave,
        areaHa: p.areaHa,
        puntosOsm: 0,
        verificados: 0,
        equipamientos: 0,
        porVerificar: 0,
      },
    ]),
  )

  for (const p of puntos) {
    const fila = p.plataforma ? base.get(p.plataforma) : undefined
    if (!fila) continue
    fila.puntosOsm++
    if (p.frescura === 'vigente') fila.verificados++
  }
  for (const e of equipamientos) {
    const fila = e.plataforma ? base.get(e.plataforma) : undefined
    if (!fila) continue
    fila.equipamientos++
    if (e.cotejo.estado !== 'confirmado') fila.porVerificar++
  }
  return [...base.values()]
}

export function aGeoJSONEquipamientos(
  equipamientos: EquipamientoMunicipal[],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: equipamientos.map((e) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [e.lon, e.lat] },
      properties: {
        id: e.id,
        nombre: e.nombre,
        tipo: e.tipo,
        estado: e.cotejo.estado,
        plataforma: e.plataforma ?? '',
      },
    })),
  }
}
