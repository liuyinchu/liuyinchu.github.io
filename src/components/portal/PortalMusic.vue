<script setup>
import APlayer from 'aplayer'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  tracks: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const container = ref(null)
let player
let disposed = false

function labelControls() {
  const root = container.value
  if (!root) return
  const labels = {
    '.aplayer-icon-back': 'Previous track',
    '.aplayer-icon-forward': 'Next track',
    '.aplayer-icon-play': 'Play',
    '.aplayer-icon-pause': 'Pause',
    '.aplayer-icon-order': 'Change playback order',
    '.aplayer-icon-loop': 'Change repeat mode',
    '.aplayer-icon-volume-down': 'Mute or unmute',
    '.aplayer-icon-menu': 'Show or hide track list',
    '.aplayer-pic .aplayer-button': player?.audio.paused ? 'Play' : 'Pause',
  }
  for (const [selector, label] of Object.entries(labels)) {
    root.querySelectorAll(selector).forEach(control => {
      control.setAttribute('aria-label', label)
      control.title = label
      if (control.tagName !== 'BUTTON') {
        control.setAttribute('role', 'button')
        control.tabIndex = 0
      }
    })
  }
}

function handleControlKeydown(event) {
  if (['Enter', ' '].includes(event.key) && event.target.matches('[role="button"]')) {
    event.preventDefault()
    event.target.click()
  }
}

async function mountPlayer() {
  await nextTick()
  if (disposed || props.loading || !container.value || !props.tracks.length || player) return
  player = new APlayer({
    container: container.value,
    autoplay: false,
    theme: '#89b4fa',
    listFolded: false,
    listMaxHeight: '246px',
    audio: props.tracks,
  })
  labelControls()
  player.on('play', labelControls)
  player.on('pause', labelControls)
}

onMounted(mountPlayer)
watch([() => props.tracks, () => props.loading], mountPlayer)

onBeforeUnmount(() => {
  disposed = true
  const current = player
  player = null
  if (!current) return
  // Pending APlayer error callbacks must see an empty list after teardown.
  current.list.clear()
  current.destroy()
})
</script>

<template>
  <div class="portal-music" @keydown="handleControlKeydown">
    <div v-if="loading" class="portal-loading" role="status">Loading music library...</div>
    <div v-else ref="container" class="aplayer-mount"></div>
  </div>
</template>
