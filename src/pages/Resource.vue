<script setup>
const resources = [
  { name: 'ChatGPT', desc: 'ChatGPT', url: 'https://chatgpt.com/' },
  { name: 'Git教程', desc: '学Git，就用廖雪峰教程（这个真的很好）！', url: 'https://liaoxuefeng.com/books/git/introduction/index.html' },
  { name: '小时百科', desc: '我用来查询数学物理知识的百科', url: 'https://wuli.wiki/index.html' },
  { name: 'Nature物理综述', desc: '找综述文献可以在这上面找', url: 'https://www.nature.com/natrevphys/' },
  { name: 'ruptures', desc: '变点检测Python库', url: 'https://centre-borelli.github.io/ruptures-docs/' },
  { name: '控制论从入门到放弃', desc: '一篇很好的控制论入门文章', url: 'https://zhuanlan.zhihu.com/p/683044170' },
  { name: 'macOS配置指南', desc: '适合于程序员与开发者的macOS配置指南', url: 'https://sourabhbajaj.com/mac-setup/' },
  { name: '天文科研指南', desc: '天文科研从入门到放弃（但是这个确实神中神）', url: 'https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md' },
  { name: '该链接已失效', desc: '该链接已失效', url: 'https://naiixi.com' },
  { name: '404 Not Found', desc: '404 Not Found', url: 'https://yeka.ai' },
  // ... 添加更多资源
]
</script>

<template>
   <main class="container fade-in">
    <h1 class="block-title">资源分享</h1>
    <p class="block-intro">我在学习中收集整理的一些优质外部资源，欢迎探索。</p>

    <ul class="list">
      <li v-for="(item, i) in resources" :key="i">
        <h3>{{ item.name }}</h3>
        <p class="desc">{{ item.desc }}</p>
        <a class="btn" :href="item.url" target="_blank">访问</a>
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
