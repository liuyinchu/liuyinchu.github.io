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

更新了v1.4中，我提供了适配于相应 LaTeX 模版的绘图风格。

更新了v1.5，适当优化。
`

const code2 = `
---

## LaTeX 通用模版

这是原近代物理实验报告模版的加强版，新增对通用笔记模板、基础物理实验模板、课程论文模板的适配。

通用模版 YsyClass，其中封装了包括但不限于上述实验报告的样式，目前测试版本v1.3-release已上线。
`

const code_gw = `
---

## 引力波物理·期末大作业

- 这个库用于存储我学习课程“引力波物理”，完成期末大作业时的各种资料，以代码为主。主要内容是：学习[这个教程](https://gwosc.org/tutorials/)，然后自己上手走一遍流程。同时，我也参考了我们课程的[讲义](https://github.com/yiminghu-SYSU/GW_DA_notes)。
- 关于数据，我只上传了**我处理后的数据**，缺失的数据和原始数据可以在[这个仓库](https://github.com/gwosc-tutorial/LOSC_Event_tutorial?tab=readme-ov-file)和[GWOSC](https://gwosc.org/events/GW150914/)中找到。
- 这些代码应该有很多问题，仅供参考。此外，这些代码可以供任意人使用。
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
      src="/bg/acadmic_example.png"
      alt="v1.4 版本后推荐绘图方式与效果"
      width="60%"
    />
    <BlockMarkdown :content="code1_2" />
    <LinkButtons :buttons="[{ text: 'GitHub仓库', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/ysy-data-analysis-utils' }]" />
    
    <BlockMarkdown :content="code2" />
    <LinkButtons :buttons="[{ text: 'GitHub仓库', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/ysy-latex-template' }]" />
    
    <BlockMarkdown :content="code_gw" />
    <ImageBlock
      src="/bg/GW150914_H1_MF.png"
      alt="GW150914-H1 事件发生时刻附近的应变数据与匹配滤波（30～350Hz）"
      width="60%"
    />
    <LinkButtons :buttons="[{ text: 'GitHub仓库', url: 'https://github.com/pifuyuini/ysy-gw-phy' }]" />
    
    <BlockMarkdown :content="code3" />
    <ImageBlock
      src="/bg/welcome_example.png"
      alt="效果展示"
      width="80%"
    />
    <LinkButtons :buttons="[{ text: 'GitHub仓库', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/learning-and-practice-linux-server-login-welcome-script-attempt' }]" />
    
    <BlockMarkdown :content="code4" />
    <ImageBlock
      src="/bg/cgc_example.png"
      alt="绘制的 CG 系数表示例"
      width="50%"
    />
    <LinkButtons :buttons="[{ text: 'GitHub仓库', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/clebsch-gordan-coefficient' }]" />
  </PageWrapper>
</template>
