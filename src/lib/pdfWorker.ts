// Single source of truth for the pdf.js worker + cmap configuration.
//
// Why this exists: the app's Content-Security-Policy is strict —
// `worker-src 'self' blob:` and a `script-src` that does NOT include any CDN.
// Several viewers were pointing `GlobalWorkerOptions.workerSrc` at
// jsdelivr/unpkg/cdnjs, so the browser BLOCKED the worker and PDFs silently
// failed to render (Audit-2026-06: secure-share PDF regression).
//
// Fix: bundle the worker from our own node_modules via Vite's `?url` import so
// it is served from our origin (covered by `worker-src 'self'`). The version
// is guaranteed to match the pdfjs that react-pdf uses, because Vite bundles
// the exact `pdfjs-dist` that is hoisted in node_modules — eliminating the
// "API version does not match Worker version" class of errors too.
//
// Import this module for its side effect (it sets the global worker once) and
// use the exported constants for `cMapUrl`.

import { pdfjs } from 'react-pdf';
// Vite resolves this to a hashed URL on our own origin and copies the file
// into the build output. (The worker is ~1.9MB but loads lazily, only when a
// PDF is opened, as a separate request — it is never in the main bundle.)
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Self-hosted pdf.js worker URL (same origin → CSP-safe). */
export const PDF_WORKER_SRC: string = pdfWorkerUrl;

/**
 * Character maps for non-Latin / specially-encoded PDFs. Fetched via
 * `connect-src` (data only, never executed), where jsdelivr is whitelisted.
 * Standard PDFs embed their fonts and never touch this. Version-pinned to the
 * bundled pdfjs so worker/api/cmaps all agree.
 */
export const PDF_CMAP_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`;
export const PDF_CMAP_PACKED = true;

/** Idempotently point the global worker at our self-hosted copy. */
export function ensurePdfWorker(): void {
  if (typeof window === 'undefined') return;
  // Always set ours — overrides any earlier CDN assignment that the CSP blocks.
  if (pdfjs.GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }
}

// Set it immediately on import so every consumer is covered.
ensurePdfWorker();
