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
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 45%)`;
}

function generateSvgAvatar() {
  const firstChar = props.name.charAt(0).toUpperCase();
  const bgColor = generateHslColor(props.name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <text x="50%" y="50%" dy=".1em" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function handleImageError() {
  loadAttempts.value++;
  switch (loadAttempts.value) {
    case 1: faviconSrc.value = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`; break;
    case 2: faviconSrc.value = generateSvgAvatar(); break;
    case 3: faviconSrc.value = '/bg/default_avatar.png'; break;
  }
}

onMounted(() => {
  faviconSrc.value = `https://icon.horse/icon/${domain}`;
});
</script>

<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="friend-card">
    <div class="card-glow"></div>
    <div class="avatar-container">
      <img 
        :src="faviconSrc" 
        :alt="`${name} avatar`" 
        class="avatar" 
        @error="handleImageError" 
      />
    </div>
    <div class="info">
      <h3 class="name">{{ name }}</h3>
      <p class="desc" :title="desc">{{ desc }}</p>
    </div>
    <div class="icon-arrow">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
    </div>
  </a>
</template>

<style scoped>
.friend-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  border-radius: 16px;
  /* 极其高级的玻璃态背景 */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}

/* 这是一个隐藏的光晕层 */
.card-glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(var(--primary-color-rgb, 120, 120, 255), 0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

.friend-card:hover {
  transform: translateY(-5px) scale(1.01);
  border-color: rgba(var(--primary-color-rgb, 120, 120, 255), 0.3);
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.1),
    0 0 20px -5px rgba(var(--primary-color-rgb), 0.1);
}

.friend-card:hover .card-glow {
  opacity: 1;
}

.avatar-container {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 12px; /* 方圆形更现代 */
  object-fit: cover;
  background-color: var(--ctp-mocha-surface0);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.4s ease;
}

.friend-card:hover .avatar {
  transform: rotate(-5deg) scale(1.1);
  border-color: var(--primary-color);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  z-index: 1;
  flex: 1;
}

.name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: 0.02em;
  transition: color 0.3s ease;
  margin: 0;
}

.friend-card:hover .name {
  color: var(--primary-color);
}

.desc {
  font-size: 0.85rem;
  color: var(--ctp-mocha-subtext0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  opacity: 0.8;
}

/* 右上角的小箭头 */
.icon-arrow {
  color: var(--ctp-mocha-overlay1);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s ease;
  z-index: 1;
}

.friend-card:hover .icon-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--primary-color);
}
</style>