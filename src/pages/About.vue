<script setup>
import TypingTitle from '../components/TypingTitle.vue'

const typingLines = [
  '欢迎来到关于页。',
  '从这里进入自我介绍、我的学术与版权说明。',
  '记录，为了更深刻地思考。',
  'Explore unknown possibilities.',
]

const aboutLinks = [
  {
    title: '自我介绍',
    eyebrow: 'Personal Profile',
    index: '01',
    to: '/about/self',
    desc: '保留原 About 内容，暂时作为个人介绍的起点。',
    detail: 'Identity',
  },
  {
    title: '我的学术',
    eyebrow: 'Academic Work',
    index: '02',
    to: '/academic',
    desc: '进入学术记录、科研工具和后续继续整理的学习材料。',
    detail: 'Research',
  },
  {
    title: '版权说明',
    eyebrow: 'Credits & License',
    index: '03',
    to: '/credit',
    desc: '查看素材致谢、代码许可和内容版权边界。',
    detail: 'Credits',
  },
]
</script>

<template>
  <main class="about-page" aria-labelledby="about-title">
    <section class="about-hero">
      <div class="hero-copy">
        <p class="eyebrow">ABOUT HUB</p>
        <h1 id="about-title">关于</h1>
        <p class="hero-lead">
          这里是站主相关内容的入口页：自我介绍、学术内容和版权说明会在这里分流。
        </p>
      </div>

      <div class="typing-surface" aria-label="关于页打字机">
        <div class="surface-header" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <TypingTitle :initial-texts="typingLines" />
      </div>
    </section>

    <section class="about-system" aria-label="关于页面入口">
      <div class="system-copy">
        <p class="eyebrow">DIRECTORY SURFACE</p>
        <h2>选择你要进入的部分</h2>
      </div>

      <nav class="link-matrix">
        <RouterLink
          v-for="item in aboutLinks"
          :key="item.to"
          class="matrix-link"
          :to="item.to"
        >
          <span class="matrix-index">{{ item.index }}</span>
          <span class="matrix-main">
            <span class="matrix-eyebrow">{{ item.eyebrow }}</span>
            <span class="matrix-title">{{ item.title }}</span>
            <span class="matrix-desc">{{ item.desc }}</span>
          </span>
          <span class="matrix-detail">{{ item.detail }}</span>
          <span class="matrix-arrow" aria-hidden="true">→</span>
        </RouterLink>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  --about-line: rgba(var(--ctp-mocha-overlay0-rgb), 0.36);
  --about-line-strong: rgba(var(--ctp-mocha-sky-rgb), 0.36);
  position: relative;
  min-height: calc(100svh - 72px);
  overflow: clip;
  isolation: isolate;
  color: var(--ctp-mocha-text);
  background:
    radial-gradient(circle at 12% 10%, rgba(var(--ctp-mocha-mauve-rgb), 0.20), transparent 26rem),
    radial-gradient(circle at 86% 16%, rgba(var(--ctp-mocha-sky-rgb), 0.18), transparent 28rem),
    linear-gradient(180deg, var(--ctp-mocha-crust), #10111c 54%, var(--ctp-mocha-base));
}

.about-page::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.68) 44%, transparent 100%);
}

.about-page::after {
  content: '';
  position: absolute;
  top: clamp(7rem, 18vw, 14rem);
  right: max(-22vw, -18rem);
  z-index: -1;
  width: min(58vw, 760px);
  aspect-ratio: 1;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.22);
  border-radius: 999px;
  background:
    conic-gradient(from 210deg, transparent, rgba(var(--ctp-mocha-sky-rgb), 0.18), transparent 34%),
    radial-gradient(circle, rgba(var(--ctp-mocha-surface0-rgb), 0.08), transparent 58%);
  filter: blur(0.2px);
}

.about-hero,
.about-system {
  width: min(1180px, calc(100% - clamp(2rem, 8vw, 8rem)));
  margin: 0 auto;
}

.about-hero {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.82fr);
  gap: clamp(2.5rem, 7vw, 6.5rem);
  align-items: center;
  min-height: min(660px, calc(100svh - 72px));
  padding: clamp(3.5rem, 6vw, 5rem) 0 clamp(2rem, 5vw, 4rem);
}

.hero-copy {
  position: relative;
  display: grid;
  gap: 1.2rem;
}

.hero-copy::before {
  content: '03';
  position: absolute;
  top: -5rem;
  left: -0.14em;
  z-index: -1;
  color: transparent;
  font-family: 'Inter', sans-serif;
  font-size: clamp(7rem, 19vw, 17rem);
  font-weight: 900;
  line-height: 1;
  -webkit-text-stroke: 1px rgba(var(--ctp-mocha-overlay1-rgb), 0.18);
}

.eyebrow,
.surface-header,
.matrix-index,
.matrix-eyebrow,
.matrix-detail,
.matrix-arrow {
  margin: 0;
  font-family: 'Fira Code', monospace;
  letter-spacing: 0;
  text-transform: uppercase;
}

.eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.82rem;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(4.8rem, 11vw, 9.5rem);
  font-weight: 900;
  line-height: 0.88;
}

.hero-lead {
  max-width: 36rem;
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.05rem, 1.7vw, 1.24rem);
  line-height: 1.8;
}

.typing-surface {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--about-line);
  border-radius: 8px;
  min-height: 300px;
  display: grid;
  align-content: center;
  background:
    linear-gradient(135deg, rgba(var(--ctp-mocha-surface1-rgb), 0.84), rgba(var(--ctp-mocha-base-rgb), 0.42)),
    rgba(var(--ctp-mocha-crust-rgb), 0.48);
  box-shadow:
    0 34px 90px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.typing-surface::before {
  content: '';
  position: absolute;
  inset: -30% -20% auto;
  height: 62%;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-mauve-rgb), 0.28), rgba(var(--ctp-mocha-sky-rgb), 0.24), rgba(var(--ctp-mocha-green-rgb), 0.16));
  filter: blur(34px);
  opacity: 0.74;
}

.typing-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, transparent 0 47%, rgba(255, 255, 255, 0.07) 47% 47.5%, transparent 47.5%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 42%);
}

.surface-header {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
  display: flex;
  gap: 0.45rem;
}

.surface-header span {
  width: 0.58rem;
  height: 0.58rem;
  border-radius: 999px;
  background: rgba(var(--ctp-mocha-overlay2-rgb), 0.64);
}

.surface-header span:nth-child(1) {
  background: var(--ctp-mocha-red);
}

.surface-header span:nth-child(2) {
  background: var(--ctp-mocha-yellow);
}

.surface-header span:nth-child(3) {
  background: var(--ctp-mocha-green);
}

.typing-surface :deep(.typing-container) {
  position: relative;
  z-index: 1;
  padding: clamp(3.8rem, 8vw, 5.5rem) clamp(1rem, 4vw, 2rem);
}

.typing-surface :deep(.typing-content) {
  width: min(100%, 36rem);
  min-height: 4.8em;
  font-size: clamp(1.6rem, 3.2vw, 2.65rem);
  letter-spacing: 0 !important;
  line-height: 1.35;
}

.about-system {
  display: grid;
  grid-template-columns: minmax(220px, 0.34fr) minmax(0, 1fr);
  gap: clamp(2rem, 6vw, 5rem);
  align-items: start;
  padding: 0 0 clamp(4rem, 8vw, 7rem);
}

.system-copy {
  position: sticky;
  top: 6rem;
  display: grid;
  gap: 0.9rem;
}

.system-copy h2 {
  margin: 0;
  max-width: 14rem;
  color: var(--ctp-mocha-text);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 850;
  line-height: 1.08;
}

.link-matrix {
  display: grid;
  border-top: 1px solid var(--about-line);
}

.matrix-link {
  position: relative;
  display: grid;
  grid-template-columns: 3.5rem minmax(12rem, 0.65fr) minmax(6rem, 0.26fr) 2rem;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  min-height: 10.5rem;
  border-bottom: 1px solid var(--about-line);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.matrix-link::before {
  content: '';
  position: absolute;
  inset: 1rem -1rem;
  z-index: -1;
  border-radius: 8px;
  opacity: 0;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.14), transparent 56%),
    rgba(var(--ctp-mocha-surface0-rgb), 0.28);
  transform: translateX(-0.4rem) scaleX(0.98);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.matrix-link:hover,
.matrix-link:focus-visible {
  border-color: var(--about-line-strong);
  transform: translateX(0.35rem);
}

.matrix-link:hover::before,
.matrix-link:focus-visible::before {
  opacity: 1;
  transform: translateX(0) scaleX(1);
}

.matrix-link:focus-visible {
  outline: 3px solid rgba(var(--ctp-mocha-sky-rgb), 0.32);
  outline-offset: 4px;
}

.matrix-index {
  color: var(--ctp-mocha-overlay2);
  font-size: 0.78rem;
}

.matrix-main {
  display: grid;
  gap: 0.55rem;
}

.matrix-eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.74rem;
}

.matrix-title {
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2.1rem, 4vw, 3.6rem);
  font-weight: 800;
  line-height: 1;
}

.matrix-desc {
  max-width: 28rem;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1rem;
  line-height: 1.72;
}

.matrix-detail {
  justify-self: end;
  color: var(--ctp-mocha-overlay2);
  font-size: 0.78rem;
}

.matrix-arrow {
  justify-self: end;
  color: var(--ctp-mocha-green);
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.matrix-link:hover .matrix-arrow,
.matrix-link:focus-visible .matrix-arrow {
  transform: translateX(0.35rem);
}

@media (max-width: 980px) {
  .about-hero,
  .about-system {
    grid-template-columns: 1fr;
  }

  .about-hero {
    min-height: auto;
  }

  .system-copy {
    position: static;
  }

  .system-copy h2 {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .about-hero,
  .about-system {
    width: min(100% - 2rem, 1180px);
  }

  .hero-copy h1 {
    font-size: 4.4rem;
  }

  .typing-surface {
    min-height: 280px;
  }

  .matrix-link {
    grid-template-columns: 2.4rem minmax(0, 1fr) 2rem;
    min-height: 12.5rem;
    gap: 0.9rem;
    padding: 1.2rem 0;
  }

  .matrix-detail {
    grid-column: 2;
    justify-self: start;
  }

  .matrix-arrow {
    grid-column: 3;
    grid-row: 1;
  }
}
</style>
