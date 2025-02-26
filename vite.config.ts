import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: false, // Disable CORS
    headers: {
      'Access-Control-Allow-Origin': 'null' // Enforce SOP
    }
  }
})