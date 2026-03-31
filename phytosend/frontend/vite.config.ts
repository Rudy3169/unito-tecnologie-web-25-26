import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Il PROXY è fondamentale! Qualsiasi richiesta Frontend verso "/api/..."
    // verrà rediretta automaticamente al Backend Java sulla porta 8080!
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})