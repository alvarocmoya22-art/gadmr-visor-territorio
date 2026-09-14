/**
 * Índice de calles del cantón, para el buscador del visor.
 *
 * Lo genera `scripts/indexar_calles.py` desde OpenStreetMap. Cada calle trae
 * ya calculadas las plataformas y los barrios por los que pasa, porque muchas
 * cruzan varias: de las 1.017 indexadas, 230 tocan dos o más plataformas.
 */
import { normalizar } from './geo'

export interface Calle {
  /** Nombre tal como está en OSM. */
  nombre: string
  /** Plataformas que atraviesa, en orden. Vacío si queda fuera del área urbana. */
  plataformas: string[]
  barrios: string[]
  /** Punto sobre la propia vía, a mitad de su recorrido. */
  centro: [number, number]
  /** Envolvente [oeste, sur, este, norte], para encuadrar el mapa. */
  caja: [number, number, number, number]
  /** En cuántos tramos está partida en OSM; da idea de su longitud. */
  segmentos: number
  /** Nombre normalizado, precalculado para buscar sin tildes ni mayúsculas. */
  clave: string
}

export interface IndiceCalles {
  /** Marca de tiempo de la base OSM con la que se generó el índice. */
  generado: string | null
  calles: Calle[]
}

interface CalleCruda {
  n: string
  p: string[]
  b: string[]
  c: [number, number]
  bb: [number, number, number, number]
  s: number
}

export async function cargarCalles(senal?: AbortSignal): Promise<IndiceCalles> {
  const resp = await fetch(`${import.meta.env.BASE_URL}datos/calles.json`, { signal: senal })
  if (!resp.ok) throw new Error(`No se pudo cargar el índice de calles (${resp.status})`)
  const datos = (await resp.json()) as { generado: string | null; calles: CalleCruda[] }
  return {
    generado: datos.generado,
    calles: datos.calles.map((c) => ({
      nombre: c.n,
      plataformas: c.p,
      barrios: c.b,
      centro: c.c,
      caja: c.bb,
      segmentos: c.s,
      clave: normalizar(c.n),
    })),
  }
}

/**
 * Busca calles por nombre. Ordena poniendo delante las que empiezan por lo
 * escrito: quien teclea «espejo» quiere «Espejo» antes que «Eugenio Espejo».
 */
export function buscarCalles(calles: Calle[], texto: string, limite = 8): Calle[] {
  const q = normalizar(texto)
  if (q.length < 2) return []

  const empiezan: Calle[] = []
  const contienen: Calle[] = []
  for (const c of calles) {
    const i = c.clave.indexOf(q)
    if (i === 0) empiezan.push(c)
    else if (i > 0) contienen.push(c)
    if (empiezan.length >= limite) break
  }

  const ordenar = (a: Calle, b: Calle) =>
    a.clave.length - b.clave.length || a.nombre.localeCompare(b.nombre, 'es')

  return [...empiezan.sort(ordenar), ...contienen.sort(ordenar)].slice(0, limite)
}
