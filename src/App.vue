<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import {
  animateRouteChildren,
  stopRouteChildrenMotion,
} from './utils/interactionMotion'

const route = useRoute()
const routeMotionBoundary = ref(null)
const isPortalRoute = computed(() => route.path === '/portal')

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    animateRouteChildren(routeMotionBoundary.value)
  },
  { flush: 'post' },
)

onBeforeUnmount(stopRouteChildrenMotion)
</script>

<template>
  <Header v-if="!isPortalRoute" />

  <div ref="routeMotionBoundary" class="route-motion-boundary">
    <router-view />
  </div>
  <Footer v-if="!isPortalRoute" />
</template>

<style>
.route-motion-boundary {
  display: contents;
}
</style>
