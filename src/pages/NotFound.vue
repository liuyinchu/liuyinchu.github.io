<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="not-found" data-page="not-found" aria-labelledby="not-found-title">
    <div class="not-found__glow not-found__glow--mauve" aria-hidden="true"></div>
    <div class="not-found__glow not-found__glow--blue" aria-hidden="true"></div>

    <section class="not-found__card">
      <p class="not-found__eyebrow">Route not found</p>
      <p class="not-found__code" aria-hidden="true">404</p>

      <h1 id="not-found-title">这里暂时没有页面</h1>
      <p class="not-found__message">
        你访问的地址可能已被移动、删除，或者从未存在过。可以从下面的入口继续探索。
      </p>

      <div class="not-found__path">
        <span>请求路径</span>
        <code>{{ route.path }}</code>
      </div>

      <nav class="not-found__actions" aria-label="404 页面快捷导航">
        <RouterLink class="not-found__link not-found__link--primary" to="/">
          返回首页
        </RouterLink>
        <RouterLink class="not-found__link" to="/space1">进入随记</RouterLink>
        <RouterLink class="not-found__link" to="/rd">查看资源</RouterLink>
        <RouterLink class="not-found__link" to="/code">代码与项目</RouterLink>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.not-found {
  --nf-base: var(--ctp-mocha-base, #1e1e2e);
  --nf-mantle: var(--ctp-mocha-mantle, #181825);
  --nf-surface: var(--ctp-mocha-surface0, #313244);
  --nf-border: var(--ctp-mocha-surface1, #45475a);
  --nf-text: var(--ctp-mocha-text, #cdd6f4);
  --nf-subtext: var(--ctp-mocha-subtext0, #a6adc8);
  --nf-mauve: var(--ctp-mocha-mauve, #cba6f7);
  --nf-blue: var(--ctp-mocha-blue, #89b4fa);
  --nf-lavender: var(--ctp-mocha-lavender, #b4befe);

  position: relative;
  isolation: isolate;
  display: grid;
  min-height: calc(100dvh - var(--header-height, 4.5rem));
  box-sizing: border-box;
  place-items: center;
  overflow: hidden;
  padding: clamp(6.5rem, 12vh, 8rem) clamp(1rem, 4vw, 3rem) clamp(3rem, 8vh, 5rem);
  color: var(--nf-text);
  background:
    linear-gradient(rgba(137, 180, 250, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(137, 180, 250, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 50% 12%, rgba(203, 166, 247, 0.12), transparent 38%),
    linear-gradient(150deg, var(--nf-base), var(--nf-mantle));
  background-size: 34px 34px, 34px 34px, auto, auto;
}

.not-found__glow {
  position: absolute;
  z-index: -1;
  width: clamp(15rem, 34vw, 30rem);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(28px);
  opacity: 0.2;
  pointer-events: none;
  animation: glow-drift 9s ease-in-out infinite alternate;
}

.not-found__glow--mauve {
  top: 8%;
  left: -10%;
  background: var(--nf-mauve);
}

.not-found__glow--blue {
  right: -12%;
  bottom: -18%;
  background: var(--nf-blue);
  animation-delay: -4s;
}

.not-found__card {
  width: min(100%, 46rem);
  box-sizing: border-box;
  padding: clamp(1.5rem, 4vw, 3.25rem);
  text-align: center;
  border: 1px solid rgba(69, 71, 90, 0.78);
  border: 1px solid color-mix(in srgb, var(--nf-border) 78%, transparent);
  border-radius: clamp(1.25rem, 3vw, 2rem);
  background: rgba(49, 50, 68, 0.86);
  background: color-mix(in srgb, var(--nf-surface) 78%, transparent);
  box-shadow:
    0 1.5rem 4rem rgba(0, 0, 0, 0.28),
    inset 0 1px rgba(255, 255, 255, 0.045);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  backdrop-filter: blur(22px) saturate(1.08);
  animation: card-arrive 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.not-found__eyebrow {
  margin: 0 0 1.5rem;
  color: var(--nf-lavender);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.not-found__code {
  margin: 0;
  font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: clamp(5rem, 17vw, 9.5rem);
  font-weight: 800;
  line-height: 0.78;
  letter-spacing: -0.08em;
  color: transparent;
  background: linear-gradient(120deg, var(--nf-mauve), var(--nf-blue));
  background-clip: text;
  -webkit-background-clip: text;
  filter: drop-shadow(0 0.6rem 1.2rem rgba(137, 180, 250, 0.14));
}

.not-found h1 {
  margin: clamp(1.75rem, 4vw, 2.5rem) 0 0;
  font-size: clamp(1.7rem, 4vw, 2.45rem);
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.not-found__message {
  max-width: 34rem;
  margin: 1rem auto 0;
  color: var(--nf-subtext);
  font-size: clamp(0.96rem, 2vw, 1.05rem);
  line-height: 1.8;
}

.not-found__path {
  display: grid;
  gap: 0.45rem;
  margin: clamp(1.5rem, 4vw, 2.25rem) 0;
  padding: 0.9rem 1rem;
  text-align: left;
  border: 1px solid rgba(69, 71, 90, 0.7);
  border: 1px solid color-mix(in srgb, var(--nf-border) 70%, transparent);
  border-radius: 0.85rem;
  background: rgba(24, 24, 37, 0.82);
  background: color-mix(in srgb, var(--nf-mantle) 82%, transparent);
}

.not-found__path span {
  color: var(--nf-subtext);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.not-found__path code {
  overflow-wrap: anywhere;
  color: var(--nf-blue);
  font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.88rem;
  line-height: 1.55;
}

.not-found__actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.not-found__link {
  display: inline-flex;
  min-height: 46px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.85rem;
  color: var(--nf-text);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
  text-decoration: none;
  border: 1px solid var(--nf-border);
  border-radius: 0.8rem;
  background: rgba(24, 24, 37, 0.42);
  transition: transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease;
}

.not-found__link:hover {
  border-color: var(--nf-blue);
  background: rgba(137, 180, 250, 0.11);
  transform: translateY(-2px);
}

.not-found__link--primary {
  color: var(--nf-mantle);
  border-color: transparent;
  background: linear-gradient(125deg, var(--nf-mauve), var(--nf-blue));
}

.not-found__link--primary:hover {
  border-color: transparent;
  background: linear-gradient(125deg, var(--nf-mauve), var(--nf-blue));
}

.not-found__link:focus-visible {
  outline: 3px solid var(--nf-lavender);
  outline-offset: 3px;
}

@keyframes card-arrive {
  from {
    opacity: 0;
    transform: translateY(0.8rem) scale(0.99);
  }
}

@keyframes glow-drift {
  to {
    transform: translate3d(1.25rem, -1rem, 0) scale(1.06);
  }
}

@media (max-width: 640px) {
  .not-found {
    min-height: calc(100dvh - var(--header-height, 4rem));
    padding: 5.75rem max(0.85rem, env(safe-area-inset-right)) max(2rem, env(safe-area-inset-bottom)) max(0.85rem, env(safe-area-inset-left));
  }

  .not-found__card {
    padding: 1.5rem 1rem;
    border-radius: 1.25rem;
  }

  .not-found__eyebrow {
    margin-bottom: 1.25rem;
  }

  .not-found__actions {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .not-found__link {
    width: 100%;
    min-height: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .not-found__card,
  .not-found__glow,
  .not-found__link {
    animation: none;
    transition: none;
  }

  .not-found__link:hover {
    transform: none;
  }
}

@media (forced-colors: active) {
  .not-found__card,
  .not-found__path,
  .not-found__link {
    border: 1px solid CanvasText;
  }

  .not-found__code,
  .not-found__link--primary {
    color: LinkText;
    background: Canvas;
  }
}
</style>
