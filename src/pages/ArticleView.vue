<script setup>
import { useRoute } from 'vue-router'
import MarkdownViewer from '../components/MarkdownViewer.vue'

const route = useRoute()
const file = `/markdown/${route.params.id}.md`
</script>

<template>
  <div class="article-container">
    <MarkdownViewer :src="file" />
  </div>
</template>

<style scoped>
.article-container {
  padding: 3rem 1rem;
  background-color: var(--background-color);
  min-height: 100vh;
}
</style>