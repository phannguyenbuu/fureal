import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // ✅ DEV = base: '/' (KHÔNG dùng /fureal3D/)
  server: {
    host: '0.0.0.0',
    port: 5173,
  }
})
