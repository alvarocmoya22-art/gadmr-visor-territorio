/**
 * Iconos de los proyectos del plan, en SVG.
 *
 * El punto del mapa lleva dos lecturas y por eso usa dos canales: el **color**
 * dice si el proyecto crea alcance de equipamiento o no, y el **icono** dice de
 * qué obra se trata. Separarlas permite responder de un vistazo las dos
 * preguntas que uno se hace al ver un punto: qué van a hacer ahí, y si eso
 * cuenta para el análisis.
 *
 * Son trazados SVG de 24×24 que se dibujan sobre un lienzo con `Path2D` y se
 * entregan a MapLibre con `addImage`. Dibujarlos así, y no con un archivo de
 * sprites, mantiene el visor en un solo paquete: no hay que servir ni versionar
 * imágenes sueltas, y el icono hereda el color del sistema de diseño en tiempo
 * de ejecución, igual que el resto del mapa.
 *
 * Van en blanco sobre el disco de color, que es lo único que se lee a dieciséis
 * píxeles. Un icono bicolor a ese tamaño es una mancha.
 */

/** Trazados de 24×24, uno por tipo de obra. */
export const ICONOS_PROYECTO: Record<string, string> = {
  // Árbol: parque y espacio público.
  parque:
    'M12 2a6.5 6.5 0 0 0-2 12.7V17H7v2h4v3h2v-3h4v-2h-3v-2.3A6.5 6.5 0 0 0 12 2zm0 2.2a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6z',
  // Frontón clásico: equipamiento cultural.
  cultura: 'M12 2 2 7.5V10h20V7.5L12 2zM5 12v7H3v3h18v-3h-2v-7h-2.5v7h-3v-7h-3v7h-3v-7H5z',
  // Balón: cancha, estadio, graderíos, coliseo.
  deporte:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.4 4.6 3.3-1.8 5.4H9.2L7.4 7.7 12 4.4zM4.3 11.2l1.6 1.2 1.8 5.3-1.3 1.1a8 8 0 0 1-2.1-7.6zm15.4 0a8 8 0 0 1-2.1 7.6l-1.3-1.1 1.8-5.3 1.6-1.2zM9.4 19.3h5.2l.6 1.7a8 8 0 0 1-6.4 0l.6-1.7z',
  // Calzada con eje discontinuo: vialidad.
  via: 'M8.6 2 5.4 22H2.3L6 2h2.6zm9.8 0L22 22h-3.1L15.6 2h2.8zM11.2 2h1.6v3.4h-1.6V2zm0 6.2h1.6v3.4h-1.6V8.2zm0 6.2h1.6v3.4h-1.6v-3.4zm0 6.2h1.6V22h-1.6v-1.4z',
  // Gota: alcantarillado, colector, drenaje.
  red: 'M12 2.2s-7 8.6-7 12.6a7 7 0 0 0 14 0c0-4-7-12.6-7-12.6zm0 3.9c1.9 2.6 5 7.3 5 8.7a5 5 0 0 1-10 0c0-1.4 3.1-6.1 5-8.7z',
  // Lápida con cruz: cementerio y bóvedas.
  funerario: 'M12 2a6 6 0 0 0-6 6v14h12V8a6 6 0 0 0-6-6zm-1 5h2v2.5h2.2v2H13V20h-2v-8.5H8.8v-2H11V7z',
  // Edificio: dotación de escala cantonal.
  dotacion: 'M12 2 3 8.3V22h7v-6h4v6h7V8.3L12 2zm0 2.5 7 4.9V20h-3v-6H8v6H5V9.4l7-4.9z',
  // Documento: estudios y consultorías, que todavía no son obra.
  estudio:
    'M6 2v20h12V7.6L12.6 2H6zm6.6 1.8L16.4 7.6h-3.8V3.8zM8 11h8v1.8H8V11zm0 3.6h8v1.8H8v-1.8zm0 3.6h5.2V20H8v-1.8z',
  // Rombo: lo que no encaja en ninguno de los anteriores.
  otro: 'M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5z',
}

/** Lado del icono en píxeles, antes de aplicar la densidad de pantalla. */
const LADO = 24

/**
 * Convierte un trazado en la imagen que MapLibre necesita.
 *
 * Se dibuja al doble de tamaño y se declara `pixelRatio: 2` para que no salga
 * borroso en pantallas densas, que son todas las de trabajo.
 */
export function imagenDeIcono(
  trazado: string,
  color: string,
  ratio = 2,
): { data: Uint8ClampedArray; width: number; height: number } | null {
  const lado = LADO * ratio
  const lienzo = document.createElement('canvas')
  lienzo.width = lado
  lienzo.height = lado
  const ctx = lienzo.getContext('2d')
  if (!ctx) return null
  ctx.scale(ratio, ratio)
  ctx.fillStyle = color
  ctx.fill(new Path2D(trazado))
  const datos = ctx.getImageData(0, 0, lado, lado)
  return { data: datos.data, width: lado, height: lado }
}

/** Nombre con el que cada icono queda registrado en el mapa. */
export const nombreIcono = (clave: string) => `proyecto-${clave}`
