import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Electron から file:// で読み込むため base は './' にする
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500,
  },
  server: { port: 5173, strictPort: true },
})
