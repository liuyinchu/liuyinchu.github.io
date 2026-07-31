# Design QA — Markdown 流光按钮视觉收敛

- Source visual truth: `/var/folders/cl/gg6c2l912qq71_cy6bn29z140000gn/T/codex-clipboard-3f17248c-6341-4787-95a7-cbdd1993f876.png`
- Source pixels: `1070 × 320`
- Implementation route: `http://localhost:5173/markdown-components#%E6%B5%81%E5%85%89%E6%8C%89%E9%92%AE`
- Desktop implementation screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button-refine/stream-button-desktop-final.png` (`1269 × 714`)
- Focused implementation crop: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button-refine/implementation-focused.png` (`449 × 84`)
- Mobile implementation screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button-refine/stream-button-mobile-final.png` (`379 × 820`)
- Combined comparison: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button-refine/design-comparison.png` (`1002 × 174`)
- Desktop CSS viewport: default in-app browser viewport, captured at `1269 × 714`; button box `432 × 66.4`
- Mobile CSS viewport override: `390 × 844`; captured content area `379 × 820`; button box `322.6 × 62.4`
- Density normalization: browser captures and focused crop use one captured image pixel per CSS pixel. Source and implementation were independently scaled to `108px` comparison height while preserving aspect ratio.
- State: dark theme, default live animation. Focus-visible was checked separately before the default-state captures.

## Full-view comparison evidence

The desktop and mobile captures show a compact call-to-action that remains visually distinct from the larger Link Card above it. The desktop button is capped at `27rem`; the mobile button fills the article column without clipping its content or creating component-level horizontal overflow. The page's existing typography, spacing, and Catppuccin surface treatment remain intact.

## Focused comparison evidence

The combined image verifies the intended transfer from the reference:

- The left side remains near-black and readable while the color field enters softly from the middle.
- The right side uses one continuous overlapping field with warm orange/cream above, magenta through the center, and violet below.
- The previous regular pinstripes are absent.
- Broad displaced light ribbons replace the earlier thin, mechanically repeated lines.
- The reference is a large card; the implementation intentionally compresses the visual language into a `432 × 66.4` button.

## Required fidelity surfaces

- Fonts and typography: the site's established fonts are retained. Eyebrow, title, and supporting copy remain legible at the smaller button size; all three truncate safely rather than wrapping into the color field.
- Spacing and layout rhythm: desktop width fell from `36rem` to `27rem`, desktop height from `89.6px` to `66.4px`, and mobile height from `80px` to `62.4px`. Padding, radius, and shadow now read as a button rather than a feature card.
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

## Follow-up polish

- P3: the three-line Markdown copy hierarchy is necessarily denser than the reference's two-line card; it remains readable and was not changed because the component API intentionally exposes eyebrow, title, and body copy.

final result: passed
