<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const resourceText = `
# 资源分享

我在学习中收集整理的一些优质外部资源，欢迎探索。

---

## 查询、百科类

### [Git教程](https://liaoxuefeng.com/books/git/introduction/index.html)
廖雪峰的 Git 教程，系统、清晰，是入门 Git 的优质资源。学Git，就用廖雪峰教程（这个真的很好）！

### [小时百科](https://wuli.wiki/index.html)
一个结构化的数学与物理知识查询平台，内容简明而准确。我用来查询数学物理知识。

### [马克思主义文库](https://www.marxists.org/chinese/index.html)
如题。

## 文献

### [Nature物理综述](https://www.nature.com/natrevphys/)
Nature Physics 杂志的综述文章合集，适合查找高质量的前沿文献。

## Python 库、包

### [Ruptures](https://centre-borelli.github.io/ruptures-docs/)
用于时间序列变点检测的 Python 库，适合科研与工程应用。

### [Optuna](https://optuna.org/)
很方便的优化框架。

## 电脑相关

### [macOS配置指南](https://sourabhbajaj.com/mac-setup/)
面向开发者的 macOS 系统配置指南，涵盖开发环境与效率工具。

## 一些文章、笔记和资料

### [控制论从入门到放弃](https://zhuanlan.zhihu.com/p/683044170)
一篇通俗易懂的控制论入门文章，适合初学者快速建立直觉。一篇很好的控制论入门文章。

### [天文科研指南](https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md)
详细介绍天文学研究的各个阶段，适合初入科研者参考。天文科研从入门到放弃（但是这个确实神中神）。

### [The Missing Semester of Your CS Education 中文版](https://missing-semester-cn.github.io/)
课程介绍（转载自网站）：计算机设计的初衷就是任务自动化，然而学生们却常常陷在大量的重复任务中，或者无法完全发挥出诸如 版本控制、文本编辑器等工具的强大作用。效率低下和浪费时间还是其次，更糟糕的是，这还可能导致数据丢失或 无法完成某些特定任务。
这些主题不是大学课程的一部分：学生一直都不知道如何使用这些工具，或者说，至少是不知道如何高效 地使用，因此浪费了时间和精力在本来可以更简单的任务上。标准的计算机科学课程缺少了这门能让计算 变得更简捷的关键课程。

此外，B站有中文翻译过的课程视频。

### [一个beamer模版](https://github.com/matze/mtheme)
看起来不错。

## 其它

### [该链接已失效](https://naiixi.com)
此链接目前无法访问，推荐移除或替换为有效资源。

### [404 Not Found](https://yeka.ai)
页面不存在，可能链接错误或目标内容已被删除。
`
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="resourceText" />
  </PageWrapper>
</template>