<script setup>
defineProps({
  groups: { type: Array, required: true },
})
</script>

<template>
  <div class="chronology-atlas">
    <nav class="chronology-nav" aria-label="按年份浏览随记">
      <p>TIME ROUTE</p>
      <a
        v-for="group in groups"
        :key="group.year"
        :href="`#chronology-${group.year}`"
      >
        <span>{{ group.year }}</span>
        <small>{{ group.items.length }}</small>
      </a>
    </nav>

    <div class="chronology-routes">
      <section
        v-for="group in groups"
        :id="`chronology-${group.year}`"
        :key="group.year"
        class="chronology-year"
        :aria-labelledby="`chronology-title-${group.year}`"
      >
        <header class="chronology-year-heading">
          <div>
            <p>Archive coordinate</p>
            <h2 :id="`chronology-title-${group.year}`">{{ group.year }}</h2>
          </div>
          <span>{{ group.items.length }} 篇随记</span>
        </header>

        <ol class="chronology-list">
          <li
            v-for="(article, index) in group.items"
            :key="article.id"
            :style="{ '--route-index': index }"
          >
            <span class="chronology-node" aria-hidden="true">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <RouterLink class="chronology-card" :to="`/space1/${article.id}`">
              <div class="chronology-copy">
                <p class="chronology-meta">
                  <time :datetime="article.date">{{ article.date }}</time>
                  <span>@{{ article.author }}</span>
                </p>
                <h3>{{ article.title }}</h3>
                <p class="chronology-desc">{{ article.desc }}</p>
                <span class="chronology-cta">沿航线进入正文 <i aria-hidden="true">↗</i></span>
              </div>
              <div class="chronology-media">
                <img
                  v-if="article.image"
                  :src="article.image"
                  :alt="article.title"
                  loading="lazy"
                  decoding="async"
                >
                <span v-else aria-hidden="true">{{ (article.title || '文')[0] }}</span>
              </div>
            </RouterLink>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.chronology-atlas {
  display: grid;
  grid-template-columns: 7.5rem minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 4.5rem);
  padding: 1.5rem 0 2rem;
}

.chronology-nav {
  position: sticky;
  top: 6rem;
  display: grid;
  align-self: start;
  gap: 0.35rem;
}

.chronology-nav p {
  margin: 0 0 0.65rem;
  color: rgba(148, 163, 216, 0.48);
  font-size: 0.62rem;
  font-weight: 760;
  letter-spacing: 0.17em;
}

.chronology-nav a {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.2rem;
  border-bottom: 1px solid rgba(148, 163, 216, 0.1);
  color: rgba(205, 217, 255, 0.72);
  text-decoration: none;
}

.chronology-nav a:hover,
.chronology-nav a:focus-visible {
  color: #89dceb;
}

.chronology-nav span {
  font-family: 'Fira Code', monospace;
  font-size: 0.88rem;
}

.chronology-nav small {
  color: rgba(148, 163, 216, 0.5);
  font-size: 0.68rem;
}

.chronology-routes {
  min-width: 0;
}

.chronology-year {
  scroll-margin-top: 5.5rem;
}

.chronology-year + .chronology-year {
  margin-top: clamp(4rem, 8vw, 7rem);
}

.chronology-year-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.chronology-year-heading p {
  margin: 0 0 0.2rem;
  color: rgba(137, 220, 235, 0.55);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.chronology-year-heading h2 {
  margin: 0;
  color: #e7ebff;
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 620;
  letter-spacing: -0.04em;
  line-height: 0.9;
}

.chronology-year-heading > span {
  color: rgba(176, 186, 222, 0.58);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.chronology-list {
  position: relative;
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0 0 0 2.6rem;
  list-style: none;
}

.chronology-list::before {
  content: '';
  position: absolute;
  top: 1.1rem;
  bottom: 1.1rem;
  left: 0.82rem;
  width: 1px;
  background: linear-gradient(#89dceb, rgba(203, 166, 247, 0.48), transparent);
}

.chronology-list li {
  position: relative;
}

.chronology-node {
  position: absolute;
  top: 1.15rem;
  left: -2.6rem;
  z-index: 2;
  display: grid;
  width: 1.65rem;
  height: 1.65rem;
  place-items: center;
  border: 1px solid rgba(137, 220, 235, 0.48);
  border-radius: 50%;
  color: #89dceb;
  background: #10121f;
  font-family: 'Fira Code', monospace;
  font-size: 0.55rem;
  box-shadow: 0 0 1.2rem rgba(137, 220, 235, 0.12);
}

.chronology-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(8.5rem, 18vw, 12.5rem);
  min-height: 10.5rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 216, 0.13);
  border-radius: 1rem;
  color: inherit;
  background:
    linear-gradient(130deg, rgba(137, 180, 250, 0.06), transparent 42%),
    rgba(17, 20, 36, 0.72);
  text-decoration: none;
  transition: border-color 0.28s ease, background-color 0.28s ease, transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.chronology-card:hover,
.chronology-card:focus-visible {
  border-color: rgba(137, 220, 235, 0.38);
  background-color: rgba(26, 30, 52, 0.82);
  transform: translateX(0.28rem);
}

.chronology-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 1.05rem 1.15rem;
}

.chronology-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 0.55rem;
  color: rgba(165, 176, 214, 0.65);
  font-family: 'Fira Code', monospace;
  font-size: 0.64rem;
}

.chronology-copy h3 {
  margin: 0;
  color: #eef1ff;
  font-family: 'LXGW WenKai', serif;
  font-size: clamp(1.12rem, 2vw, 1.45rem);
  line-height: 1.3;
  text-wrap: balance;
}

.chronology-desc {
  display: -webkit-box;
  margin: 0.55rem 0 0;
  overflow: hidden;
  color: rgba(176, 186, 222, 0.67);
  font-size: 0.78rem;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.chronology-cta {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.7rem;
  color: rgba(137, 220, 235, 0.72);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.chronology-cta i {
  font-style: normal;
  transition: translate 0.25s ease;
}

.chronology-card:hover .chronology-cta i,
.chronology-card:focus-visible .chronology-cta i {
  translate: 0.2rem 0;
}

.chronology-media {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(137, 180, 250, 0.2), rgba(203, 166, 247, 0.16));
}

.chronology-media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(17, 20, 36, 0.44), transparent 40%);
}

.chronology-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.78;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease;
}

.chronology-card:hover .chronology-media img,
.chronology-card:focus-visible .chronology-media img {
  transform: scale(1.04);
  opacity: 0.95;
}

.chronology-media > span {
  display: grid;
  height: 100%;
  place-items: center;
  color: rgba(238, 241, 255, 0.78);
  font-family: 'LXGW WenKai', serif;
  font-size: 2.5rem;
}

@media (max-width: 760px) {
  .chronology-atlas {
    grid-template-columns: 1fr;
    gap: 1.3rem;
    padding-top: 0.6rem;
  }

  .chronology-nav {
    position: static;
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.35rem;
    scrollbar-width: thin;
  }

  .chronology-nav p {
    display: none;
  }

  .chronology-nav a {
    min-width: 5.2rem;
    flex: none;
    padding: 0.55rem 0.7rem;
    border: 1px solid rgba(148, 163, 216, 0.14);
    border-radius: 999px;
    background: rgba(17, 20, 36, 0.58);
  }

  .chronology-list {
    padding-left: 2rem;
  }

  .chronology-list::before {
    left: 0.65rem;
  }

  .chronology-node {
    left: -2rem;
    width: 1.35rem;
    height: 1.35rem;
    font-size: 0.48rem;
  }

  .chronology-card {
    grid-template-columns: 1fr;
  }

  .chronology-media {
    grid-row: 1;
    min-height: 8.5rem;
    max-height: 11rem;
  }

  .chronology-media::after {
    background: linear-gradient(0deg, rgba(17, 20, 36, 0.56), transparent 45%);
  }
}

@media (max-width: 420px) {
  .chronology-year-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .chronology-copy {
    padding: 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chronology-card,
  .chronology-media img,
  .chronology-cta i {
    transition: none;
  }

  .chronology-card:hover,
  .chronology-card:focus-visible {
    transform: none;
  }
}
</style>
