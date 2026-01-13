import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/rag': 'http://localhost:8000',
      '/files': 'http://localhost:8000',
      '/preview': 'http://localhost:8000',
      '/artifacts': 'http://localhost:8000',
      '/session': 'http://localhost:8000',
      '/templates': 'http://localhost:8000',
      '/enhance-with-images': 'http://localhost:8000',
      '/connect': 'http://localhost:8000',
    }
  }
})
