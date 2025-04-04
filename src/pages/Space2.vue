<template>
  <PageWrapper>
    <!-- 文本模块 A -->
    <BlockMarkdown :content="introText" />

    <!-- 按钮模块 B：一行排列的跳转按钮 -->
    <LinkButtons :buttons="[
      { text: 'GitHub', url: 'https://github.com/liuyinchu' },
      { text: '项目仓库', url: 'https://github.com/liuyinchu/liuyinchu.github.io' },
      { text: '代码页面', url: '/code' }
    ]" />

    <!-- 图片模块 C -->
    <ImageBlock
      src="/bg/share.jpeg"
      alt="分享是创造的开始"
      width="80%"
    />

    <!-- 第二段 Markdown 文本 -->
    <BlockMarkdown :content="bodyText" />

    <!-- 再来一个按钮模块 -->
    <LinkButtons :buttons="[
      { text: '更多资源', url: '/resource' }
    ]" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `
# 欢迎来到示例页面

这个页面展示了如何组合使用我们自定义的页面模块。

你可以在任何页面中这样组织内容，实现高度复用。
`

const bodyText = `
---

## 关于本站

本网站由 Vue + Vite 构建，支持：

- Markdown 编辑
- LaTeX 公式（例如：$\\alpha^2 + \\beta^2 = 1$）
- 精美的跳转按钮
- 响应式图片展示

一切都采用 [Catppuccin Mocha](https://catppuccin.com/) 主题风格。

\`\`\`js
console.log("Enjoy your personal space!")
\`\`\`

希望这个空间成为你的创意花园。
`
</script>
