import { useEffect, useState } from 'react'
import { fotosCercanas, hayToken, type Foto } from '../lib/mapillary'

export interface FotosCalle {
  fotos: Foto[]
  cargando: boolean
  error: string | null
  /** Cierto si no se consultó nada por falta de token. */
  faltaToken: boolean
  /**
   * Id de foto sacado de las teselas del mapa. Sirve de respaldo cuando la
   * Graph API no devuelve nada — pasa si el token no tiene permiso de lectura,
   * porque las teselas sí funcionan sin él.
   */
  idRespaldo: string | null
}

/** Fotografía de calle de Mapillary alrededor de un punto, por cercanía. */
export function useFotosCalle(
  lon: number,
  lat: number,
  clave: string,
  idRespaldo: string | null = null,
  radioM = 60,
): FotosCalle {
  const [estado, setEstado] = useState<Omit<FotosCalle, 'idRespaldo'>>({
    fotos: [],
    cargando: true,
    error: null,
    faltaToken: !hayToken,
  })

  useEffect(() => {
    const ctrl = new AbortController()
    setEstado({ fotos: [], cargando: true, error: null, faltaToken: !hayToken })

    fotosCercanas(lon, lat, radioM, 6, ctrl.signal)
      .then((fotos) => {
        if (!ctrl.signal.aborted) {
          setEstado({ fotos, cargando: false, error: null, faltaToken: !hayToken })
        }
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        setEstado({
          fotos: [],
          cargando: false,
          error: e instanceof Error ? e.message : String(e),
          faltaToken: !hayToken,
        })
      })

    return () => ctrl.abort()
  }, [lon, lat, clave, radioM])

  return { ...estado, idRespaldo }
}
