<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { markRouteViewReady } from './router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const displayedPath = ref(route.path)
const isHomeRoute = computed(() => route.path === '/')
const isPortalRoute = computed(() => displayedPath.value === '/portal')
const isTransitioning = ref(false)
let leavingHeight = 0
let enteringElement = null
let originalMinHeight = ''

function releaseHeight() {
  if (!enteringElement) return
  enteringElement.style.minHeight = originalMinHeight
  enteringElement = null
}

function beforeRouteLeave(element) {
  markRouteViewReady(null)
  releaseHeight()
  // Reserve at most one viewport, even when leaving a very long article.
  leavingHeight = Math.min(element.offsetHeight, window.innerHeight)
  isTransitioning.value = true
}

function enterRoute(element) {
  releaseHeight()
  enteringElement = element
  originalMinHeight = element.style.minHeight
  if (getComputedStyle(element).position !== 'fixed') {
    element.style.minHeight = `${Math.max(leavingHeight, element.offsetHeight)}px`
  }
}

function finishRouteEnter(element) {
  if (element !== enteringElement) return
  releaseHeight()
  isTransitioning.value = false
}

async function routeMounted(vnode) {
  const path = vnode.key
  if (path !== route.path) return
  displayedPath.value = path
  if (path === '/') {
    releaseHeight()
    isTransitioning.value = false
  }
  // Let the new page's mounted hooks and Header/Footer update finish first.
  await nextTick()
  if (path === route.path) markRouteViewReady(path)
}
</script>

<template>
  <Header v-if="!isPortalRoute" />

  <RouterView v-slot="{ Component }">
    <component
      v-if="isHomeRoute"
      :is="Component"
      :key="route.path"
      @vue:mounted="routeMounted"
    />
    <Transition
      v-else
      name="route-flow"
      mode="out-in"
      @before-leave="beforeRouteLeave"
      @enter="enterRoute"
      @after-enter="finishRouteEnter"
      @enter-cancelled="finishRouteEnter"
    >
      <component :is="Component" :key="route.path" @vue:mounted="routeMounted" />
    </Transition>
  </RouterView>
  <Footer v-if="!isPortalRoute" :style="{ visibility: isTransitioning ? 'hidden' : undefined }" />
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

  .route-flow-enter-from {
    transform: none;
  }
}
</style>
