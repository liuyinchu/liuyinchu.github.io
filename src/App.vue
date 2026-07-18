<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isPortalRoute = computed(() => route.path === '/portal')
</script>

<template>
  <Header v-if="!isPortalRoute" />

  <RouterView v-slot="{ Component }">
    <Transition name="route-flow" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <Footer v-if="!isPortalRoute" />
</template>

<style>
.route-flow-enter-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.route-flow-leave-active {
  transition: opacity 0.13s ease;
}

.route-flow-enter-from {
  opacity: 0;
  transform: translateY(0.45rem);
}

.route-flow-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .route-flow-enter-active,
  .route-flow-leave-active {
    transition: none;
  }
}
</style>
