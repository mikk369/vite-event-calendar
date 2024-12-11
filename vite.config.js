import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true, // Enable manifest generation
    outDir: 'dist', // Specify the output directory
  }
})
