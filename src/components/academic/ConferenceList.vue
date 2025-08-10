<template>
  <section id="conferences" class="content-section">
    <h2 class="section-title">Conferences & Talks</h2>
    <ul class="conference-list">
      <li v-for="(item, index) in items" :key="index" class="conference-item">
        <span class="conference-name">{{ item.name }}</span>
        <span class="conference-details">{{ item.event }} • {{ item.location }} • {{ item.date }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
// 脚本部分无需改动
defineProps({
  items: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
/* 整体卡片样式，更紧凑 */
.content-section {
  margin-top: 4rem;
  padding: 2rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s 0.8s ease-out forwards;
}

/* 统一标题样式 */
.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 1px;
}

.conference-list {
  list-style: none;
  padding: 0;
}

/* 修改点：列表项改为 Flex 布局，实现左右两栏 */
.conference-item {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: baseline; /* 基线对齐 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 1rem; /* 设置元素间距 */
  
  padding: 1.2rem 1rem;
  border-radius: 8px; /* 为 hover 效果增加圆角 */
  /* 移除底部分割线，改用外边距分隔 */
  /* border-bottom: 1px solid var(--border-color); */
  margin-bottom: 0.5rem;
  
  transition: background-color 0.3s ease, transform 0.3s ease;
}
.conference-item:last-child {
  margin-bottom: 0;
}
.conference-item:hover {
  background-color: var(--surface-color-hover);
  transform: scale(1.02); /* 增加轻微放大效果 */
}

/* 会议名称样式（左栏） */
.conference-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0;
  flex-shrink: 0; /* 防止名称过长时被压缩 */
}

/* 会议详情样式（右栏） */
.conference-details {
  color: var(--ctp-mocha-subtext1, #bac2de);
  font-size: 0.95rem;
  margin: 0;
  text-align: right; /* 右对齐 */
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>