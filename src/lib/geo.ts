/** Utilidades geométricas mínimas. Nada de esto justifica una librería aparte. */

/** Distancia aproximada en metros (equirectangular; exacta de sobra a escala urbana). */
export function distanciaM(aLon: number, aLat: number, bLon: number, bLat: number): number {
  const R = 6371000
  const rad = Math.PI / 180
  const x = (bLon - aLon) * rad * Math.cos(((aLat + bLat) / 2) * rad)
  const y = (bLat - aLat) * rad
  return Math.round(Math.sqrt(x * x + y * y) * R)
}

export type Anillo = number[][]
export type Caja = [number, number, number, number]

export function cajaDe(anillos: Anillo[]): Caja {
  let oeste = Infinity, sur = Infinity, este = -Infinity, norte = -Infinity
  for (const anillo of anillos) {
    for (const [x, y] of anillo) {
      if (x < oeste) oeste = x
      if (x > este) este = x
      if (y < sur) sur = y
      if (y > norte) norte = y
    }
  }
  return [oeste, sur, este, norte]
}

export const enCaja = (lon: number, lat: number, c: Caja) =>
  lon >= c[0] && lon <= c[2] && lat >= c[1] && lat <= c[3]

/** Cruce de rayos sobre un anillo. */
function enAnillo(lon: number, lat: number, anillo: Anillo): boolean {
  let dentro = false
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i]
    const [xj, yj] = anillo[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      dentro = !dentro
    }
  }
  return dentro
}

/**
 * Punto dentro de un polígono. `poligono` es una lista de anillos: el primero
 * es el contorno y los siguientes son huecos, como en GeoJSON.
 */
export function enPoligono(lon: number, lat: number, poligono: Anillo[]): boolean {
  if (poligono.length === 0 || !enAnillo(lon, lat, poligono[0])) return false
  for (let i = 1; i < poligono.length; i++) {
    if (enAnillo(lon, lat, poligono[i])) return false // cayó en un hueco
  }
  return true
}

/** Aplana una geometría GeoJSON de área a una lista de polígonos. */
export function poligonosDe(g: GeoJSON.Geometry): Anillo[][] {
  if (g.type === 'Polygon') return [g.coordinates as Anillo[]]
  if (g.type === 'MultiPolygon') return g.coordinates as unknown as Anillo[][]
  return []
}

const RUIDO = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'san', 'santa', 'dr', 'doctor'])

/** Minúsculas, sin tildes, sin palabras vacías: base para comparar nombres. */
export function normalizar(s: string): string {
  return s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .split(' ')
    .filter((t) => t && !RUIDO.has(t))
    .join(' ')
}

/** Coeficiente de Dice sobre bigramas: 0 = nada en común, 1 = idénticos. */
export function similitud(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1
  const bigramas = (s: string) => {
    const m = new Map<string, number>()
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2)
      m.set(g, (m.get(g) ?? 0) + 1)
    }
    return m
  }
  const ma = bigramas(a)
  const mb = bigramas(b)
  if (ma.size === 0 || mb.size === 0) return 0
  let comunes = 0
  let totalA = 0
  for (const n of ma.values()) totalA += n
  let totalB = 0
  for (const n of mb.values()) totalB += n
  for (const [g, n] of ma) comunes += Math.min(n, mb.get(g) ?? 0)
  return (2 * comunes) / (totalA + totalB)
}
