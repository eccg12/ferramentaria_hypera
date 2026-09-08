import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' — a build precisa abrir por file:// e no GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // 'estaticos' e não 'assets': public/assets/ (a foto da placa) já ocupa dist/assets/
    assetsDir: 'estaticos',
    assetsInlineLimit: 0,
  },
})
