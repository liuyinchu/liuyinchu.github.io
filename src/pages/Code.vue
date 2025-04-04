<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const rawList = [
  {
    name: '个人绘图工具',
    desc: '就开发了一点点功能，如果有用的话，你可以拿去尽情使用。',
    url: '/files/code/ysy_plot_utils.py'
  },
  {
    name: '近代物理实验报告模版',
    desc: '这个我也没搞完，但暂时就这样勉强能用；总之，它为近代物理实验报告的撰写提供了一些探索与可能。',
    url: '/files/code/v1.2-beta-ysy-new-labreport-template-recommended-only-for-modern-physics-experiments.zip'
  },
  {
    name: '远程登录服务器时的欢迎脚本',
    desc: '练手用的',
    url: '/files/code/learning-and-practice-linux-server-login-welcome-script-attempt.zip'
  }
]

const intro = `
# 共享代码

这里展示我公开的一些科研或学习代码，欢迎参考使用。
`

// ✅ 安全地提前构造 Markdown 字符串
const codeList = rawList.map((item) => ({
  markdown: `## ${item.name}\n\n${item.desc}`,
  url: item.url
}))
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="intro" />

    <template v-for="(item, i) in codeList" :key="i">
      <BlockMarkdown :content="item.markdown" />
      <LinkButtons :buttons="[{ text: '下载', url: item.url }]" />
    </template>
  </PageWrapper>
</template>