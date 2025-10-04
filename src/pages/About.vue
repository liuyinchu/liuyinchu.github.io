<template>
  <PageWrapper>
    <BlockMarkdown :content="aboutText" :useCJK="true" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const aboutText = `
# 关于本站和作者

作者是**流萤厨**，所以：“个人网站高能回，流萤厨献给流萤的真挚情书！”

- **自我介绍：** 懒得写，不影响。
- **联系方式：** 页脚有我的 GitHub 和邮箱。
- **关于这个网站：** 主要用于练手和分享一些东西。
- **想到了再写……**
`
</script>