<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const intro = `
# 共享代码

这里展示我公开的一些科研或学习代码，欢迎参考使用。
`
const code1 = `
---

## 个人绘图工具

<code>ysy_plot_utils.py</code>封装了一些适用于<code>Matplotlib</code>的主题样式和快速绘图函数。

虽然但是，就开发了一点点功能，如果有用的话，你可以拿去尽情使用。
`

const code1_2 = `
更新了v1.3版本，主要新增了风格加载器功能；然后对主绘图函数做了小适配，对流萤主题也做了小修改与小适配。
`

const code2 = `
---

## 近代物理实验报告模版

这个我也没搞完，但暂时就这样勉强能用；总之，它为近代物理实验报告的撰写的新形式与新主题风格提供了一些探索与可能。
`

const code3 = `
---

## 远程登录服务器时的欢迎脚本

这个是我玩我的服务器时练手用的，没啥用。
`

const code4 = `
---

## CG系数表绘制脚本

算法是学Cohen的《量子力学》时想的，属于学习时练手项目，也就有个形式，性能都相当差，仅做参考。
`
</script>


<template>
  <PageWrapper>
    <BlockMarkdown :content="intro" />
    
    <BlockMarkdown :content="code1" />
    <ImageBlock
      src="/bg/ysy_plot_examples.png"
      alt="使用设定好的主题并用快速多曲线绘制函数的绘图结果"
      width="50%"
    />
    <BlockMarkdown :content="code1_2" />
    <ImageBlock
      src="/bg/ysy_plot_examples_2.png"
      alt="v1.3版本中新增的风格加载器，图示为与本网站适配的梦琪摩卡主题"
      width="50%"
    />
    <LinkButtons :buttons="[{ text: '下载', url: '/files/code/ysy-data-analysis-utils-v1.3.zip' }]" />
    
    <BlockMarkdown :content="code2" />
    <LinkButtons :buttons="[{ text: '下载', url: '/files/code/v1.2-beta-ysy-new-labreport-template-recommended-only-for-modern-physics-experiments.zip' }]" />
    
    <BlockMarkdown :content="code3" />
    <ImageBlock
      src="/bg/welcome_example.png"
      alt="效果展示"
      width="80%"
    />
    <LinkButtons :buttons="[{ text: '下载', url: '/files/code/learning-and-practice-linux-server-login-welcome-script-attempt.zip' }]" />
    
    <BlockMarkdown :content="code4" />
    <ImageBlock
      src="/bg/cgc_example.png"
      alt="绘制的CG系数表示例"
      width="50%"
    />
    <LinkButtons :buttons="[{ text: '下载', url: '/files/code/clebsch-gordan-coefficient.zip' }]" />
  </PageWrapper>
</template>
