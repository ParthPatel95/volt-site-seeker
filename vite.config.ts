import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Reduce build verbosity to prevent log overflow - always quiet for builds
  logLevel: command === 'build' ? 'warn' : 'info',
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Disable gzip size reporting to speed up builds and reduce log output
    reportCompressedSize: false,
    // Increase chunk size warning limit to reduce warning spam
    chunkSizeWarningLimit: 2000,
    // Ensure content-hash based filenames for proper cache invalidation
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  plugins: [
    react(),
    // Only run tagger during dev server, not builds
    command === 'serve' && mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'prompt', // Changed from 'autoUpdate' to enable needRefresh detection
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'lovable-uploads/*'],
      manifest: {
        name: 'WattByte',
        short_name: 'WattByte',
        description: 'AI-Powered Energy Discovery Platform',
        theme_color: '#0A1628',
        background_color: '#0A1628',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Increase limit to handle large bundles (default is 2MB)
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        // Ensure new service workers take control immediately
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
