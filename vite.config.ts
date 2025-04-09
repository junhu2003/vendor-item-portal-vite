import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: './postcss.config.js',
  },
  base: '/', // Important for Azure
  // Fix for portal rendering
  build: {
    target: 'esnext',
    polyfillModulePreload: false,
    outDir: 'dist'
  }
})
