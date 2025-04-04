<template>
  <PageWrapper>
    <BlockMarkdown :content="creditText" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'

const creditText = `
# 致谢与版权

感谢以下项目、资源与灵感给予本站建设的重要支持：

- **Vue 3 + Vite：** 本网站所采用的高效现代的前端开发框架。
- **markdown-it + MathJax：** 本网站所采用的支持优雅的 Markdown 与公式展示。
- **OpenAI ChatGPT：** 提供本网站的构思、设计与编码建议的好伙伴。
- **GitHub Pages：** 本网站部署于 GitHub Pages。
- **部分灵感来源：** Apple 官网、yyk space、Huanyu Shi 等（部分可以在 [网上邻居](/space1) 中找到）。
- **部分素材来源：** pixiv 画师（他们可以在 [资源链接](/resource) 中找到）。
- **说明：** 如果您认为侵犯了您的版权，您可以通过页脚的联系方式告知我，我会第一时间删除相关资源。
- **关于这个网站的版权：** 暂时懒得写，我估计也用不上。
`
</script>