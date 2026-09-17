/**
 * Descarga de lo que se está viendo, en GeoJSON o en shapefile.
 *
 * El shapefile impone límites que el GeoJSON no tiene: los nombres de campo no
 * pueden pasar de 10 caracteres y el formato no lleva codificación declarada.
 * Por eso los campos se nombran aquí de forma explícita en vez de dejar que la
 * librería los trunque por su cuenta, que es como se acaba con `completitu`.
 */
import { zip } from '@mapbox/shp-write'
import JSZip from 'jszip'
import type { Punto } from './overpass'
import { POR_CLAVE } from './categorias'

/** Campos del archivo exportado. Ninguno pasa de 10 caracteres, por el DBF. */
interface FilaExportada extends Record<string, string | number> {
  id: string
  nombre: string
  categoria: string
  clase: string
  frescura: string
  check_date: string
  completo: number
  plataforma: string
  barrio: string
}

function aFila(p: Punto): FilaExportada {
  return {
    id: p.id,
    nombre: p.nombre ?? '',
    categoria: POR_CLAVE.get(p.categoria)?.rotulo ?? p.categoria,
    clase: p.clase,
    frescura: p.frescura,
    check_date: p.checkDate ?? '',
    completo: Math.round(p.completitud * 100),
    plataforma: p.plataforma ?? '',
    barrio: p.barrio ?? '',
  }
}

function aColeccion(puntos: Punto[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: puntos.map((p) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: aFila(p),
    })),
  }
}

function descargar(contenido: Blob, nombre: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(contenido)
  a.download = nombre
  a.click()
  URL.revokeObjectURL(a.href)
}

const hoy = () => new Date().toISOString().slice(0, 10)

/**
 * CSV con BOM. Sin el, Excel en Windows abre el archivo en la codificacion del
 * sistema y «MACAJI» llega roto; con el, lo reconoce como UTF-8 y respeta las
 * tildes, que es como sale el nombre de casi todos los barrios.
 */
export function descargarCsv(texto: string, nombre: string) {
  descargar(new Blob(['\ufeff' + texto], { type: 'text/csv;charset=utf-8' }), nombre)
}

export function descargarGeoJSON(puntos: Punto[]) {
  const blob = new Blob([JSON.stringify(aColeccion(puntos), null, 1)], {
    type: 'application/geo+json',
  })
  descargar(blob, `riobamba-levantamiento-${hoy()}.geojson`)
}

/**
 * Shapefile dentro de un ZIP. Un shapefile solo admite un tipo de geometría,
 * y aquí todo son puntos, así que sale un único archivo.
 */
/** Caracteres que el DBF en Latin-1 no puede representar. */
function fueraDeLatin1(puntos: Punto[]): string[] {
  const malos = new Set<string>()
  for (const p of puntos) {
    for (const ch of `${p.nombre ?? ''}${p.barrio ?? ''}${p.clase}`) {
      if (ch.charCodeAt(0) > 255) malos.add(ch)
    }
  }
  return [...malos]
}

export async function descargarShapefile(puntos: Punto[]) {
  if (puntos.length === 0) throw new Error('No hay puntos que exportar con los filtros actuales.')

  // El DBF va en Latin-1 por limitacion de la libreria: lo que no quepa ahi se
  // perderia en silencio, asi que mejor decirlo.
  const malos = fueraDeLatin1(puntos)
  if (malos.length > 0) {
    console.warn(
      `[exportar] El shapefile va en Latin-1 y estos caracteres no caben: ${malos.join(' ')}. ` +
        'Saldran cambiados en el DBF; el GeoJSON los conserva bien.',
    )
  }

  const nombre = `riobamba-levantamiento-${hoy()}`
  const contenido = await zip(aColeccion(puntos), {
    outputType: 'blob',
    compression: 'DEFLATE',
    types: { point: nombre },
  })
  const bruto =
    contenido instanceof Blob
      ? contenido
      : new Blob([contenido as BlobPart], { type: 'application/zip' })

  // La libreria escribe .shp, .shx, .dbf y .prj, pero no .cpg, y sin el cada
  // programa adivina la codificacion. Se declara ISO-8859-1 porque es lo que
  // shp-write escribe de verdad: se comprobo que «MACAJÍ» sale como el byte
  // 0xCD, que es Latin-1. Declarar UTF-8 «porque toca» rompia el archivo:
  // GDAL lo creia y fallaba al leerlo.
  const paquete = await JSZip.loadAsync(bruto)
  paquete.file(`${nombre}.cpg`, 'ISO-8859-1')
  const blob = await paquete.generateAsync({ type: 'blob', compression: 'DEFLATE' })

  descargar(blob, `${nombre}-shp.zip`)
}
