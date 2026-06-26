// Sanitize server/user-supplied report HTML before it is injected into the
// live document via `.innerHTML` for html2canvas PDF capture.
//
// The shared AESO report is a chunk of HTML authored by whoever created the
// share (stored in shared_aeso_reports.report_html). When it's *displayed*
// it goes through a sandboxed <iframe srcDoc>, which neutralizes scripts.
// But the PDF-export path (and a couple of historical-pricing capture paths)
// write that same HTML straight into a <div> attached to document.body via
// `container.innerHTML = htmlContent`. That div is in the parent origin, so
// an embedded `<img src=x onerror=…>` or inline handler in the report HTML
// would execute with full app privileges during export — bypassing the
// iframe sandbox used everywhere else. (Audit-2026-06-25.)
//
// DOMPurify strips <script>, event-handler attributes (onerror/onload/…),
// and javascript: URLs while preserving the tables / inline styles / images
// a report needs to render for capture.

import DOMPurify from 'dompurify';

export function sanitizeReportHtml(html: string): string {
  if (typeof html !== 'string' || html.length === 0) return '';
  return DOMPurify.sanitize(html, {
    // Keep <style> blocks and style attributes — reports rely on them for
    // layout when rasterized by html2canvas. DOMPurify still sanitizes the
    // CSS inside <style> (strips expression(), url(javascript:), etc.).
    // FORCE_BODY keeps a leading <style> in the output instead of dropping
    // it as stray head content.
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    // Belt-and-braces: forbid the script vector explicitly even though
    // DOMPurify drops it by default.
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'base', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'formaction'],
  });
}
