/**
 * Colores para deck.gl, leídos del sistema de diseño.
 *
 * deck.gl quiere `[r, g, b, a]` y el sistema de diseño vive en variables CSS,
 * que además cambian con el tema. Se leen en tiempo de ejecución, igual que
 * hace `paletaResuelta()` para MapLibre: así el color de la categoría Salud es
 * el mismo en los puntos del mapa, en la leyenda y en estas capas, y sigue
 * siéndolo al cambiar a tema oscuro.
 */
import { CATEGORIAS, type ClaveCategoria } from '../categorias'
import type { Frescura } from '../overpass'

export type Rgba = [number, number, number, number]

/** Convierte un color CSS —`#rgb`, `#rrggbb` o `rgb()`— a `[r,g,b,a]`. */
export function aRgba(css: string, alfa = 255): Rgba {
  const s = css.trim()
  if (s.startsWith('#')) {
    const h = s.slice(1)
    const n =
      h.length === 3
        ? h
            .split('')
            .map((c) => c + c)
            .join('')
        : h
    return [
      parseInt(n.slice(0, 2), 16),
      parseInt(n.slice(2, 4), 16),
      parseInt(n.slice(4, 6), 16),
      alfa,
    ]
  }
  const m = s.match(/-?\d+(\.\d+)?/g)
  if (m && m.length >= 3) {
    return [Number(m[0]), Number(m[1]), Number(m[2]), alfa]
  }
  // Un token que no resuelve no debe dejar la capa invisible: gris del sistema.
  return [132, 150, 164, alfa]
}

/** Lee una variable CSS del documento. */
function token(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

/** Paleta de categorías, en el orden de serie del sistema. */
export function paletaCategorias(alfa = 220): Record<ClaveCategoria, Rgba> {
  return Object.fromEntries(
    CATEGORIAS.map((c) => [
      c.clave,
      aRgba(token(c.serie > 0 ? `--gr-s${c.serie}` : '--gr-s-otros'), alfa),
    ]),
  ) as Record<ClaveCategoria, Rgba>
}

/**
 * Colores de estado del levantamiento.
 *
 * Verde, ámbar y rojo están reservados para estado en el sistema de diseño, y
 * este es justo un estado, así que aquí sí corresponden.
 */
export function paletaFrescura(alfa = 220): Record<Frescura, Rgba> {
  return {
    vigente: aRgba(token('--gr-ok'), alfa),
    por_vencer: aRgba(token('--gr-aviso'), alfa),
    vencido: aRgba(token('--gr-error'), alfa),
    sin_verificar: aRgba(token('--gr-tinta-3'), alfa),
  }
}

/**
 * Rampa secuencial para densidad, la misma del sistema.
 *
 * Va de claro a oscuro; deck.gl la usa para repartir los hexágonos por
 * cuantiles, así que el extremo oscuro es siempre «lo más denso que hay aquí»
 * y no un valor absoluto.
 */
export const RAMPA_DENSIDAD: Rgba[] = [
  [220, 233, 244, 200],
  [179, 207, 231, 210],
  [127, 174, 214, 220],
  [74, 136, 190, 230],
  [31, 95, 148, 240],
  [10, 56, 96, 250],
]

/** Color del extremo del arco que sale del barrio. */
export const ARCO_ORIGEN = (): Rgba => aRgba(token('--gr-info'), 200)
/** Color del extremo que llega al equipamiento. */
export const ARCO_DESTINO = (): Rgba => aRgba(token('--gr-s3'), 200)
/** Arco que supera el umbral de alerta. */
export const ARCO_LEJOS = (): Rgba => aRgba(token('--gr-error'), 220)
