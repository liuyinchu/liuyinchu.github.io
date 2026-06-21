<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  link: { type: String, required: true },
  desc: { type: String, required: true }
})

const faviconSrc = ref('')
const loadAttempts = ref(0)
const domain = new URL(props.link).hostname

function generateHslColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = hash % 360
  return `hsl(${h}, 70%, 45%)`
}

function generateSvgAvatar() {
  const firstChar = props.name.charAt(0).toUpperCase()
  const bgColor = generateHslColor(props.name)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <text x="50%" y="50%" dy=".1em" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

function handleImageError() {
  loadAttempts.value++
  switch (loadAttempts.value) {
    case 1:
      faviconSrc.value = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      break
    case 2:
      faviconSrc.value = generateSvgAvatar()
      break
    case 3:
      faviconSrc.value = '/bg/default_avatar.png'
      break
  }
}

onMounted(() => {
  faviconSrc.value = `https://icon.horse/icon/${domain}`
})
</script>

<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="friend-card">
    <span class="card-scanline" aria-hidden="true"></span>
    <div class="avatar-container">
      <img
        :src="faviconSrc"
        :alt="`${name} avatar`"
        class="avatar"
        @error="handleImageError"
      />
    </div>
    <div class="info">
      <span class="node-label">NEIGHBOR NODE</span>
      <h3 class="name">{{ name }}</h3>
      <p class="desc" :title="desc">{{ desc }}</p>
    </div>
    <span class="card-status">OPEN</span>
  </a>
</template>

<style scoped>
.friend-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  min-height: 104px;
  overflow: hidden;
  border: 1px solid rgba(var(--ctp-mocha-sky-rgb), 0.14);
  border-radius: 8px;
  padding: 1rem;
  background:
    linear-gradient(145deg, rgba(var(--ctp-mocha-surface1-rgb), 0.86), rgba(var(--ctp-mocha-base-rgb), 0.92)),
    var(--ctp-mocha-base);
  box-shadow:
    12px 14px 28px rgba(0, 0, 0, 0.32),
    -10px -10px 24px rgba(255, 255, 255, 0.022),
    inset 1px 1px 0 rgba(255, 255, 255, 0.06),
    inset -8px -8px 18px rgba(0, 0, 0, 0.18);
  color: var(--ctp-mocha-text);
  text-decoration: none;
  transition:
    transform 0.24s ease,
    background 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.friend-card:hover,
.friend-card:focus-visible {
  transform: translateY(-9px) scale(1.018);
  border-color: rgba(var(--ctp-mocha-sky-rgb), 0.62);
  background:
    linear-gradient(145deg, rgba(var(--ctp-mocha-sapphire-rgb), 0.24), rgba(var(--ctp-mocha-surface1-rgb), 0.94) 42%, rgba(var(--ctp-mocha-base-rgb), 0.96)),
    var(--ctp-mocha-base);
  box-shadow:
    0 0 0 1px rgba(var(--ctp-mocha-sky-rgb), 0.16),
    0 18px 44px rgba(var(--ctp-mocha-sapphire-rgb), 0.24),
    18px 24px 42px rgba(0, 0, 0, 0.48),
    -12px -12px 26px rgba(255, 255, 255, 0.035),
    inset 1px 1px 0 rgba(255, 255, 255, 0.12),
    inset -10px -10px 22px rgba(0, 0, 0, 0.2);
  outline: none;
  text-decoration: none;
}

.card-scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(var(--ctp-mocha-sky-rgb), 0.12), transparent 36%),
    repeating-linear-gradient(90deg, transparent 0 20px, rgba(255, 255, 255, 0.035) 20px 21px);
  opacity: 0.34;
}

.avatar-container,
.info,
.card-status {
  position: relative;
  z-index: 1;
}

.avatar {
  width: 54px;
  height: 54px;
  border: 1px solid rgba(var(--ctp-mocha-lavender-rgb), 0.22);
  border-radius: 8px;
  object-fit: cover;
  background-color: var(--ctp-mocha-surface0);
  box-shadow:
    6px 6px 14px rgba(0, 0, 0, 0.26),
    -5px -5px 12px rgba(255, 255, 255, 0.025);
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.friend-card:hover .avatar {
  transform: translateY(-3px) scale(1.06);
  border-color: rgba(var(--ctp-mocha-teal-rgb), 0.66);
  box-shadow:
    0 0 0 4px rgba(var(--ctp-mocha-sky-rgb), 0.12),
    10px 12px 24px rgba(0, 0, 0, 0.34);
}

.info {
  display: grid;
  min-width: 0;
  gap: 0.28rem;
}

.node-label,
.card-status {
  color: var(--ctp-mocha-overlay1);
  font-family: 'Fira Code', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.name {
  margin: 0;
  color: var(--ctp-mocha-text);
  font-size: 1.05rem;
  font-weight: 760;
  transition: color 0.22s ease, transform 0.22s ease;
}

.friend-card:hover .name,
.friend-card:focus-visible .name {
  color: var(--ctp-mocha-sky);
  transform: translateX(3px);
}

.desc {
  margin: 0;
  overflow: hidden;
  color: var(--ctp-mocha-subtext0);
  font-family: 'LXGW WenKai', serif;
  font-size: 0.92rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-status {
  align-self: start;
  border: 1px solid rgba(var(--ctp-mocha-teal-rgb), 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.55rem;
  color: var(--ctp-mocha-teal);
  transition:
    background-color 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    color 0.22s ease;
}

.friend-card:hover .card-status,
.friend-card:focus-visible .card-status {
  border-color: rgba(var(--ctp-mocha-teal-rgb), 0.55);
  background: rgba(var(--ctp-mocha-teal-rgb), 0.12);
  box-shadow: 0 0 18px rgba(var(--ctp-mocha-teal-rgb), 0.18);
  color: var(--ctp-mocha-sky);
}

@media (max-width: 520px) {
  .friend-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .card-status {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
