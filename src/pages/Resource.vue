<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'

const resourceText = `
# 资源分享

我在学习中收集整理的一些优质外部资源，欢迎探索。

---

## [ChatGPT](https://chatgpt.com/)
我的好助手……

## [Git教程](https://liaoxuefeng.com/books/git/introduction/index.html)
学Git，就用廖雪峰教程（这个真的很好）！

## [小时百科](https://wuli.wiki/index.html)
我用来查询数学物理知识的百科。

## [Nature物理综述](https://www.nature.com/natrevphys/)
找综述文献可以在这上面找。

## [ruptures](https://centre-borelli.github.io/ruptures-docs/)
变点检测 Python 库。

## [控制论从入门到放弃](https://zhuanlan.zhihu.com/p/683044170)
一篇很好的控制论入门文章。

## [macOS配置指南](https://sourabhbajaj.com/mac-setup/)
适合于程序员与开发者的 macOS 配置指南。

## [天文科研指南](https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md)
天文科研从入门到放弃（但是这个确实神中神）。

## [该链接已失效](https://naiixi.com)
该链接已失效。

## [404 Not Found](https://yeka.ai)
404 Not Found.
`
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="resourceText" />
  </PageWrapper>
</template>