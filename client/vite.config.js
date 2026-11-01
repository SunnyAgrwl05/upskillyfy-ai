import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react-dom/client', 'react-router-dom', 'axios'],
  },
  server: {
    allowedHosts: [
      'superactively-sphenic-nadia.ngrok-free.dev'
    ]
  }
})
