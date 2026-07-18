<script setup>
import { computed, onMounted, ref } from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'

const brief = ref(null)
const publications = ref([])
const markdownContent = ref('')
const experience = ref([])
const conferences = ref([])
const isLoading = ref(true)
const dataIssues = ref([])

const sections = [
  ['academic-profile', 'Profile'],
  ['academic-focus', 'Research Focus'],
  ['academic-work', 'Current Work'],
  ['academic-publications', 'Publications'],
  ['academic-record', 'Experience'],
  ['academic-contact', 'Contact'],
]

const contactLinks = computed(() => {
  const links = Object.entries(brief.value?.contact?.links || {}).map(([label, href]) => ({ label, href }))
  const email = brief.value?.contact?.email
  return [
    { label: 'Research Homepage', href: '/research' },
    ...links,
    ...(email ? [{ label: 'Email', href: `mailto:${email}` }] : []),
  ]
})

const visiblePublications = computed(() => publications.value.filter((item) => {
  const placeholderAuthors = item.authors?.some((author) => /您的名字|your name/i.test(author))
  return item.title && !/论文题目|paper title/i.test(item.title) && !placeholderAuthors && !/xxxx/i.test(item.link || '')
}))

const visibleConferences = computed(() => conferences.value.filter((item) => (
  item.name
  && !/conference name/i.test(item.name)
  && !/yyyy/i.test(item.date || '')
)))

const visibleHighlights = computed(() => (brief.value?.highlights || []).filter((item) => (
  item && !/^(?:is'?s|it'?s) a pity/i.test(item.trim())
)))

const renderedWorkContent = computed(() => markdownContent.value
  .replace(/^##\s+My Current and Future Work[^\n]*\n+/i, '')
  .replace(/^#\s+/gm, '### ')
  .replace(/^##\s+/gm, '#### '))

async function fetchResource(url, type) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return type === 'text' ? response.text() : response.json()
}

async function loadAcademicData() {
  const resources = [
    ['brief', '/data/academic_brief.json', 'json', '学术简介'],
    ['publications', '/data/publications.json', 'json', '成果列表'],
    ['markdown', '/data/highlight_work.md', 'text', '当前工作'],
    ['experience', '/data/experience.json', 'json', '经历'],
    ['conferences', '/data/conferences.json', 'json', '会议记录'],
  ]

  const results = await Promise.allSettled(resources.map(([, url, type]) => fetchResource(url, type)))
  const issues = []

  results.forEach((result, index) => {
    const [key, , , label] = resources[index]
    if (result.status === 'rejected') {
      issues.push(label)
      console.error(`Academic 数据加载失败（${label}）:`, result.reason)
      return
    }

    if (key === 'brief') brief.value = result.value
    if (key === 'publications') publications.value = Array.isArray(result.value) ? result.value : []
    if (key === 'markdown') markdownContent.value = result.value
    if (key === 'experience') experience.value = Array.isArray(result.value) ? result.value : []
    if (key === 'conferences') conferences.value = Array.isArray(result.value) ? result.value : []
  })

  dataIssues.value = issues
  isLoading.value = false
}

onMounted(loadAcademicData)
</script>

<template>
  <main class="academic-page">
    <div class="academic-atmosphere" aria-hidden="true"></div>

    <section class="signature-hero" aria-labelledby="academic-title">
      <RouterLink class="research-link" to="/research">Research Homepage</RouterLink>
      <div class="signature-copy">
        <p>Academic Card · Yang Shuyun</p>
        <h1 id="academic-title" class="sr-only">{{ brief?.name || 'Yang Shuyun' }} 的学术主页</h1>
        <div class="signature-stage" aria-label="Shuyun Yang signature">
          <svg
            class="signature-outline"
            viewBox="0 0 460 149"
            role="img"
            aria-label="Shuyun Yang signature outline"
          >
            <defs>
              <filter id="academic-signature-outline-filter">
                <feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="expanded" />
                <feComposite in="expanded" in2="SourceAlpha" operator="out" result="outline" />
                <feFlood flood-color="#89b4fa" flood-opacity="0.95" result="color" />
                <feComposite in="color" in2="outline" operator="in" />
              </filter>
            </defs>
            <image
              href="/fig/signature-shuyun-yang.png"
              width="460"
              height="149"
              preserveAspectRatio="xMidYMid meet"
              filter="url(#academic-signature-outline-filter)"
            />
          </svg>
          <img
            class="signature-fill"
            src="/fig/signature-shuyun-yang.png"
            alt="Shuyun Yang signature"
          >
        </div>
        <p class="signature-role">{{ brief?.title || 'Academic Profile' }}</p>
        <a class="enter-profile" href="#academic-profile">
          <span>Explore profile</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>

    <div class="academic-shell">
      <aside class="academic-nav" aria-label="学术主页章节">
        <p>INDEX</p>
        <a v-for="([id, label], index) in sections" :key="id" :href="`#${id}`">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          {{ label }}
        </a>
      </aside>

      <div class="academic-content">
        <div v-if="isLoading" class="academic-status" role="status">
          <span aria-hidden="true"></span>
          正在读取学术资料…
        </div>

        <div v-else-if="dataIssues.length" class="academic-notice" role="status">
          部分资料暂未载入：{{ dataIssues.join('、') }}。其余内容仍可正常浏览。
        </div>

        <section id="academic-profile" class="academic-section profile-section" aria-labelledby="profile-title">
          <header class="section-heading">
            <p>01 / Profile</p>
            <h2 id="profile-title">学术名片</h2>
          </header>

          <div class="profile-layout">
            <dl class="identity-card">
              <div>
                <dt>Name</dt>
                <dd>{{ brief?.name || 'Yang Shuyun' }}</dd>
              </div>
              <div>
                <dt>Current title</dt>
                <dd>{{ brief?.title || 'Undergraduate' }}</dd>
              </div>
              <div>
                <dt>Primary focus</dt>
                <dd>{{ brief?.research_interests?.[0] || 'Control and dynamics' }}</dd>
              </div>
            </dl>

            <div class="profile-statements">
              <p v-for="statement in brief?.career_three_lines || []" :key="statement">
                {{ statement }}
              </p>
              <p v-if="!brief?.career_three_lines?.length">
                Profile details are being prepared.
              </p>
            </div>
          </div>
        </section>

        <section id="academic-focus" class="academic-section" aria-labelledby="focus-title">
          <header class="section-heading section-heading--split">
            <div>
              <p>02 / Research Focus</p>
              <h2 id="focus-title">研究方向</h2>
            </div>
            <span>从精密测量到智能控制，一组彼此相连的问题。</span>
          </header>

          <ul class="interest-list">
            <li v-for="(interest, index) in brief?.research_interests || []" :key="interest">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              {{ interest }}
            </li>
          </ul>
        </section>

        <section id="academic-work" class="academic-section" aria-labelledby="work-title">
          <header class="section-heading section-heading--split">
            <div>
              <p>03 / Current Work</p>
              <h2 id="work-title">当前工作</h2>
            </div>
            <span>Current and future work &amp; vision</span>
          </header>

          <div v-if="renderedWorkContent" class="work-document">
            <MarkdownViewer :content="renderedWorkContent" variant="embed" />
          </div>
          <div v-else class="empty-state">当前工作说明正在整理。</div>
        </section>

        <section id="academic-publications" class="academic-section" aria-labelledby="publications-title">
          <header class="section-heading section-heading--split">
            <div>
              <p>04 / Publications</p>
              <h2 id="publications-title">出版与成果</h2>
            </div>
            <span>只展示已确认的公开记录。</span>
          </header>

          <div v-if="visiblePublications.length" class="publication-list">
            <article v-for="item in visiblePublications" :key="`${item.title}-${item.year}`">
              <div class="publication-meta">
                <span>{{ item.type || 'Publication' }}</span>
                <time>{{ item.year }}</time>
              </div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.authors?.join(', ') }}</p>
              <small>{{ item.venue }}</small>
              <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer">Open publication ↗</a>
            </article>
          </div>
          <div v-else class="empty-state">
            <strong>公开成果列表待更新</strong>
            <p>示例占位数据不会在正式页面中冒充真实成果；后续补充 JSON 后会自动显示。</p>
          </div>

          <div v-if="visibleHighlights.length" class="highlight-list">
            <p v-for="highlight in visibleHighlights" :key="highlight">{{ highlight }}</p>
          </div>
        </section>

        <section id="academic-record" class="academic-section" aria-labelledby="record-title">
          <header class="section-heading">
            <p>05 / Experience</p>
            <h2 id="record-title">经历与会议</h2>
          </header>

          <div class="record-grid">
            <div>
              <h3>Experience</h3>
              <ol v-if="experience.length" class="experience-list">
                <li v-for="item in experience" :key="`${item.period}-${item.organization}`">
                  <time>{{ item.period }}</time>
                  <h4>{{ item.role }}</h4>
                  <p>{{ item.organization }}</p>
                  <span>{{ item.description }}</span>
                </li>
              </ol>
              <div v-else class="empty-state empty-state--compact">经历资料待更新。</div>
            </div>

            <div>
              <h3>Conferences</h3>
              <div v-if="visibleConferences.length" class="conference-list">
                <article v-for="item in visibleConferences" :key="`${item.name}-${item.date}`">
                  <time>{{ item.date }}</time>
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.event }} · {{ item.location }}</p>
                </article>
              </div>
              <div v-else class="empty-state empty-state--compact">
                会议记录尚未公开；示例占位条目已隐藏。
              </div>
            </div>
          </div>
        </section>

        <section id="academic-contact" class="academic-section contact-section" aria-labelledby="contact-title">
          <header class="section-heading section-heading--split">
            <div>
              <p>06 / Contact</p>
              <h2 id="contact-title">联系与入口</h2>
            </div>
            <span>{{ brief?.contact?.email || 'Contact details' }}</span>
          </header>

          <div class="contact-grid">
            <template v-for="link in contactLinks" :key="link.label">
              <RouterLink v-if="link.href.startsWith('/')" :to="link.href">
                <span>{{ link.label }}</span>
                <i aria-hidden="true">↗</i>
              </RouterLink>
              <a
                v-else
                :href="link.href"
                :target="link.href.startsWith('http') ? '_blank' : undefined"
                :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              >
                <span>{{ link.label }}</span>
                <i aria-hidden="true">↗</i>
              </a>
            </template>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
.academic-page {
  --academic-panel: rgba(24, 24, 37, 0.7);
  --academic-border: rgba(180, 190, 254, 0.14);
  position: relative;
  min-height: 100dvh;
  overflow: clip;
  color: #cdd6f4;
  background:
    radial-gradient(circle at 14% 12%, rgba(137, 180, 250, 0.11), transparent 34rem),
    radial-gradient(circle at 86% 28%, rgba(203, 166, 247, 0.08), transparent 32rem),
    #0d0e18;
  font-family: 'Inter', 'LXGW WenKai', sans-serif;
}

.academic-atmosphere {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(205, 214, 244, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(205, 214, 244, 0.022) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: linear-gradient(180deg, #000, transparent 82%);
}

.signature-hero {
  position: relative;
  z-index: 1;
  display: grid;
  box-sizing: border-box;
  min-height: calc(100svh - 72px);
  place-items: center;
  padding: clamp(4.5rem, 10vh, 7rem) 1.25rem;
}

.signature-hero::after {
  content: '';
  position: absolute;
  right: 8vw;
  bottom: 8vh;
  left: 8vw;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(137, 180, 250, 0.34), transparent);
}

.research-link {
  position: absolute;
  top: 1.4rem;
  right: clamp(1rem, 4vw, 3rem);
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  padding: 0 0.95rem;
  border: 1px solid var(--academic-border);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.72);
  background: rgba(17, 17, 27, 0.48);
  font-family: 'Fira Code', monospace;
  font-size: 0.7rem;
  text-decoration: none;
}

.research-link:hover,
.research-link:focus-visible {
  border-color: rgba(137, 180, 250, 0.5);
  color: #89dceb;
}

.signature-copy {
  display: grid;
  width: min(900px, 100%);
  place-items: center;
  text-align: center;
}

.signature-copy > p:first-child,
.section-heading > p,
.section-heading > div > p {
  margin: 0;
  color: rgba(137, 220, 235, 0.7);
  font-family: 'Fira Code', monospace;
  font-size: 0.68rem;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.signature-stage {
  position: relative;
  width: min(78vw, 720px);
  aspect-ratio: 460 / 149;
  margin: clamp(1.4rem, 5vh, 3rem) 0 0.7rem;
}

.signature-outline,
.signature-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.signature-outline {
  clip-path: inset(0 100% 0 0);
  filter: drop-shadow(0 0 18px rgba(137, 180, 250, 0.35));
  animation: signature-trace 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
}

.signature-fill {
  clip-path: inset(0 100% 0 0);
  opacity: 0;
  filter: drop-shadow(0 24px 58px rgba(0, 0, 0, 0.34)) drop-shadow(0 0 24px rgba(180, 190, 254, 0.18));
  animation:
    signature-fill 1.35s cubic-bezier(0.16, 1, 0.3, 1) 1.15s forwards,
    signature-settle 3s ease-in-out 2.2s infinite;
}

.signature-role {
  margin: 0 0 1.3rem;
  color: rgba(205, 214, 244, 0.58);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.enter-profile {
  display: inline-flex;
  min-height: 2.9rem;
  align-items: center;
  gap: 0.7rem;
  padding: 0 1.05rem;
  border: 1px solid rgba(137, 180, 250, 0.36);
  border-radius: 999px;
  color: #d8def8;
  background: rgba(49, 50, 68, 0.48);
  font-size: 0.82rem;
  font-weight: 740;
  text-decoration: none;
  transition: border-color 0.22s ease, background-color 0.22s ease, transform 0.22s ease;
}

.enter-profile:hover,
.enter-profile:focus-visible {
  border-color: rgba(137, 220, 235, 0.62);
  background: rgba(69, 71, 90, 0.62);
  transform: translateY(-2px);
}

@keyframes signature-trace {
  to { clip-path: inset(0 0 0 0); }
}

@keyframes signature-fill {
  0% { clip-path: inset(0 100% 0 0); opacity: 0; }
  100% { clip-path: inset(0 0 0 0); opacity: 1; }
}

@keyframes signature-settle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.academic-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 9.5rem minmax(0, 1fr);
  width: min(100% - 3rem, 1200px);
  margin: 0 auto;
  gap: clamp(2.5rem, 6vw, 6rem);
  padding: clamp(4rem, 8vw, 7rem) 0 clamp(4rem, 8vw, 7rem);
}

.academic-nav {
  position: sticky;
  top: 6rem;
  display: grid;
  align-self: start;
  gap: 0.1rem;
}

.academic-nav > p {
  margin: 0 0 0.8rem;
  color: rgba(166, 173, 200, 0.42);
  font-family: 'Fira Code', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
}

.academic-nav a {
  display: grid;
  grid-template-columns: 1.7rem 1fr;
  gap: 0.45rem;
  padding: 0.65rem 0.2rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.08);
  color: rgba(205, 214, 244, 0.56);
  font-size: 0.72rem;
  text-decoration: none;
}

.academic-nav a:hover,
.academic-nav a:focus-visible {
  color: #89dceb;
}

.academic-nav span {
  color: rgba(137, 180, 250, 0.58);
  font-family: 'Fira Code', monospace;
}

.academic-content {
  min-width: 0;
}

.academic-status,
.academic-notice {
  margin-bottom: 2rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--academic-border);
  border-radius: 0.75rem;
  color: rgba(205, 214, 244, 0.7);
  background: rgba(30, 30, 46, 0.58);
  font-size: 0.8rem;
}

.academic-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.academic-status span {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: #89b4fa;
  box-shadow: 0 0 1rem rgba(137, 180, 250, 0.5);
  animation: status-pulse 1.2s ease-in-out infinite;
}

@keyframes status-pulse {
  50% { opacity: 0.35; }
}

.academic-section {
  scroll-margin-top: 6rem;
  content-visibility: auto;
  contain-intrinsic-size: auto 40rem;
}

.academic-section + .academic-section {
  margin-top: clamp(5rem, 11vw, 9rem);
}

.section-heading {
  margin-bottom: clamp(1.6rem, 4vw, 2.6rem);
}

.section-heading--split {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 2rem;
}

.section-heading h2 {
  margin: 0.35rem 0 0;
  color: #f1f3ff;
  font-size: clamp(2.2rem, 5vw, 4.6rem);
  font-weight: 790;
  letter-spacing: -0.055em;
  line-height: 0.98;
}

.section-heading--split > span {
  max-width: 22rem;
  color: rgba(205, 214, 244, 0.52);
  font-family: 'LXGW WenKai', serif;
  font-size: 0.85rem;
  line-height: 1.65;
  text-align: right;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(15rem, 0.72fr) minmax(0, 1.28fr);
  gap: 1rem;
}

.identity-card,
.profile-statements,
.work-document,
.publication-list article,
.empty-state,
.record-grid > div,
.contact-grid a {
  border: 1px solid var(--academic-border);
  border-radius: 1rem;
  background: var(--academic-panel);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.identity-card {
  margin: 0;
  overflow: hidden;
}

.identity-card div {
  padding: 1rem 1.15rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.1);
}

.identity-card div:last-child {
  border-bottom: 0;
}

.identity-card dt {
  margin-bottom: 0.35rem;
  color: rgba(137, 220, 235, 0.58);
  font-family: 'Fira Code', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.identity-card dd {
  margin: 0;
  color: #e3e7fb;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.4;
}

.profile-statements {
  display: grid;
  align-content: center;
  overflow: hidden;
}

.profile-statements p {
  position: relative;
  margin: 0;
  padding: 1rem 1.2rem 1rem 1.45rem;
  border-bottom: 1px solid rgba(180, 190, 254, 0.1);
  color: rgba(205, 214, 244, 0.75);
  font-family: 'LXGW WenKai', serif;
  font-size: 0.92rem;
  line-height: 1.75;
}

.profile-statements p:last-child {
  border-bottom: 0;
}

.profile-statements p::before {
  content: '';
  position: absolute;
  top: 1.45rem;
  left: 0;
  width: 0.22rem;
  height: 1.3rem;
  background: linear-gradient(#89b4fa, #cba6f7);
}

.interest-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.interest-list li {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  min-height: 4.7rem;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--academic-border);
  border-radius: 0.85rem;
  color: rgba(225, 230, 252, 0.86);
  background: rgba(30, 30, 46, 0.54);
  font-size: 0.88rem;
}

.interest-list span {
  color: rgba(137, 180, 250, 0.58);
  font-family: 'Fira Code', monospace;
  font-size: 0.68rem;
}

.work-document {
  overflow: hidden;
  padding: clamp(1.2rem, 3vw, 2.2rem);
}

.work-document :deep(.markdown-body) {
  max-width: 72ch;
  margin: 0;
  padding: 0;
  font-size: clamp(0.98rem, 1.2vw, 1.08rem);
  line-height: 1.85;
}

.work-document :deep(.markdown-body h1),
.work-document :deep(.markdown-body h3) {
  font-size: clamp(1.6rem, 3.4vw, 2.5rem);
}

.work-document :deep(.markdown-body h2),
.work-document :deep(.markdown-body h4) {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
}

.publication-list {
  display: grid;
  gap: 0.85rem;
}

.publication-list article {
  padding: 1.1rem 1.2rem;
}

.publication-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: rgba(137, 220, 235, 0.64);
  font-family: 'Fira Code', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.publication-list h3 {
  margin: 0.65rem 0 0.35rem;
  color: #eef1ff;
  font-size: 1.2rem;
}

.publication-list p,
.publication-list small {
  margin: 0;
  color: rgba(205, 214, 244, 0.66);
  font-size: 0.82rem;
}

.publication-list small {
  display: block;
  margin-top: 0.25rem;
}

.publication-list a {
  display: inline-flex;
  margin-top: 0.8rem;
  color: #89b4fa;
  font-size: 0.75rem;
  text-decoration: none;
}

.highlight-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.highlight-list p {
  margin: 0;
  padding: 0.9rem 1rem;
  border-left: 2px solid #cba6f7;
  color: rgba(205, 214, 244, 0.72);
  background: rgba(203, 166, 247, 0.07);
}

.empty-state {
  padding: 1.4rem;
  color: rgba(205, 214, 244, 0.62);
}

.empty-state strong {
  display: block;
  margin-bottom: 0.4rem;
  color: rgba(238, 241, 255, 0.86);
}

.empty-state p {
  max-width: 62ch;
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.65;
}

.empty-state--compact {
  border: 0;
  box-shadow: none;
  background: rgba(49, 50, 68, 0.32);
  font-size: 0.82rem;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.record-grid > div {
  min-width: 0;
  padding: 1.1rem;
}

.record-grid > div > h3 {
  margin: 0 0 1rem;
  color: rgba(137, 220, 235, 0.72);
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.experience-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0 0 0 1.25rem;
  border-left: 1px solid rgba(137, 180, 250, 0.28);
  list-style: none;
}

.experience-list li {
  position: relative;
  padding: 0 0 1.35rem 0.25rem;
}

.experience-list li::before {
  content: '';
  position: absolute;
  top: 0.3rem;
  left: -1.6rem;
  width: 0.55rem;
  height: 0.55rem;
  border: 2px solid #89b4fa;
  border-radius: 50%;
  background: #181825;
}

.experience-list time,
.conference-list time {
  color: rgba(137, 180, 250, 0.62);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
}

.experience-list h4,
.conference-list h4 {
  margin: 0.35rem 0;
  color: #eef1ff;
  font-size: 1rem;
}

.experience-list p,
.conference-list p {
  margin: 0;
  color: rgba(205, 214, 244, 0.68);
  font-size: 0.82rem;
  line-height: 1.55;
}

.experience-list span {
  display: block;
  margin-top: 0.5rem;
  color: rgba(205, 214, 244, 0.52);
  font-family: 'LXGW WenKai', serif;
  font-size: 0.8rem;
  line-height: 1.65;
}

.conference-list {
  display: grid;
  gap: 0.75rem;
}

.conference-list article {
  padding: 0.85rem;
  border: 1px solid rgba(180, 190, 254, 0.1);
  border-radius: 0.75rem;
  background: rgba(49, 50, 68, 0.28);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.contact-grid a {
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
  color: rgba(225, 230, 252, 0.82);
  text-decoration: none;
  transition: border-color 0.22s ease, transform 0.22s ease, background-color 0.22s ease;
}

.contact-grid a:hover,
.contact-grid a:focus-visible {
  border-color: rgba(137, 220, 235, 0.46);
  background: rgba(49, 50, 68, 0.72);
  transform: translateY(-2px);
}

.contact-grid i {
  color: #89dceb;
  font-style: normal;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .signature-hero {
    min-height: calc(100svh - 68px);
  }

  .academic-shell {
    grid-template-columns: 1fr;
    width: min(100% - 2rem, 1200px);
    gap: 2rem;
  }

  .academic-nav {
    position: sticky;
    top: 68px;
    z-index: 8;
    display: flex;
    overflow-x: auto;
    gap: 0.35rem;
    margin-inline: -1rem;
    padding: 0.7rem 1rem;
    border-block: 1px solid rgba(180, 190, 254, 0.1);
    background: rgba(13, 14, 24, 0.9);
    backdrop-filter: blur(12px);
    scrollbar-width: thin;
  }

  .academic-nav > p {
    display: none;
  }

  .academic-nav a {
    min-width: max-content;
    grid-template-columns: auto 1fr;
    padding: 0.55rem 0.75rem;
    border: 1px solid rgba(180, 190, 254, 0.12);
    border-radius: 999px;
    background: rgba(30, 30, 46, 0.62);
  }
}

@media (max-width: 720px) {
  .signature-hero {
    padding-top: 4rem;
  }

  .research-link {
    top: 0.8rem;
  }

  .signature-stage {
    width: min(92vw, 720px);
  }

  .section-heading--split,
  .profile-layout,
  .record-grid {
    grid-template-columns: 1fr;
  }

  .section-heading--split {
    display: grid;
    gap: 0.75rem;
  }

  .section-heading--split > span {
    max-width: 34rem;
    text-align: left;
  }

  .interest-list,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .work-document {
    padding: 1rem;
  }

  .work-document :deep(.markdown-body) {
    font-size: 0.96rem;
  }
}

@media (max-width: 420px) {
  .signature-copy > p:first-child {
    font-size: 0.6rem;
  }

  .signature-role {
    font-size: 0.65rem;
  }

  .academic-shell {
    width: min(100% - 1.25rem, 1200px);
  }

  .academic-nav {
    margin-inline: -0.625rem;
    padding-inline: 0.625rem;
  }

  .section-heading h2 {
    font-size: clamp(2rem, 12vw, 3rem);
  }

  .profile-statements p,
  .identity-card div,
  .record-grid > div {
    padding-inline: 0.9rem;
  }
}

@media (max-height: 620px) and (orientation: landscape) {
  .signature-hero {
    min-height: 34rem;
    padding-block: 3.5rem;
  }

  .signature-stage {
    width: min(60vw, 560px);
    margin-block: 0.8rem 0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signature-outline,
  .signature-fill {
    clip-path: none;
    opacity: 1;
    animation: none;
  }

  .academic-status span,
  .enter-profile,
  .contact-grid a {
    animation: none;
    transition: none;
  }

  .enter-profile:hover,
  .enter-profile:focus-visible,
  .contact-grid a:hover,
  .contact-grid a:focus-visible {
    transform: none;
  }
}

@media print {
  .signature-hero {
    min-height: auto;
    padding-block: 2rem;
  }

  .academic-nav,
  .research-link,
  .enter-profile,
  .academic-atmosphere {
    display: none;
  }

  .academic-shell {
    display: block;
    width: 100%;
  }

  .academic-section {
    content-visibility: visible;
    break-inside: avoid;
  }
}
</style>
