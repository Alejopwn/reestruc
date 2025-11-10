import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8066',
        changeOrigin: true,
      },
      '/productos': {
        target: 'http://localhost:8066',
        changeOrigin: true,
      },
      '/categorias': {
        target: 'http://localhost:8066',
        changeOrigin: true,
      }
    }
  }
})