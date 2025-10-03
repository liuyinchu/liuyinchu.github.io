<template>
  <div ref="root" class="ltoc">
    <!-- 悬浮按钮 -->
    <button
      class="ltoc__btn"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="ltoc-panel"
      aria-label="Open article directory"
      @click="toggle"
    >
      <!-- 简洁图标（书签/目录） -->
      <svg viewBox="0 0 24 24" class="ltoc__icon" aria-hidden="true">
        <path d="M6 4h12a2 2 0 0 1 2 2v14l-8-4-8 4V6a2 2 0 0 1 2-2z"/>
      </svg>
    </button>

    <!-- 弹出面板 -->
    <transition name="ltoc-pop">
      <aside
        v-if="open"
        id="ltoc-panel"
        class="ltoc__panel"
        role="dialog"
        aria-label="Article directory"
        @keydown.esc.prevent="open=false"
      >
        <header class="ltoc__hdr">
          <span class="ltoc__title">目录</span>
          <span class="ltoc__count" v-if="items.length">({{ items.length }})</span>
          <!-- <button class="ltoc__close" aria-label="Close" @click="open=false"></button> -->
        </header>

        <div class="ltoc__body">
          <div v-if="loading" class="ltoc__state">Loading…</div>
          <div v-else-if="error" class="ltoc__state ltoc__state--err">{{ error }}</div>
          <ul v-else class="ltoc__list" role="list">
            <li v-for="it in items" :key="it.id" class="ltoc__item">
              <a
                class="ltoc__link"
                :href="linkTo(it.id)"
                @click.prevent="go(it.id)"
              >
                <span class="ltoc__dot" aria-hidden="true"></span>
                <span class="ltoc__text">{{ it.title }}</span>
              </a>
            </li>
            <li v-if="!items.length" class="ltoc__state">No entries.</li>
          </ul>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  /** 文章列表 JSON 路径；建议放 /public/article.json */
  src: { type: String, default: '/article.json' },
  /** 点击后跳转的前缀 */
  basePath: { type: String, default: '/space1' },
  /** 是否禁止缓存（调试用） */
  noCache: { type: Boolean, default: true },
})

const open = ref(false)
const items = ref([])
const loading = ref(false)
const error = ref('')
const root = ref(null)

const normalizeItems = (raw) => {
  const arr = Array.isArray(raw) ? raw : (raw?.articles || raw?.items || [])
  return arr
    .map(x => ({
      id: String(x.id ?? x.slug ?? x._id ?? x.path ?? '').trim(),
      title: String(x.title ?? x.name ?? x.label ?? '(untitled)').trim(),
    }))
    .filter(x => x.id)
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(props.src, { cache: props.noCache ? 'no-store' : 'default' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    items.value = normalizeItems(data)
  } catch (e) {
    error.value = String(e?.message || e)
  } finally {
    loading.value = false
  }
}

const toggle = () => {
  open.value = !open.value
  if (open.value && !items.value.length && !loading.value) load()
}

const linkTo = (id) => `${props.basePath}/${encodeURIComponent(id)}`

const go = (id) => {
  // 直接使用硬链接，避免强依赖 vue-router
  window.location.href = linkTo(id)
}

// 点击外部关闭
const onDocPointer = (ev) => {
  if (!open.value) return
  if (root.value && !root.value.contains(ev.target)) open.value = false
}
watch(open, (v) => {
  if (v) document.addEventListener('pointerdown', onDocPointer, { capture: true })
  else document.removeEventListener('pointerdown', onDocPointer, { capture: true })
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer, { capture: true }))
onMounted(() => {/* 懒加载，首次点开时请求 */})
</script>

<style scoped>
/* 根容器固定在左侧中部；不影响全局样式 */
.ltoc {
  position: fixed;
  left: 20px;
  top: 84%;
  transform: translateY(-50%);
  z-index: 2147483000;
}

/* 悬浮按钮 */
.ltoc__btn {
  display: grid;
  place-items: center;
  width: 36.2px;
  height: 36.2px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: var(--background-color);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  cursor: pointer;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
  outline: none;
}
.ltoc__btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.28); }
.ltoc__btn:active { transform: translateY(0); box-shadow: 0 4px 14px rgba(0,0,0,.2); }
.ltoc__icon { width: 22px; height: 22px; fill: var(--background-color); }

/* 弹出面板（从按钮向右侧“抽屉式”展开） */
.ltoc__panel {
  position: absolute;
  left: 50px; /* 紧贴按钮右侧 */
  top: -400%;
  transform: translateY(-50%);
  width: 500px;
  max-height: min(60vh, 560px);
  display: flex;
  flex-direction: column;

  /* 毛玻璃 + 主题变量 */
  background: rgba(30, 30, 46, 0.6);
  -webkit-backdrop-filter: blur(8.5px) saturate(1.1);
  backdrop-filter: blur(8.5px) saturate(1.1);

  border: 0px solid var(--border-color);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.35);
  color: var(--text-color);
}

/* 小箭头（指向按钮） */
.ltoc__panel::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 88.55%;
  transform: translateY(-50%) rotate(-45deg);
  width: 20px; height: 20px;
  background: inherit;
  border-left: 0px solid var(--border-color);
  border-top: 0px solid var(--border-color);
  -webkit-backdrop-filter: inherit; backdrop-filter: inherit;
}

.ltoc__hdr {
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem .9rem .6rem .9rem;
  border-bottom: 1px dashed var(--border-color);
}
.ltoc__title { font-weight: 700; font-family: "LXGW WenKai";}
.ltoc__count { opacity: .75; font-size: .9rem; }
.ltoc__close {
  margin-left: auto;
  width: 15px; height: 15px; border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--danger-color);
  color: var(--text-color); cursor: pointer;
}
.ltoc__close:hover { background: linear-gradient(135deg, var(--danger-color), var(--accent-color)); }

.ltoc__body {
  overflow: auto;
  overscroll-behavior: contain;
  padding: .4rem .3rem .6rem .3rem;
}

/* 列表 */
.ltoc__list { list-style: none; margin: 0; padding: 0; }
.ltoc__item + .ltoc__item { border-top: 1px solid rgba(255,255,255,0.1); }

.ltoc__link {
  display: grid;
  grid-template-columns: 12px 1fr;
  align-items: center;
  gap: .6rem;
  padding: .55rem .7rem;
  text-decoration: none;
  color: var(--text-color);
  border-radius: 10px;
  transition: background-color .15s ease, transform .08s ease;
  font-family: "LXGW WenKai";
}
.ltoc__link:hover {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  color: var(--background-color);
}
.ltoc__link:active { transform: translateY(1px); }

.ltoc__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--link-color);
  box-shadow: 0 0 8px var(--link-color);
}
.ltoc__text {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.2;
}

/* 状态文本 */
.ltoc__state {
  padding: .8rem .9rem; opacity: .8; font-size: .95rem;
}
.ltoc__state--err { color: var(--danger-color); }

/* 动画 */
.ltoc-pop-enter-from,
.ltoc-pop-leave-to   { opacity: 0; transform: translate(8px, -50%) scale(.98); }
.ltoc-pop-enter-active,
.ltoc-pop-leave-active { transition: opacity .16s ease, transform .16s ease; }

/* 无动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ltoc__btn, .ltoc-pop-enter-active, .ltoc-pop-leave-active { transition: none !important; }
}
</style>