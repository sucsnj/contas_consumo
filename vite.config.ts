import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const portaApi = process.env.PORT ?? '4173'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.HOST ?? '0.0.0.0',
    proxy: {
      '/api': `http://127.0.0.1:${portaApi}`,
    },
  },
})
