<template>
  <PageWrapper>
    <pre align="center">
      ██████╗ ██████╗ ██╗███████╗██╗  ██╗    ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
      ██╔══██╗██╔══██╗██║██╔════╝██║ ██╔╝    ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
      ██████╔╝██████╔╝██║███████╗█████╔╝     ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
      ██╔══██╗██╔══██╗██║╚════██║██╔═██╗     ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
      ██████╔╝██║  ██║██║███████║██║  ██╗    ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
      ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
    </pre>  
         
    <BlockMarkdown :content="introText" />

  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

---

# 个人小巧思合集

喂喂喂！
`
</script>
