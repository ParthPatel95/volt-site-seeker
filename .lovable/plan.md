# Advisory page — load performance pass

The Advisory page feels slow because the **hero render is blocked by ~1MB of below-the-fold assets** that get pulled in synchronously, and most sections render eagerly. Three concrete fixes, no content changes.

## 1. Stop pulling pipeline JPEGs into the hero bundle

`src/data/advisory-pipeline.ts` does six top-level `import` statements of JPEGs (jinja, texas, nepal, bhutan, india, newfoundland — ~850KB combined). Anything that touches `PIPELINE_PROJECTS` (including the hero stat strip / `PipelineFlowStrip`) drags every image into the initial chunk, even though only the case-studies section actually displays them.

Fix:
- Remove the `import` statements at the top of `advisory-pipeline.ts`.
- Replace the `image` field with the public-relative path string (e.g. `'/src/assets/pipeline/jinja-uganda-hydro.jpg'`) **or** keep typed image keys and resolve them only inside `AdvisoryCaseStudies.tsx` via a small lookup that does the imports there.
- Result: hero + map chunk drops by ~850KB.

## 2. Lazy-load the 73KB world-land-path

`src/components/advisory/world-land-path.ts` is a single 73KB string. It is already only used by `AdvisoryPipelineMap`, but because that map is `React.lazy`'d in `Advisory.tsx`, this is fine — verify nothing else imports it. (Quick `rg` check in implementation.) If clean, no action; if leaked, remove the leak.

## 3. Lazy-render more sections + add `loading="lazy"` to images

In `src/pages/Advisory.tsx`:
- Convert `AdvisoryAudience`, `AdvisoryMarketContext`, `AdvisoryServices`, `AdvisoryProcess`, `AdvisoryDifferentiators` from static imports to `React.lazy` + `Suspense` with a lightweight fallback (reuse `SectionLoader` from `LazyErrorBoundary`). Hero stays eager.
- Wrap each lazy section in an IntersectionObserver-style mount (reuse the `LazyLegalSection` pattern, or a small inline version) so they only mount when scrolled near.
- Confirm `loading="lazy"` and `decoding="async"` on every `<img>` in `AdvisoryCaseStudies` and `PipelineProjectCard` (already partially done — verify).

## 4. Trim hero work

- `AdvisoryHero` uses a 700px blurred glow + dotted radial-gradient overlay. Keep, but add `will-change: auto` (no extra GPU layer) and ensure the gradient div has `pointer-events-none` (it does). No structural change.
- Remove the redundant `ScrollReveal` wrapping the hero — the hero is above the fold, the reveal animation just delays paint by ~300ms. Render the hero content directly.

## Technical details (for engineering)

Files touched:
- `src/data/advisory-pipeline.ts` — drop image `import`s; expose either string paths or a separate `pipelineImages.ts` consumed only by `AdvisoryCaseStudies.tsx` / `PipelineProjectCard.tsx`.
- `src/components/advisory/AdvisoryCaseStudies.tsx`, `PipelineProjectCard.tsx` — resolve images locally; ensure `loading="lazy" decoding="async"`.
- `src/pages/Advisory.tsx` — convert 5 sections to `React.lazy`, add `Suspense` fallbacks, and (optionally) wrap each in a tiny `<InView>` mount-on-visible component.
- `src/components/advisory/AdvisoryHero.tsx` — drop the outer `ScrollReveal` wrapper.

Verification:
- Run dev build, open Advisory, confirm initial JS chunk for `Advisory` route shrinks (target: −800KB+).
- Browser performance profile: TTI / LCP on Advisory should drop noticeably; scroll-in of below-fold sections should not jank.

Out of scope:
- No copy, design, or feature changes.
- Admin `ConsultingInquiries` untouched.
