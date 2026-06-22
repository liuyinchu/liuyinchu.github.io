<template>
  <MarkdownViewer
    :content="content"
    :use-c-j-k="useCJK"
    variant="embed"
  />
</template>

<script setup>
import MarkdownViewer from '../MarkdownViewer.vue'

defineProps({
  content: {
    type: String,
    required: true,
  },
  useCJK: {
    type: Boolean,
    default: false,
  },
})
</script>
