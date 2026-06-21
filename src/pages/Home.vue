<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const homeSections = [
  {
    id: 'opening',
    title: 'Welcome',
    image: '/bg/liuyin.jpg',
    align: 'left',
    heroOnly: true,
    anchor: true
  },
  {
    id: 'notes',
    eyebrow: 'JOTTINGS',
    title: '随记',
    description: '一些不完全归档的想法、片段、记录和心情，保留它们正在生长的样子。',
    image: '/bg/open.jpeg',
    cta: '进入随记',
    to: '/space1',
    align: 'left'
  },
  {
    id: 'resources',
    eyebrow: 'RESOURCES',
    title: '资源链接',
    description: '把值得保存、反复访问或继续延展的入口放在这里，让路径本身也变得清晰。',
    image: '/bg/share.jpeg',
    cta: '查看资源链接',
    to: '/rd',
    align: 'right'
  },
  {
    id: 'projects',
    eyebrow: 'PROJECTS',
    title: '代码与项目',
    description: '这里收纳我正在做、做过、或者还想继续完善的技术实践。',
    image: '/bg/snow_mountain_starry_sky_aurora.jpeg',
    cta: '查看代码与项目',
    to: '/code',
    align: 'left'
  },
  {
    id: 'lounge',
    eyebrow: 'LOUNGE',
    title: '赛博会客厅',
    description: '汇总站点访客中心和网络邻居入口，可查看访客信息、站点导览和朋友们的个人站点。',
    image: '/bg/skadi.jpeg',
    cta: '进入会客厅',
    to: '/space3',
    align: 'right'
  },
  {
    id: 'about',
    eyebrow: 'ABOUT',
    title: '关于',
    description: '从这里进入自我介绍、我的学术和版权说明。',
    image: '/bg/IMG_FireFly.png',
    cta: '了解关于',
    to: '/about',
    align: 'left'
  }
]

const headerOffset = ref(0)

let headerResizeObserver = null

function updateHeaderOffset() {
  headerOffset.value = document.querySelector('header')?.getBoundingClientRect().height || 0
}

function observeHeaderOffset() {
  const header = document.querySelector('header')

  updateHeaderOffset()

  if (window.ResizeObserver && header) {
    headerResizeObserver = new ResizeObserver(updateHeaderOffset)
    headerResizeObserver.observe(header)
  }

  document.fonts?.ready.then(updateHeaderOffset)
}

onMounted(() => {
  observeHeaderOffset()
  window.addEventListener('resize', updateHeaderOffset)
})

onBeforeUnmount(() => {
  headerResizeObserver?.disconnect()
  window.removeEventListener('resize', updateHeaderOffset)
})
</script>

<template>
  <main
    class="home-scroll"
    aria-label="LiuYinChu homepage"
    :style="{ '--home-header-offset': `${headerOffset}px` }"
  >
    <section
      v-for="(section, index) in homeSections"
      :id="section.id"
      :key="section.id"
      class="home-panel"
      :class="[`home-panel--${section.align}`, { 'home-panel--first': index === 0 }]"
    >
      <img
        class="home-panel__image"
        :src="section.image"
        :alt="section.title"
        :loading="index === 0 ? 'eager' : 'lazy'"
        decoding="async"
      >
      <div class="home-panel__shade" aria-hidden="true"></div>

      <div
        v-if="section.heroOnly"
        class="home-panel__welcome"
      >
        <div class="entry-word-stage home-panel__welcome-stage">
          <h1 class="entry-word home-panel__welcome-word">Welcome</h1>
        </div>
      </div>

      <div
        v-else
        class="home-panel__content"
      >
        <p class="home-panel__eyebrow">{{ section.eyebrow }}</p>
        <h2 class="home-panel__title">{{ section.title }}</h2>
        <p class="home-panel__description">{{ section.description }}</p>

        <RouterLink
          class="home-panel__button"
          :to="section.to"
        >
          {{ section.cta }}
        </RouterLink>
      </div>

      <a
        v-if="section.anchor"
        class="home-panel__scroll-cue"
        href="#notes"
        aria-label="Scroll to the next homepage section"
      >
        <span></span>
      </a>
    </section>
  </main>
</template>

<style scoped>
.entry-word-stage {
  position: relative;
  width: min(86vw, 920px);
  height: clamp(3.8rem, 8.4vw, 6.2rem);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 24%,
    #000 76%,
    transparent 100%
  );
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    #000 24%,
    #000 76%,
    transparent 100%
  );
}

.entry-word {
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(3.8rem, 8.4vw, 6.2rem);
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  font-size: clamp(2.45rem, 8.5vw, 5.65rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  color: #f5f6ff;
  text-shadow: 0 16px 52px rgba(137, 180, 250, 0.28);
}

.home-scroll {
  background: #03050b;
  color: #fff;
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
  scroll-behavior: smooth;
}

.home-panel {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  isolation: isolate;
}

.home-panel__image {
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.018);
}

.home-panel__shade {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(180deg, rgba(3, 5, 11, 0.16) 0%, rgba(3, 5, 11, 0.22) 44%, rgba(3, 5, 11, 0.72) 100%),
    linear-gradient(90deg, rgba(3, 5, 11, 0.74) 0%, rgba(3, 5, 11, 0.42) 28%, rgba(3, 5, 11, 0.12) 58%, rgba(3, 5, 11, 0.58) 100%);
}

.home-panel--right .home-panel__shade {
  background:
    linear-gradient(180deg, rgba(3, 5, 11, 0.16) 0%, rgba(3, 5, 11, 0.22) 44%, rgba(3, 5, 11, 0.72) 100%),
    linear-gradient(270deg, rgba(3, 5, 11, 0.78) 0%, rgba(3, 5, 11, 0.44) 32%, rgba(3, 5, 11, 0.10) 62%, rgba(3, 5, 11, 0.50) 100%);
}

.home-panel--first .home-panel__shade {
  background:
    radial-gradient(circle at 50% 50%, rgba(3, 5, 11, 0.24) 0%, rgba(3, 5, 11, 0.16) 30%, rgba(3, 5, 11, 0.50) 100%),
    linear-gradient(180deg, rgba(3, 5, 11, 0.08) 0%, rgba(3, 5, 11, 0.20) 52%, rgba(3, 5, 11, 0.58) 100%);
}

.home-panel__welcome {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.home-panel--first .home-panel__welcome {
  left: 50vw;
  right: auto;
  width: 100vw;
  transform: translateX(-50%) translateY(calc(-1 * var(--home-header-offset, 0px)));
}

.home-panel__welcome-stage {
  width: min(86vw, 920px);
}

.home-panel__welcome-word {
  margin: 0;
}

.home-panel__content {
  width: min(520px, calc(100vw - 48px));
  margin: 0 0 clamp(4.7rem, 10vh, 7rem) clamp(2rem, 7vw, 6rem);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.54);
}

.home-panel--right {
  justify-content: flex-end;
}

.home-panel--right .home-panel__content {
  margin-right: clamp(2rem, 7vw, 6rem);
  margin-left: 0;
}

.home-panel__eyebrow {
  margin: 0 0 0.85rem;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.88);
}

.home-panel__title {
  margin: 0;
  font-size: clamp(2.8rem, 5.6vw, 5.8rem);
  font-weight: 900;
  line-height: 0.96;
  letter-spacing: 0;
  color: #fff;
}

.home-panel__description {
  max-width: 33rem;
  margin: 1.25rem 0 1.85rem;
  font-size: clamp(1.08rem, 1.45vw, 1.32rem);
  font-weight: 500;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.88);
}

.home-panel__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 10.5rem;
  min-height: 3rem;
  padding: 0.72rem 1.35rem;
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  transition:
    background-color 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease,
    transform 0.22s ease;
}

.home-panel__button:hover,
.home-panel__button:focus-visible {
  color: #05070d;
  background: rgba(255, 255, 255, 0.94);
  border-color: #fff;
  transform: translateY(-2px);
}

.home-panel__button:focus-visible,
.home-panel__scroll-cue:focus-visible {
  outline: 3px solid rgba(137, 180, 250, 0.86);
  outline-offset: 4px;
}

.home-panel__scroll-cue {
  position: absolute;
  left: 50%;
  bottom: calc(4.7rem + var(--home-header-offset, 0px));
  width: 2.2rem;
  height: 2.2rem;
  transform: translateX(-50%);
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #fff;
  text-decoration: none;
}

.home-panel__scroll-cue span {
  width: 0.86rem;
  height: 0.86rem;
  border-right: 2px solid rgba(255, 255, 255, 0.95);
  border-bottom: 2px solid rgba(255, 255, 255, 0.95);
  transform: rotate(45deg);
  animation: scrollCue 1.55s ease-in-out infinite;
}

@keyframes scrollCue {
  0%,
  100% {
    opacity: 0.45;
    transform: translateY(-4px) rotate(45deg);
  }

  50% {
    opacity: 1;
    transform: translateY(5px) rotate(45deg);
  }
}

@media (max-width: 768px) {
  .entry-word-stage,
  .entry-word {
    height: clamp(3.15rem, 14vw, 4.6rem);
  }

  .entry-word {
    font-size: clamp(2.2rem, 12vw, 4rem);
  }

  .home-panel {
    min-height: 100svh;
  }

  .home-panel__content,
  .home-panel--right .home-panel__content {
    width: min(100% - 2rem, 34rem);
    margin: 0 1rem 5.2rem;
  }

  .home-panel__title {
    font-size: clamp(2.35rem, 12vw, 4.1rem);
  }

  .home-panel__description {
    font-size: 1rem;
    line-height: 1.7;
  }

  .home-panel__button {
    min-width: 9.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-panel__button,
  .home-panel__scroll-cue span {
    transition: none;
    animation: none;
  }
}
</style>
