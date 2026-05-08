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
    // Flag any single chunk over ~1 MB so we notice new bloat; heavy libs
    // are split out via manualChunks below.
    chunkSizeWarningLimit: 1200,
    // Ensure content-hash based filenames for proper cache invalidation
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        // Split heavy libraries into their own chunks so the main bundle
        // stays small and these only load when a page actually imports
        // them (via dynamic import or a route that uses them).
        manualChunks: {
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-mapbox': ['mapbox-gl'],
          'vendor-pdf': ['pdfjs-dist', 'react-pdf', 'jspdf', 'pdf-lib', 'html2canvas'],
          'vendor-ocr': ['tesseract.js'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          // @huggingface/transformers is only referenced by dead code
          // (BackgroundRemovalProcessor has no call sites) — tree-shaken
          // away in production, so not listed here.
        },
      },
    },
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
        // App.tsx is now route-level lazy-loaded (Phase F), so the main
        // shell is ~632 KB instead of ~5 MB. The heaviest lazy chunk —
        // the `/app` (VoltScout) bundle — is intentionally excluded from
        // precaching via `globIgnores` so we don't blow through mobile
        // storage on first install. It's still fetched on demand when
        // the user navigates to /app. Other chunks (vendor-mapbox,
        // vendor-pdf, vendor-charts) precache fine under the 4 MB
        // ceiling and let the home page work offline.
        globIgnores: ['**/VoltScout-*.js', '**/VoltScout.*.js'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB
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
