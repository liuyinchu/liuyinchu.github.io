<script setup>
import { onMounted, ref } from 'vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'

const markdownContent = ref('')
const loadError = ref('')

function removeDocumentTitle(markdown) {
  return markdown.replace(/^\uFEFF?\s*#(?!#)\s+[^\n]+\n+/, '')
}

onMounted(async () => {
  try {
    const response = await fetch('/markdown/post_it.md')
    if (!response.ok) throw new Error(`说说请求失败：${response.status}`)
    markdownContent.value = removeDocumentTitle(await response.text())
  } catch (error) {
    loadError.value = '说说暂时没有加载成功，请稍后刷新。'
    console.error('无法加载说说:', error)
  }
})
</script>

<template>
  <main class="talk-page" aria-labelledby="talk-title">
    <header class="talk-hero">
      <img src="/bg/white_sweater.PNG" alt="" decoding="async">
      <div class="talk-hero__veil" aria-hidden="true"></div>
      <div class="talk-hero__content">
        <h1 id="talk-title">时代正疾驰而过...</h1>
        <span>分享日常生活，偶尔发表各种想法与吐槽</span>
      </div>
    </header>

    <section class="talk-content" aria-label="说说正文">
      <p v-if="loadError" class="talk-state" role="alert">{{ loadError }}</p>
      <p v-else-if="!markdownContent" class="talk-state" role="status">正在翻开说说……</p>
      <MarkdownViewer
        v-else
        :content="markdownContent"
        variant="page"
        use-c-j-k
      />
    </section>
  </main>
</template>

<style scoped>
.talk-page {
  min-height: 100vh;
  padding: clamp(1.5rem, 3vw, 2.75rem) 0 clamp(4rem, 8vw, 7rem);
  color: var(--ctp-mocha-text);
  background:
    radial-gradient(circle at 10% 8%, rgba(137, 180, 250, 0.09), transparent 28rem),
    radial-gradient(circle at 92% 24%, rgba(203, 166, 247, 0.07), transparent 30rem),
    var(--ctp-mocha-base);
}

.talk-hero {
  position: relative;
  display: flex;
  min-height: clamp(20rem, 35vw, 29rem);
  align-items: end;
  margin: 0 auto clamp(3rem, 6vw, 5.5rem);
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 1.15rem;
  background: #181825;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.24);
}

.talk-hero > img,
.talk-hero__veil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.talk-hero > img {
  object-fit: cover;
  object-position: 50% 34%;
  opacity: 0.74;
  filter: saturate(0.82) contrast(1.04);
}

.talk-hero__veil {
  background:
    linear-gradient(90deg, rgba(17, 17, 27, 0.86) 0%, rgba(17, 17, 27, 0.45) 58%, rgba(17, 17, 27, 0.18)),
    linear-gradient(0deg, rgba(17, 17, 27, 0.82), transparent 64%);
}

.talk-hero__content {
  position: relative;
  z-index: 1;
  max-width: 56rem;
  padding: clamp(2rem, 5vw, 5rem);
  font-family: "TsangerJinKai02-W04", "仓耳今楷02 W04", "LXGW WenKai", serif;
  text-shadow: 0 3px 24px rgba(0, 0, 0, 0.38);
}

.talk-hero__content h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(2.55rem, 6.2vw, 6rem);
  font-weight: 700;
  line-height: 1.06;
  text-wrap: balance;
}

.talk-hero__content span {
  display: block;
  margin-top: 1.45rem;
  color: rgba(245, 246, 255, 0.82);
  font-size: clamp(1rem, 1.9vw, 1.35rem);
  line-height: 1.7;
}

.talk-hero,
.talk-content {
  width: min(100% - 3rem, 1320px);
  margin-inline: auto;
}

.talk-content {
  min-height: 18rem;
}

.talk-content :deep(.markdown-body--page) {
  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
}

.talk-state {
  width: min(100% - 3rem, 960px);
  margin: 0 auto;
  color: rgba(205, 214, 244, 0.72);
  text-align: center;
}

@media (min-width: 1800px) {
  .talk-hero,
  .talk-content {
    width: min(100% - 6rem, 1760px);
  }

  .talk-hero {
    min-height: 31.5rem;
  }

  .talk-hero__content {
    max-width: 72rem;
    padding: 5.5rem 6.5rem;
  }
}

@media (max-width: 720px) {
  .talk-page {
    padding-top: 1rem;
  }

  .talk-hero {
    min-height: 23rem;
    margin-bottom: 3.25rem;
    border-radius: 0.9rem;
  }

  .talk-hero,
  .talk-content {
    width: min(100% - 2rem, 1320px);
  }

  .talk-hero > img {
    object-position: 58% center;
  }

  .talk-hero__veil {
    background:
      linear-gradient(0deg, rgba(17, 17, 27, 0.9), rgba(17, 17, 27, 0.16) 85%),
      linear-gradient(90deg, rgba(17, 17, 27, 0.6), transparent);
  }

  .talk-hero__content {
    padding: 1.5rem;
  }
}
</style>
