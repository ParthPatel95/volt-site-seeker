import { describe, it, expect } from 'vitest';
import { sanitizeReportHtml } from './sanitizeReportHtml';

// These guard the PDF-export XSS fix: report HTML is written into a
// document.body-attached <div> via innerHTML, so any active content in it
// would run in the app origin. The sanitizer must strip the active vectors
// while preserving the benign report markup html2canvas needs.

describe('sanitizeReportHtml', () => {
  it('strips <script> tags', () => {
    const out = sanitizeReportHtml('<p>hi</p><script>window.x=1</script>');
    expect(out).toContain('<p>hi</p>');
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('strips inline event handlers (the img/onerror vector)', () => {
    const out = sanitizeReportHtml('<img src="x" onerror="alert(document.cookie)">');
    expect(out.toLowerCase()).not.toContain('onerror');
    expect(out.toLowerCase()).not.toContain('alert(');
  });

  it('strips javascript: URLs', () => {
    const out = sanitizeReportHtml('<a href="javascript:alert(1)">click</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('strips <iframe> / <object> / <embed>', () => {
    const out = sanitizeReportHtml(
      '<iframe src="evil"></iframe><object data="x"></object><embed src="x">',
    );
    expect(out.toLowerCase()).not.toContain('<iframe');
    expect(out.toLowerCase()).not.toContain('<object');
    expect(out.toLowerCase()).not.toContain('<embed');
  });

  it('preserves benign report markup: tables, styles, inline style', () => {
    const dirty =
      '<style>.t{color:red}</style>' +
      '<table><tr><td style="font-weight:bold">$45.20</td></tr></table>' +
      '<img src="https://example.com/logo.png">';
    const out = sanitizeReportHtml(dirty);
    expect(out).toContain('<table');
    expect(out).toContain('<td');
    expect(out).toContain('font-weight:bold');
    expect(out).toContain('<style');
    expect(out).toContain('logo.png');
  });

  it('handles empty / non-string input safely', () => {
    expect(sanitizeReportHtml('')).toBe('');
    // @ts-expect-error intentional bad input
    expect(sanitizeReportHtml(null)).toBe('');
    // @ts-expect-error intentional bad input
    expect(sanitizeReportHtml(undefined)).toBe('');
  });
});
