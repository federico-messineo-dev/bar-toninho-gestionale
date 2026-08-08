import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['index.html'],
        manifest: {
          name: 'Caffè Toninho - Gestione Inventario',
          short_name: 'Caffè Toninho',
          description: 'Gestione inventario, menu e ordini del Caffè Toninho',
          theme_color: '#722F37',
          background_color: '#F5F0E6',
          display: 'standalone',
          start_url: '/',
          icons: [
            {src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png'},
            {src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png'},
            {src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {cacheName: 'google-fonts-cache', expiration: {maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365}},
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {cacheName: 'gstatic-fonts-cache', expiration: {maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365}},
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-cache',
                networkTimeoutSeconds: 5,
                expiration: {maxEntries: 50, maxAgeSeconds: 60 * 60 * 24},
              },
            },
            {
              urlPattern: /^https:\/\/.*\.supabase\.in\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-infra-cache',
                networkTimeoutSeconds: 5,
                expiration: {maxEntries: 50, maxAgeSeconds: 60 * 60 * 24},
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
