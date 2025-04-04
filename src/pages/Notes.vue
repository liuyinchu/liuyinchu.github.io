<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const notes = [
  {
    name: '早期尝试学深度学习没学会',
    desc: '找了半天没啥可放的就把这玩意放上来吧。',
    url: '/files/notes/hand_rubbing_neural_network.pdf'
  }
]

const introText = `
# 我的笔记

记录下我在学习和研究中的思考与总结。
`

// ✅ 提前构造 markdown 内容数组
const noteMarkdowns = notes.map((item) => ({
  content: `## ${item.name}\n\n${item.desc}`,
  url: item.url
}))
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="introText" />

    <template v-for="(item, i) in noteMarkdowns" :key="i">
      <BlockMarkdown :content="item.content" />
      <LinkButtons :buttons="[{ text: '下载', url: item.url }]" />
    </template>
  </PageWrapper>
</template>