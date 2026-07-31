<script setup>
import MarkdownViewer from '../components/MarkdownViewer.vue'
</script>

<template>
  <main class="precision-physkit-page">
    <header class="project-hero">
      <p>PRECISION PHYSKIT · v0.1.0</p>
      <h1>precision-physkit</h1>
      <span>从数据治理到谱估计、拟合与峰分析的完整文档</span>
    </header>

    <MarkdownViewer
      src="/markdown/pages/precision-physkit.md"
      variant="page"
      use-c-j-k
    />
  </main>
</template>

<style scoped>
.precision-physkit-page {
  min-height: 100vh;
  padding: clamp(6rem, 9vw, 8rem) 0 clamp(4rem, 8vw, 7rem);
  color: var(--text-color);
  background:
    radial-gradient(circle at 12% 4%, rgba(137, 180, 250, 0.13), transparent 30rem),
    radial-gradient(circle at 90% 8%, rgba(148, 226, 213, 0.09), transparent 28rem),
    linear-gradient(180deg, #11111b 0%, var(--background-color) 28rem);
}

.project-hero {
  box-sizing: border-box;
  width: min(100% - 2rem, 960px);
  margin: 0 auto clamp(1.2rem, 3vw, 2.2rem);
  padding: clamp(1.4rem, 4vw, 2.6rem);
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgba(49, 50, 68, 0.76), rgba(24, 24, 37, 0.52));
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.24);
}

.project-hero p,
.project-hero span {
  margin: 0;
  color: rgba(205, 214, 244, 0.58);
  font-family: "Fira Code", monospace;
  font-size: clamp(0.7rem, 1vw, 0.82rem);
  letter-spacing: 0.14em;
}

.project-hero h1 {
  margin: 0.5rem 0 0.75rem;
  color: #cdd6f4;
  font-family: "LXGW WenKai", serif;
  font-size: clamp(2rem, 5vw, 4.1rem);
  font-weight: 680;
  letter-spacing: -0.04em;
  line-height: 1.15;
  text-wrap: balance;
}

@media (max-width: 640px) {
  .precision-physkit-page {
    padding-top: 5.2rem;
  }

  .project-hero {
    width: min(100% - 1.2rem, 960px);
    border-radius: 1rem;
  }
}
</style>
