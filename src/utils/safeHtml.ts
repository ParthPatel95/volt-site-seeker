// Lightweight HTML escaping helpers used to prevent XSS when rendering
// model-generated or user-supplied text via dangerouslySetInnerHTML.
//
// For full untrusted HTML documents (e.g. report bodies retrieved from the
// database), do NOT use these helpers — render the document inside a
// sandboxed <iframe srcDoc=...> instead so any embedded scripts cannot run.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

export function escapeHtml(input: string): string {
  if (input == null) return '';
  return String(input).replace(/[&<>"'/]/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

// Escape input first, then re-introduce the small set of formatting tags we
// support. Currently only **bold**.
export function renderInlineMarkdown(
  input: string,
  strongClassName = 'text-foreground font-semibold'
): string {
  const escaped = escapeHtml(input);
  return escaped.replace(
    /\*\*(.+?)\*\*/g,
    `<strong class="${escapeHtml(strongClassName)}">$1</strong>`
  );
}
