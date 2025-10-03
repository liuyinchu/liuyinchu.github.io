<template>
  <div class="lsrch" :style="rootPosStyle">
    <!-- 悬浮按钮（同样式，小方圆角 36.2） -->
    <button
      class="lsrch__btn"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="lsrch-dialog"
      aria-label="Open search"
      @click="openSearch"
    >
      <svg viewBox="0 0 24 24" class="lsrch__icon" aria-hidden="true">
        <path d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.7.7l.27.28v.79L20 21.5 21.5 20l-6-6zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
      </svg>
    </button>

    <!-- Teleport 遮罩到 body，规避 transform 包含块问题 -->
    <teleport to="body">
      <transition name="lsrch-fade">
        <div v-if="open" class="lsrch__mask" @click.self="close" role="presentation">
          <div
            id="lsrch-dialog"
            class="lsrch__dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Search articles"
            @keydown.esc.prevent="close"
          >
            <header class="lsrch__hdr">
              <span class="lsrch__title">搜索</span>
              <!-- <button class="lsrch__close" aria-label="Close" @click="close"></button> -->
            </header>

            <div class="lsrch__bar">
              <input
                ref="inputEl"
                v-model="q"
                type="search"
                class="lsrch__input"
                :placeholder="placeholder"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
                inputmode="search"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="enter"
              />
            </div>

            <!-- 只有有输入时才渲染结果；无输入不显示任何东西 -->
            <div v-if="qTrim.length" class="lsrch__body">
              <ul class="lsrch__list" role="list">
                <li
                  v-for="(it, i) in results"
                  :key="it.id"
                  class="lsrch__item"
                  :class="{ 'is-active': i === sel }"
                >
                  <a
                    class="lsrch__link"
                    :href="linkTo(it.id)"
                    @click.prevent="go(it.id)"
                    @mousemove="sel = i"
                  >
                    <span class="lsrch__text">{{ it.title }}</span>
                  </a>
                </li>
                <li v-if="!loading && !results.length" class="lsrch__state">No matches</li>
              </ul>
              <div v-if="loading" class="lsrch__state">Searching…</div>
              <div v-if="error" class="lsrch__state lsrch__state--err">{{ error }}</div>
            </div>

            <footer class="lsrch__foot">
              <small class="lsrch__note">Local-only search. We don’t collect or store input !</small>
            </footer>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

/** 静态站点隐私承诺：
 * - 不写入 localStorage/sessionStorage/cookie
 * - 不把输入拼进 URL
 * - 仅同源 GET /article.json（credentials: 'omit'）
 */

const props = defineProps({
  src: { type: String, default: '/article.json' }, // 数据源
  basePath: { type: String, default: '/space1' },  // 跳转前缀
  left: { type: [Number, String], default: 20 },   // 悬浮按钮位置
  top:  { type: [Number, String], default: '70%' },
  noCache: { type: Boolean, default: true },
  placeholder: { type: String, default: '请输入关键词' },
})

const open = ref(false)
const items = ref([])    // {id,title,desc}
const loading = ref(false)
const error = ref('')
const q = ref('')
const sel = ref(0)
const inputEl = ref(null)

const qTrim = computed(() => q.value.trim())

const rootPosStyle = computed(() => ({
  left: typeof props.left === 'number' ? `${props.left}px` : String(props.left),
  top:  typeof props.top  === 'number' ? `${props.top}px`  : String(props.top),
}))

const normalizeItems = (raw) => {
  const arr = Array.isArray(raw) ? raw : (raw?.articles || raw?.items || [])
  return arr.map(x => ({
    id: String(x.id ?? x.slug ?? x._id ?? x.path ?? '').trim(),
    title: String(x.title ?? x.name ?? x.label ?? '(untitled)').trim(),
    desc: String(x.desc ?? x.description ?? x.summary ?? '').trim(),
  })).filter(x => x.id)
}

const load = async () => {
  if (items.value.length || loading.value) return
  loading.value = true; error.value = ''
  try {
    const res = await fetch(props.src, {
      cache: props.noCache ? 'no-store' : 'default',
      credentials: 'omit',
      // 限制同源；若非同源资源，请移除此项并确保 CORS 正确
      mode: 'same-origin',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    items.value = normalizeItems(data)
  } catch (e) {
    error.value = String(e?.message || e)
  } finally {
    loading.value = false
  }
}

const openSearch = async () => {
  open.value = true
  await load()
  await nextTick()
  inputEl.value?.focus()
}

const close = () => {
  open.value = false
  // 零持久化：关闭时清空输入与选择
  q.value = ''
  sel.value = 0
}

const norm = (s) => s.toLowerCase()

const results = computed(() => {
  const key = norm(qTrim.value)
  if (!key) return []
  const r = items.value.filter(it => {
    const t = norm(it.title), d = norm(it.desc)
    return t.includes(key) || d.includes(key)
  })
  return r.sort((a,b) => {
    const keyIdx = (t, d) => {
      const ti = t.indexOf(key), di = d.indexOf(key)
      return ti >= 0 ? ti : (di >= 0 ? 1000 + di : 9999)
    }
    const sa = keyIdx(norm(a.title), norm(a.desc))
    const sb = keyIdx(norm(b.title), norm(b.desc))
    if (sa !== sb) return sa - sb
    return a.title.localeCompare(b.title)
  })
})

const linkTo = (id) => `${props.basePath}/${encodeURIComponent(id)}`
const go = (id) => { window.location.href = linkTo(id) }

/** 键盘选择 */
const move = (delta) => {
  const n = results.value.length
  if (!n) return
  sel.value = ( (sel.value + delta) % n + n ) % n
}

/** 回车进入 */
const enter = () => {
  const it = results.value[sel.value]
  if (it) go(it.id)
}
</script>

<style scoped>
/* 悬浮按钮位置（与目录按钮风格一致，可用 props 改） */
.lsrch {
  position: fixed;
  transform: translateY(-50%);
  z-index: 2147483000;
}

/* 悬浮按钮：36.2px + 10px 圆角，渐变、阴影与上个一致 */
.lsrch__btn{
  display: grid; place-items: center;
  width: 36.2px; height: 36.2px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--success-color), var(--primary-color));
  color: var(--background-color);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  cursor: pointer;
  transition: transform .15s ease, box-shadow .2s ease, opacity .2s ease;
  outline: none;
}
.lsrch__btn:hover{ transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.28); }
.lsrch__btn:active{ transform: translateY(0); box-shadow: 0 4px 14px rgba(0,0,0,.2); }
.lsrch__icon{ width: 20px; height: 20px; fill: var(--background-color); }

/* 遮罩与对话框（居中） */
.lsrch__mask{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  display: grid; place-items: center;
  z-index: 2147483200;
}

.lsrch__dialog{
  width: min(720px, 92vw);
  max-height: min(75vh, 720px);
  display: flex; flex-direction: column;
  background: var(--frosted-glass, rgba(20,20,20,.78));
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  backdrop-filter: blur(12px) saturate(1.1);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: 0 18px 56px rgba(0,0,0,.4);
  color: var(--text-color);
}

.lsrch__hdr{
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem .9rem .6rem .9rem;
  border-bottom: 1px dashed var(--border-color);
}
.lsrch__title{ font-weight: 750; font-family: "LXGW WenKai";}
.lsrch__close{
  margin-left: auto; width: 15px; height: 15px;
  border-radius: 999px; border: 1px solid var(--border-color);
  background: var(--surface-color-hover); color: var(--danger-color); cursor: pointer;
}
.lsrch__close:hover{ color: var(--background-color); background: var(--danger-color); }

.lsrch__bar{ padding: .75rem .9rem .3rem .9rem; }
.lsrch__input{
  width: 100%; font-size: 1rem;
  padding: .65rem .8rem; border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
  font-family: "LXGW WenKai";
  outline: none;
}
.lsrch__input:focus{ border-color: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 25%, transparent); }

.lsrch__body{
  overflow: auto; overscroll-behavior: contain;
  padding: .3rem .3rem .6rem .3rem;
}

.lsrch__list{ list-style: none; margin: 0; padding: 0; }
.lsrch__item + .lsrch__item{ border-top: 1px solid rgba(255,255,255,0.04); }
.lsrch__link{
  display: grid; grid-template-columns: 12px 1fr;
  align-items: center; gap: .6rem;
  padding: .55rem .7rem; text-decoration: none;
  color: var(--text-color); border-radius: 10px;
  transition: background-color .15s ease, transform .08s ease;
  font-family: "LXGW WenKai";
}
.lsrch__link::before{
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: var(--link-color); box-shadow: 0 0 8px var(--link-color);
}
.lsrch__link:hover{ color: var(--background-color); background: linear-gradient(135deg, var(--primary-color), var(--success-color)); }
.is-active .lsrch__link{ color: var(--background-color); background: linear-gradient(135deg, var(--primary-color), var(--success-color)); }

/* 新增：纯文本 title 的网格放到第 2 列，超长省略 */
.lsrch__text{
  grid-column: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lsrch__state{ padding: .8rem .9rem; opacity: .8; font-size: .95rem; }
.lsrch__state--err{ color: var(--danger-color); }

.lsrch__foot{ padding: .2rem .9rem .7rem .9rem; opacity: 1; color: var(--danger-color);font-family: "LXGW WenKai";}

.lsrch-fade-enter-from, .lsrch-fade-leave-to { opacity: 0; }
.lsrch-fade-enter-active, .lsrch-fade-leave-active { transition: opacity .15s ease; }

@media (prefers-reduced-motion: reduce){
  .lsrch__btn, .lsrch-fade-enter-active, .lsrch-fade-leave-active{ transition: none !important; }
}
</style>