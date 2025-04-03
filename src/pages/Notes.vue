<script setup>
const notes = [
  { name: '早期尝试学深度学习没学会', desc: '找了半天没啥可放的就把这玩意放上来吧。', url: '/files/notes/hand_rubbing_neural_network.pdf' },
  // ... 更多笔记
]
</script>

<template>
    <main class="container fade-in">
    <h1 class="block-title">我的笔记</h1>
    <p class="block-intro">记录下我在学习和研究中的思考与总结。</p>

    <ul class="list">
      <li v-for="(item, i) in notes" :key="i">
        <h3>{{ item.name }}</h3>
        <p class="desc">{{ item.desc }}</p>
        <a class="btn" :href="item.url" target="_blank">下载</a>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.list {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: auto;
}
li {
  margin-bottom: 2rem;
}
h3 {
  margin-bottom: 0.4rem;
  color: var(--gray-blue);
}
.desc {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 0.6rem;
}
</style>
