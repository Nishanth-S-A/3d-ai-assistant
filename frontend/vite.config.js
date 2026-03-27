import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Optional: Proxy to Ollama to avoid CORS errors in browser
    proxy: {
      '/api': {
        target: 'http://ollama:11434',
        changeOrigin: true,
      }
    }
  }
})