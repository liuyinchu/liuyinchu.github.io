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
    <h4>目 录</h4>
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
  padding: 0.5rem;
  padding-right: 1rem;
  font-family: "LXGW WenKai";
}
h4 {
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 1.5rem;
  padding-left: 0.5rem; /* slight indent */
  color: #F3E9C6; /* 暗金配色 */
  /* 底部装饰线 */
  border-bottom: 1px solid rgba(243, 233, 198, 0.1);
  padding-bottom: 0.8rem;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li a {
  display: block;
  padding: 0.4rem 0rem;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 2px solid transparent;

  /* [修改] 调整字号和颜色 */
  font-size: 0.95rem;
  color: var(--text-color); /* 你指定的颜色 (即 var(--ctp-mocha-sky)) */
}
/* li a:hover {
  color: var(--text-color); 
  background-color: var(--surface-color-hover);
  border-left-color: var(--primary-color);
} */
li a:hover {
  color: #89b4fa; /* 亮蓝 (Blue) */
  background: linear-gradient(90deg, rgba(137, 180, 250, 0.1) 0%, transparent 100%);
  border-left-color: #89b4fa; /* 侧边亮起 */
  box-shadow: -2px 0 12px rgba(137, 180, 250, 0.2); /* 侧边辉光 */
  padding-left: 1.2rem; /* 明显的右移反馈 */
}
.toc-level-2 { padding-left: 0rem; }
.toc-level-3 { padding-left: 1.5rem; }
.toc-level-4 { padding-left: 3rem; }
</style>