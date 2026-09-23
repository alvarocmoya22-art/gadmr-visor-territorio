/**
 * Cobertura de equipamiento por área de influencia.
 *
 * Mide qué parte del territorio queda dentro del radio de servicio de algún
 * equipamiento de un tipo dado. Es el primer paso de la metodología habitual
 * en planificación urbana: primero el área servida por jerarquía de
 * equipamiento, después la población que cae dentro de ella.
 *
 * El método es de muestreo: se llena cada barrio de puntos en rejilla y se
 * cuenta cuántos tienen equipamiento a su alcance. Sobre esa fracción se
 * reparte la población del barrio, que viene del Censo 2022 ya distribuida por
 * edificios (ver `scripts/poblacion_barrios.py`), y así la cobertura se mide
 * en habitantes y no solo en hectáreas.
 *
 * Lo que NO hace, y conviene tener presente al leer los resultados:
 *
 *  - Mide en línea recta. La distancia andando por calle siempre es mayor, así
 *    que la cobertura real es algo menor que la que sale aquí.
 *  - Trata todos los equipamientos como equivalentes. Una escuela de 60 plazas
 *    cubre lo mismo que una de 900, lo cual es falso: eso solo se corrige con
 *    la capacidad de cada uno y un método tipo E2SFCA.
 *  - Dentro del barrio reparte la población de forma uniforme. Es un supuesto
 *    aceptable en barrios urbanos pequeños, no en los de borde.
 *  - Los radios son un punto de partida, no una norma. Hay que fijarlos contra
 *    el estándar urbanístico que aplique al PUGS.
 */
import type { ClaveCategoria } from './categorias'
import { distanciaM, enPoligono } from './geo'
import type { Barrio, EquipamientoMunicipal } from './municipal'
import type { Punto } from './overpass'

/** De dónde salen los equipamientos que cuentan como servicio. */
export type FuenteCobertura = 'gadm' | 'osm' | 'ambas'

/**
 * Radios de partida por tipo, en metros.
 *
 * Son órdenes de magnitud corrientes en la jerarquía barrial/sectorial/zonal,
 * NO cifras tomadas de una norma concreta. Están aquí para que el visor abra
 * con algo razonable; el valor que se use en un informe tiene que salir del
 * estándar urbanístico vigente y por eso el radio es un control a la vista.
 */
export const RADIO_SUGERIDO: Record<string, number> = {
  educativo: 500,
  recreativo: 400,
  salud: 1000,
  'religioso / cultura': 800,
  cultura: 800,
  administrativo: 1500,
}
export const RADIO_POR_DEFECTO = 800

/** Radios que ofrece el control, en metros. */
export const RADIOS = [300, 400, 500, 800, 1000, 1500]

/**
 * Categoría de OSM equivalente a cada tipo del inventario municipal.
 *
 * Solo están los tipos en los que la equivalencia es defendible. Lo religioso
 * no tiene categoría propia en el visor y lo cultural se reparte entre varias,
 * así que para esos el cotejo con OSM se queda fuera antes que dar por bueno
 * un emparejamiento a medias.
 */
export const EQUIVALENTE_OSM: Record<string, ClaveCategoria | undefined> = {
  educativo: 'educacion',
  salud: 'salud',
  recreativo: 'espacio_publico',
  administrativo: 'institucional',
}

/** Lado de la rejilla de muestreo, en metros. */
const PASO_M = 75

/** Un punto que sirve como oferta, venga de donde venga. */
interface Servicio {
  lon: number
  lat: number
}

export interface CoberturaBarrio {
  nombre: string
  /** Parte de la superficie del barrio dentro de algún radio, de 0 a 1. */
  cubierto: number
  /** Puntos de rejilla evaluados; con muy pocos, el porcentaje es grueso. */
  muestras: number
  areaHa: number
  /** Habitantes del barrio (Censo 2022), 0 si no hay dato. */
  pob: number
  /** Habitantes dentro del radio, suponiendo reparto uniforme en el barrio. */
  pobCubierta: number
}

export interface Cobertura {
  tipo: string
  radio: number
  fuente: FuenteCobertura
  /** Equipamientos que han entrado en el cálculo. */
  servicios: number
  /** Cuántos vienen del inventario y cuántos de OSM, para poder decirlo. */
  deGadm: number
  deOsm: number
  filas: CoberturaBarrio[]
  /** Coropleta por barrio. */
  geo: GeoJSON.FeatureCollection
  /** Los círculos de alcance, para enseñar de dónde sale la cobertura. */
  alcance: GeoJSON.FeatureCollection
  /** Superficie cubierta sobre el total del ámbito, de 0 a 1. */
  total: number
  /** Barrios sin nada de superficie cubierta. */
  sinNada: number
  /** Habitantes del ámbito; 0 cuando no hay datos de población cargados. */
  poblacion: number
  /** Habitantes dentro de algún radio de servicio. */
  poblacionCubierta: number
  /** Habitantes de los barrios que se quedan enteros fuera. */
  poblacionSinNada: number
}

/**
 * Índice por celdas del tamaño del radio.
 *
 * Sin él esto es una comparación de todos contra todos: unos 20.000 puntos de
 * rejilla por 300 equipamientos son seis millones de distancias cada vez que
 * se mueve el control del radio. Con el índice solo se miran las nueve celdas
 * vecinas y la respuesta es inmediata.
 */
class Rejilla {
  private celdas = new Map<string, Servicio[]>()
  private ladoLat: number
  private ladoLon: number

  constructor(servicios: Servicio[], radioM: number, latRef: number) {
    this.ladoLat = radioM / 111320
    this.ladoLon = radioM / (111320 * Math.cos((latRef * Math.PI) / 180))
    for (const s of servicios) {
      const clave = this.clave(s.lon, s.lat)
      const ya = this.celdas.get(clave)
      if (ya) ya.push(s)
      else this.celdas.set(clave, [s])
    }
  }

  private clave(lon: number, lat: number): string {
    return `${Math.floor(lon / this.ladoLon)},${Math.floor(lat / this.ladoLat)}`
  }

  /** ¿Hay algún servicio a `radioM` o menos de este punto? */
  alcanza(lon: number, lat: number, radioM: number): boolean {
    const cx = Math.floor(lon / this.ladoLon)
    const cy = Math.floor(lat / this.ladoLat)
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const lista = this.celdas.get(`${cx + i},${cy + j}`)
        if (!lista) continue
        for (const s of lista) {
          if (distanciaM(lon, lat, s.lon, s.lat) <= radioM) return true
        }
      }
    }
    return false
  }
}

/** Círculo geodésico aproximado, para dibujar el alcance. */
function circulo(lon: number, lat: number, radioM: number, lados = 36): number[][] {
  const dLat = radioM / 111320
  const dLon = radioM / (111320 * Math.cos((lat * Math.PI) / 180))
  const anillo: number[][] = []
  for (let i = 0; i <= lados; i++) {
    const a = (i / lados) * 2 * Math.PI
    anillo.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)])
  }
  return anillo
}

export interface OpcionesCobertura {
  tipo: string
  radio: number
  fuente: FuenteCobertura
}

/**
 * Parte de cada barrio que queda dentro del radio de servicio.
 *
 * `barrios` llega ya recortado al ámbito; `equipamientos` y `puntos` también,
 * así que el resultado cambia solo con los filtros, como el resto del análisis.
 */
export function calcularCobertura(
  barrios: Barrio[],
  equipamientos: EquipamientoMunicipal[],
  puntos: Punto[],
  { tipo, radio, fuente }: OpcionesCobertura,
): Cobertura {
  const delGadm = fuente === 'osm' ? [] : equipamientos.filter((e) => e.tipo === tipo)
  const categoria = EQUIVALENTE_OSM[tipo]
  const delOsm =
    fuente === 'gadm' || !categoria ? [] : puntos.filter((p) => p.categoria === categoria)

  const servicios: Servicio[] = [
    ...delGadm.map((e) => ({ lon: e.lon, lat: e.lat })),
    ...delOsm.map((p) => ({ lon: p.lon, lat: p.lat })),
  ]

  const latRef = barrios.length ? barrios[0].centro[1] : -1.67
  const indice = new Rejilla(servicios, radio, latRef)

  const filas: CoberturaBarrio[] = []
  const rasgos: GeoJSON.Feature[] = []
  let areaTotal = 0
  let areaCubierta = 0
  let pobTotal = 0
  let pobCubierta = 0
  let pobSinNada = 0

  for (const b of barrios) {
    const [oeste, sur, este, norte] = b.caja
    const latMedia = (sur + norte) / 2
    const dLat = PASO_M / 111320
    const dLon = PASO_M / (111320 * Math.cos((latMedia * Math.PI) / 180))

    let dentro = 0
    let cubiertos = 0
    for (let y = sur + dLat / 2; y <= norte; y += dLat) {
      for (let x = oeste + dLon / 2; x <= este; x += dLon) {
        // La caja del barrio es un rectángulo; solo cuentan los puntos que
        // caen de verdad dentro de alguna de sus piezas.
        if (!b.poligonos.some((poly) => enPoligono(x, y, poly))) continue
        dentro++
        if (servicios.length > 0 && indice.alcanza(x, y, radio)) cubiertos++
      }
    }

    // Un barrio menor que la celda de rejilla puede no recibir ningún punto.
    // En ese caso se evalúa su centro, que siempre cae dentro.
    if (dentro === 0) {
      dentro = 1
      if (servicios.length > 0 && indice.alcanza(b.centro[0], b.centro[1], radio)) cubiertos = 1
    }

    const cubierto = cubiertos / dentro
    /*
     * La poblacion se reparte uniforme DENTRO del barrio. Es un supuesto, pero
     * mucho mas inocente que el equivalente a nivel de sector censal: los
     * barrios urbanos son pequenos y homogeneos, y la poblacion que entra aqui
     * ya viene repartida por edificios, no por superficie.
     */
    const pobCubiertaBarrio = b.pob * cubierto
    filas.push({
      nombre: b.nombre,
      cubierto,
      muestras: dentro,
      areaHa: b.areaHa,
      pob: b.pob,
      pobCubierta: pobCubiertaBarrio,
    })
    areaTotal += b.areaHa
    areaCubierta += b.areaHa * cubierto
    pobTotal += b.pob
    pobCubierta += pobCubiertaBarrio
    if (cubierto === 0) pobSinNada += b.pob

    rasgos.push({
      type: 'Feature',
      geometry:
        b.poligonos.length === 1
          ? { type: 'Polygon', coordinates: b.poligonos[0] }
          : { type: 'MultiPolygon', coordinates: b.poligonos },
      properties: {
        nombre: b.nombre,
        // En porcentaje entero: MapLibre compara mejor enteros y la leyenda
        // habla en porcentaje, no en fracciones.
        cubierto: Math.round(cubierto * 100),
        muestras: dentro,
      },
    })
  }

  // Con censo, primero los que dejan mas gente fuera; sin el, los menos
  // cubiertos. Un barrio deshabitado y sin cobertura no es una prioridad.
  filas.sort((a, b) =>
    pobTotal > 0
      ? b.pob * (1 - b.cubierto) - a.pob * (1 - a.cubierto)
      : a.cubierto - b.cubierto,
  )

  return {
    tipo,
    radio,
    fuente,
    servicios: servicios.length,
    deGadm: delGadm.length,
    deOsm: delOsm.length,
    filas,
    geo: { type: 'FeatureCollection', features: rasgos },
    alcance: {
      type: 'FeatureCollection',
      features: servicios.map((s) => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [circulo(s.lon, s.lat, radio)] },
        properties: {},
      })),
    },
    total: areaTotal ? areaCubierta / areaTotal : 0,
    sinNada: filas.filter((f) => f.cubierto === 0).length,
    poblacion: Math.round(pobTotal),
    poblacionCubierta: Math.round(pobCubierta),
    poblacionSinNada: Math.round(pobSinNada),
  }
}

/** Los tipos del inventario, con cuántos equipamientos tiene cada uno. */
export function tiposDisponibles(
  equipamientos: EquipamientoMunicipal[],
): { tipo: string; n: number }[] {
  const cuenta = new Map<string, number>()
  for (const e of equipamientos) cuenta.set(e.tipo, (cuenta.get(e.tipo) ?? 0) + 1)
  return [...cuenta.entries()]
    .map(([tipo, n]) => ({ tipo, n }))
    .sort((a, b) => b.n - a.n)
}
