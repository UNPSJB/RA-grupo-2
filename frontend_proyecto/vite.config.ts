import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Esto configura el proxy para conectar front y back en local
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Esto permite que la cookie se guarde en localhost:5173
        cookieDomainRewrite: {
          "localhost:8000": "localhost",
          "localhost": "localhost",
        }
      }
    }
  }
})