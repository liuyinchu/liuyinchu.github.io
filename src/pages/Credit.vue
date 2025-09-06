<template>
  <PageWrapper>
    <BlockMarkdown :content="creditText" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const creditText = `
# 致谢 & 版权

*感谢以下项目、资源与灵感给予本站建设的重要支持！*

---

## 技术支持

- 核心框架：高效现代的前端开发框架 [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- Markdown ：渲染 [markdown-it](https://markdown-it.docschina.org/) + 公式支持 [MathJax](https://www.mathjax.org/)
- 网站托管：本网站部署于 GitHub Pages
- 颜色主题：[Catppuccin Mocha](https://catppuccin.com/)

---

## 灵感素材

首先，感谢[网络邻居](/space2)中的各位提供网站构思与设计灵感上的支持。

同时，本网站的构思与设计也参考了这些网站：
- [CXPLAY World](https://blog.cxplay.org/)
- [AirTouch](https://xsl.im/)
- [柳下川](https://kawayww.com/)
- [lhasa's Blog](https://lhasa.icu/)

本网站采用了大量图片素材，其中有部分来自 PIXIV 和 BiliBili 的各位画师，他们是：
- Osot-酒保（B）

以上，暂时未列出的各位我会及时补上。

---

## 版权说明

**首先，对于我使用的各种素材，如果您认为侵犯了您的版权，我表达强烈的歉意，您可以通过页脚的联系方式告知我，我会第一时间删除相关资源并与您沟通后续处理事项。**

接下来，关于这个网站的版权，基本按照 [MIT LICENSE](https://opensource.org/license/mit) 发布：
- 前端代码：“Copyright (c) 2024 - 2025 LiuYinChu'Space 本软件可自由使用、复制、修改、分发，前提是保留原始版权声明。
软件按“原样”提供，不附带任何明示或暗示的担保。”
- 原创图片：允许所有人以任意形式使用。
- 原创文章与日志：“[CC BY-NC-ND 4.0 国际许可协议](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans)，转载请务必注明出处，禁止商用及修改。”

`
</script>