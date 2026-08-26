import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    // Listen on every interface so the port mapping works when this runs in a
    // container. Harmless when running on the host.
    host: true,
    watch: {
      // Docker Desktop on macOS does not deliver filesystem events reliably
      // through a bind mount, so file changes are polled inside the container.
      // Set only there — polling on the host burns CPU for no benefit.
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
    proxy: {
      // Forward API calls to the FastAPI backend during development.
      // On the host that is localhost:8000; inside Compose it is the `api`
      // service, which Compose sets via VITE_API_PROXY_TARGET.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
