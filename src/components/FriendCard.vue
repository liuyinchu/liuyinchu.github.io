<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  link: { type: String, required: true },
  desc: { type: String, required: true }
})

// --- 新增的图标获取逻辑 ---

// 使用 ref 来动态管理图标的 src
const faviconSrc = ref('')
// 记录尝试加载的次数
const loadAttempts = ref(0)
// 从网站链接中提取域名
const domain = new URL(props.link).hostname

// 生成一个基于字符串的 HSL 颜色，用于SVG头像背景
function generateHslColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  // 返回一个饱和度较高、亮度适中的 HSL 颜色字符串
  return `hsl(${h}, 70%, 45%)`;
}

// 生成 SVG 文字头像的 Data URI
function generateSvgAvatar() {
  const firstChar = props.name.charAt(0).toUpperCase();
  const bgColor = generateHslColor(props.name);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="100%" height="100%" fill="${bgColor}" />
      <text
        x="50%"
        y="50%"
        dy=".1em"
        font-family="Arial, sans-serif"
        font-size="36"
        font-weight="bold"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ${firstChar}
      </text>
    </svg>
  `;
  // 将 SVG 字符串编码并作为 Data URI 返回
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// 图片加载失败时的处理函数
function handleImageError() {
  loadAttempts.value++;
  switch (loadAttempts.value) {
    case 1:
      // 第一次失败，尝试备用API (Google)
      faviconSrc.value = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      break;
    case 2:
      // 第二次失败，生成 SVG 文字头像
      faviconSrc.value = generateSvgAvatar();
      break;
    case 3:
      // 第三次失败 (极端情况)，使用最终的本地备用图片
      faviconSrc.value = '/bg/default_avatar.png'; // 确保这个路径下有你的备用图片
      break;
  }
}

// 组件挂载时，设置初始的图标源为第一层API
onMounted(() => {
  // 优先使用 icon.horse API
  faviconSrc.value = `https://icon.horse/icon/${domain}`;
});
</script>

<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="friend-card">
    <img 
      :src="faviconSrc" 
      :alt="`${name} avatar`" 
      class="avatar" 
      @error="handleImageError" 
    />
    <div class="info">
      <h3 class="name">{{ name }}</h3>
      <p class="desc">{{ desc }}</p>
    </div>
  </a>
</template>

<style scoped>
/* 这里的样式就是我们上一轮优化后的样式，保持不变 */
.friend-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  text-decoration: none;
  border-radius: 0.75rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.friend-card:hover {
  transform: translateY(-6px);
  background-color: var(--surface-color-hover);
  border-color: var(--primary-color-hover);
  box-shadow: 0 8px 20px -5px rgba(var(--ctp-mocha-sky-rgb), 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: var(--ctp-mocha-surface2);
  transition: transform 0.3s ease;
}

.friend-card:hover .avatar {
  transform: scale(1.1);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: hidden;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}
</style>