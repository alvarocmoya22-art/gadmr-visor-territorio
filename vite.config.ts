import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * En GitHub Pages el sitio cuelga de /<repositorio>/, no de la raíz, así que
 * los archivos se piden con ese prefijo. En desarrollo se sirve desde la raíz.
 * El código lee las rutas con `import.meta.env.BASE_URL`, nunca fijas.
 */
const BASE_EN_PAGES = '/gadmr-visor-territorio/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_EN_PAGES : '/',
  plugins: [react()],
  server: { port: 5183, strictPort: true },
}))
