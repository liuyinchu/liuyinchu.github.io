<script setup>
import { ref } from 'vue'

defineProps({
  articles: { type: Array, default: () => [] },
})

const isPaused = ref(false)
</script>

<template>
  <section
    v-if="articles.length"
    class="featured-rail"
    aria-labelledby="featured-rail-title"
  >
    <div class="rail-heading">
      <div>
        <p>Selected reading</p>
        <h2 id="featured-rail-title">精选文章</h2>
      </div>
      <button
        type="button"
        :aria-pressed="isPaused.toString()"
        @click="isPaused = !isPaused"
      >
        <span aria-hidden="true">{{ isPaused ? '▶' : 'Ⅱ' }}</span>
        {{ isPaused ? '继续滚动' : '暂停滚动' }}
      </button>
    </div>

    <div class="rail-viewport">
      <div class="rail-track" :class="{ 'is-paused': isPaused }">
        <div
          v-for="copyIndex in 2"
          :key="copyIndex"
          class="rail-set"
          :aria-hidden="copyIndex === 2 ? 'true' : undefined"
        >
          <RouterLink
            v-for="article in articles"
            :key="`${copyIndex}-${article.id}`"
            class="rail-card"
            :to="`/space1/${article.id}`"
            :tabindex="copyIndex === 2 ? -1 : undefined"
          >
            <img
              :src="article.image"
              :alt="article.title"
              loading="lazy"
              decoding="async"
            >
            <div class="rail-card-copy">
              <p>{{ article.featuredLabel }}</p>
              <h3>{{ article.title }}</h3>
              <span>{{ article.date }} <i aria-hidden="true">↗</i></span>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-rail {
  --rail-gap: clamp(0.85rem, 1.6vw, 1.25rem);
  width: min(100% - 3rem, 1320px);
  margin: 0 auto clamp(4rem, 8vw, 7rem);
}

.rail-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.35rem;
}

.rail-heading p {
  margin: 0 0 0.45rem;
  color: rgba(205, 214, 244, 0.56);
  font-size: 0.72rem;
  font-weight: 760;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.rail-heading h2 {
  margin: 0;
  color: #cdd6f4;
  font-size: clamp(1.55rem, 3vw, 2.45rem);
  line-height: 1;
}

.rail-heading button {
  display: inline-flex;
  min-height: 2.7rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.9rem;
  border: 1px solid rgba(180, 190, 254, 0.16);
  border-radius: 999px;
  color: rgba(205, 214, 244, 0.76);
  background: rgba(30, 30, 46, 0.62);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
}

.rail-heading button:hover,
.rail-heading button:focus-visible {
  border-color: rgba(137, 180, 250, 0.46);
  color: #cdd6f4;
}

.rail-viewport {
  overflow: hidden;
  border-radius: 1rem;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 2.4rem, #000 calc(100% - 2.4rem), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 2.4rem, #000 calc(100% - 2.4rem), transparent);
}

.rail-track {
  display: flex;
  width: max-content;
  gap: var(--rail-gap);
  animation: featured-rail-scroll 52s linear infinite;
  will-change: transform;
}

.rail-track.is-paused,
.rail-viewport:hover .rail-track,
.rail-viewport:focus-within .rail-track {
  animation-play-state: paused;
}

.rail-set {
  display: flex;
  gap: var(--rail-gap);
}

.rail-card {
  position: relative;
  display: grid;
  width: clamp(17rem, 28vw, 23rem);
  min-height: 15.75rem;
  overflow: hidden;
  border: 1px solid rgba(180, 190, 254, 0.13);
  border-radius: 1rem;
  color: inherit;
  background: #1e1e2e;
  text-decoration: none;
  isolation: isolate;
}

.rail-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, transparent 15%, rgba(17, 17, 27, 0.32) 48%, rgba(17, 17, 27, 0.98));
}

.rail-card img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.78;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
}

.rail-card-copy {
  align-self: end;
  padding: 1.15rem;
}

.rail-card-copy p {
  width: fit-content;
  margin: 0 0 0.65rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid rgba(205, 214, 244, 0.2);
  border-radius: 999px;
  color: rgba(245, 246, 255, 0.82);
  background: rgba(17, 17, 27, 0.42);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.rail-card h3 {
  margin: 0;
  color: #f5f6ff;
  font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  line-height: 1.18;
  text-wrap: balance;
}

.rail-card-copy span {
  display: flex;
  justify-content: space-between;
  margin-top: 0.7rem;
  color: rgba(205, 214, 244, 0.67);
  font-size: 0.78rem;
}

.rail-card-copy i {
  color: #89b4fa;
  font-style: normal;
  transition: translate 0.25s ease;
}

.rail-card:hover img,
.rail-card:focus-visible img {
  transform: scale(1.035);
  opacity: 0.92;
}

.rail-card:hover i,
.rail-card:focus-visible i {
  translate: 0.22rem 0;
}

@keyframes featured-rail-scroll {
  to { transform: translateX(calc(-50% - var(--rail-gap) / 2)); }
}

@media (max-width: 760px) {
  .featured-rail {
    width: min(100% - 2rem, 1320px);
    margin-bottom: 4.2rem;
  }

  .rail-heading button {
    display: none;
  }

  .rail-viewport {
    overflow-x: auto;
    padding-bottom: 0.7rem;
    -webkit-mask-image: none;
    mask-image: none;
    scrollbar-width: thin;
    scroll-snap-type: x mandatory;
  }

  .rail-track {
    animation: none;
    will-change: auto;
  }

  .rail-set:nth-child(2) {
    display: none;
  }

  .rail-card {
    width: min(78vw, 20rem);
    min-height: 14.5rem;
    scroll-snap-align: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rail-track {
    animation: none;
    will-change: auto;
  }

  .rail-set:nth-child(2) {
    display: none;
  }

  .rail-viewport {
    overflow-x: auto;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .rail-card img,
  .rail-card-copy i {
    transition: none;
  }
}
</style>
