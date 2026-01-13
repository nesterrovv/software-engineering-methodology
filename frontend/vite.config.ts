import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/incidents": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/complaints": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/violations": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/reports": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
})
