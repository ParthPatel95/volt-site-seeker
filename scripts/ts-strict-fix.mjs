#!/usr/bin/env node
// One-shot transform: annotate reducer/map/filter callback parameters with
// `: any` (or proper types) in files that produce TS7006 errors under
// noImplicitAny. Files with rich types should already infer correctly;
// this script targets the known untyped-data sites flagged by
// `tsc --noImplicitAny`.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

// Each entry: file -> array of [oldFragment, newFragment].
const PATCHES = {
  'src/components/aeso/dashboard-widgets/AdvancedChartWidget.tsx': [
    ['reduce((acc, v) => acc + v', 'reduce((acc: number, v: number) => acc + v'],
    ['reduce((acc, v) => acc + Math.abs(v', 'reduce((acc: number, v: number) => acc + Math.abs(v'],
  ],
  'src/components/aeso/dashboard-widgets/DistributionWidget.tsx': [
    ['reduce((acc, v) => acc + v', 'reduce((acc: number, v: number) => acc + v'],
    ['reduce((acc, v) => acc + Math.pow(v', 'reduce((acc: number, v: number) => acc + Math.pow(v'],
    ['filter(v => v', 'filter((v: number) => v'],
  ],
  'src/components/aeso/dashboard-widgets/EnhancedStatCard.tsx': [
    ['.map(d => d', '.map((d: any) => d'],
    ['reduce((sum, v) => sum + v, 0)', 'reduce((sum: number, v: number) => sum + v, 0)'],
    ['reduce((sum, v, i, arr)', 'reduce((sum: number, v: number, i: number, arr: number[])'],
  ],
  'src/components/aeso/dashboard-widgets/ScatterPlotWidget.tsx': [
    ['reduce((sum, p) => sum + p.x, 0)', 'reduce((sum: number, p: { x: number; y: number }) => sum + p.x, 0)'],
    ['reduce((sum, p) => sum + p.y, 0)', 'reduce((sum: number, p: { x: number; y: number }) => sum + p.y, 0)'],
    ['reduce((sum, p) => sum + p.x * p.y, 0)', 'reduce((sum: number, p: { x: number; y: number }) => sum + p.x * p.y, 0)'],
    ['reduce((sum, p) => sum + p.x * p.x, 0)', 'reduce((sum: number, p: { x: number; y: number }) => sum + p.x * p.x, 0)'],
    ['reduce((sum, p) => sum + Math.pow(p.y - meanY, 2)', 'reduce((sum: number, p: { x: number; y: number }) => sum + Math.pow(p.y - meanY, 2)'],
    ['reduce((sum, p) => sum + Math.pow(p.y - (slope * p.x + intercept), 2)', 'reduce((sum: number, p: { x: number; y: number }) => sum + Math.pow(p.y - (slope * p.x + intercept), 2)'],
    ['.reduce((min, p) => p.x < min ? p.x : min', '.reduce((min: number, p: { x: number; y: number }) => p.x < min ? p.x : min'],
    ['.reduce((max, p) => p.x > max ? p.x : max', '.reduce((max: number, p: { x: number; y: number }) => p.x > max ? p.x : max'],
    ['.map((entry, index)', '.map((entry: any, index: number)'],
  ],
  'src/components/aeso/AESOHistoricalPricing.tsx': [
    [').filter(r => r.', ').filter((r: any) => r.'],
  ],
  'src/components/intelligence/AESOInvestmentPanel.tsx': [
    ['.find(op => op', '.find((op: any) => op'],
    ['.filter(op => op', '.filter((op: any) => op'],
    ['.map(s => s', '.map((s: any) => s'],
  ],
  'src/components/intelligence/AESOMarketAnalyticsPanel.tsx': [
    ['.map(price =>', '.map((price: any) =>'],
  ],
  'src/components/integrations/ExternalAPIIntegrations.tsx': [
    ['setIntegrations(prev => prev.map', 'setIntegrations((prev: any) => prev.map'],
  ],
  'src/components/secure-share/ExportControls.tsx': [
    ['.map(row => row.map(cell =>', '.map((row: any[]) => row.map((cell: any) =>'],
  ],
  'src/lib/weatherAPI.ts': [
    ['reduce((sum, temp) => sum + temp', 'reduce((sum: number, temp: number) => sum + temp'],
    ['reduce((sum, precip) => sum + precip', 'reduce((sum: number, precip: number) => sum + precip'],
    ['reduce((sum, speed) => sum + speed', 'reduce((sum: number, speed: number) => sum + speed'],
    ['reduce((sum, humidity) => sum + humidity', 'reduce((sum: number, humidity: number) => sum + humidity'],
  ],
};

let totalReplacements = 0;
for (const [file, patches] of Object.entries(PATCHES)) {
  const path = resolve(ROOT, file);
  let src = readFileSync(path, 'utf8');
  let changed = 0;
  for (const [from, to] of patches) {
    if (!src.includes(from)) {
      console.warn(`[${file}] miss: ${from.slice(0, 60)}…`);
      continue;
    }
    const before = src;
    src = src.split(from).join(to);
    if (src !== before) {
      // count occurrences replaced
      const occurrences = before.split(from).length - 1;
      changed += occurrences;
    }
  }
  writeFileSync(path, src);
  totalReplacements += changed;
  console.log(`${file}: ${changed} replacement(s)`);
}
console.log(`\nTotal: ${totalReplacements} replacements across ${Object.keys(PATCHES).length} files.`);
