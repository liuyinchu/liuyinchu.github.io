<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const notes = [
  {
    name: '引力波物理个人笔记 II',
    desc: '课程《引力波物理》的完整（暂时）个人笔记；其中部分材料来源已在文件中有详细说明；此外，与之相关的是[期末大作业](https://github.com/pifuyuini/ysy-gw-phy)。',
    url: '/files/notes/gwphy_note_ysy.pdf'
  },
  {
    name: '超越标准量子极限的基于多体纠缠玻色-爱因斯坦凝聚体的精密磁场测量方案设计',
    desc: '课程《精密测量物理导论》期末论文。',
    url: '/files/notes/QuantumMagnetometry_BEC_20250628.pdf'
  },
  {
    name: 'Optics Assignment',
    desc: '2022级光学课作业个人习题解答（英文版）。',
    url: '/files/notes/ysy_optics.pdf'
  },
  {
    name: '2024年大创项目：LHASSO高能粒子能量数据 AI 重构和分析',
    desc: '给小组的汇报人做的PPT，结果他没用上；不过挺详细的，倒是可以当个关于 GNN 的介绍笔记。',
    url: '/files/notes/lhasso_gnn_presentation_ysyversion.pdf'
  },
  {
    name: '引力波物理梳理笔记 I',
    desc: '课程《引力波物理》前半学期内容（主要是GR和引力波理论部分）的个人知识点梳理笔记。',
    url: '/files/notes/gw_ppt_note.pdf'
  },
  {
    name: '量子力学梳理笔记 I',
    desc: '个人笔记，参考知乎的文章，梳理了含时微扰、绝热近似和相对论量子力学的内容。',
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