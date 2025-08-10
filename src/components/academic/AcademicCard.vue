<template>
  <section
    class="academic-card"
    role="region"
    aria-labelledby="ac-card-title"
  >
    <!-- 霓虹描边 -->
    <div class="frame"></div>

    <!-- 头部：姓名 / 头衔（可空） -->
    <header class="card-header" v-if="data?.name || data?.title">
      <h2 id="ac-card-title" class="card-name" v-if="data?.name">
        {{ data.name }}
      </h2>
      <p class="card-title" v-if="data?.title">{{ data.title }}</p>
    </header>

    <div class="card-body">
      <!-- Research Interests -->
      <section class="card-section" v-if="interests.length">
        <h3 class="sec-title">Research Interests</h3>
        <div class="interests-tags">
          <span
            v-for="interest in interests"
            :key="interest"
            class="tag"
          >{{ interest }}</span>
        </div>
      </section>

      <!-- Career in Three Lines -->
      <section class="card-section" v-if="careerLines.length">
        <h3 class="sec-title">Career in Three Lines</h3>
        <ul class="list">
          <li v-for="(line, i) in careerLines" :key="i">{{ line }}</li>
        </ul>
      </section>

      <!-- Highlights：支持字符串数组和对象数组 -->
      <section class="card-section" v-if="hlList.length">
        <h3 class="sec-title">Highlights</h3>
        <ul class="list">
          <li v-for="(h, i) in hlList" :key="i">
            <template v-if="h.isObject">
              <strong v-if="h.title">{{ h.title }}</strong>
              <span v-if="h.title && (h.summary || h.link)" class="dash"> — </span>
              <span v-if="h.summary">{{ h.summary }}</span>
              <a v-if="h.link" :href="h.link" target="_blank" rel="noopener" class="ext">
                link
              </a>
            </template>
            <template v-else>
              {{ h.text }}
            </template>
          </li>
        </ul>
      </section>

      <!-- Contact -->
      <section class="card-section" v-if="hasContact">
        <h3 class="sec-title">Contact</h3>

        <div class="contact">
          <div v-if="email" class="contact-row">
            <span class="label">Email</span>
            <a class="value" :href="`mailto:${email}`">{{ email }}</a>
          </div>

          <div v-if="contactLinks.length" class="contact-row">
            <span class="label">Links</span>
            <div class="links">
              <a
                v-for="(item, i) in contactLinks"
                :key="i"
                :href="item.url"
                target="_blank"
                rel="noopener"
                class="ext"
              >
                {{ item.name }}
              </a>
            </div>
          </div>

          <div v-if="location" class="contact-row">
            <span class="label">Location</span>
            <span class="value">{{ location }}</span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true }
})

/* --- 安全解构与兼容 --- */
const interests = computed(() => props.data?.research_interests ?? [])
const careerLines = computed(() => props.data?.career_three_lines ?? [])

/* highlights: 字符串数组 / 对象数组 兼容 */
const hlList = computed(() => {
  const hs = props.data?.highlights ?? []
  return hs.map(h => {
    if (typeof h === 'string') return { isObject: false, text: h }
    if (h && typeof h === 'object') return { isObject: true, ...h }
    return { isObject: false, text: String(h) }
  })
})

/* contact */
const email = computed(() => props.data?.contact?.email || '')
const location = computed(() => props.data?.contact?.location || '')
const contactLinks = computed(() => {
  const links = props.data?.contact?.links || {}
  return Object.entries(links).map(([name, url]) => ({ name, url }))
})
const hasContact = computed(() => !!(email.value || location.value || contactLinks.value.length))
</script>

<style scoped>
/* 尺寸体系 */
:host, .academic-card {
  --sp-0: 0;
  --sp-1: 0.25rem;
  --sp-2: 0.5rem;
  --sp-3: 0.75rem;
  --sp-4: 1rem;
  --sp-5: 1.25rem;
  --sp-6: 1.5rem;

  --radius: 16px;
  --glow: 0 10px 28px rgba(0,0,0,.18);
}

/* 容器 */
.academic-card {
  position: relative;
  isolation: isolate;
  background: color-mix(in oklab, var(--surface-color) 92%, black 0%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--sp-6) var(--sp-6) var(--sp-5);
  box-shadow: var(--glow);
  backdrop-filter: blur(10px) saturate(1.08);
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp .5s ease-out forwards;
}
@media (prefers-reduced-motion: reduce) {
  .academic-card { animation: none; opacity: 1; transform: none; }
}

/* 霓虹描边 */
.frame {
  pointer-events: none;
  position: absolute; inset: 0;
  border-radius: calc(var(--radius) + 1px);
}
.frame::before {
  content: "";
  position: absolute; inset: -1px;
  border-radius: inherit;
  background:
    conic-gradient(
      from 0deg,
      color-mix(in oklab, var(--primary-color) 82%, white 0%) 0%,
      color-mix(in oklab, var(--accent-color) 82%, white 0%) 30%,
      color-mix(in oklab, var(--link-color) 82%, white 0%) 60%,
      color-mix(in oklab, var(--primary-color) 82%, white 0%) 100%
    );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  padding: 1px;
  opacity: .22;
  filter: blur(.2px);
  transition: opacity .25s ease;
}
.academic-card:hover .frame::before { opacity: .35; }

/* 头部 */
.card-header {
  text-align: center;
  padding-bottom: var(--sp-3);
  margin-bottom: var(--sp-3);
  border-bottom: 1px solid var(--border-color);
}
.card-name {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem); /* ↑ 增大 */
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: .02em;
}
.card-title {
  margin: .45rem 0 0;
  font-size: clamp(1.3rem, 2vw, 1.6rem); /* ↑ 增大 */
  font-weight: 400;
  color: var(--text-color);
  opacity: .92;
}

/* 分节 */
.card-section { margin-top: var(--sp-5); }
.card-section:first-child { margin-top: var(--sp-3); }

.sec-title {
  margin: 0 0 var(--sp-2);
  font-size: 1.2rem; /* ↑ 增大 */
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--accent-color);
  padding-left: .6rem;
  border-left: 3px solid var(--primary-color);
}

/* 标签 */
.interests-tags {
  display: flex; flex-wrap: wrap; gap: .5rem .6rem;
}
.tag {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .45rem .85rem; /* ↑ 增大 */
  border-radius: 999px;
  border: 1px solid var(--border-color);
  /* background: color-mix(in oklab, var(--surface-color) 85%, black 0%); */
  background: #45475a ;
  color: var(--text-color);
  font-size: 1rem; /* ↑ 增大 */
  font-weight: 500;
  transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
}
.tag:hover, .tag:focus-visible {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--primary-color) 70%, white 0%);
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary-color) 22%, transparent),
              0 6px 18px rgba(0,0,0,.18);
  outline: none;
}

/* 列表 */
.list { list-style: none; margin: 0; padding: 0; }
.list > li {
  position: relative;
  padding-left: 1.15rem;
  font-size: 1.05rem; /* ↑ 增大 */
  line-height: 1.75; /* ↑ 行高 */
  margin: .2rem 0;
}
.list > li::before {
  content: "";
  position: absolute; left: 0; top: .65em;
  width: .5rem; height: .5rem; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%,
              color-mix(in oklab, var(--primary-color) 80%, white 0%) 0%,
              color-mix(in oklab, var(--accent-color) 70%, white 0%) 60%,
              transparent 70%);
  box-shadow: 0 0 0 1px var(--border-color);
}

/* 联系方式 */
.contact { display: grid; gap: .5rem; }
.contact-row {
  display: grid; grid-template-columns: 90px 1fr;
  gap: .5rem; align-items: baseline;
}
.label { color: var(--link-color); opacity: .95; font-size: 1rem; /* ↑ 增大 */ }
.value { color: var(--text-color); font-size: 1.05rem; /* ↑ 增大 */ word-break: break-word; }
.links { display: flex; flex-wrap: wrap; gap: .5rem .9rem; }

a.ext {
  color: var(--link-color); text-decoration: none; position: relative;
  outline: none; font-size: 1.05rem; /* ↑ 增大 */
}
a.ext::after {
  content: "↗"; font-size: .8em; margin-left: .25em; opacity: .8;
}
a.ext:hover { color: var(--primary-color-hover); text-decoration: underline; }
a.ext:focus-visible {
  text-decoration: underline;
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary-color) 25%, transparent);
  border-radius: 6px;
}

/* 动画 */
@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}
</style>