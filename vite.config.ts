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
        // Function form (required by Vite 8 / rolldown; the object form is
        // Rollup-only). Each heavy lib + its subtree lands in its own chunk
        // so the main bundle stays small and these load on demand.
        // @huggingface/transformers is only referenced by dead code
        // (BackgroundRemovalProcessor has no call sites) — tree-shaken away
        // in production, so it is not split here.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(three|@react-three)\//.test(id)) return 'vendor-three';
          if (/node_modules\/mapbox-gl\//.test(id)) return 'vendor-mapbox';
          if (/node_modules\/(pdfjs-dist|react-pdf|jspdf|pdf-lib|html2canvas)\//.test(id)) return 'vendor-pdf';
          if (/node_modules\/tesseract\.js\//.test(id)) return 'vendor-ocr';
          if (/node_modules\/recharts\//.test(id)) return 'vendor-charts';
          if (/node_modules\/@supabase\/supabase-js\//.test(id)) return 'vendor-supabase';
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
