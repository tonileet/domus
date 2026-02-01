import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable SPA routing - serve index.html for all routes
    // This fixes the issue where refreshing or directly navigating to routes
    // (like /properties, /contacts, etc.) results in blank pages
    historyApiFallback: true,
  },
})
