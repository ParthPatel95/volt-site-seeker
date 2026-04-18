

# Academy Improvement Opportunities

Based on auditing the current Academy implementation, here are the highest-impact improvements grouped by category. Pick any combination and I'll build them.

---

## 1. Learner Engagement & Retention

- **Streaks & daily goals** — Track consecutive learning days, show a flame icon in the header, send gentle nudges when a streak is at risk. Backed by a `learning_streaks` table.
- **XP & leveling system** — Award XP for lessons completed, quizzes passed, exams aced. Visible level badge on profile.
- **Bookmarks / Save for later** — Let users bookmark specific lessons or sections and access them from a dedicated "Saved" tab.
- **Notes per lesson** — A side-panel notebook so learners can take personal notes per section, persisted to Supabase.

## 2. Social & Community

- **Leaderboard** — Top learners ranked by XP, exams passed, or modules completed. Weekly + all-time tabs.
- **Discussion threads per lesson** — Lightweight comment threads at the bottom of each lesson for Q&A.
- **Cohort/study groups** — Optional groups where learners can see each other's progress.

## 3. Credentialing

- **Per-module certificates with verification URL** — Already have masterclass cert; extend to per-module with a public `/verify/:certId` page.
- **LinkedIn share button** — One-click "Add to LinkedIn" for any earned certificate.
- **Downloadable PDF certificates** — Generate a polished PDF (not just an image) signed by WattByte.

## 4. Content Discovery & Personalization

- **Recommended next module** — Smarter suggestions based on what user completed and quiz performance (not just sequential).
- **Skill-level placement quiz** — A 10-question intake quiz that recommends a starting module (Beginner/Intermediate/Advanced track).
- **Search across lesson content** — Full-text search of lesson bodies (not just titles) using a Supabase search index.
- **Glossary** — Centralized industry-term glossary with hover tooltips throughout lessons.

## 5. Accessibility & UX Polish

- **Audio narration toggle** — Use ElevenLabs or browser TTS to read lesson content aloud.
- **Reading progress bar** — Thin bar at top of each lesson page showing scroll progress.
- **Dark/light mode refinements** — Audit lesson pages for contrast issues.
- **Mobile lesson reader** — Optimize the long-form lesson layout for phone reading (current layout is desktop-first).
- **Print-friendly view** — A clean "Print this lesson" stylesheet for offline study.

## 6. Admin & Analytics

- **Admin dashboard** — Aggregate metrics: enrollment count, module completion rates, average exam scores, drop-off points per lesson.
- **Per-lesson drop-off heatmap** — Identify which sections lose learners.
- **Content editor** — Lightweight CMS so non-developers can update lesson copy without touching code.

## 7. Interactive Content Expansion

- **Video walkthroughs** — Replace "Coming Soon" placeholders with short Loom-style screen recordings for top modules.
- **Live calculators per module** — e.g., a hashrate-to-revenue calculator in Mining Economics, a noise distance calculator in Noise Management.
- **Case study deep-dives** — Full case study pages (e.g., the 45MW Alberta facility) with photos, financials, lessons learned.

---

## Recommended "next 3" if you want my pick

1. **Per-module certificates + verification URL + LinkedIn share** — High prestige, low effort, drives organic referral.
2. **Streaks + XP system** — Proven retention mechanic, ~1 day of work.
3. **Admin analytics dashboard** — You'll need this to know which improvements are working.

Tell me which items to build (or pick "the recommended 3") and I'll produce a detailed implementation plan for those.

