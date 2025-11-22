import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Capturamos cualquier solicitud que empiece con "/api"
      '/api': {
        target: 'http://localhost:8000', // Tu backend FastAPI
        changeOrigin: true,
        secure: false,
        // IMPORTANTE: Esto borra "/api" antes de llegar al backend.
        // El frontend pide: /api/opciones
        // El backend recibe: /opciones
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})