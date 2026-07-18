<script setup>
const loungeLinks = [
  {
    label: '访客中心',
    eyebrow: 'Visitor Center',
    to: '/visitor-center',
    desc: '来自哪，将去往哪，又在何处留下足迹 ...',
    meta: 'PUBLIC NODE 01',
  },
  {
    label: '网络邻居',
    eyebrow: 'Cyber Neighbors',
    to: '/space2',
    desc: '通向朋友们的个人站点，保留旧互联网时代互相串门的温度。',
    meta: 'PUBLIC NODE 02',
  },
]
</script>

<template>
  <main class="lounge-page" aria-labelledby="lounge-title">
    <section class="lounge-hero">
      <div class="hero-copy">
        <p class="kicker">CYBER LOUNGE</p>
        <h1 id="lounge-title">赛博会客厅</h1>
        <p class="hero-text">
          “我教你们的不是邻人，而是朋友。<br />
          让朋友成为大地的节日。”
        </p>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <img src="/bg/skadi.jpeg" alt="" loading="eager" decoding="async" />
        <div class="monitor-frame">
          <span class="monitor-label">OPEN CHANNEL</span>
          <span class="monitor-readout">02 ROUTES READY</span>
        </div>
      </div>
    </section>

    <section class="lounge-grid" aria-label="会客厅入口">
      <RouterLink
        v-for="item in loungeLinks"
        :key="item.to"
        :to="item.to"
        class="lounge-card"
      >
        <span class="card-meta">{{ item.meta }}</span>
        <span class="card-eyebrow">{{ item.eyebrow }}</span>
        <span class="card-title">{{ item.label }}</span>
        <span class="card-desc">{{ item.desc }}</span>
        <span class="card-action">进入</span>
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.lounge-page {
  position: relative;
  min-height: calc(100vh - 72px);
  overflow: hidden;
  padding: clamp(4.5rem, 8vw, 7.5rem) clamp(1rem, 4vw, 3rem) 7rem;
  background:
    linear-gradient(rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--ctp-mocha-overlay0-rgb), 0.08) 1px, transparent 1px),
    linear-gradient(145deg, var(--ctp-mocha-crust), var(--ctp-mocha-base) 52%, var(--ctp-mocha-mantle));
  background-size: 42px 42px, 42px 42px, auto;
  color: var(--ctp-mocha-text);
}

.lounge-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.035) 0,
      rgba(255, 255, 255, 0.035) 1px,
      transparent 1px,
      transparent 9px
    );
  mix-blend-mode: screen;
  opacity: 0.28;
}

.lounge-hero,
.lounge-grid {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.lounge-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
}

.kicker,
.card-meta,
.card-eyebrow,
.monitor-label,
.monitor-readout {
  margin: 0;
  font-family: 'Fira Code', monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kicker {
  color: var(--ctp-mocha-sky);
  font-size: 0.82rem;
}

.hero-copy h1 {
  margin: 1rem 0 1.25rem;
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(3.4rem, 8vw, 6.8rem);
  font-weight: 800;
  line-height: 1;
}

.hero-text {
  max-width: 680px;
  margin: 0;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.8;
}

.hero-visual {
  position: relative;
  min-height: 420px;
  border: 1px solid rgba(var(--ctp-mocha-sapphire-rgb), 0.28);
  border-radius: 8px;
  overflow: hidden;
  background: var(--ctp-mocha-surface0);
  box-shadow:
    22px 24px 46px rgba(0, 0, 0, 0.4),
    -16px -16px 34px rgba(255, 255, 255, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.035);
}

.hero-visual img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  opacity: 0.7;
  filter: saturate(0.82) contrast(1.06);
}

.monitor-frame {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.25);
  border-radius: 6px;
  padding: 1rem;
  background: rgba(var(--ctp-mocha-crust-rgb), 0.78);
  backdrop-filter: blur(14px);
}

.monitor-label {
  color: var(--ctp-mocha-teal);
  font-size: 0.74rem;
}

.monitor-readout {
  color: var(--ctp-mocha-peach);
  font-size: 0.74rem;
}

.lounge-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.2rem, 2vw, 1.8rem);
  margin-top: clamp(3rem, 6vw, 5rem);
}

.lounge-card {
  position: relative;
  display: grid;
  min-height: 270px;
  align-content: start;
  gap: 0.9rem;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.16);
  border-radius: 8px;
  padding: clamp(1.4rem, 3vw, 2rem);
  overflow: hidden;
  background:
    linear-gradient(150deg, rgba(var(--ctp-mocha-surface1-rgb), 0.88), rgba(var(--ctp-mocha-base-rgb), 0.88)),
    var(--ctp-mocha-base);
  box-shadow:
    16px 18px 34px rgba(0, 0, 0, 0.34),
    -12px -12px 28px rgba(255, 255, 255, 0.025),
    inset 1px 1px 0 rgba(255, 255, 255, 0.06),
    inset -10px -10px 22px rgba(0, 0, 0, 0.18);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.lounge-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.12), transparent 34%),
    repeating-linear-gradient(90deg, transparent 0 18px, rgba(255, 255, 255, 0.04) 18px 19px);
  opacity: 0.45;
}

.lounge-card:hover {
  transform: translateY(-6px);
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.36);
  box-shadow:
    20px 24px 46px rgba(0, 0, 0, 0.42),
    -14px -14px 30px rgba(255, 255, 255, 0.035),
    inset 1px 1px 0 rgba(255, 255, 255, 0.08);
}

.lounge-card:hover,
.lounge-card:focus-visible {
  text-decoration: none;
}

.card-meta,
.card-eyebrow,
.card-title,
.card-desc,
.card-action {
  position: relative;
  z-index: 1;
}

.card-meta {
  color: var(--ctp-mocha-overlay1);
  font-size: 0.7rem;
}

.card-eyebrow {
  color: var(--ctp-mocha-sky);
  font-size: 0.74rem;
}

.card-title {
  color: var(--ctp-mocha-text);
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
}

.card-desc {
  max-width: 34rem;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 1rem;
  line-height: 1.75;
}

.card-action {
  align-self: end;
  justify-self: start;
  margin-top: 0.6rem;
  border: 1px solid rgba(var(--ctp-mocha-teal-rgb), 0.28);
  border-radius: 999px;
  padding: 0.65rem 1.1rem;
  color: var(--ctp-mocha-teal);
  font-weight: 700;
}

@media (max-width: 860px) {
  .lounge-hero,
  .lounge-grid {
    grid-template-columns: 1fr;
  }

  .hero-visual,
  .hero-visual img {
    min-height: 300px;
  }
}

@media (max-width: 560px) {
  .lounge-page {
    padding-inline: 1rem;
  }

  .monitor-frame {
    align-items: flex-start;
    flex-direction: column;
  }

  .lounge-card {
    min-height: 240px;
  }
}
</style>
