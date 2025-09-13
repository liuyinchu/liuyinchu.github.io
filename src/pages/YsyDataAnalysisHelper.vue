<template>
  <PageWrapper>
    <pre align="center"> 
██╗   ██╗██████╗  █████╗ ██╗  ██╗    ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ 
╚██╗ ██╔╝██╔══██╗██╔══██╗██║  ██║    ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗
 ╚████╔╝ ██║  ██║███████║███████║    ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝
  ╚██╔╝  ██║  ██║██╔══██║██╔══██║    ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗
   ██║   ██████╔╝██║  ██║██║  ██║    ██║  ██║███████╗███████╗██║     ███████╗██║  ██║
   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
    </pre> 

    <BlockMarkdown :content="introText" />

    <BlockMarkdown :content="yph1" />

    <LinkButtons :buttons="[
      { text: '使用/下载/托管仓库', url: 'https://github.com/liuyinchu/ysy-data-analysis-helper/tree/main/ysy-plot-helper' }
    ]" />

    <BlockMarkdown :content="yph2" />

    <ImageBlock
      src="/fig/ysy_academic_sky.png"
      alt="漫光天空配色的适用于 Ysy LaTeX 的绘图样式"
      width="40%"
    />

    <BlockMarkdown :content="yph3" />

    <ImageBlock
      src="/fig/science.png"
      alt="Science 期刊样式"
      width="40%"
    />

    <BlockMarkdown :content="yph4" />

    <ImageBlock
      src="/fig/ieee.png"
      alt="IEEE 风格的黑白打印友好样式"
      width="40%"
    />

  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

---

# 个人（实验）数据处理工具

这是一个合集，包含：
- 个人绘图助手 \`ysy_plot_helper.py\` (v1.6.0)
- 未完成/待定

`

const yph1 = `

---

## 绘图助手 \`ysy_plot_helper.py\`

一个轻量、务实的个人 Python 绘图助手，基于 Matplotlib。

提供一个“开箱即用”的标准化绘图入口和一个可组合的临时样式加载器，帮助您在 Jupyter Notebook、Python 脚本与学术论文之间保持一致、美观的出图风格。

### 特性

  * **标准化绘图函数 \`plot(...)\`**：一行代码完成常见的折线/散点图绘制，包括标题、坐标轴标签、图例等常用元素的设置，并原生支持多数据序列。
    \`yph.plot()\` 封装了一个基础的 \`matplotlib.pyplot\` 绘图流程，特别适合快速可视化数据。
    \`\`\`python
    # 准备数据
    x = np.linspace(0, 2 * np.pi, 200)
    y = np.sin(x)

    # 一行代码出图
    yph.plot(x, y, legend_name='sin(x)', plot_title='Sine Wave', x_label='Radian', y_label='Value')
    \`\`\`
  * **临时样式加载器 \`temp_style(...)\`**：以 \`with\` 代码块的形式，将多个内置样式片段与您的自定义配置项动态组合成一个临时的 \`.mplstyle\` 样式文件。该样式仅在代码块内生效，结束后自动恢复 Matplotlib 的默认设置，绝不污染全局环境。
    \`\`\`python
    # 在 with 代码块中使用推荐的 "学术" + "天空蓝" 风格
    with yph.temp_style(["ysy_academic", "sky"]):
        # 在这里创建你的图形
        fig, ax = plt.subplots()
        ax.plot(x, np.sin(x), label='sin(x)')
        ax.plot(x, np.cos(x), label='cos(x)')
        ax.set_title('Trigonometric Functions')
        ax.set_xlabel('Radian')
        ax.set_ylabel('Value')
        ax.legend()
        plt.show()

    # 在 with 代码块之外，Matplotlib 样式会恢复到之前的状态
    fig, ax = plt.subplots()
    ax.plot(x, np.tan(x), label='tan(x)')
    ax.set_title('Another Plot with Default Style')
    ax.legend()
    plt.show()
    \`\`\`
  * **可组合的内置样式库 \`PRESET_STYLES\`**：内置多套精心设计的样式片段，并清晰地将它们区分为“布局类”（控制尺寸、字体、坐标刻度等）与“配色类”（控制色盘、前景/背景色等），允许您像搭积木一样自由组合，创造出最适合您当前需求的视觉风格。
  * **样式快速预览 \`print_preset_styles()\`**：在命令行中快速打印出所有可用的预设样式及其推荐组合，方便您随时查阅和选用。

`

const yph2 = `

### **三种好看的内置样式**

#### \`"ysy_academic"\` + \`"sky"\`

这套组合是为学术写作而设计的，特别是为了与我的另一个项目 **Ysy LaTeX 模板** 完美配合。
设计的核心理念是：当生成的图片以 "0.7textwidth" 的宽度插入 LaTeX 文档时，图中的文字大小（如标题、标签）应与文章的正文字号（约 11pt）基本一致，且图片的宽高比接近黄金比例，以获得最佳的视觉协调性。\`"sky"\` 配色方案同样源自 Ysy LaTeX 中的同名主题。

`

const yph3 = `

#### \`"science"\` + \`"science_color"\`

这套组合的灵感与设计绝大部分来自于优秀的 \`SciencePlots\` 包，旨在复现顶级期刊 *Science* 的绘图风格。其简洁、清晰、专业的视觉呈现使其非常适用于正式的科学出版物。特别地，它与 Ysy LaTeX 模板中的 \`Elegant\` 配色主题也十分搭调。

`

const yph4 = `

#### \`"ieee"\` + \`"ieee_color"\`

>IEEE requires figures to be readable when printed in black and white. The ieee style also sets the figure width to fit within one column of an IEEE paper.

这套样式的诞生源于一个触动我的故事：

> 某天网上冲浪，看到这样一条消息，颇有感触：“在德国参加几次会议，真的会见到好几个那种路都走不稳，退休好多年的老教授还去参加会议，真的觉得他们是真热爱。之前外导还嘱咐我，文章里的图颜色别花花绿绿的，尽量用黑白，因为会有老教授不喜欢读电子版的，他们喜欢打印出来读，如果你文章里全是花花绿绿的，他们打印下来也分辨不清。”

这个故事提醒我们，学术成果的传播应当考虑到所有读者，包括那些习惯于阅读黑白打印稿的老一辈学者。IEEE 的出版规范也明确要求：“图形在黑白打印时必须是可读的”。因此，我参考 \`SciencePlots\` 实现了这套 \`ieee\` 样式，它不仅优化了灰度可读性，还将图形宽度默认设置为适合 IEEE 双栏论文的单栏宽度。

> “真正的科研工作者总是前赴后继地奔赴那片荒原。”

希望这份小小的脚本，能为您的探索之路提供些许便利。

`
</script>
