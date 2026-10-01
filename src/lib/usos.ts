/**
 * Los doce usos del inventario del GADM, con su color.
 *
 * Es una taxonomía distinta de la de OpenStreetMap y no se mezcla con ella: de
 * las nueve categorías de OSM y los doce usos de aquí, solo Educación y Salud
 * significan lo mismo. Comercio, Alimentación y Patrimonio no existen en el
 * inventario; Religioso, Cultural, Infraestructura, Especial, Bienestar Social
 * y Servicios Funerarios no existen como categoría en OSM. Sumar las dos
 * listas daría un total que no significa nada.
 *
 * El orden es el de la Tabla 3 del Código Urbano, no el de frecuencia: así el
 * color de un uso no cambia al filtrar ni al cambiar de plataforma.
 *
 * Doce colores cualitativos están en el límite de lo que se distingue de un
 * vistazo —el consenso práctico son ocho o diez—, así que la lista con su
 * muestra al lado no es decorativa: es lo que permite leer el mapa.
 */

export const USOS = [
  'Educación',
  'Cultural',
  'Salud',
  'Bienestar Social',
  'Recreativo y Deporte',
  'Religioso',
  'Seguridad',
  'Administración Pública',
  'Servicios Funerarios',
  'Transporte',
  'Infraestructura',
  'Especial',
] as const

export type Uso = (typeof USOS)[number]

/** Variable CSS de la serie asignada a cada uso, por su posición en la lista. */
export function colorUso(uso: string): string {
  const i = USOS.indexOf(uso as Uso)
  return i < 0 ? 'var(--gr-s-otros)' : `var(--gr-s${i + 1})`
}

/** Los colores ya resueltos; MapLibre no entiende `var()`. */
export function paletaUsos(): Record<string, string> {
  const raiz = getComputedStyle(document.documentElement)
  const leer = (v: string) => raiz.getPropertyValue(v).trim() || '#8496a4'
  return Object.fromEntries(USOS.map((u, i) => [u, leer(`--gr-s${i + 1}`)]))
}
