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

  <router-view />
  <Footer v-if="!isPortalRoute" />
</template>
