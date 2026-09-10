/**
 * Mapillary: la fotografía de calle del visor. Es la única fuente porque es la
 * única con cobertura real en Riobamba — la ciudad está recorrida entera.
 *
 * Exige un token, que se pone en `.env.local`:
 *
 *     VITE_MAPILLARY_TOKEN=MLY|...
 *
 * Se obtiene registrando una aplicación en
 * <https://www.mapillary.com/dashboard/developers>. Es un token de cliente y
 * viaja al navegador: sirve para uso interno, no es un secreto que proteja nada.
 */
import { distanciaM } from './geo'

export interface Foto {
  id: string
  lon: number
  lat: number
  fecha: string | undefined
  /** Rumbo de la camara en grados; sirve para orientar el marcador del mapa. */
  rumbo: number | undefined
  licencia: string
  miniatura: string | undefined
  media: string | undefined
  enlaceVisor: string
  /** Distancia en metros al punto consultado. */
  distancia: number
}

export const MAPILLARY = {
  grafo: 'https://graph.mapillary.com',
  teselas: 'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}',
  visor: 'https://www.mapillary.com/app',
}

/** Token de cliente, o cadena vacía si no se configuró. */
export const token = (import.meta.env.VITE_MAPILLARY_TOKEN as string | undefined)?.trim() ?? ''

export const hayToken = token.length > 0

/** URL de teselas con el token incrustado, o null si no hay token. */
export function urlTeselas(): string | null {
  return hayToken ? `${MAPILLARY.teselas}?access_token=${encodeURIComponent(token)}` : null
}

/**
 * Límite de la API desde enero de 2026: el bbox debe medir menos de 0,01 grados
 * cuadrados. Un radio urbano cabe de sobra; el cantón entero no, y por eso la
 * cobertura general se ve por teselas y no se cuenta por aquí.
 */
export const MAX_GRADOS2 = 0.01

interface ImagenGrafo {
  id: string
  captured_at?: number
  compass_angle?: number
  is_pano?: boolean
  thumb_256_url?: string
  thumb_1024_url?: string
  geometry?: { type: string; coordinates: [number, number] }
}

/**
 * Fotos alrededor de un punto, de la más cercana a la más lejana.
 * Devuelve lista vacía si no hay token: la ficha lo indica y sigue funcionando.
 */
export async function fotosCercanas(
  lon: number,
  lat: number,
  radioM = 60,
  limite = 6,
  senal?: AbortSignal,
): Promise<Foto[]> {
  if (!hayToken) return []

  const dLat = radioM / 111320
  const dLon = radioM / (111320 * Math.cos((lat * Math.PI) / 180))
  const area = 2 * dLon * (2 * dLat)
  if (area >= MAX_GRADOS2) {
    throw new Error(
      `El area consultada (${area.toFixed(5)} grados cuadrados) supera el limite de ${MAX_GRADOS2} de Mapillary.`,
    )
  }

  const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(',')
  const campos = 'id,captured_at,compass_angle,is_pano,thumb_256_url,thumb_1024_url,geometry'
  const url =
    `${MAPILLARY.grafo}/images?access_token=${encodeURIComponent(token)}` +
    `&bbox=${bbox}&fields=${campos}&limit=${limite * 4}`

  const resp = await fetch(url, { signal: senal })
  if (!resp.ok) {
    const detalle = resp.status === 401 ? ' (token invalido o caducado)' : ''
    throw new Error(`Mapillary respondió ${resp.status}${detalle}`)
  }
  const datos = (await resp.json()) as { data?: ImagenGrafo[] }

  return (datos.data ?? [])
    .map((img): Foto | null => {
      const c = img.geometry?.coordinates
      if (!c) return null
      return {
        id: img.id,
        lon: c[0],
        lat: c[1],
        fecha: img.captured_at ? new Date(img.captured_at).toISOString() : undefined,
        rumbo: img.compass_angle,
        // Mapillary publica sus imágenes bajo CC BY-SA 4.0.
        licencia: 'CC-BY-SA-4.0',
        miniatura: img.thumb_256_url,
        media: img.thumb_1024_url,
        enlaceVisor: `${MAPILLARY.visor}/?pKey=${img.id}&focus=photo`,
        distancia: distanciaM(lon, lat, c[0], c[1]),
      }
    })
    .filter((f): f is Foto => f !== null)
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, limite)
}
