<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const notes = [
  {
    name: 'Deep Learning Practice Checklist',
    desc: '深度学习实践指引',
    url: '/files/notes/DL_Proj_Checklist.md'
  },
  {
    name: '（组会汇报）从稀疏识别到弱形式：数据驱动建模方法初探',
    desc: '关于两篇文献阅读、学习与复现的结果的汇报',
    url: '/files/notes/group_conference_1_sindy.pdf'
  },
  {
    name: '引力波物理个人笔记',
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
  }
]

const introText = `

---

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
      <pre class="ascii_text">
███╗   ██╗ ██████╗ ████████╗███████╗███████╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
      </pre>

    <BlockMarkdown :content="introText" :useCJK="true" />

    <template v-for="(item, i) in noteMarkdowns" :key="i">
      <BlockMarkdown :content="item.content" :useCJK="true" />
      <LinkButtons :buttons="[{ text: 'Click Here to Get It !', url: item.url }]" />
    </template>
  </PageWrapper>
</template>

<style scoped>
.ascii_text {
  font-family: "Fira Code", monospace; /* 指定 Fira Code */
  text-align: center;                  /* 居中 */
  white-space: pre;                    /* 保留空格和换行，适合 ASCII 艺术 */
  font-size: 12.5px;
}
</style>
