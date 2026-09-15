import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Local `dotnet run` ships empty CORS origins, so dev traffic goes
      // same-origin through Vite and is forwarded to the backend.
      '/api': {
        target: 'http://localhost:5072',
        changeOrigin: true,
      },
    },
  },
})
