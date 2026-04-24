import { describe, it, expect } from 'vitest';
import { escapeHtml, renderInlineMarkdown } from '../safeHtml';

describe('escapeHtml', () => {
  it('escapes the standard set of HTML-sensitive characters', () => {
    expect(escapeHtml('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    expect(escapeHtml(`a & b "c" 'd'`))
      .toBe('a &amp; b &quot;c&quot; &#39;d&#39;');
  });

  it('handles empty and nullish inputs safely', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });
});

describe('renderInlineMarkdown', () => {
  it('renders **bold** after escaping surrounding HTML', () => {
    const out = renderInlineMarkdown('Revenue is **$1M** <b>ignored</b>');
    expect(out).toContain('<strong');
    expect(out).toContain('$1M</strong>');
    // Raw <b> from input must be escaped, not emitted as a tag.
    expect(out).toContain('&lt;b&gt;ignored&lt;&#x2F;b&gt;');
    expect(out).not.toContain('<b>ignored</b>');
  });

  it('does not let attributes leak via the bold payload', () => {
    const out = renderInlineMarkdown('**" onmouseover=alert(1) x="**');
    // The double-quote inside the bold payload must be escaped so the
    // attribute context on the emitted <strong> cannot be broken out of.
    expect(out).not.toMatch(/<strong[^>]*onmouseover/);
    expect(out).toContain('&quot;');
  });

  it('escapes the className argument so quotes cannot break the attribute', () => {
    const out = renderInlineMarkdown('**x**', '" onload="alert(1)');
    // The class attribute value (between class=" and the matching ") must
    // not contain a raw double-quote — any " in the input should be encoded
    // as &quot;, keeping the attribute intact.
    const match = out.match(/class="([^"]*)"/);
    expect(match).not.toBeNull();
    expect(match![1]).not.toContain('"');
    expect(match![1]).toContain('&quot;');
  });
});
