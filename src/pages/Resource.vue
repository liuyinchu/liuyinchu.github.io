<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const resourceText = `
# 资源分享

我在学习中收集整理的一些优质外部资源，欢迎探索。

---

## [ChatGPT](https://chatgpt.com/)
强大的 AI 助手，可用于学习、写作、编程等多种场景。

## [Git教程](https://liaoxuefeng.com/books/git/introduction/index.html)
廖雪峰的 Git 教程，系统、清晰，是入门 Git 的优质资源。学Git，就用廖雪峰教程（这个真的很好）！

## [小时百科](https://wuli.wiki/index.html)
一个结构化的数学与物理知识查询平台，内容简明而准确。我用来查询数学物理知识。

## [Nature物理综述](https://www.nature.com/natrevphys/)
Nature Physics 杂志的综述文章合集，适合查找高质量的前沿文献。

## [ruptures](https://centre-borelli.github.io/ruptures-docs/)
用于时间序列变点检测的 Python 库，适合科研与工程应用。

## [控制论从入门到放弃](https://zhuanlan.zhihu.com/p/683044170)
一篇通俗易懂的控制论入门文章，适合初学者快速建立直觉。一篇很好的控制论入门文章。

## [macOS配置指南](https://sourabhbajaj.com/mac-setup/)
面向开发者的 macOS 系统配置指南，涵盖开发环境与效率工具。

## [天文科研指南](https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md)
详细介绍天文学研究的各个阶段，适合初入科研者参考。天文科研从入门到放弃（但是这个确实神中神）。

## [该链接已失效](https://naiixi.com)
此链接目前无法访问，推荐移除或替换为有效资源。

## [404 Not Found](https://yeka.ai)
页面不存在，可能链接错误或目标内容已被删除。
`
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="resourceText" />
  </PageWrapper>
</template>