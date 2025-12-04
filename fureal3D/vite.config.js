import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/fureal3D/' : '/',  // ✅ Dev '/', Prod '/fureal3D/'
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: '31.97.76.62',  // ✅ Server public IP cho HMR dev
      port: 5173
    }
  }
}))
