<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const notes = [
  {
    name: '早期尝试学深度学习没学会',
    desc: '找了半天没啥可放的就把这玩意放上来吧。',
    url: '/files/notes/hand_rubbing_neural_network.pdf'
  },
  {
    name: '2024年大创项目',
    desc: '给小组的汇报人做的PPT，结果他没用上；不过挺详细的，倒是可以当个笔记。',
    url: '/files/notes/lhasso_gnn_presentation_ysyversion.pdf'
  },
  {
    name: '引力波物理梳理笔记1',
    desc: '课程《引力波物理》前半学期内容的个人知识点梳理笔记。',
    url: '/files/notes/gw_ppt_note.pdf'
  },
  {
    name: '量子力学梳理笔记1',
    desc: '个人笔记，参考知乎的文章，梳理了含时微扰、绝热近似和相对论量子力学的内容',
    url: '/files/notes/qm_ppt_note.pdf'
  },
]

const introText = `
# 我的笔记

记录下我在学习和研究中的思考与总结。

---
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