/**
 * Análisis sobre lo que ya está en pantalla.
 *
 * Todo lo de aquí recibe los datos YA filtrados y devuelve números nuevos: no
 * vuelve a consultar nada ni guarda estado. Esa es la regla que mantiene el
 * análisis pegado a los filtros: si el usuario cambia de plataforma, cambian
 * las entradas y el resultado se recalcula solo.
 *
 * Las distancias son en línea recta (ver `distanciaM`). Por calle siempre
 * serán mayores; donde importa, el rótulo lo dice.
 */
import type { ClaveCategoria } from './categorias'
import { distanciaM, enPoligono, type Anillo } from './geo'
import type { Barrio, EquipamientoMunicipal, Plataforma } from './municipal'
import { RADIO_COTEJO_M } from './municipal'
import { plataformaDe } from './municipal'
import type { Punto } from './overpass'

// ───────────────────────────────────────────── punto interior de un polígono

/** Centroide de área de un anillo, con su área con signo. */
function centroideAnillo(anillo: Anillo): { x: number; y: number; area: number } {
  let a = 0
  let x = 0
  let y = 0
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    const f = xj * yi - xi * yj
    a += f
    x += (xj + xi) * f
    y += (yj + yi) * f
  }
  if (a === 0) {
    // Anillo degenerado: se cae al promedio de vértices antes que devolver NaN.
    const n = anillo.length || 1
    return {
      x: anillo.reduce((s, p) => s + p[0], 0) / n,
      y: anillo.reduce((s, p) => s + p[1], 0) / n,
      area: 0,
    }
  }
  return { x: x / (3 * a), y: y / (3 * a), area: Math.abs(a / 2) }
}

/**
 * Un punto que cae DENTRO del barrio y cerca de su centro.
 *
 * El centroide de área no sirve solo: en los barrios en forma de L o de U cae
 * fuera, y entonces la distancia que se mide no es la de nadie. Se prueba el
 * centroide y, si queda fuera, se busca en una rejilla el punto interior más
 * próximo a él.
 */
function puntoInterior(poligonos: Anillo[][]): [number, number] {
  // Se trabaja sobre el polígono de mayor superficie: los barrios partidos en
  // dos piezas se representan por la principal, no por un punto intermedio
  // que caería en el hueco entre ambas.
  let mayor = poligonos[0]
  let areaMayor = -1
  for (const poly of poligonos) {
    const { area } = centroideAnillo(poly[0])
    if (area > areaMayor) {
      areaMayor = area
      mayor = poly
    }
  }
  const c = centroideAnillo(mayor[0])
  if (enPoligono(c.x, c.y, mayor)) return [c.x, c.y]

  let oeste = Infinity, sur = Infinity, este = -Infinity, norte = -Infinity
  for (const [x, y] of mayor[0]) {
    if (x < oeste) oeste = x
    if (x > este) este = x
    if (y < sur) sur = y
    if (y > norte) norte = y
  }
  const PASOS = 14
  let mejor: [number, number] = [c.x, c.y]
  let mejorD = Infinity
  for (let i = 1; i < PASOS; i++) {
    for (let j = 1; j < PASOS; j++) {
      const x = oeste + ((este - oeste) * i) / PASOS
      const y = sur + ((norte - sur) * j) / PASOS
      if (!enPoligono(x, y, mayor)) continue
      const d = (x - c.x) ** 2 + (y - c.y) ** 2
      if (d < mejorD) {
        mejorD = d
        mejor = [x, y]
      }
    }
  }
  return mejor
}

// ─────────────────────────────────────────────── 1. déficit de equipamiento

export interface DeficitBarrio {
  nombre: string
  areaHa: number
  /** Equipamientos del inventario dentro del barrio. */
  equipamientos: number
  /** Registros de OSM dentro del barrio. */
  registros: number
  /** Metros del centro del barrio al equipamiento más cercano del ámbito. */
  distancia: number | null
  lon: number
  lat: number
}

export interface Deficit {
  filas: DeficitBarrio[]
  geo: GeoJSON.FeatureCollection
  /** Barrios sin ningún equipamiento dentro. */
  sinNada: number
  /** Mediana de la distancia al equipamiento más cercano. */
  mediana: number | null
  /** Barrios a más de un kilómetro del equipamiento más cercano. */
  masDeUnKm: number
}

/** Cortes de la escala, en metros. El último tramo es «más de 1 km». */
export const CORTES_DEFICIT = [250, 500, 750, 1000]

/**
 * Distancia de cada barrio al equipamiento más cercano, y cuántos tiene dentro.
 *
 * `plataforma` recorta el conjunto de barrios: se queda con los que tienen su
 * centro dentro de ella. Un barrio a caballo entre dos plataformas cuenta para
 * aquella donde está su centro, que es el criterio que ya usa el resto del
 * visor para asignar puntos a un sector.
 */
export function calcularDeficit(
  barrios: Barrio[],
  plataformas: Plataforma[],
  equipamientos: EquipamientoMunicipal[],
  puntos: Punto[],
  plataforma: string | null,
): Deficit {
  const registrosPorBarrio = new Map<string, number>()
  for (const p of puntos) {
    if (p.barrio) registrosPorBarrio.set(p.barrio, (registrosPorBarrio.get(p.barrio) ?? 0) + 1)
  }
  const equipPorBarrio = new Map<string, number>()
  for (const e of equipamientos) {
    if (e.barrioLimite) equipPorBarrio.set(e.barrioLimite, (equipPorBarrio.get(e.barrioLimite) ?? 0) + 1)
  }

  const filas: DeficitBarrio[] = []
  const rasgos: GeoJSON.Feature[] = []

  for (const b of barrios) {
    const [lon, lat] = puntoInterior(b.poligonos)
    if (plataforma && plataformaDe(lon, lat, plataformas) !== plataforma) continue

    let distancia: number | null = null
    for (const e of equipamientos) {
      const d = distanciaM(lon, lat, e.lon, e.lat)
      if (distancia === null || d < distancia) distancia = d
    }

    const fila: DeficitBarrio = {
      nombre: b.nombre,
      areaHa: b.areaHa,
      equipamientos: equipPorBarrio.get(b.nombre) ?? 0,
      registros: registrosPorBarrio.get(b.nombre) ?? 0,
      distancia,
      lon,
      lat,
    }
    filas.push(fila)
    rasgos.push({
      type: 'Feature',
      geometry:
        b.poligonos.length === 1
          ? { type: 'Polygon', coordinates: b.poligonos[0] }
          : { type: 'MultiPolygon', coordinates: b.poligonos },
      properties: {
        nombre: fila.nombre,
        equipamientos: fila.equipamientos,
        registros: fila.registros,
        // MapLibre no sabe comparar null: sin equipamiento a la vista, el
        // barrio entra en el tramo peor en vez de quedarse sin pintar.
        distancia: fila.distancia ?? 99999,
      },
    })
  }

  filas.sort((a, b) => (b.distancia ?? -1) - (a.distancia ?? -1))
  const conDistancia = filas
    .map((f) => f.distancia)
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b)

  return {
    filas,
    geo: { type: 'FeatureCollection', features: rasgos },
    sinNada: filas.filter((f) => f.equipamientos === 0).length,
    mediana: conDistancia.length
      ? conDistancia[Math.floor((conDistancia.length - 1) / 2)]
      : null,
    masDeUnKm: conDistancia.filter((d) => d > 1000).length,
  }
}

// ───────────────────────────────── 2. lo que OSM ve y el inventario no tiene

export interface Hallazgo {
  punto: Punto
  /** Metros al equipamiento municipal más cercano; null si no hay ninguno. */
  distancia: number | null
}

/**
 * Registros de OSM de una categoría que no tienen equivalente en el inventario
 * del GADM: no hay ningún equipamiento municipal a menos de `radio` metros.
 *
 * Es el cotejo de `municipal.ts` mirado del revés. Aquel pregunta «¿de lo que
 * tengo inventariado, qué falta levantar?»; este pregunta «¿qué está levantado
 * y no tengo inventariado?», que es la lista con la que se sale a terreno.
 */
export function sinInventariar(
  puntos: Punto[],
  equipamientos: EquipamientoMunicipal[],
  categoria: ClaveCategoria,
  radio: number = RADIO_COTEJO_M,
): Hallazgo[] {
  const hallazgos: Hallazgo[] = []
  for (const p of puntos) {
    if (p.categoria !== categoria) continue
    let distancia: number | null = null
    for (const e of equipamientos) {
      const d = distanciaM(p.lon, p.lat, e.lon, e.lat)
      if (distancia === null || d < distancia) distancia = d
    }
    if (distancia === null || distancia > radio) hallazgos.push({ punto: p, distancia })
  }
  return hallazgos.sort((a, b) => (b.distancia ?? 1e9) - (a.distancia ?? 1e9))
}

/** Los hallazgos como CSV, con coordenadas, para llevarlos a terreno. */
export function hallazgosACsv(hallazgos: Hallazgo[]): string {
  const filas = [
    ['id_osm', 'nombre', 'clase', 'lat', 'lon', 'plataforma', 'barrio', 'm_al_inventario'],
    ...hallazgos.map((h) => [
      h.punto.id,
      h.punto.nombre ?? '',
      h.punto.clase,
      h.punto.lat.toFixed(6),
      h.punto.lon.toFixed(6),
      h.punto.plataforma ?? '',
      h.punto.barrio ?? '',
      h.distancia === null ? '' : String(h.distancia),
    ]),
  ]
  // Comillas dobles siempre: los nombres traen comas y punto y coma.
  return filas.map((f) => f.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n')
}

// ──────────────────────────────────────────── 3. cruce de dos categorías

export interface CruceBarrio {
  nombre: string
  a: number
  b: number
}

export interface Cruce {
  a: ClaveCategoria
  b: ClaveCategoria
  umbral: number
  nA: number
  nB: number
  /** Puntos de A con al menos un B dentro del umbral. */
  cubiertos: number
  /** Mediana de la distancia de A al B más cercano. */
  mediana: number | null
  /** Distancia por debajo de la cual quedan nueve de cada diez puntos de A. */
  p90: number | null
  /** Ids de los puntos de A que no tienen ningún B dentro del umbral. */
  desatendidos: string[]
  /** Barrios con A y sin ningún B: el caso que interesa mirar en el mapa. */
  barriosSinB: CruceBarrio[]
}

/**
 * Cruza dos categorías: para cada punto de A busca el B más cercano.
 *
 * Es una comparación de todos contra todos. Con los volúmenes de este visor
 * (a lo sumo unos pocos miles por lado dentro de una plataforma) sale en
 * milisegundos, y un índice espacial solo añadiría código que mantener.
 */
export function cruzar(
  puntos: Punto[],
  a: ClaveCategoria,
  b: ClaveCategoria,
  umbral: number,
): Cruce {
  const listaA = puntos.filter((p) => p.categoria === a)
  const listaB = puntos.filter((p) => p.categoria === b)

  const distancias: number[] = []
  const desatendidos: string[] = []
  let cubiertos = 0

  for (const p of listaA) {
    let mejor = Infinity
    for (const q of listaB) {
      const d = distanciaM(p.lon, p.lat, q.lon, q.lat)
      if (d < mejor) mejor = d
    }
    if (mejor === Infinity) {
      desatendidos.push(p.id)
      continue
    }
    distancias.push(mejor)
    if (mejor <= umbral) cubiertos++
    else desatendidos.push(p.id)
  }

  const orden = [...distancias].sort((x, y) => x - y)
  const cuantil = (q: number) =>
    orden.length ? orden[Math.min(orden.length - 1, Math.floor(q * orden.length))] : null

  const porBarrio = new Map<string, CruceBarrio>()
  for (const p of listaA) {
    if (!p.barrio) continue
    const f = porBarrio.get(p.barrio) ?? { nombre: p.barrio, a: 0, b: 0 }
    f.a++
    porBarrio.set(p.barrio, f)
  }
  for (const p of listaB) {
    if (!p.barrio) continue
    const f = porBarrio.get(p.barrio) ?? { nombre: p.barrio, a: 0, b: 0 }
    f.b++
    porBarrio.set(p.barrio, f)
  }

  return {
    a,
    b,
    umbral,
    nA: listaA.length,
    nB: listaB.length,
    cubiertos,
    mediana: cuantil(0.5),
    p90: cuantil(0.9),
    desatendidos,
    barriosSinB: [...porBarrio.values()]
      .filter((f) => f.a > 0 && f.b === 0)
      .sort((x, y) => y.a - x.a),
  }
}
