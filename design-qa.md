# Design QA — Markdown 流光按钮最终尺寸

- Final source truth: browser annotation 1 on `.md-stream-button`, visible viewport `1440 × 900`, requested box `250 × 35`
- Prior visual reference: `/var/folders/cl/gg6c2l912qq71_cy6bn29z140000gn/T/codex-clipboard-3f17248c-6341-4787-95a7-cbdd1993f876.png` (`1070 × 320`)
- Implementation route: `http://localhost:5173/markdown-components#%E6%B5%81%E5%85%89%E6%8C%89%E9%92%AE`
- Before screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260731-stream-button-final-size/before-default.png` (`1013 × 768`), button `432 × 66.4`
- Final annotated-viewport screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260731-stream-button-final-size/after-1440x900.png` (`1429 × 900` browser content area), button `250 × 35`
- Final default-viewport screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260731-stream-button-final-size/after-default-visible.png` (`1013 × 768`), button `250 × 35`
- Final mobile screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260731-stream-button-final-size/after-mobile-390x844.png` (`379 × 844` browser content area), button `250 × 35`
- Responsive underflow check: at a `280 × 700` override (`269px` browser content area), the `246.6px` article column leaves `212.6px` available after article padding; the button contracts to `212.6 × 35`
- Comparison method: the before and after default-viewport screenshots were inspected together in one comparison input. The annotation's exact numeric target was also checked from the live DOM at the annotated viewport.
- State: dark theme, default live animation.

## Final annotation evidence

- Exact target: live `getBoundingClientRect()` returned `250 × 35` at the requested desktop viewport.
- Responsive cap: both desktop and standard mobile resolve to `width: min(100%, 250px)` and `height: 35px`; only narrower article columns reduce the width.
- Internal fit: padding and the three typographic tiers were scaled with the outer box. Eyebrow, title, and body remain vertically centered; long copy stays single-line and safely clips with ellipsis.
- Visual continuity: the existing black-to-orange/magenta/violet field, SVG turbulence/displacement, screen blending, bright core, and asynchronous sine-driven motion were intentionally left unchanged.
- Page integrity: the smaller pill does not overlap the following Markdown example and introduces no component-level horizontal overflow.

## Full-view comparison evidence

The final implementation now reads unambiguously as a compact button rather than a card. In the paired default-viewport evidence, the bounding box changes from `432 × 66.4` to `250 × 35` while preserving the same left alignment, pill radius, dark surface, continuous right-side color field, and three-line information hierarchy.

The annotated desktop capture and the `390 × 844` mobile capture show the same intentional `250 × 35` cap. The `280 × 700` underflow check confirms the cap participates in the existing responsive article width instead of forcing horizontal overflow.

## Final required fidelity surfaces

- Fonts and typography: the site's established fonts are retained. Eyebrow, title, and supporting copy were proportionally reduced to fit the annotated height; all three remain single-line and truncate safely rather than wrapping into the color field.
- Spacing and layout rhythm: the final cap is exactly `250 × 35`, down from the preceding `432 × 66.4`. The pill remains left-aligned with the article content and keeps its existing section margins.
- Colors and visual tokens: the source's black, burnt-orange, cream, hot-magenta, and violet order is reflected in the live field. Screen blending is retained while layer opacity was reduced to avoid a washed-out white stripe.
- Image quality and asset fidelity: the requested visual is a live CSS/SVG effect rather than a raster asset. The color field stays continuous at both sizes; no repeating-line overlay, stretching artifact, hard-edged blob, or filter halo is visible.
- Copy and content: `eyebrow`, `title`, and Markdown-formatted supporting copy are unchanged and coherent.
- Interaction and accessibility: the native anchor navigates to `/space1`; browser Back returns to the component manual. The cyan focus-visible ring remains clear. Reduced-motion handling preserves a static field and disables continuous updates.

## Animation evidence

Two samples `900ms` apart changed:

- `baseFrequency`: `0.00209 0.02385` → `0.00213 0.02387`
- displacement scale: `27.27` → `27.81`
- primary field shift: `-0.80%` → `-0.51%`
- first ribbon offset: `2.81%` → `2.84%`
- counter ribbon offset: `0.58%` → `0.06%`
- first ribbon tilt: `-0.24deg` → `-0.02deg`
- bright-core opacity: `0.472` → `0.468`

The final animation continues to use independent sine groups based on irrational constants. Separate field, ribbon, counter-ribbon, tilt, displacement, and core-breath values move at different rates without fixed keyframes.

## Browser and interaction checks

- Desktop and mobile layouts render without overlap or component clipping.
- Pointer activation reaches `/space1`; Back restores the Markdown components route.
- Focus-visible styling renders on the native link.
- No component-specific browser error was observed.
- Existing Vue Router warnings for async Chinese/hash headings remain unrelated to this component refinement.

## Comparison history

### Pass 1 — blocked

- [P1] Button dimensions read as a card: `36rem × 89.6px` was too long and too tall.
- [P1] A `repeating-linear-gradient` created artificial, evenly spaced horizontal lines.
- [P1] One translated color plane and high displacement amplitude made the animation feel mechanically synchronized.
- Fixes: reduced desktop and mobile dimensions, removed the repeating-line layer, softened the noise before displacement, added two independently moving broad ribbons, and slowed each sine group to a different irrational cadence.

### Pass 2 — blocked

- [P2] The first smooth-field revision blended into one pale pink bar and underrepresented the reference's top-orange and lower-violet separation.
- Fixes: vertically separated the three overlapping color regions, strengthened the upper warm core and lower violet ribbon, reduced additive opacity, increased broad-form displacement, and added subtle counter-rotation.

### Pass 3 — passed

- Post-fix evidence: `stream-button-desktop-final.png`, `stream-button-mobile-final.png`, and `design-comparison.png`.
- No actionable P0/P1/P2 mismatch remains. The narrower aspect ratio and smaller type scale are intentional consequences of implementing a button instead of reproducing the reference card.

### Pass 4 — passed

- Browser annotation changed the accepted target from `432 × 66.4` to exactly `250 × 35`.
- Fixes: applied an explicit `250px` responsive width cap and `35px` fixed height, centered the content stack, and scaled padding and type so the three-tier label fits without expanding the outer box.
- Live DOM checks passed at desktop, standard mobile, and sub-250px available widths.
- No actionable P0/P1/P2 mismatch remains.

## Follow-up polish

- P3: the final annotated size intentionally produces a very dense three-line hierarchy. It remains coherent at normal zoom and uses ellipsis where needed, but copy legibility is necessarily lower than in the preceding `432 × 66.4` version.

final result: passed
