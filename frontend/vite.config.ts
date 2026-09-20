import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Backend-ul acceptă CORS doar de la acest port; fără strictPort, Vite ar sări pe alt port dacă 5173 e ocupat.
  server: { port: 5173, strictPort: true },
})
