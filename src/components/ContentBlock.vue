<template>
  <section
    class="content-block"
    :style="backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}"
  >
    <div class="overlay-glass">
      <h2 class="block-title">{{ title }}</h2>
      <div class="slot-wrapper">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  backgroundImage: String // 可选：背景图路径
})
</script>
