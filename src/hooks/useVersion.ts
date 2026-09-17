import { useEffect, useState } from 'react'

/** Sello de la compilación que se está ejecutando; lo inyecta Vite. */
declare const __SELLO__: string

/** Cada cuánto se pregunta si hay una versión nueva publicada. */
const CADA_MS = 5 * 60 * 1000

/**
 * Avisa cuando el servidor tiene una versión más nueva que la que corre aquí.
 *
 * GitHub Pages sirve el index.html con diez minutos de caché y no permite
 * cambiar esa cabecera. El efecto es desconcertante: se publica una mejora, se
 * abre el visor y no está, porque el navegador reusa el HTML viejo y con él el
 * bundle viejo. Preguntando por `version.json` sin caché, la aplicación se
 * entera y puede decirlo en vez de dejar al usuario pensando que no funcionó.
 */
export function useVersionNueva(): boolean {
  const [hayNueva, setHayNueva] = useState(false)

  useEffect(() => {
    let vivo = true

    const mirar = async () => {
      try {
        const resp = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
        if (!resp.ok) return
        const { v } = (await resp.json()) as { v?: string }
        // Sin sello o con el mismo, no hay nada que decir. Un fallo de red
        // tampoco es noticia: se vuelve a mirar en la siguiente vuelta.
        if (vivo && v && v !== __SELLO__) setHayNueva(true)
      } catch {
        /* sin conexión: se reintenta luego */
      }
    }

    void mirar()
    const id = setInterval(mirar, CADA_MS)
    // Volver a la pestaña es el momento natural para comprobarlo: es cuando
    // alguien retoma el visor despues de que se haya publicado algo.
    const alVolver = () => {
      if (document.visibilityState === 'visible') void mirar()
    }
    document.addEventListener('visibilitychange', alVolver)

    return () => {
      vivo = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [])

  return hayNueva
}

/**
 * Recarga saltándose la caché del HTML.
 *
 * `location.reload()` no basta: el documento sigue viniendo de la caché del
 * navegador. Cambiando la consulta se pide una dirección que no está guardada.
 */
export function recargarDeVerdad(): void {
  const url = new URL(window.location.href)
  url.searchParams.set('v', Date.now().toString(36))
  window.location.replace(url.toString())
}
