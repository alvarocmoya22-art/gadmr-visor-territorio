import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * En GitHub Pages el sitio cuelga de /<repositorio>/, no de la raíz, así que
 * los archivos se piden con ese prefijo. En desarrollo se sirve desde la raíz.
 * El código lee las rutas con `import.meta.env.BASE_URL`, nunca fijas.
 */
const BASE_EN_PAGES = '/gadmr-visor-territorio/'

/** Sello de esta compilación. Cambia en cada build y no se repite. */
const SELLO = Date.now().toString(36)

/**
 * Publica el sello en dos sitios: dentro del bundle y en un `version.json`
 * suelto.
 *
 * GitHub Pages sirve el index.html con diez minutos de caché y no deja tocar
 * esa cabecera, así que tras publicar hay quien sigue con la versión anterior
 * sin saberlo: el visor parece no haber cambiado. Comparando el sello que
 * lleva dentro el bundle con el del archivo (que sí se pide sin caché), la
 * aplicación puede darse cuenta y avisar.
 */
function selloDeVersion(): Plugin {
  const cuerpo = JSON.stringify({ v: SELLO })
  return {
    name: 'sello-de-version',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: cuerpo })
    },
    configureServer(server) {
      // En desarrollo no hay build, pero el archivo tiene que existir igual
      // para que el mismo código funcione sin ramas especiales.
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(cuerpo)
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_EN_PAGES : '/',
  plugins: [react(), selloDeVersion()],
  define: { __SELLO__: JSON.stringify(SELLO) },
  server: { port: 5183, strictPort: true },
}))
