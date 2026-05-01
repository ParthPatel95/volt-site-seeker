import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveTone } from '../data-freshness-badge';

const NOW = new Date('2026-04-22T12:00:00Z').getTime();

afterEach(() => {
  vi.useRealTimers();
});

function freezeNow() {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
}

describe('resolveTone', () => {
  it('returns "estimated" when source ends with _estimated, regardless of timestamp', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW), 'aeso_estimated', 120, 900)).toBe('estimated');
    expect(resolveTone(new Date(NOW - 1_000_000), 'spp_estimated', 120, 900)).toBe('estimated');
  });

  it('returns "estimated" for synthetic / mock / estimated sources', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW), 'synthetic', 120, 900)).toBe('estimated');
    expect(resolveTone(new Date(NOW), 'mock', 120, 900)).toBe('estimated');
    expect(resolveTone(new Date(NOW), 'ESTIMATED', 120, 900)).toBe('estimated');
  });

  it('returns "unavailable" when timestamp is missing', () => {
    freezeNow();
    expect(resolveTone(null, undefined, 120, 900)).toBe('unavailable');
    expect(resolveTone(undefined, null, 120, 900)).toBe('unavailable');
    expect(resolveTone('not a date', undefined, 120, 900)).toBe('unavailable');
  });

  it('returns "live" when within the live threshold', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW), 'aeso', 120, 900)).toBe('live');
    expect(resolveTone(new Date(NOW - 60_000), 'aeso', 120, 900)).toBe('live');
    expect(resolveTone(new Date(NOW - 119_000), 'aeso', 120, 900)).toBe('live');
  });

  it('returns "stale" between live and stale thresholds', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW - 121_000), 'aeso', 120, 900)).toBe('stale');
    expect(resolveTone(new Date(NOW - 5 * 60_000), 'aeso', 120, 900)).toBe('stale');
    expect(resolveTone(new Date(NOW - 14 * 60_000), 'aeso', 120, 900)).toBe('stale');
  });

  it('returns "outdated" past the stale threshold', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW - 16 * 60_000), 'aeso', 120, 900)).toBe('outdated');
    expect(resolveTone(new Date(NOW - 60 * 60_000), 'aeso', 120, 900)).toBe('outdated');
  });

  it('accepts ISO strings and numeric timestamps', () => {
    freezeNow();
    expect(resolveTone(new Date(NOW - 30_000).toISOString(), 'aeso', 120, 900)).toBe('live');
    expect(resolveTone(NOW - 30_000, 'aeso', 120, 900)).toBe('live');
  });
});
