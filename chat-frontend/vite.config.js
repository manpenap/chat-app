import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://lets-talk-4ejt.onrender.com', // Cambia 5000 si tu backend usa otro puerto
    },
  },

})
