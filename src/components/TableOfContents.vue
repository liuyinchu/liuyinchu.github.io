<script setup>
defineProps({
  toc: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="toc-sticky-container">
    <h4>目录</h4>
    <nav>
      <ul>
        <li
          v-for="item in toc"
          :key="item.id"
          :class="`toc-level-${item.level}`"
        >
          <a :href="`#${item.id}`">{{ item.text }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.toc-sticky-container {
  position: sticky;
  top: 3rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  
  /* [新增] 为目录栏添加背景和圆角 */
  background-color: var(--surface-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
}
h4 {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 1rem;
  padding-left: 0.5rem; /* slight indent */
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li a {
  display: block;
  padding: 0.4rem 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 2px solid transparent;

  /* [修改] 调整字号和颜色 */
  font-size: 0.85rem;
  color: #74c7ec; /* 你指定的颜色 (即 var(--ctp-mocha-sky)) */
}
li a:hover {
  color: var(--text-color); /* 悬浮时颜色加深 */
  background-color: var(--surface-color-hover);
  border-left-color: var(--primary-color);
}
.toc-level-2 { padding-left: 1rem; }
.toc-level-3 { padding-left: 2rem; }
</style>