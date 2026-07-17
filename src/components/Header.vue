<template>
  <header
    class="site-header"
    :class="{
      'is-scrolled': isScrolled,
      'is-hidden': isHeaderHidden && !isMenuOpen,
      'is-menu-open': isMenuOpen,
    }"
  >
    <div class="header-inner">
      <RouterLink to="/" class="logo-area" @click="closeMenu">
        <span class="logo-shell" aria-hidden="true">
          <img src="/favicon_liuyin.svg" alt="" class="logo" />
        </span>
        <span class="site-name">LiuYinChu'Space</span>
      </RouterLink>

      <nav class="nav-menu desktop-menu" aria-label="Primary navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ 'is-active': isActive(item) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <button
        class="mobile-nav-toggle"
        :class="{ 'is-active': isMenuOpen }"
        type="button"
        :aria-expanded="isMenuOpen.toString()"
        aria-controls="mobile-nav"
        aria-label="Toggle navigation"
        @click="toggleMenu"
      >
        <span class="hamburger-box" aria-hidden="true">
          <span class="hamburger-inner"></span>
        </span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="mobile-menu">
        <nav
          v-if="isMenuOpen"
          id="mobile-nav"
          class="mobile-menu-container"
          aria-label="Mobile navigation"
        >
          <RouterLink
            v-for="(item, index) in navItems"
            :key="item.to"
            :to="item.to"
            :class="{ 'is-active': isActive(item) }"
            :style="{ '--i': index + 1 }"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const navItems = [
  {
    label: '随记',
    to: '/space1',
    match: ['/space1'],
  },
  {
    label: '资源链接',
    to: '/rd',
    match: [
      '/rd',
      '/resource',
      '/rliterature',
      '/rprogramming',
      '/rmaterials',
      '/rcomputer',
      '/rtools',
      '/rfiles',
    ],
  },
  {
    label: '代码与项目',
    to: '/code',
    match: [
      '/code',
      '/brisk-nexus',
      '/ysy-latex',
      '/ysy-data-analysis-helper',
      '/cyber-match',
      '/lyc2048',
    ],
  },
  {
    label: '赛博会客厅',
    to: '/space3',
    match: ['/space2', '/space3', '/visitor-center'],
  },
  {
    label: '关于',
    to: '/about',
    match: ['/about', '/credit', '/academic', '/research', '/academic-plot-guide'],
  },
]

const route = useRoute()
const isMenuOpen = ref(false)
const isScrolled = ref(false)
const isHeaderHidden = ref(false)
const currentPath = computed(() => route.path)

let lastScrollY = 0
let ticking = false

function isActive(item) {
  return item.match.some((path) => (
    currentPath.value === path || currentPath.value.startsWith(`${path}/`)
  ))
}

function setBodyLocked(locked) {
  document.body.style.overflow = locked ? 'hidden' : ''
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
  isHeaderHidden.value = false
  setBodyLocked(isMenuOpen.value)
}

function closeMenu() {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
  setBodyLocked(false)
}

function updateHeaderState() {
  const scrollY = Math.max(window.scrollY, 0)
  const delta = scrollY - lastScrollY

  isScrolled.value = scrollY > 12

  if (isMenuOpen.value || scrollY <= 16) {
    isHeaderHidden.value = false
  } else if (delta > 8 && scrollY > 96) {
    isHeaderHidden.value = true
  } else if (delta < -8) {
    isHeaderHidden.value = false
  }

  lastScrollY = scrollY
  ticking = false
}

function handleScroll() {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(updateHeaderState)
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
    isHeaderHidden.value = false
    lastScrollY = Math.max(window.scrollY, 0)
    isScrolled.value = lastScrollY > 12
  },
)

onMounted(() => {
  lastScrollY = Math.max(window.scrollY, 0)
  isScrolled.value = lastScrollY > 12
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  setBodyLocked(false)
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.56);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px) saturate(135%);
  -webkit-backdrop-filter: blur(16px) saturate(135%);
  transition:
    transform 0.28s ease,
    background-color 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.site-header.is-scrolled,
.site-header.is-menu-open {
  background-color: rgba(var(--ctp-mocha-base-rgb), 0.84);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
}

.site-header.is-menu-open {
  z-index: 1004;
}

.site-header.is-hidden {
  transform: translateY(-110%);
}

.header-inner {
  position: relative;
  z-index: 1005;
  width: min(1180px, calc(100vw - 48px));
  min-height: 72px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.logo-area {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 0.72rem;
  color: var(--text-color);
  text-decoration: none;
}

.logo-shell {
  position: relative;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.logo-shell::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(116, 199, 236, 0.34), transparent 68%);
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.logo {
  position: relative;
  z-index: 1;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.site-name {
  overflow: hidden;
  color: rgba(245, 246, 255, 0.92);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.24s ease;
}

.logo-area:hover .logo,
.logo-area:focus-visible .logo {
  transform: rotate(-8deg) scale(1.07);
}

.logo-area:hover .logo-shell::before,
.logo-area:focus-visible .logo-shell::before {
  opacity: 1;
  transform: scale(1.12);
}

.logo-area:hover .site-name,
.logo-area:focus-visible .site-name {
  background: linear-gradient(
    135deg,
    #E57219 0%,
    #EDCC87 16.7%,
    #B4E6CD 40.5%,
    #69F0E1 61%,
    #47F1E8 97.8%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.desktop-menu {
  gap: clamp(0.86rem, 2.2vw, 1.55rem);
  padding: 0 0.12rem;
}

.desktop-menu a {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  color: rgba(205, 214, 244, 0.72);
  font-family: 'LXGW WenKai', 'Inter', system-ui, sans-serif;
  font-size: 1.03rem;
  font-weight: 650;
  line-height: 1;
  text-decoration: none;
  transition: color 0.22s ease, text-shadow 0.22s ease;
}

.desktop-menu a::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0.42rem;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #74c7ec, #f5c2e7);
  opacity: 0;
  transform: scaleX(0.34);
  transform-origin: center;
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.desktop-menu a:hover,
.desktop-menu a:focus-visible,
.desktop-menu a.is-active {
  color: #fff;
  text-shadow: 0 0 18px rgba(116, 199, 236, 0.28);
}

.desktop-menu a:hover::after,
.desktop-menu a:focus-visible::after,
.desktop-menu a.is-active::after {
  opacity: 0.92;
  transform: scaleX(1);
}

.mobile-nav-toggle {
  position: relative;
  z-index: 1003;
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.22s ease, border-color 0.22s ease;
}

.mobile-nav-toggle:hover,
.mobile-nav-toggle:focus-visible {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
}

.hamburger-box {
  position: relative;
  display: block;
  width: 22px;
  height: 18px;
}

.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after {
  position: absolute;
  left: 0;
  width: 22px;
  height: 2px;
  background-color: currentColor;
  border-radius: 999px;
  transition:
    top 0.2s ease,
    transform 0.24s ease,
    opacity 0.18s ease;
}

.hamburger-inner {
  top: 8px;
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: '';
}

.hamburger-inner::before {
  top: -7px;
}

.hamburger-inner::after {
  top: 7px;
}

.mobile-nav-toggle.is-active .hamburger-inner {
  transform: rotate(45deg);
}

.mobile-nav-toggle.is-active .hamburger-inner::before {
  top: 0;
  opacity: 0;
}

.mobile-nav-toggle.is-active .hamburger-inner::after {
  top: 0;
  transform: rotate(-90deg);
}

.mobile-menu-container {
  position: fixed;
  inset: 0;
  z-index: 1003;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  padding: 6.5rem 2rem 3rem;
  background:
    radial-gradient(circle at 50% 0%, rgba(116, 199, 236, 0.12), transparent 34%),
    rgba(var(--ctp-mocha-base-rgb), 0.94);
  backdrop-filter: blur(18px) saturate(135%);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
}

.mobile-menu-container a {
  color: rgba(245, 246, 255, 0.78);
  font-family: 'LXGW WenKai', 'Inter', system-ui, sans-serif;
  font-size: clamp(1.55rem, 9vw, 2.25rem);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  opacity: 0;
  transform: translateY(18px);
  animation: mobileLinkIn 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 0.045s);
}

.mobile-menu-container a.is-active,
.mobile-menu-container a:hover,
.mobile-menu-container a:focus-visible {
  color: #fff;
}

.mobile-menu-container a.is-active::after {
  content: '';
  display: block;
  width: 34px;
  height: 2px;
  margin: 0.58rem auto 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #74c7ec, #f5c2e7);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.24s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

@keyframes mobileLinkIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .header-inner {
    width: min(100% - 32px, 1180px);
    min-height: 68px;
  }

  .desktop-menu {
    display: none;
  }

  .mobile-nav-toggle {
    display: inline-flex;
  }
}

@media (max-width: 420px) {
  .header-inner {
    width: min(100% - 24px, 1180px);
  }

  .logo-shell {
    width: 34px;
    height: 34px;
  }

  .logo {
    width: 32px;
    height: 32px;
  }

  .site-name {
    max-width: calc(100vw - 132px);
    font-size: 1rem;
  }
}
</style>
