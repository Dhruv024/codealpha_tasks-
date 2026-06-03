import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@magenta/music', '@tensorflow/tfjs'],
  },
})
