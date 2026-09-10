/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ui: ['Archivo', 'Segoe UI', 'system-ui', 'sans-serif'],
        texto: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        dato: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
      borderRadius: { gr: '4px', ficha: '6px' },
    },
  },
  plugins: [],
}
