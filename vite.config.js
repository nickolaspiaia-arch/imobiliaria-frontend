import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // proxy para desenvolvimento local redireciona /api para o backend
    proxy: {
        '/api': {
          target: 'http://localhost:8080', // URL do backend local
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
    }
  }
})
