<template>
  <section id="experience" class="content-section">
    <h2 class="section-title">Experience</h2>
    <div class="timeline">
      <div v-for="(item, index) in items" :key="index" class="timeline-item">
        <div class="timeline-marker">
          <div class="timeline-dot"></div>
        </div>
        <div class="timeline-content">
          <h3 class="timeline-role">{{ item.role }}</h3>
          
          <div class="timeline-meta">
            <span class="timeline-org">{{ item.organization }}</span>
            <span class="timeline-period">{{ item.period }}</span>
          </div>

          <p class="timeline-desc">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
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
  animation: fadeInUp 0.8s 0.6s ease-out forwards;
}

/* 统一标题样式 */
.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 1px;
}

.timeline {
  position: relative;
  padding-left: 3rem; /* 为时间线标记留出空间 */
  /* 时间线的左侧竖线 */
  border-left: 2px solid var(--border-color);
}

/* 增强交互性：为整个条目添加 hover 效果 */
.timeline-item {
  position: relative;
  margin-bottom: 2rem; /* 减小条目间距 */
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}
.timeline-item:hover {
  background-color: var(--surface-color-hover);
}
.timeline-item:last-child {
  margin-bottom: 0;
}

/* 时间线标记（圆点）的容器 */
.timeline-marker {
  position: absolute;
  left: -3rem; /* (padding-left) */
  top: 0.3rem;
  width: 2px; /* 与竖线同宽 */
  height: 100%;
  transform: translateX(-50%); /* 自身居中 */
}

/* 重新设计时间线圆点，更有层次感 */
.timeline-dot {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--surface-color); /* 背景色，与卡片一致 */
  border: 2px solid var(--accent-color); /* 用强调色作为边框 */
  transition: transform 0.3s ease, background-color 0.3s ease;
}

/* 交互效果：悬浮时圆点放大 */
.timeline-item:hover .timeline-dot {
  transform: translateX(-50%) scale(1.2);
  background-color: var(--accent-color);
}


.timeline-content {
  position: relative;
}

.timeline-role {
  font-size: 1.3rem;
  color: var(--primary-color-hover);
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

/* 新的 meta 行布局 */
.timeline-meta {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center;
  flex-wrap: wrap; /* 允许换行 */
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.timeline-org {
  font-weight: 500;
  font-size: 1.1rem;
}

/* 移除斜体，调整样式 */
.timeline-period {
  font-size: 0.9rem;
  color: var(--ctp-mocha-subtext1, #bac2de);
  font-style: normal; /* 移除斜体 */
  background-color: var(--surface-color-hover);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
}

/* 减小描述部分的行高，使其更紧凑 */
.timeline-desc {
  margin: 0;
  line-height: 1.6;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>