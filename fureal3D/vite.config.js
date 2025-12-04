import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/creative/' : '/',
  plugins: [react()],
  server: {
    host: true,     // Tốt nhất là true để tự động detect IP
    port: 5173,
    hmr: true
  }
}))
