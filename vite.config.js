import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Egg ATM CRM',
      short_name: 'EggCRM',
      description: 'CRM panel for Egg ATM franchise management',
      start_url: '.',
      display: 'standalone',
      background_color: '#0B1A3A',
      theme_color: '#0B1A3A',
      icons: [
        { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
        { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    }
  })],
  server: {
    port: 5174,
  },
})
