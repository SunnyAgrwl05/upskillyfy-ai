import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Polling is needed for reliable updates on WSL-backed Windows shares.
      usePolling: true,
    },
    allowedHosts: [
      'superactively-sphenic-nadia.ngrok-free.dev'
    ]
  }
})
