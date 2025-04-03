<script setup>
const codeList = [
  { name: '个人绘图工具', desc: '就开发了一点点功能，如果有用的话，你可以拿去尽情使用。', url: '/files/code/ysy_plot_utils.py' },
  { name: '近代物理实验报告模版', desc: '这个我也没搞完，但暂时就这样勉强能用；总之，它为近代物理实验报告的撰写提供了一些探索与可能。', url: '/files/code/v1.2-beta-ysy-new-labreport-template-recommended-only-for-modern-physics-experiments.zip' },
  { name: '远程登录服务器时的欢迎脚本', desc: '练手用的', url: '/files/code/learning-and-practice-linux-server-login-welcome-script-attempt.zip' },
  // ... 继续添加
]
</script>

<template>
    <main class="container fade-in">
    <h1 class="block-title">共享代码</h1>
    <p class="block-intro">这里展示我公开的一些科研或学习代码，欢迎参考使用。</p>

    <ul class="list">
      <li v-for="(item, i) in codeList" :key="i">
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
