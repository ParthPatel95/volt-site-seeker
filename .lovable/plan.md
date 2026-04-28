## Plan

1. **Fix the black Earth rendering properly**
   - Replace the current dark wireframe-only globe material with a lightweight, self-contained globe visual that reads as Earth at all viewing angles.
   - Use safer React Three Fiber patterns so Three.js resources are created/disposed reliably.
   - Add visible land/continent cues, better lighting, and a non-black ocean tone while preserving the institutional WattByte aesthetic.
   - Keep the pipeline arcs, markers, legend, and click-to-inspect panel.

2. **Improve Advisory page load time**
   - Lazy-load the heavy 3D globe section instead of including `@react-three/fiber`, `three`, and `drei` in the initial Advisory page chunk.
   - Lazy-load lower-page Advisory sections so the hero and above-the-fold content render first.
   - Reduce WebGL workload by lowering star count, sphere segment counts, and device pixel ratio.
   - Ensure the globe has a polished loading placeholder so the page does not feel stalled while 3D assets initialize.

3. **Remove the advisory email address**
   - Remove the visible `advisory@wattbyte.com` mailto link from the bottom of the form.
   - Remove the success-state mailto button and replace the copy with a form-only confirmation.
   - Remove fallback error text that tells users to email directly, while keeping useful form submission error feedback.
   - Keep the form storing submissions only in Supabase as requested.

4. **QA after implementation**
   - Open `/advisory` at the current viewport size.
   - Verify the hero appears quickly, the globe no longer appears black, markers/arcs still work, and the form no longer displays the advisory email address.
   - Check browser console errors and performance profile again after the changes.