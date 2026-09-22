# Design QA — precision-physkit 文档主页

- Source visual truth: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260801-precision-physkit-page/source-markdown-components-final-1440x900.png`
- Responsive source capture: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260801-precision-physkit-page/source-markdown-components-mobile-390x844.png`
- Secondary source truth: browser annotation 1 on `.md-stream-button`, requested box `200 × 50px` at a `1440 × 900` visible viewport.
- Implementation route: `http://localhost:5173/precision-physkit`
- Desktop implementation screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260801-precision-physkit-page/precision-physkit-desktop-final-1440x900.png`
- Mobile implementation screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260801-precision-physkit-page/precision-physkit-mobile-final-390x844.png`
- Focused stream-button screenshot: `/Users/ysyspace/workspace/dev/agent-code-helper-test/tmp/cache/20260801-precision-physkit-page/stream-button-200x50-visible-final.png`
- Desktop viewport override: `1440 × 900`; browser content viewport `1429 × 900`; source and implementation captures `1429 × 893`; density `1 captured pixel / CSS pixel`.
- Mobile viewport override: `390 × 844`; browser content viewport `379 × 844`; source and implementation captures `379 × 820`; density `1 captured pixel / CSS pixel`.
- State: Catppuccin dark theme, default header state, document beginning. Folding and anchor-navigation states were checked separately.
- Comparison method: desktop source and implementation were opened together in one comparison input; mobile source and implementation were opened together in a second same-size comparison input.

## Findings

No actionable P0, P1, or P2 mismatch remains.

The project page preserves the existing general Markdown page skeleton while replacing only project-specific content: hero label, title, subtitle, page Markdown source, and the second radial accent. The new route renders the complete three-part tutorial and the annotated stream button resolves to exactly `200 × 50px` on desktop and standard mobile widths.

## Full-view comparison evidence

### Desktop

- Source and implementation use the same `960px` hero width, `1032.4px` rendered Markdown width, page padding, border, radius, surface opacity, shadow, and header offset.
- Source hero box measured `960 × 216.6px`; implementation measured `960 × 217.1px`. The `0.5px` height difference comes from the project-specific title metrics and is visually negligible.
- The Markdown body starts at `476.3px` in the source and `475.7px` in the implementation, preserving the vertical transition from hero to content.
- The page hierarchy remains hero → page title → explanatory content. The implementation adds badges and a document-scope alert without changing the outer page structure.

### Mobile

- Both pages use the same `359.8px` hero width and `9.6px` side inset at the `379px` content viewport.
- The implementation has no page-level horizontal overflow (`scrollWidth === clientWidth === 379px`).
- The two-column overview collapses to one column; code blocks retain their own horizontal scroller instead of widening the document.
- The project title remains on one line, the subtitle remains readable, and the top document card stays inside the viewport.

## Focused region comparison evidence

- Stream button: live DOM measurements returned exactly `200 × 50px` for both instances on `/precision-physkit` and for the component manual instance at the annotated desktop viewport.
- The button keeps the established continuous black-to-orange/magenta/violet field, SVG turbulence/displacement, screen blending, bright core, and asynchronous sine-driven animation. Only the requested outer dimensions, padding, and text scale changed.
- Rich Markdown rendering: the combined document produced 5 level-two sections, 35 level-three sections, 3 tables, 122 highlighted code blocks, and 173 MathJax containers. No raw component syntax or Markdown load-error surface remained visible.
- Cross-chapter transitions render as two link cards and two contextual alerts. The introduction and conclusion render two step sequences, one responsive columns block, one native folding block, badges, and source-code stream buttons.

## Required fidelity surfaces

- Fonts and typography: the hero and Markdown page reuse the source page's `LXGW WenKai`, `Fira Code`, and inherited article typography. English package naming remains optically balanced at desktop and mobile widths; inline code, headings, tables, and formulas retain the existing hierarchy.
- Spacing and layout rhythm: hero dimensions, content widths, outer margins, card padding, radii, and header offset match the source skeleton. The combined document adds section transitions only at the three source-document boundaries.
- Colors and tokens: Catppuccin Mocha surfaces, text, blue headings, borders, shadows, and callout tones are inherited. The project page changes the source's secondary purple ambient glow to the existing teal token for project identity without introducing a new palette.
- Image quality and asset fidelity: neither the source page nor the project documentation requires project imagery. Existing site avatar and icon assets are reused; no placeholder, CSS illustration, or custom replacement asset was introduced.
- Copy and content: all three supplied drafts are preserved verbatim inside the assembled document. Added copy is limited to a scope statement, reading route, cross-chapter transitions, quick links, final reproducibility checklist, and repository calls to action.

## Interaction, accessibility, and runtime checks

- `/code` renders one `precision-physkit` project card with a unique `/precision-physkit` homepage link and the project GitHub link.
- `/precision-physkit` resolves directly through Vue Router.
- The quick link to `#part-preprocess` updates the hash and reaches the intended chapter region.
- The native folding component toggles from closed to open.
- Header navigation, semantic headings, native links, code copy buttons, focus styles, and reduced-motion behavior remain inherited from the established page and component implementations.
- Desktop and mobile page widths remain stable. Tables and code blocks do not create document-level horizontal scrolling.
- No page-specific console error was observed. Existing MathJax component-version warnings and the known asynchronous Vue Router hash warning remain unrelated to this page implementation.

## Comparison history

### Pass 1 — passed

- The first rendered project page matched the existing Markdown page frame at both desktop and mobile sizes.
- The long document rendered all three supplied chapters, formulas, tables, highlighted code, explicit anchors, and selected rich components without an actionable layout or content defect.
- No P0/P1/P2 visual correction was required after the first comparison.

### Stream-button annotation pass — passed

- Requested dimensions: `200 × 50px`.
- Observed dimensions: `200 × 50px` on the component manual, project document desktop view, and project document mobile view.
- No component-level or page-level overflow was introduced.

## Implementation checklist

- [x] Register `/precision-physkit`.
- [x] Add a project card and repository link to `/code`.
- [x] Assemble the three supplied drafts into one public Markdown content file.
- [x] Add a cohesive introduction, reading route, chapter transitions, quick links, and reproducibility conclusion.
- [x] Use existing alerts, badges, steps, columns, folding, link cards, and stream buttons.
- [x] Apply the `200 × 50px` stream-button annotation responsively.
- [x] Verify desktop, mobile, anchor, folding, route, card-link, Markdown, MathJax, and build behavior.

## Follow-up polish

- P3: the required single-page document is intentionally very long. The quick index and chapter transition cards make it navigable, but a future dedicated sticky table of contents could further reduce return-to-top travel without changing the document content.

final result: passed

---

# Design QA — 星间 / Stellar Field (2026-09-22)

This section records the current task. The earlier project report above is retained unchanged.

## Source and implementation evidence

- Source visual truth: https://openai.com/zh-Hans-CN/index/gpt-6-astra/ and the user's `codex-clipboard-508af4bf-9f5b-4bfe-856d-89b5bce0469b.png` attachment (1676 × 1250).
- Implementation: http://localhost:5173/stellar-field, served from the remote repository through the requested SSH tunnel.
- Source screenshots: browser captures in this task named `astraHeroDesktop`, `astraCursorBefore`, `astraBlossomBefore`, `astraHeroMobile`, and `astraBlossomMobile`.
- Implementation screenshots: browser captures in this task named `stellarHeroFront`, `stellarCursorDensityFinal`, `stellarBlossomFinal`, `stellarHeroMobileFinal`, and `stellarBlossomMobileCorrect`.
- Screenshot storage: these captures were emitted as images in the task conversation. No filesystem screenshot path was returned by the supported browser API, and no local screenshot files were created. The identifiers above describe the actual in-session captures, not invented file paths.
- Desktop viewport: 1280 × 720 CSS px. Source canvas 1265 × 720 CSS px; implementation content 1269 px wide with a 648 px stage below the existing 72 px site header. Both were captured in the same browser at the same viewport; scrollbar/header differences were treated as intentional shell differences. Images were compared at the tool's native displayed scale, without resampling.
- Mobile viewport: 390 × 844 CSS px; implementation document width 379 px and stage height 776 px below its existing 68 px header. No document-level horizontal overflow. The source uses a full-viewport scene and deliberately crops the enlarged formation at the sides; the implementation also preserves a large scene.
- State: dark background, stable front-facing six/cursor/blossom formations, intermediate scattered reading state, rotated state, replay, pause, keyboard focus, and mobile layouts.
- Full-view comparison: source and implementation screenshots were emitted together in the same tool result for each formation and for mobile. Captures taken during smooth scroll or hot reload were excluded from settled-state judgments.
- Focused visual inspection: the full-view captures made the star cores, surrounding dust, outline geometry and control hit areas legible. The shader/core widths and the exact hit-test target at each mobile chapter button were additionally examined; separate raster crops were not required.

## Findings and comparison history

1. **[P1, fixed] Dim stars and absent galactic nucleus.** Initial stars resembled a faint line; the source has luminous white/blue cores, soft halos and a concentrated nucleus. Enlarged the bright-star sprites, introduced a nucleus-specific size/brightness increase, widened the soft halo, and separated cool dust from occasional warm stars. Subsequent front-facing comparisons show a luminous core and visible depth layers.
2. **[P1, fixed] Wrong cursor silhouette.** The first pass used a conventional pointer with a rectangular stem. Replaced it with the observed four-vertex, rounded navigation arrow. The final source/implementation pair shows the matching overall silhouette and scale.
3. **[P2, fixed] Flat dark background and overly uniform/thick stellar bands.** Added restrained blue/teal edge haze and visible deep-field stars. Kept luminous stars in the narrow streams, with broader dim dust outside; removed resampling that promoted distant dust points to bright stars. Final density uses 11,800 dust points, 132 bright stars and 360 background stars.
4. **[P2, fixed] Foreground captions crossed the desktop formations.** Moved the cursor and blossom captions into the left margin on wide screens; added phrase-level line breaks. Mobile captions remain beneath the formation.
5. **[P1, fixed] Moving prose intercepted mobile chapter controls.** DOM hit testing showed the story heading above the bottom buttons. Moved the controls into their own sticky overlay above the story. Post-fix hit tests resolve all three buttons to themselves, and chapter navigation reaches progress 0, 0.5 and 1.
6. **[P2, fixed] Missing first-arrival gathering animation.** The first mount now starts from scattered stars and gathers into the current scroll state in approximately 1.8 seconds. Reduced-motion mode skips this transition.
7. **[P2, fixed] Scattered particles behind the camera were projected into the image.** Independent staged-code review reproduced 406 behind-camera particles at a 90-degree yaw. Added near-plane clipping before perspective division. The regression calculation clips all 406 (668 including the near-plane margin), leaves zero behind-camera points visible, and bounds the projection scale to 15.2. The revised shader compiled and rendered normally in the browser.
8. **[P3, remaining] Independent reconstruction.** Star positions, exact spline curvature, glow falloff and drag damping use original procedural parameters. They are visually inspired by the source, not extracted official parameters or a pixel-identical copy. Source code requests were blocked by the source site's challenge; no verification was bypassed. The page attributes the visual reference and uses original story text.

## Required fidelity surfaces

- **Fonts/typography:** the reference's launch copy is intentionally replaced with original Chinese text. The project uses the site's sans-serif fallback stack, restrained monospaced labels, readable paragraph line height and explicit heading phrase breaks. No clipped heading or document overflow was observed at the tested sizes.
- **Spacing/layout:** the scene occupies the viewport below the existing site navigation. Five scroll sections align with the five morph anchors. Desktop captions avoid the main formation; mobile controls remain visible and independently clickable.
- **Colors/tokens:** near-black/teal space, pale blue/white luminous stars, sparse amber points and low-contrast blue dust. The site's existing header and footer are retained deliberately.
- **Image quality/asset fidelity:** the target is a real-time particle effect. It is implemented in native WebGL2 rather than replaced by a static image or video. Three-dimensional positions, glow, depth-dependent size, perspective and continuous particle correspondence remain active during interaction. The fallback is explicitly identified as a static star map.
- **Copy/content:** an original narrative about seeing, choosing and connecting, followed by collapsible component usage documentation. No launch-page article text is copied. A source link and independent-project attribution are present.

## Validation

- Source captured and directly compared with the implementation in the in-app browser at desktop and mobile widths.
- Scroll transitions observed in both directions; the same particle field gathers into three forms and scatters between them.
- Mouse drag visibly rotates the formation; pointer release leaves `data-dragging=false` and supports inertia.
- Direction keys and Home operate on the focused canvas; focus indication is visible.
- Pause/resume state, replay, reset-view and all three chapter buttons exercised. Chapter buttons also restore the front view.
- Component-use disclosure expands and collapses, with readable code and no horizontal document overflow.
- `/code` contains exactly one Stellar Field project card with a `/stellar-field` homepage link. The site's code/project navigation remains active.
- Navigating away leaves no canvas; returning creates one WebGL2 canvas and resumes the restored page state. Event/Observer/RAF/GPU cleanup was also reviewed in the implementation.
- Additional 1440 × 900 layout check passed with no horizontal overflow. Pause/resume and replay were rechecked at this size. A separate advanced clipped-screenshot probe returned mismatched page imagery and was excluded from evidence; fresh-page checks through the normal browser capture showed stars while paused, resumed animation and a complete scatter/regather cycle. No speculative screenshot-recovery logic was added.
- Final browser console inspection returned no errors or warnings for the page.
- Geometry validation checked finite target coordinates, buffer dimensions and unchanged deep-field positions between all four targets. Both JavaScript modules pass `node --check`.
- `npm run build` passes; the basic SEO generator includes the new route among 69 generated entries. Existing large-chunk warnings refer to unrelated Markdown/Mermaid bundles.
- No dependencies installed. No source assets hotlinked. All code changes and the development server remain on the authorized remote host.

## Limits

- Mobile viewport layout was tested in the desktop browser; physical touchscreen gestures, low-end GPU performance, WebGL context loss and an OS-level reduced-motion preference were not device-tested. Their implementation paths were reviewed.
- The visual reconstruction is deliberately disclosed as independent. Exact per-star positions and rendering pixels are not asserted to match the source.

## Implementation checklist

- [x] Reusable Vue component, documented props/events/methods and resource lifecycle.
- [x] Three formations, continuous scroll morphs, realistic layered star light and interaction.
- [x] Original project story, route, project card and navigation integration.
- [x] Desktop/mobile visual comparisons, primary interaction checks and production build.
- [x] Earlier QA records preserved; no unrelated code changes.

final result: passed
