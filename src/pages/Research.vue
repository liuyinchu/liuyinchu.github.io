<script setup>
import MarkdownViewer from '../components/MarkdownViewer.vue'
</script>

<template>
  <main class="markdown-project-page">
    <MarkdownViewer
      src="/markdown/pages/research.md"
      variant="page"
    />
  </main>
</template>

<style scoped>
.markdown-project-page {
  min-height: 100vh;
  padding: clamp(4.8rem, 8vw, 7rem) 0 clamp(4rem, 8vw, 6rem);
  color: var(--text-color);
  background:
    radial-gradient(circle at 14% 0%, rgba(137, 180, 250, 0.1), transparent 30rem),
    radial-gradient(circle at 88% 8%, rgba(180, 190, 254, 0.08), transparent 28rem),
    var(--background-color);
}
</style>
