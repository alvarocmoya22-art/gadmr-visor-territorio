/**
 * Capas del GADM Riobamba: plataformas, parroquias urbanas, barrios y el
 * inventario de equipamientos.
 *
 * Origen: shapefiles en EPSG:32717 (UTM 17S) convertidos a GeoJSON WGS84 por
 * `scripts/convertir_shapefiles.py`. Ese script es la única vía de actualización:
 * si llegan shapefiles nuevos, se vuelve a correr, no se editan los GeoJSON.
 */
import { cajaDe, distanciaM, enCaja, enPoligono, normalizar, poligonosDe, puntoInterior, similitud, type Anillo, type Caja } from './geo'
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
  /**
   * Habitantes del Censo 2022 repartidos a este barrio. Cero cuando el barrio
   * no recibio ningun edificio, que en suelo urbano suele querer decir que no
   * hay nadie viviendo ahi, no que falte el dato.
   */
  pob: number
  /** Viviendas particulares ocupadas. */
  viv: number
  /** Poblacion en viviendas con acceso a servicios publicos basicos. */
  pobServB: number
  /**
   * Punto dentro del barrio, cerca de su centro. Se calcula una vez al cargar
   * porque de él dependen tanto la plataforma como las distancias del
   * análisis, y recorrer 204 polígonos en cada cambio de filtro se nota.
   */
  centro: [number, number]
  /** Plataforma que contiene ese centro; null si el barrio cae fuera de todas. */
  plataforma: string | null
}

export interface EquipamientoMunicipal {
  id: string
  nombre: string
  /** Uso segun la Tabla 3 del Codigo Urbano: Educacion, Salud, Transporte... */
  tipo: string
  /** Actividad concreta, p. ej. «Iglesias hasta 200 puestos». */
  elemento: string
  /** Nivel de la ordenanza: Barrial, Zonal o Cantonal. */
  tipologia: string
  /** Publico o Privado. */
  gestion: string
  /** Estado fisico observado en campo: Bueno, Regular o Malo. */
  estado: string
  /** Parroquia declarada en el levantamiento. */
  parroquia: string
  observaciones: string
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

/**
 * Agregado de poblacion por barrio y plataforma.
 *
 * Lo produce `scripts/poblacion_barrios.py` a partir del Censo 2022. Al
 * proyecto solo llega este resumen, nunca la capa de sectores del INEC: sus
 * condiciones de uso son de copyright y este repositorio es publico.
 */
export interface Poblacion {
  fuente: string
  metodo: string
  canton: { pob: number; sectores: number }
  barrios: Record<string, { pob: number; viv: number; pobServB: number; edificios: number }>
  plataformas: Record<string, { pob: number; viv: number }>
}

/**
 * Un proyecto del tablero de la Jefatura de Diseno de la Obra Publica.
 *
 * Llega de `scripts/proyectos_pac.py`, que lee la misma tabla que sirve el
 * tablero publico. `uso` y `tipologia` son los de la Tabla 3 del Codigo Urbano,
 * de modo que un proyecto se puede medir con el mismo radio que un equipamiento
 * ya construido; `aporta` dice si crea alcance nuevo o no. Un adoquinado, un
 * colector o una consultoria son inversion real y no mueven la cobertura de un
 * parque: esos llegan con `aporta` en falso y no entran en el analisis.
 */
export interface Proyecto {
  id: string
  item: number
  nombre: string
  categoria: string
  parroquia: string
  monto: number | null
  estado: string
  /** Uso de la Tabla 3, o null si el proyecto no es equipamiento. */
  uso: string | null
  tipologia: string | null
  /**
   * A que escala sirve: «proximidad» si es equipamiento al que se va andando,
   * «ciudad» si es dotacion cantonal —el cementerio general, el centro de
   * rescate animal— que sirve a todo el canton y que nadie usa a diario a pie,
   * null si no es equipamiento. Solo lo de proximidad entra en la isocrona.
   */
  escala: string | null
  /** Si crea alcance nuevo de equipamiento: `escala` de proximidad. */
  aporta: boolean
  /** Por que aporta o por que no, en una linea. */
  nota: string
  lon: number
  lat: number
  plataforma: string | null
  barrio: string | null
}

export interface CapasMunicipales {
  plataformas: Plataforma[]
  barriosLista: Barrio[]
  equipamientos: EquipamientoMunicipal[]
  parroquias: GeoJSON.FeatureCollection
  barrios: GeoJSON.FeatureCollection
  plataformasGeo: GeoJSON.FeatureCollection
  /** null si el archivo no esta; el visor sigue funcionando sin poblacion. */
  poblacion: Poblacion | null
  /** Vacio si el archivo no esta: la capa de proyectos es opcional. */
  proyectos: Proyecto[]
}

/**
 * Ámbito que reúne todas las plataformas: el área urbana del cantón.
 *
 * No es una plataforma, es la suma de las 18. Hace falta como valor propio
 * porque «sin filtro» no significa lo mismo: sin filtro entran también los
 * registros de las parroquias rurales, que no forman parte del levantamiento
 * por plataformas.
 *
 * El asterisco no colisiona con ninguna clave real: van de la A a la Q.
 */
export const URBANO = '*'

/** Radio dentro del cual dos registros pueden ser el mismo sitio. */
export const RADIO_COTEJO_M = 50
/** Por debajo de este parecido de nombre la coincidencia no se da por buena. */
export const UMBRAL_NOMBRE = 0.5

/*
 * `no-cache` no significa «sin cache»: significa revalidar antes de usarla.
 * Estos archivos se sirven con un nombre fijo y diez minutos de cache, asi que
 * tras publicar una capa corregida el navegador seguia dando la vieja mientras
 * el codigo ya era el nuevo. Con la revalidacion, el ETag ahorra la descarga
 * cuando el archivo no ha cambiado y la fuerza cuando si.
 */
async function traer(nombre: string): Promise<GeoJSON.FeatureCollection> {
  const resp = await fetch(`${import.meta.env.BASE_URL}datos/${nombre}.geojson`, {
    cache: 'no-cache',
  })
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

/**
 * Superficie del barrio en hectáreas.
 *
 * Se prefiere la calculada de la geometría: el `AREA_HA_` del shapefile
 * municipal repite los mismos 62,28 ha en 17 barrios que miden entre 1 y 11,
 * y esa cifra es la que el visor enseña junto a cada nombre.
 */
const areaDe = (p: Record<string, unknown>): number =>
  Number(p.area_ha_geom ?? p.area_ha ?? 0)

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
      ya.areaHa += areaDe(p)
      ya.caja = cajaDe(ya.poligonos.flat())
      ya.piezas++
    } else {
      porNombre.set(nombre, {
        nombre,
        areaHa: areaDe(p),
        poligonos,
        caja: cajaDe(poligonos.flat()),
        piezas: 1,
        centro: [0, 0], // se rellena al terminar de unir las piezas
        plataforma: null,
        pob: 0,
        viv: 0,
        pobServB: 0,
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

/**
 * Trae el agregado de poblacion. Que falte no es un error: el visor funciona
 * igual sin el, solo sin los indicadores por habitante.
 */
async function traerPoblacion(): Promise<Poblacion | null> {
  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}datos/poblacion.json`, {
      cache: 'no-cache',
    })
    return resp.ok ? ((await resp.json()) as Poblacion) : null
  } catch {
    return null
  }
}

/**
 * Los proyectos, si estan.
 *
 * Opcional a proposito: el visor tiene que seguir abriendo aunque el archivo no
 * se haya generado todavia o el tablero de origen se caiga.
 */
async function traerProyectos(): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}datos/proyectos.geojson`, {
      cache: 'no-cache',
    })
    return resp.ok ? ((await resp.json()) as GeoJSON.FeatureCollection) : null
  } catch {
    return null
  }
}

export async function cargarCapas(): Promise<CapasMunicipales> {
  const [plataformasGeo, parroquias, barrios, equipamientosGeo, poblacion, proyectosGeo] =
    await Promise.all([
      traer('plataformas'),
      traer('parroquias'),
      traer('barrios'),
      traer('equipamientos'),
      traerPoblacion(),
      traerProyectos(),
    ])

  const plataformas = aPlataformas(plataformasGeo)
  nombrarBarrios(barrios)
  const barriosLista = aBarrios(barrios)

  // Con todas las piezas ya unidas, cada barrio recibe su centro y la
  // plataforma que lo contiene. Un barrio a caballo entre dos cuenta para
  // aquella donde cae su centro, el mismo criterio que para los puntos.
  for (const b of barriosLista) {
    b.centro = puntoInterior(b.poligonos)
    b.plataforma = plataformaDe(b.centro[0], b.centro[1], plataformas)
    const censo = poblacion?.barrios[b.nombre]
    if (censo) {
      b.pob = censo.pob
      b.viv = censo.viv
      b.pobServB = censo.pobServB
    }
  }

  const equipamientos: EquipamientoMunicipal[] = equipamientosGeo.features.map((f, i) => {
    const p = f.properties ?? {}
    const c = (f.geometry as GeoJSON.Point).coordinates
    return {
      // `id` se repite entre capas de origen, así que el índice es la clave real.
      id: `m${i}`,
      nombre: String(p.nombre ?? '').trim(),
      tipo: String(p.tipo ?? 'sin tipo'),
      elemento: String(p.elemento ?? ''),
      tipologia: String(p.tipologia ?? ''),
      gestion: String(p.gestion ?? ''),
      estado: String(p.estado ?? ''),
      parroquia: String(p.parroquia ?? ''),
      observaciones: String(p.observaciones ?? ''),
      lon: c[0],
      lat: c[1],
      plataforma: plataformaDe(c[0], c[1], plataformas),
      barrioLimite: barrioDe(c[0], c[1], barriosLista),
      cotejo: { estado: 'ausente', osmId: null, osmNombre: null, distancia: null, parecido: 0 },
    }
  })

  const proyectos: Proyecto[] = (proyectosGeo?.features ?? []).map((f, i) => {
    const p = f.properties ?? {}
    const c = (f.geometry as GeoJSON.Point).coordinates
    return {
      id: `pr${i}`,
      item: Number(p.item ?? 0),
      nombre: String(p.proyecto ?? '').trim(),
      categoria: String(p.categoria ?? ''),
      parroquia: String(p.parroquia ?? ''),
      monto: p.monto == null ? null : Number(p.monto),
      estado: String(p.estado ?? ''),
      uso: p.uso == null ? null : String(p.uso),
      tipologia: p.tipologia == null ? null : String(p.tipologia),
      escala: p.escala == null ? null : String(p.escala),
      aporta: p.aporta === true,
      nota: String(p.nota ?? ''),
      lon: c[0],
      lat: c[1],
      // La plataforma y el barrio los calcula el script por geometria, pero se
      // recalculan aqui para que no dependan de que el archivo este al dia con
      // los limites que el visor tiene cargados.
      plataforma: plataformaDe(c[0], c[1], plataformas),
      barrio: barrioDe(c[0], c[1], barriosLista),
    }
  })

  return {
    plataformas,
    barriosLista,
    equipamientos,
    parroquias,
    barrios,
    plataformasGeo,
    poblacion,
    proyectos,
  }
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
        tipologia: e.tipologia,
        gestion: e.gestion,
        estado: e.cotejo.estado,
        plataforma: e.plataforma ?? '',
      },
    })),
  }
}
