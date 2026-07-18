<script setup>
import MarkdownViewer from '../components/MarkdownViewer.vue'
</script>

<template>
  <main class="markdown-components-page">
    <header class="component-hero">
      <p>MARKDOWN COMPONENT LAB</p>
      <h1>让文字拥有更多形状</h1>
      <span>Rich components for articles and general pages</span>
    </header>

    <MarkdownViewer
      src="/markdown/pages/markdown-components.md"
      variant="page"
      use-c-j-k
    />
  </main>
</template>

<style scoped>
.markdown-components-page {
  min-height: 100vh;
  padding: clamp(6rem, 9vw, 8rem) 0 clamp(4rem, 8vw, 7rem);
  color: var(--text-color);
  background:
    radial-gradient(circle at 12% 4%, rgba(137, 180, 250, 0.13), transparent 30rem),
    radial-gradient(circle at 90% 8%, rgba(203, 166, 247, 0.1), transparent 28rem),
    linear-gradient(180deg, #11111b 0%, var(--background-color) 28rem);
}

.component-hero {
  box-sizing: border-box;
  width: min(100% - 2rem, 960px);
  margin: 0 auto clamp(1.2rem, 3vw, 2.2rem);
  padding: clamp(1.4rem, 4vw, 2.6rem);
  border: 1px solid rgba(180, 190, 254, 0.14);
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgba(49, 50, 68, 0.76), rgba(24, 24, 37, 0.52));
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.24);
}

.component-hero p,
.component-hero span {
  margin: 0;
  color: rgba(205, 214, 244, 0.58);
  font-family: "Fira Code", monospace;
  font-size: clamp(0.7rem, 1vw, 0.82rem);
  letter-spacing: 0.14em;
}

.component-hero h1 {
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
  .markdown-components-page {
    padding-top: 5.2rem;
  }

  .component-hero {
    width: min(100% - 1.2rem, 960px);
    border-radius: 1rem;
  }
}
</style>
