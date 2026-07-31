# Design QA — Markdown 流光按钮

- Source visual truth: `/var/folders/cl/gg6c2l912qq71_cy6bn29z140000gn/T/codex-clipboard-02e6c5fa-8fe9-4b69-9a09-f91146e75632.jpg`
- Source pixels: `1206 × 952`; focused dark-card crop: `770 × 248`
- Implementation route: `http://localhost:5173/markdown-components#%E6%B5%81%E5%85%89%E6%8C%89%E9%92%AE`
- Implementation focused screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button/implementation-stream-button-focused.png` (`616 × 112`)
- Full desktop screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button/stream-button-desktop.png` (`1189 × 892`)
- Mobile screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button/stream-button-mobile.png` (`379 × 820`)
- Focus screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button/stream-button-focus.png`
- Combined comparison: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/20260731-stream-button/design-comparison.png` (`1300 × 260`)
- Desktop CSS viewport: `1200 × 900`; button box: `576 × 89.6`
- Mobile CSS viewport: `390 × 844`; button box: `322.6 × 80`
- Density normalization: browser captures and focused crop were compared at approximately `1 CSS px = 1 image px`; the reference crop was proportionally scaled only for the combined comparison.
- State: dark theme, default live animation; mobile focus-visible state checked separately.

## Full-view comparison evidence

The component remains a compact call-to-action inside the existing Markdown component manual rather than inheriting the reference card's large height. Its full-width mobile layout and capped desktop width preserve the page rhythm, leave the syntax example readable below it, and do not introduce horizontal overflow.

## Focused comparison evidence

The combined comparison verifies the intended visual transfer:

- The left text zone remains dark and high-contrast.
- The right side is one continuous overlapping color field, not separated blurred blobs.
- Magenta, violet, warm orange, and a bright cream core reproduce the reference's light behavior.
- The field is displaced into horizontal wind filaments; `screen` blending makes intersections additive.
- The reference card proportions were intentionally reduced to a `5–6rem` capsule button.

## Required fidelity surfaces

- Fonts and typography: the existing site fonts are retained. Eyebrow, title, and copy reproduce the reference hierarchy at button scale without clipping at desktop or mobile widths.
- Spacing and layout rhythm: pill radius, compact height, left alignment, padding, and capped desktop width are balanced against the Markdown page. Mobile width expands to the available column.
- Colors and visual tokens: the dark Catppuccin-compatible base is preserved while the right field uses violet, magenta, orange, and cream light. Contrast remains legible through the field mask.
- Image quality and asset fidelity: the source contains no reusable raster asset for the button. The requested live CSS color field and SVG filter are rendered sharply at both tested sizes, without raster stretching or halos.
- Copy and content: title, eyebrow, and Markdown-formatted supporting copy are present and coherent.
- Interaction and accessibility: pointer navigation reaches `/space1`; the native anchor receives a visible cyan focus ring; reduced-motion code stops the animation and retains a static visual; external links receive `noopener noreferrer`.

## Animation evidence

Two samples taken 420 ms apart changed:

- `baseFrequency`: `0.00382 0.03305` → `0.00380 0.03374`
- displacement scale: `36.39` → `36.65`
- bright-core opacity: `0.900` → `0.912`

The horizontal turbulence frequency remains close to one tenth of the vertical frequency. Multiple sine terms based on irrational constants drive turbulence, displacement, field drift, and core breathing without fixed visual keyframes.

## Browser and interaction checks

- Desktop and mobile layouts rendered without overlap or horizontal page overflow.
- Pointer activation navigated to `/space1` and browser Back returned to the component manual.
- Focus-visible styling rendered on the native link.
- No component-specific console error or warning was observed. Existing unrelated Home transition and encoded Chinese heading-scroll warnings remain outside this change.

## Comparison history

### Pass 1

- P0/P1/P2 findings: none.
- Intentional difference: the source is a large card; the implementation is a smaller action button as requested.
- Post-fix evidence: no visual fix loop was required.

## Follow-up polish

- P3: none required for handoff.

final result: passed
