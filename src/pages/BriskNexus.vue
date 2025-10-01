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

    <BlockMarkdown :content="proj1" />

    <!-- 图片模块 C -->
    <ImageBlock
      src="/fig/welcome_example.png"
      alt="效果如图所示"
      width="70%"
    />

        <LinkButtons :buttons="[
      { text: 'Click Here to Get it !', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/learning-and-practice-linux-server-login-welcome-script-attempt' }
    ]" />

    <BlockMarkdown :content="proj2" />

    <!-- 图片模块 C -->
    <ImageBlock
      src="/fig/cgc_example.png"
      alt="j1=2, j2=2 时的 CG 系数"
      width="50%"
    />

        <LinkButtons :buttons="[
      { text: 'Click Here to Get it !', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/clebsch-gordan-coefficient' }
    ]" />

    <BlockMarkdown :content="proj3" />

    <ImageBlock
      src="/fig/ysy_latex_ref.png"
      alt="模板参考文献格式说明——建议喂给 AI 助手"
      width="70%"
    />

        <LinkButtons :buttons="[
      { text: 'Click Here to Get it !', url: 'https://github.com/pifuyuini/brisk-nexus/tree/dev/ysy-latex-template/template-v1.4.1' }
    ]" />

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

- 服务器欢迎脚本（已完成）
- CG系数表生成脚本（已完成）
- 个人 LaTeX 模板：\`ysy-latex\`（v1.4.1）

`

const proj1 = `

---

## 学习和实践 Linux 服务器登录欢迎脚本尝试

用于通过SSH远程登陆服务器时在终端上显示欢迎词。

练手时的初步尝试。
`

const proj2 = `

---

## 学量子力学时写的 CG 系数表生成器

学习 Cohen 的量子力学时，为了很好的去理解和掌握角动量耦合（CG 系数）的递推关系，因此尝试用这个递推关系去写了一个 CG 系数表生成器。

注意其中每个数都应当加上一个根号，正负号代表根号外的正负。

此外，参考了 Sakurai 的现代量子力学和[这份笔记](https://huanyushi.github.io/posts/clebsh-gordan-coefficients/)。
`

const proj3 = `

---

## 基于YsyClass样式的ysy-latex模版

这个模板由于一些素材上的问题和一些未知的 Bug ，我目前暂时并没有打算公开（事实上你从这个名字就能发现这十分难绷）。

理论上除我以外只有部分邀请测试的人员会持有这个模板。

Anyway，如果你发现了它，并且觉得它有用的话，就悄悄用吧。

目前在内测的是 v1.4.1 版本，该模板目前仍处于开发阶段，结构与功能尚不完善，部分内容可能在后续版本中变更。

**传播与使用限制（重要）：由于模板中部分素材尚未完成版权审查，存在潜在侵权风险，因此严禁将本模板传递给除你本人以外的任何第三方。若违反此条，因传播行为导致的任何侵权责任，将由你本人承担全部后果。**

其中非素材部分的开源内容，你可自由使用、修改甚至传播（不过模板本身较为粗糙，或许也没什么可传播的）。

模板仅用于非商业性学习交流，不得用于任何营利性用途。

模板结构设计参考了 Markdown 类标记语言的风格，主要文件如下：
- \`control.tex\`：用于设置文章的风格和元信息（如颜色、封面、身份等），建议主要调整 ycolor 参数。推荐配色主题：CatppuccinLatte、Elegant、SkyRelax。
- \`main.tex\`：正文内容主体，请参考示例文件使用特定排版环境。
- \`appendix.tex\`：附录内容。
- \`ref.tex\`：参考文献。

demo文件可以在 v1.3-release 中找到，不过会与 v1.4 不兼容。

`

</script>
