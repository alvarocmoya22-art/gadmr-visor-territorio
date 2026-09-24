/**
 * Construcción de las capas de deck.gl y de sus cifras.
 *
 * Aquí no se consulta nada: se recibe lo que el visor ya tiene cargado y
 * filtrado, igual que el resto del análisis. Por eso cambiar de plataforma o
 * de barrio arriba mueve también estas capas, sin trabajo extra.
 *
 * El módulo se carga con `import()` desde el mapa: deck.gl pesa lo suyo y no
 * tiene por qué descargarlo quien no abra la pestaña.
 */
import { ArcLayer, PolygonLayer, ScatterplotLayer } from '@deck.gl/layers'
import { HexagonLayer } from '@deck.gl/aggregation-layers'
import type { Layer } from '@deck.gl/core'
import {
  ARCO_ALERTA_M,
  ELEVACION_BARRIOS,
  ELEVACION_MAXIMA,
  MAX_ARCOS,
  type AlturaBarrio,
  type ColorBarrio,
  type ColorPor,
  type PesoDensidad,
} from '../../config/deckEscenarios'
import { distanciaM } from '../geo'
import type { Barrio, EquipamientoMunicipal } from '../municipal'
import type { Punto } from '../overpass'
import type { Anillo } from '../geo'
import {
  ARCO_DESTINO,
  ARCO_LEJOS,
  ARCO_ORIGEN,
  paletaCategorias,
  paletaFrescura,
  RAMPA_DENSIDAD,
  type Rgba,
} from './colores'

/** Lo que las capas necesitan saber de fuera. */
export interface Entradas {
  puntos: Punto[]
  equipamientos: EquipamientoMunicipal[]
  barrios: Barrio[]
  /** Tipo de equipamiento al que se asignan los barrios en los flujos. */
  tipoEquipamiento: string
}

/** Un arco de asignación, ya resuelto. */
export interface Arco {
  barrio: string
  /** Habitantes del barrio, del Censo 2022. */
  poblacion: number
  origen: [number, number]
  destino: [number, number]
  equipamiento: string
  distancia: number
}

/**
 * Asigna cada barrio al equipamiento más cercano del tipo elegido.
 *
 * Es el análisis de cobertura dibujado como asignación de demanda: se ve qué
 * equipamiento carga con cuánta gente. No son viajes observados —el proyecto
 * no tiene ninguna matriz origen-destino— y por eso la vista lo dice.
 *
 * Se quedan fuera los barrios sin población: un arco de grosor cero no aporta
 * y sí ensucia.
 */
export function asignar(
  barrios: Barrio[],
  equipamientos: EquipamientoMunicipal[],
  tipo: string,
): Arco[] {
  const destino = equipamientos.filter((e) => e.tipo === tipo)
  if (destino.length === 0) return []

  const arcos: Arco[] = []
  for (const b of barrios) {
    if (b.pob <= 0) continue
    let mejor: EquipamientoMunicipal | null = null
    let mejorD = Infinity
    for (const e of destino) {
      const d = distanciaM(b.centro[0], b.centro[1], e.lon, e.lat)
      if (d < mejorD) {
        mejorD = d
        mejor = e
      }
    }
    if (!mejor) continue
    arcos.push({
      barrio: b.nombre,
      poblacion: b.pob,
      origen: b.centro,
      destino: [mejor.lon, mejor.lat],
      equipamiento: mejor.nombre || 'Sin nombre',
      distancia: mejorD,
    })
  }
  // Los más poblados primero: si hay que recortar, que se queden los que más
  // gente representan, no los primeros por orden alfabético.
  return arcos.sort((a, b) => b.poblacion - a.poblacion).slice(0, MAX_ARCOS)
}

/** Puntos de OSM coloreados por categoría o por estado. */
export function capaPuntos(puntos: Punto[], colorPor: ColorPor): Layer {
  const porCategoria = paletaCategorias()
  const porFrescura = paletaFrescura()
  return new ScatterplotLayer<Punto>({
    id: 'deck-puntos',
    data: puntos,
    getPosition: (p) => [p.lon, p.lat],
    getFillColor: (p): Rgba =>
      colorPor === 'frescura' ? porFrescura[p.frescura] : porCategoria[p.categoria],
    getRadius: 6,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
    radiusMaxPixels: 14,
    stroked: true,
    getLineColor: [255, 255, 255, 180],
    lineWidthMinPixels: 1,
    pickable: true,
    // Sin esto, cambiar de criterio de color no repinta: deck.gl cachea los
    // atributos y no tiene forma de saber que la función devuelve otra cosa.
    updateTriggers: { getFillColor: [colorPor] },
  })
}

/** Un punto cualquiera de los que se pueden agregar en una celda. */
interface Agregable {
  lon: number
  lat: number
}

/** Lo que entra en la agregación según el peso elegido. */
export function datosDensidad(
  puntos: Punto[],
  equipamientos: EquipamientoMunicipal[],
  peso: PesoDensidad,
): Agregable[] {
  const pendientes = () =>
    puntos.filter((p) => p.frescura === 'sin_verificar' || p.frescura === 'vencido')
  if (peso === 'equipamientos') return equipamientos
  if (peso === 'pendientes') return pendientes()
  if (peso === 'ambos') return [...puntos, ...equipamientos]
  return puntos
}

/** Agregación en hexágonos, con la altura según lo que se elija. */
export function capaDensidad(
  puntos: Punto[],
  equipamientos: EquipamientoMunicipal[],
  radio: number,
  peso: PesoDensidad,
  extruido: boolean,
): Layer {
  const datos = datosDensidad(puntos, equipamientos, peso)
  return new HexagonLayer<Agregable>({
    id: 'deck-densidad',
    data: datos,
    getPosition: (p) => [p.lon, p.lat],
    radius: radio,
    extruded: extruido,
    // Rango, no factor: deck.gl reparte las alturas entre 0 y el techo segun
    // lo que haya en la vista. Con un factor fijo, una celda de cien puntos
    // levantaba columnas de dos kilometros y el mapa desaparecia debajo.
    elevationRange: [0, ELEVACION_MAXIMA],
    elevationScale: extruido ? 1 : 0,
    colorRange: RAMPA_DENSIDAD.map((c) => [c[0], c[1], c[2]]) as [number, number, number][],
    opacity: 0.85,
    coverage: 0.92,
    pickable: true,
    updateTriggers: { getPosition: [peso] },
  })
}

/** Arcos de asignación; el grosor es la población del barrio. */
export function capaFlujos(arcos: Arco[]): Layer {
  const origen = ARCO_ORIGEN()
  const destino = ARCO_DESTINO()
  const lejos = ARCO_LEJOS()
  // El grosor se reparte sobre el barrio más poblado, no sobre un valor fijo:
  // con una plataforma de 13.000 habitantes y otra de 179, un grosor absoluto
  // dejaría una de las dos vistas ilegible.
  const maxPob = Math.max(1, ...arcos.map((a) => a.poblacion))
  return new ArcLayer<Arco>({
    id: 'deck-flujos',
    data: arcos,
    getSourcePosition: (a) => a.origen,
    getTargetPosition: (a) => a.destino,
    getSourceColor: (a): Rgba => (a.distancia > ARCO_ALERTA_M ? lejos : origen),
    getTargetColor: (a): Rgba => (a.distancia > ARCO_ALERTA_M ? lejos : destino),
    getWidth: (a) => 1 + (a.poblacion / maxPob) * 9,
    widthUnits: 'pixels',
    getHeight: 0.4,
    pickable: true,
    updateTriggers: { getWidth: [maxPob], getSourceColor: [arcos.length] },
  })
}

/** Una pieza de barrio lista para dibujar, con lo que la tiñe y la levanta. */
export interface PiezaBarrio {
  nombre: string
  anillos: Anillo[]
  poblacion: number
  viviendas: number
  areaHa: number
  /** Metros al equipamiento más cercano del tipo elegido; null si no hay ninguno. */
  distancia: number | null
  /** Parte de la población con servicios básicos, de 0 a 1. */
  servicios: number
}

/**
 * Prepara los barrios para dibujarlos en tres dimensiones.
 *
 * Un barrio puede venir partido en varias piezas, y `PolygonLayer` dibuja un
 * polígono por dato, así que cada pieza va suelta repitiendo los atributos del
 * barrio. La altura y el color son del barrio entero, no de la pieza: partir
 * la población entre los trozos daría bloques de distinta altura para el mismo
 * sitio.
 */
export function piezasDeBarrios(
  barrios: Barrio[],
  equipamientos: EquipamientoMunicipal[],
  tipo: string,
): PiezaBarrio[] {
  const destino = equipamientos.filter((e) => e.tipo === tipo)
  const piezas: PiezaBarrio[] = []
  for (const b of barrios) {
    let distancia: number | null = null
    for (const e of destino) {
      const d = distanciaM(b.centro[0], b.centro[1], e.lon, e.lat)
      if (distancia === null || d < distancia) distancia = d
    }
    for (const poly of b.poligonos) {
      piezas.push({
        nombre: b.nombre,
        anillos: poly,
        poblacion: b.pob,
        viviendas: b.viv,
        areaHa: b.areaHa,
        distancia,
        servicios: b.pob > 0 ? b.pobServB / b.pob : 0,
      })
    }
  }
  return piezas
}

/** El valor que levanta cada barrio, según lo elegido. */
function alturaDe(p: PiezaBarrio, altura: AlturaBarrio): number {
  if (altura === 'viviendas') return p.viviendas
  if (altura === 'densidad') return p.areaHa > 0 ? p.poblacion / p.areaHa : 0
  return p.poblacion
}

/**
 * Barrios extruidos: la altura dice cuánta gente y el color, cómo de lejos
 * le queda el servicio. Alto y oscuro es una prioridad; bajo y oscuro, no.
 */
export function capaBarrios(
  piezas: PiezaBarrio[],
  altura: AlturaBarrio,
  color: ColorBarrio,
  extruido: boolean,
): Layer {
  const maximo = Math.max(1, ...piezas.map((p) => alturaDe(p, altura)))
  // La escala del color del deficit, la misma de la pestana Analisis: las dos
  // responden a la misma pregunta y deben leerse igual.
  const tono = (p: PiezaBarrio): Rgba => {
    if (color === 'servicios') {
      // Sin servicios basicos -> extremo oscuro, igual que «lejos».
      const i = Math.min(5, Math.floor((1 - p.servicios) * 6))
      return RAMPA_DENSIDAD[i]
    }
    const d = p.distancia
    if (d === null) return RAMPA_DENSIDAD[5]
    const i = d < 250 ? 0 : d < 500 ? 1 : d < 750 ? 2 : d < 1000 ? 3 : 4
    return RAMPA_DENSIDAD[i + 1]
  }

  return new PolygonLayer<PiezaBarrio>({
    id: 'deck-barrios',
    data: piezas,
    getPolygon: (p) => p.anillos as unknown as number[][][],
    extruded: extruido,
    getElevation: (p) => (alturaDe(p, altura) / maximo) * ELEVACION_BARRIOS,
    getFillColor: tono,
    getLineColor: [255, 255, 255, 120],
    lineWidthMinPixels: 1,
    stroked: true,
    filled: true,
    wireframe: false,
    opacity: 0.85,
    pickable: true,
    updateTriggers: {
      getElevation: [altura, maximo, extruido],
      getFillColor: [color],
    },
  })
}

// ───────────────────────────────────────────────────────── cifras

export interface Cifra {
  t: string
  v: string
}

/** Resumen de una asignación, para los indicadores y la tabla. */
export function resumenFlujos(arcos: Arco[]): {
  poblacion: number
  lejos: number
  poblacionLejos: number
  mediana: number | null
  porEquipamiento: { nombre: string; barrios: number; poblacion: number }[]
} {
  const orden = arcos.map((a) => a.distancia).sort((x, y) => x - y)
  const porEquip = new Map<string, { nombre: string; barrios: number; poblacion: number }>()
  for (const a of arcos) {
    const f = porEquip.get(a.equipamiento) ?? { nombre: a.equipamiento, barrios: 0, poblacion: 0 }
    f.barrios++
    f.poblacion += a.poblacion
    porEquip.set(a.equipamiento, f)
  }
  return {
    poblacion: arcos.reduce((s, a) => s + a.poblacion, 0),
    lejos: arcos.filter((a) => a.distancia > ARCO_ALERTA_M).length,
    poblacionLejos: arcos
      .filter((a) => a.distancia > ARCO_ALERTA_M)
      .reduce((s, a) => s + a.poblacion, 0),
    mediana: orden.length ? orden[Math.floor((orden.length - 1) / 2)] : null,
    porEquipamiento: [...porEquip.values()].sort((a, b) => b.poblacion - a.poblacion),
  }
}

/** Reparto de los puntos por categoría, para la tabla de la vista de puntos. */
export function resumenPuntos(puntos: Punto[]): { clave: string; n: number }[] {
  const cuenta = new Map<string, number>()
  for (const p of puntos) cuenta.set(p.categoria, (cuenta.get(p.categoria) ?? 0) + 1)
  return [...cuenta.entries()]
    .map(([clave, n]) => ({ clave, n }))
    .sort((a, b) => b.n - a.n)
}
