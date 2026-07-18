<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: '1em' },
})
</script>

<template>
  <svg
    class="site-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    :width="size"
    :height="size"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="name === 'journal'">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </g>
    <g v-else-if="name === 'talk'">
      <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2.25V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </g>
    <g v-else-if="name === 'resources' || name === 'link'">
      <path d="m10.5 13.5 3-3" />
      <path d="M7.4 15.6 5.8 17.2a3.4 3.4 0 1 1-4.8-4.8l3.2-3.2A3.4 3.4 0 0 1 9 9" />
      <path d="M15 15a3.4 3.4 0 0 0 4.8-.2l3.2-3.2a3.4 3.4 0 1 0-4.8-4.8l-1.6 1.6" transform="translate(-1 0)" />
    </g>
    <g v-else-if="name === 'code' || name === 'programming'">
      <path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4l-3 16" />
    </g>
    <g v-else-if="name === 'lounge'">
      <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M17 11a3 3 0 1 0 0-6M21 20v-1.5a4 4 0 0 0-3-3.87" />
    </g>
    <g v-else-if="name === 'about' || name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </g>
    <g v-else-if="name === 'github'">
      <path d="M15 22v-3.9c.04-1-.35-1.75-.85-2.2 2.8-.31 5.75-1.38 5.75-6.25A4.9 4.9 0 0 0 18.6 6.2a4.55 4.55 0 0 0-.13-3.4s-1.02-.35-3.47 1.3a11.8 11.8 0 0 0-6 0C6.55 2.45 5.53 2.8 5.53 2.8a4.55 4.55 0 0 0-.13 3.4 4.9 4.9 0 0 0-1.3 3.45c0 4.86 2.95 5.94 5.75 6.25-.45.4-.78 1.02-.84 1.8-.76.34-2.68.93-3.86-1.1-.72-1.25-1.85-1.34-1.85-1.34" />
      <path d="M9 22v-4.3" />
    </g>
    <g v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </g>
    <g v-else-if="name === 'literature'">
      <path d="M5 4h10a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2z" />
      <path d="M7 16h11M8 8h6M8 11h6" />
    </g>
    <g v-else-if="name === 'computer'">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </g>
    <g v-else-if="name === 'materials'">
      <path d="M4 7h16v13H4zM3 4h18v3H3zM9 11h6" />
    </g>
    <g v-else-if="name === 'tools'">
      <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3z" />
    </g>
    <g v-else-if="name === 'files'">
      <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" />
    </g>
    <g v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </g>
    <g v-else-if="name === 'pause'">
      <path d="M9 7v10M15 7v10" />
    </g>
    <g v-else-if="name === 'play'">
      <path d="m9 7 8 5-8 5z" />
    </g>
    <g v-else-if="name === 'chevron-left'">
      <path d="m15 18-6-6 6-6" />
    </g>
    <g v-else-if="name === 'chevron-right'">
      <path d="m9 18 6-6-6-6" />
    </g>
    <g v-else>
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
    </g>
  </svg>
</template>

<style scoped>
.site-icon {
  display: block;
  flex: 0 0 auto;
  overflow: visible;
}
</style>
