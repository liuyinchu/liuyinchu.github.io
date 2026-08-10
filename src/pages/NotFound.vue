<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const titleRef = ref(null)

const focusTitle = () => {
  nextTick(() => titleRef.value?.focus({ preventScroll: true }))
}

onMounted(focusTitle)
watch(() => route.fullPath, focusTitle)
</script>

<template>
  <main class="not-found" data-page="not-found" aria-labelledby="not-found-title">
    <section class="not-found__console" aria-label="失联导航台">
      <div class="not-found__instrument" aria-hidden="true">
        <div class="not-found__unit-label">
          <span class="not-found__signal-dot"></span>
          <span>Route recovery unit</span>
        </div>

        <div class="not-found__code-mark">
          <span class="not-found__digit">4</span>

          <div class="not-found__radar-well">
            <svg
              class="not-found__radar"
              viewBox="0 0 240 240"
              fill="none"
              focusable="false"
            >
              <circle class="not-found__radar-ring" cx="120" cy="120" r="92" />
              <circle class="not-found__radar-ring not-found__radar-ring--inner" cx="120" cy="120" r="58" />
              <path class="not-found__radar-axis" d="M120 22v196M22 120h196" />
              <path class="not-found__radar-axis" d="m50.7 50.7 138.6 138.6m0-138.6L50.7 189.3" />

              <g class="not-found__scanner">
                <path class="not-found__scanner-fill" d="M120 120 112 30a91 91 0 0 1 56 20Z" />
                <path class="not-found__scanner-line" d="M120 120 168 50" />
              </g>

              <path
                class="not-found__route-line"
                d="M48 154c26-4 27-32 49-34 25-2 26 33 49 29 17-3 19-23 36-32"
              />
              <circle class="not-found__route-node" cx="48" cy="154" r="6" />
              <circle class="not-found__route-node" cx="182" cy="117" r="6" />

              <g class="not-found__break-mark">
                <path d="m112 137 7-12 7 12" />
                <path d="M119 125v16" />
              </g>

              <g class="not-found__beacon">
                <circle cx="120" cy="120" r="12" />
                <circle cx="120" cy="120" r="4" />
              </g>
            </svg>
          </div>

          <span class="not-found__digit">4</span>
        </div>

        <div class="not-found__telemetry">
          <span><small>Status</small> Off grid</span>
          <span><small>Node</small> 404</span>
        </div>
      </div>

      <div class="not-found__content">
        <p class="not-found__eyebrow">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="5" cy="12" r="2.25" />
            <circle cx="19" cy="12" r="2.25" />
            <path d="M7.25 12h3.25m3 0h3.25M11 8.75l2 2.1-2 2.4" />
          </svg>
          <span>Navigation · signal lost</span>
        </p>

        <h1 id="not-found-title" ref="titleRef" tabindex="-1">这条路线偏离了坐标</h1>
        <p class="not-found__message">
          没有在当前站点找到这个地址。你可以返回已知区域，或从下面的坐标继续探索。
        </p>

        <div class="not-found__path">
          <span class="not-found__path-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span class="not-found__path-copy">
            <span class="not-found__path-label">Lost coordinate</span>
            <code dir="ltr">{{ route.path }}</code>
          </span>
        </div>

        <nav class="not-found__actions" aria-label="404 页面快捷导航">
          <RouterLink class="not-found__link not-found__link--primary" to="/">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m3.5 10.5 8.5-7 8.5 7" />
              <path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" />
            </svg>
            <span>返回首页</span>
            <svg class="not-found__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </RouterLink>

          <RouterLink class="not-found__link" to="/space1">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3.5 5.5c3.2-.8 5.8-.2 8.5 1.8v13c-2.7-2-5.3-2.6-8.5-1.8Z" />
              <path d="M20.5 5.5c-3.2-.8-5.8-.2-8.5 1.8v13c2.7-2 5.3-2.6 8.5-1.8Z" />
            </svg>
            <span>随记</span>
          </RouterLink>

          <RouterLink class="not-found__link" to="/rd">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 6.5h7l2 2h9v10.75A1.75 1.75 0 0 1 19.25 21H4.75A1.75 1.75 0 0 1 3 19.25Z" />
              <path d="M3 8.5h18" />
            </svg>
            <span>资源</span>
          </RouterLink>

          <RouterLink class="not-found__link" to="/code">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m7 9 3 3-3 3m5 0h5" />
            </svg>
            <span>项目</span>
          </RouterLink>
        </nav>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  --nf-bg: #202230;
  --nf-surface: #252837;
  --nf-surface-soft: #292c3c;
  --nf-surface-deep: #1c1e2a;
  --nf-shadow-dark: rgba(8, 9, 15, 0.68);
  --nf-shadow-light: rgba(65, 69, 94, 0.38);
  --nf-edge: #737a94;
  --nf-text: #eef1ff;
  --nf-muted: #b8bfd8;
  --nf-blue: #9fc4ff;
  --nf-mauve: #d4b8ff;
  --nf-display: ui-rounded, "SF Pro Rounded", "Avenir Next", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  --nf-body: "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
  --nf-mono: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace;

  position: relative;
  isolation: isolate;
  display: grid;
  min-height: calc(100dvh - var(--header-height, 4.5rem));
  box-sizing: border-box;
  place-items: center;
  overflow-x: clip;
  padding: clamp(6.5rem, 11vh, 8rem) clamp(1rem, 4vw, 3.5rem) clamp(3.25rem, 7vh, 5rem);
  color: var(--nf-text);
  background: var(--nf-bg);
  font-family: var(--nf-body);
}

.not-found::before,
.not-found::after {
  position: absolute;
  z-index: -1;
  width: clamp(10rem, 18vw, 17rem);
  aspect-ratio: 1;
  border: 1px solid rgba(115, 122, 148, 0.12);
  border-radius: 50%;
  box-shadow:
    inset 10px 10px 22px rgba(8, 9, 15, 0.28),
    inset -10px -10px 22px rgba(65, 69, 94, 0.14);
  content: "";
  pointer-events: none;
}

.not-found::before {
  top: 13%;
  left: -5rem;
}

.not-found::after {
  right: -6rem;
  bottom: 3%;
}

.not-found__console {
  position: relative;
  display: grid;
  grid-template-columns: minmax(21rem, 0.9fr) minmax(0, 1.15fr);
  gap: clamp(2rem, 4vw, 4rem);
  width: min(100%, 65rem);
  box-sizing: border-box;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border: 1px solid rgba(115, 122, 148, 0.4);
  border-radius: clamp(1.6rem, 3vw, 2.4rem);
  background: var(--nf-surface);
  box-shadow:
    -18px -18px 38px var(--nf-shadow-light),
    20px 20px 44px var(--nf-shadow-dark);
}

.not-found__console::before,
.not-found__console::after {
  position: absolute;
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: var(--nf-surface-deep);
  box-shadow:
    inset 1px 1px 2px rgba(8, 9, 15, 0.8),
    inset -1px -1px 2px rgba(92, 97, 127, 0.35);
  content: "";
}

.not-found__console::before {
  top: 1.25rem;
  left: 1.25rem;
}

.not-found__console::after {
  right: 1.25rem;
  bottom: 1.25rem;
}

.not-found__instrument {
  display: grid;
  min-width: 0;
  align-content: space-between;
  gap: 1.25rem;
  padding: clamp(1.25rem, 2.4vw, 1.75rem);
  border-radius: 1.65rem;
  background: var(--nf-surface-soft);
  box-shadow:
    inset 9px 9px 20px rgba(8, 9, 15, 0.56),
    inset -9px -9px 20px rgba(67, 72, 98, 0.31);
}

.not-found__unit-label,
.not-found__eyebrow,
.not-found__path-label,
.not-found__telemetry small {
  font-family: var(--nf-mono);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.not-found__unit-label {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--nf-muted);
  font-size: 0.7rem;
}

.not-found__signal-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--nf-mauve);
  box-shadow: 0 0 0 0.28rem rgba(212, 184, 255, 0.1);
}

.not-found__code-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.35rem, 1.2vw, 0.8rem);
}

.not-found__digit {
  color: var(--nf-text);
  font-family: var(--nf-display);
  font-size: clamp(4.8rem, 7.5vw, 7.2rem);
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -0.08em;
  text-shadow:
    -3px -3px 6px rgba(90, 95, 124, 0.32),
    4px 4px 8px rgba(8, 9, 15, 0.72);
}

.not-found__radar-well {
  display: grid;
  width: clamp(9rem, 14vw, 12.5rem);
  aspect-ratio: 1;
  flex: 0 0 auto;
  place-items: center;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid rgba(115, 122, 148, 0.5);
  border-radius: 50%;
  background: var(--nf-surface-deep);
  box-shadow:
    inset 9px 9px 18px rgba(6, 7, 12, 0.76),
    inset -8px -8px 18px rgba(62, 66, 91, 0.28),
    0 0 0 0.45rem rgba(29, 31, 44, 0.62);
}

.not-found__radar {
  display: block;
  width: 100%;
  height: 100%;
  color: var(--nf-blue);
  pointer-events: none;
}

.not-found__radar-ring,
.not-found__radar-axis {
  stroke: rgba(159, 196, 255, 0.25);
  stroke-width: 1.35;
}

.not-found__radar-ring--inner {
  stroke-dasharray: 4 7;
}

.not-found__scanner {
  transform-origin: 120px 120px;
  animation: radar-sweep 9s linear infinite;
}

.not-found__scanner-fill {
  fill: rgba(159, 196, 255, 0.055);
}

.not-found__scanner-line,
.not-found__route-line,
.not-found__route-node,
.not-found__beacon,
.not-found__break-mark {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.not-found__scanner-line {
  stroke-width: 1.5;
}

.not-found__route-line {
  stroke-width: 3;
  stroke-dasharray: 10 8;
  animation: route-pulse 2.8s linear infinite;
}

.not-found__route-node {
  fill: var(--nf-surface-deep);
  stroke-width: 3;
}

.not-found__break-mark {
  color: var(--nf-mauve);
  stroke-width: 3;
}

.not-found__beacon {
  fill: var(--nf-surface-deep);
  stroke-width: 2.5;
}

.not-found__telemetry {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

.not-found__telemetry > span {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.65rem 0.75rem;
  color: var(--nf-text);
  font-family: var(--nf-mono);
  font-size: 0.78rem;
  border-radius: 0.75rem;
  background: var(--nf-surface);
  box-shadow:
    -4px -4px 8px rgba(67, 72, 98, 0.2),
    5px 5px 10px rgba(8, 9, 15, 0.48);
}

.not-found__telemetry small {
  color: var(--nf-muted);
  font-size: 0.58rem;
}

.not-found__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 0.4rem 0;
}

.not-found__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1.25rem;
  color: var(--nf-mauve);
  font-size: 0.72rem;
}

.not-found__eyebrow svg {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.not-found h1 {
  margin: 0;
  color: var(--nf-text);
  font-family: var(--nf-display);
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 750;
  line-height: 1.12;
  letter-spacing: -0.045em;
}

.not-found h1:focus {
  outline: none;
}

.not-found__message {
  max-width: 34rem;
  margin: 1.15rem 0 0;
  color: var(--nf-muted);
  font-size: clamp(1rem, 1.4vw, 1.08rem);
  line-height: 1.75;
}

.not-found__path {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: center;
  margin: clamp(1.5rem, 3vw, 2rem) 0;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(115, 122, 148, 0.5);
  border-radius: 1rem;
  background: var(--nf-surface-deep);
  box-shadow:
    inset 6px 6px 12px rgba(6, 7, 12, 0.68),
    inset -5px -5px 12px rgba(60, 64, 88, 0.23);
}

.not-found__path-icon {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  color: var(--nf-blue);
  border-radius: 0.7rem;
  background: var(--nf-surface-soft);
  box-shadow:
    -3px -3px 7px rgba(61, 66, 90, 0.28),
    4px 4px 8px rgba(7, 8, 13, 0.62);
}

.not-found__path-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.not-found__path-copy {
  display: grid;
  min-width: 0;
  gap: 0.34rem;
}

.not-found__path-label {
  color: var(--nf-muted);
  font-size: 0.62rem;
}

.not-found__path code {
  overflow-wrap: anywhere;
  unicode-bidi: plaintext;
  color: var(--nf-blue);
  font-family: var(--nf-mono);
  font-size: 0.86rem;
  line-height: 1.5;
}

.not-found__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.not-found__link {
  display: inline-flex;
  min-width: 0;
  min-height: 3.45rem;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 0.85rem;
  color: var(--nf-text);
  font-size: 0.91rem;
  font-weight: 700;
  line-height: 1.25;
  text-decoration: none;
  border: 1px solid var(--nf-edge);
  border-radius: 0.9rem;
  background: var(--nf-surface-soft);
  box-shadow:
    -5px -5px 11px rgba(66, 71, 97, 0.28),
    6px 6px 13px rgba(7, 8, 13, 0.62);
  transition: color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.not-found__link svg {
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.not-found__link--primary {
  grid-column: 1 / -1;
  justify-content: flex-start;
  min-height: 3.8rem;
  padding-inline: 1.15rem;
  color: var(--nf-blue);
  border-color: var(--nf-blue);
}

.not-found__link--primary .not-found__arrow {
  margin-left: auto;
}

.not-found__link:active {
  transform: translateY(1px);
  box-shadow:
    inset 4px 4px 9px rgba(7, 8, 13, 0.66),
    inset -4px -4px 9px rgba(66, 71, 97, 0.24);
}

.not-found__link:focus-visible {
  outline: 3px solid var(--nf-mauve);
  outline-offset: 4px;
}

@media (hover: hover) {
  .not-found__link:hover {
    color: var(--nf-blue);
    transform: translateY(-2px);
    box-shadow:
      -7px -7px 14px rgba(66, 71, 97, 0.34),
      8px 8px 16px rgba(7, 8, 13, 0.67);
  }
}

@keyframes radar-sweep {
  to {
    transform: rotate(360deg);
  }
}

@keyframes route-pulse {
  to {
    stroke-dashoffset: -36;
  }
}

@media (max-width: 860px) {
  .not-found__console {
    grid-template-columns: 1fr;
    width: min(100%, 42rem);
  }

  .not-found__instrument {
    min-height: 16rem;
  }

  .not-found__code-mark {
    margin-block: -0.35rem;
  }

  .not-found__radar-well {
    width: clamp(8.5rem, 26vw, 11rem);
  }

  .not-found__digit {
    font-size: clamp(4.5rem, 15vw, 6.5rem);
  }
}

@media (max-width: 520px) {
  .not-found {
    min-height: calc(100dvh - var(--header-height, 4rem));
    place-items: start center;
    padding: 5.75rem max(0.9rem, env(safe-area-inset-right)) max(2.5rem, env(safe-area-inset-bottom)) max(0.9rem, env(safe-area-inset-left));
  }

  .not-found::before,
  .not-found::after {
    display: none;
  }

  .not-found__console {
    gap: 1.25rem;
    padding: 1rem;
    border-radius: 1.45rem;
    box-shadow:
      -10px -10px 24px rgba(65, 69, 94, 0.28),
      12px 12px 28px rgba(8, 9, 15, 0.62);
  }

  .not-found__console::before,
  .not-found__console::after {
    display: none;
  }

  .not-found__instrument {
    min-height: 0;
    gap: 0.8rem;
    padding: 1rem;
    border-radius: 1.15rem;
  }

  .not-found__unit-label {
    font-size: 0.62rem;
  }

  .not-found__code-mark {
    margin: -0.15rem 0;
  }

  .not-found__radar-well {
    width: clamp(7.25rem, 35vw, 9rem);
    padding: 0.45rem;
  }

  .not-found__digit {
    font-size: clamp(3.7rem, 18vw, 5rem);
  }

  .not-found__telemetry > span {
    padding: 0.55rem 0.65rem;
    font-size: 0.7rem;
  }

  .not-found__content {
    padding: 0.2rem 0.2rem 0.35rem;
  }

  .not-found__eyebrow {
    margin-bottom: 0.85rem;
    font-size: 0.65rem;
  }

  .not-found h1 {
    font-size: clamp(1.75rem, 8vw, 2.25rem);
  }

  .not-found__message {
    margin-top: 0.8rem;
    font-size: 0.96rem;
    line-height: 1.65;
  }

  .not-found__path {
    margin: 1.2rem 0;
    padding: 0.75rem;
  }

  .not-found__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.7rem;
  }

  .not-found__link--primary {
    grid-column: auto;
  }

  .not-found__arrow {
    display: none;
  }

  .not-found__link {
    min-height: 3.7rem;
  }
}

@media (max-width: 360px) {
  .not-found__link {
    padding-inline: 0.65rem;
  }

}

@media (min-width: 700px) and (max-height: 650px) {
  .not-found {
    place-items: start center;
    padding-block: 5.5rem 2rem;
  }

  .not-found__console {
    grid-template-columns: minmax(17rem, 0.82fr) minmax(0, 1.18fr);
    gap: 1.5rem;
    width: min(100%, 58rem);
    padding: 1.15rem;
  }

  .not-found__instrument {
    min-height: 0;
    gap: 0.7rem;
    padding: 1rem;
  }

  .not-found__radar-well {
    width: 8rem;
  }

  .not-found__digit {
    font-size: 4.25rem;
  }

  .not-found__eyebrow {
    margin-bottom: 0.7rem;
  }

  .not-found__message {
    margin-top: 0.7rem;
    line-height: 1.55;
  }

  .not-found__path {
    margin-block: 0.9rem;
    padding-block: 0.65rem;
  }

  .not-found__link {
    min-height: 3rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found__scanner,
  .not-found__route-line {
    animation: none;
  }

  .not-found__link {
    transition: none;
  }

  .not-found__link:active,
  .not-found__link:hover {
    transform: none;
  }
}

@media (forced-colors: active) {
  .not-found,
  .not-found__console,
  .not-found__instrument,
  .not-found__radar-well,
  .not-found__telemetry > span,
  .not-found__path,
  .not-found__path-icon,
  .not-found__link {
    color: CanvasText;
    border: 1px solid CanvasText;
    background: Canvas;
    box-shadow: none;
  }

  .not-found__link--primary,
  .not-found__eyebrow,
  .not-found__path code,
  .not-found__radar,
  .not-found__path-icon {
    color: LinkText;
  }

  .not-found__link:focus-visible {
    outline-color: Highlight;
  }
}
</style>
