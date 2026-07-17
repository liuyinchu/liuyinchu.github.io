<template>
  <header
    ref="siteHeaderRef"
    class="site-header"
    :class="{
      'is-scrolled': isScrolled,
      'is-hidden': isHeaderHidden && !isMenuRendered,
      'is-menu-open': isMenuRendered,
    }"
  >
    <div class="header-inner">
      <RouterLink to="/" class="logo-area" @click="closeMenu()">
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
        ref="menuToggleRef"
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
      <nav
        v-if="isMenuRendered"
        id="mobile-nav"
        ref="mobileMenuRef"
        class="mobile-menu-container"
        aria-label="Mobile navigation"
        :aria-hidden="(!isMenuOpen).toString()"
        :inert="!isMenuOpen"
      >
        <RouterLink
          v-for="(item, index) in navItems"
          :key="item.to"
          :to="item.to"
          :class="{ 'is-active': isActive(item) }"
          :style="{ '--i': index + 1 }"
          @click="closeMenu()"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </Teleport>
  </header>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  enterMobileMenu,
  leaveMobileMenu,
  prepareMobileMenu,
  setMobileMenuToggleOpen,
  setFluidHeaderHidden,
  stopMobileMenuMotion,
  stopMobileMenuToggleMotion,
  stopFluidHeaderMotion,
} from '../utils/interactionMotion'

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
const isMenuRendered = ref(false)
const isScrolled = ref(false)
const isHeaderHidden = ref(false)
const siteHeaderRef = ref(null)
const mobileMenuRef = ref(null)
const menuToggleRef = ref(null)
const currentPath = computed(() => route.path)

let lastScrollY = 0
let ticking = false
let scrollFrame = 0
let menuMotionRequest = 0
let bodyLockActive = false
let bodyOverflowBeforeMenu = ''
let menuOpenedFromKeyboard = false

function isActive(item) {
  return item.match.some((path) => (
    currentPath.value === path || currentPath.value.startsWith(`${path}/`)
  ))
}

function setBodyLocked(locked) {
  if (locked && !bodyLockActive) {
    bodyOverflowBeforeMenu = document.body.style.overflow
    bodyLockActive = true
    document.body.style.overflow = 'hidden'
  } else if (!locked && bodyLockActive) {
    document.body.style.overflow = bodyOverflowBeforeMenu
    bodyLockActive = false
  }
}

function toggleMenu(event) {
  menuOpenedFromKeyboard = !isMenuOpen.value && event?.detail === 0
  isMenuOpen.value = !isMenuOpen.value
  isHeaderHidden.value = false
}

function closeMenu(restoreFocus = false) {
  if (!isMenuOpen.value) return
  const shouldRestoreFocus = (
    restoreFocus
    || mobileMenuRef.value?.contains(document.activeElement)
  )
  if (shouldRestoreFocus) {
    menuToggleRef.value?.focus({ preventScroll: true })
  }
  isMenuOpen.value = false
  menuOpenedFromKeyboard = false
}

async function syncMobileMenu(open) {
  const request = ++menuMotionRequest
  if (open) setBodyLocked(true)

  if (open && !isMenuRendered.value) isMenuRendered.value = true
  await nextTick()
  if (request !== menuMotionRequest) return

  const element = mobileMenuRef.value
  if (!element) {
    if (!open) {
      isMenuRendered.value = false
      setBodyLocked(false)
    }
    return
  }

  if (open) {
    prepareMobileMenu(element, menuToggleRef.value)
    enterMobileMenu(element, menuToggleRef.value)
    if (menuOpenedFromKeyboard) {
      element.querySelector('a')?.focus({ preventScroll: true })
      menuOpenedFromKeyboard = false
    }
    return
  }

  leaveMobileMenu(element, () => {
    if (!isMenuOpen.value && request === menuMotionRequest) {
      isMenuRendered.value = false
      setBodyLocked(false)
    }
  })
}

function handleMenuKeydown(event) {
  if (!isMenuOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenu(true)
    return
  }

  if (event.key !== 'Tab') return
  const links = Array.from(mobileMenuRef.value?.querySelectorAll('a') ?? [])
  const focusables = [menuToggleRef.value, ...links].filter(Boolean)
  if (!focusables.length) return

  const currentIndex = focusables.indexOf(document.activeElement)
  event.preventDefault()
  const direction = event.shiftKey ? -1 : 1
  const nextIndex = currentIndex === -1
    ? (event.shiftKey ? focusables.length - 1 : 0)
    : (currentIndex + direction + focusables.length) % focusables.length
  focusables[nextIndex].focus({ preventScroll: true })
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
  scrollFrame = 0
}

function handleScroll() {
  if (ticking) return
  ticking = true
  scrollFrame = window.requestAnimationFrame(updateHeaderState)
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

watch(
  [isHeaderHidden, isMenuOpen],
  ([hidden, menuOpen]) => {
    setFluidHeaderHidden(siteHeaderRef.value, hidden && !menuOpen)
  },
  { flush: 'post' },
)

watch(
  isMenuOpen,
  (open) => syncMobileMenu(open),
  { flush: 'post' },
)

watch(
  isMenuOpen,
  (open) => setMobileMenuToggleOpen(menuToggleRef.value, open),
  { flush: 'post' },
)

onMounted(() => {
  lastScrollY = Math.max(window.scrollY, 0)
  isScrolled.value = lastScrollY > 12
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleMenuKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleMenuKeydown)
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
  scrollFrame = 0
  ticking = false
  menuMotionRequest += 1
  stopMobileMenuMotion(mobileMenuRef.value)
  stopMobileMenuToggleMotion(menuToggleRef.value)
  stopFluidHeaderMotion(siteHeaderRef.value)
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
  --menu-icon-progress: 0;
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
}

.hamburger-inner {
  top: 8px;
  transform: rotate(calc(var(--menu-icon-progress) * 45deg));
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: '';
}

.hamburger-inner::before {
  top: calc(-7px + var(--menu-icon-progress) * 7px);
  opacity: calc(1 - var(--menu-icon-progress));
}

.hamburger-inner::after {
  top: calc(7px - var(--menu-icon-progress) * 7px);
  transform: rotate(calc(var(--menu-icon-progress) * -90deg));
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
  opacity: 1;
  transform: translateY(0);
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

@media (prefers-reduced-motion: reduce) {
  .site-header,
  .logo-shell::before,
  .logo,
  .site-name,
  .desktop-menu a,
  .desktop-menu a::after,
  .mobile-nav-toggle {
    transition: none;
  }

  .logo-area:hover .logo,
  .logo-area:focus-visible .logo {
    transform: none;
  }

  .logo-area:hover .logo-shell::before,
  .logo-area:focus-visible .logo-shell::before {
    opacity: 0;
    transform: scale(0.7);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .site-header,
  .site-header.is-scrolled,
  .site-header.is-menu-open {
    background-color: rgba(var(--ctp-mocha-base-rgb), 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .mobile-menu-container {
    background: rgba(var(--ctp-mocha-base-rgb), 0.99);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-contrast: more) {
  .site-header,
  .site-header.is-scrolled,
  .site-header.is-menu-open {
    background-color: rgb(var(--ctp-mocha-base-rgb));
    border-bottom-color: rgba(255, 255, 255, 0.42);
  }

  .mobile-menu-container {
    background: rgb(var(--ctp-mocha-base-rgb));
  }
}
</style>
