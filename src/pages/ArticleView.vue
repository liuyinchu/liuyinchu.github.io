<script setup>
import { useRoute } from 'vue-router'
import MarkdownViewer from '../components/MarkdownViewer.vue'

const route = useRoute()
const file = `/markdown/${route.params.id}.md`
</script>

<template>
  <MarkdownViewer :src="file" />
</template>
