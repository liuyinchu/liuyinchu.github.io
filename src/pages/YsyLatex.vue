<template>
  <PageWrapper>
    <pre class="ascii_text"> 
      ██╗   ██╗███████╗██╗   ██╗    ██╗      █████╗ ████████╗███████╗██╗  ██╗
      ╚██╗ ██╔╝██╔════╝╚██╗ ██╔╝    ██║     ██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
       ╚████╔╝ ███████╗ ╚████╔╝     ██║     ███████║   ██║   █████╗   ╚███╔╝ 
        ╚██╔╝  ╚════██║  ╚██╔╝      ██║     ██╔══██║   ██║   ██╔══╝   ██╔██╗ 
         ██║   ███████║   ██║       ███████╗██║  ██║   ██║   ███████╗██╔╝ ██╗
         ╚═╝   ╚══════╝   ╚═╝       ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
    </pre> 

    <BlockMarkdown :content="introText" :useCJK="true" />

  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

---

# 个人模板 Ysy LaTeX

喂喂喂！
`
</script>

<style scoped>
.ascii_text {
  font-family: "Fira Code", monospace; /* 指定 Fira Code */
  text-align: center;                  /* 居中 */
  white-space: pre;                    /* 保留空格和换行，适合 ASCII 艺术 */
  font-size: 12.5px;
}
</style>
