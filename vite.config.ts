import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
