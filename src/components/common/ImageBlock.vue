<template>
  <div class="image-block">
    <figure>
      <img :src="src" :alt="alt" :style="{ width: width }" />
      <figcaption v-if="alt" class="caption">{{ alt }}</figcaption>
    </figure>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '100%'
  }
})
</script>

<style scoped>
.image-block {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

figure {
  margin: 0;
  text-align: center;
}

img {
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  background-color: var(--surface-color);
  max-width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.02);
}

.caption {
  font-size: 0.9rem;
  color: var(--text-color);
  margin-top: 0.5rem;
  font-style: italic;
}
</style>