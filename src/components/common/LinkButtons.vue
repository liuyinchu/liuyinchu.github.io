<template>
  <div class="button-group">
    <a
      v-for="(btn, index) in buttons"
      :key="index"
      :href="btn.url"
      class="themed-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ btn.text }}
    </a>
  </div>
</template>

<script setup>
const props = defineProps({
  buttons: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>

<style scoped>
.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
}

/* Apple风格圆角按钮 */
.themed-button {
  background-color: var(--primary-color);
  color: var(--ctp-mocha-base);
  padding: 0.6rem 1.2rem;
  border-radius: 999px; /* 超圆角 */
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.themed-button:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-2px);
}
</style>