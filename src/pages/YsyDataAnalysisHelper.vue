<template>
  <PageWrapper>
    <pre class="ascii_text"> 
██╗   ██╗██████╗  █████╗ ██╗  ██╗    ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ 
╚██╗ ██╔╝██╔══██╗██╔══██╗██║  ██║    ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗
 ╚████╔╝ ██║  ██║███████║███████║    ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝
  ╚██╔╝  ██║  ██║██╔══██║██╔══██║    ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗
   ██║   ██████╔╝██║  ██║██║  ██║    ██║  ██║███████╗███████╗██║     ███████╗██║  ██║
   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
    </pre> 

    <BlockMarkdown :content="introText" :useCJK="true" />

    <BlockMarkdown :content="yph1" :useCJK="true" />

    <LinkButtons :buttons="[
      { text: 'Click Here to Get It !', url: 'https://github.com/liuyinchu/ysy-data-analysis-helper/tree/main/ysy-plot-helper' }
    ]" />

    <BlockMarkdown :content="yph2" :useCJK="true" />

    <ImageBlock
      src="/fig/ysy_academic_sky.png"
      alt="漫光天空配色的适用于 Ysy LaTeX 的绘图样式"
      width="40%"
    />

    <BlockMarkdown :content="yph3" :useCJK="true" />

    <ImageBlock
      src="/fig/science.png"
      alt="Science 期刊样式"
      width="40%"
    />

    <BlockMarkdown :content="yph4" :useCJK="true" />

    <ImageBlock
      src="/fig/ieee.png"
      alt="IEEE 风格的黑白打印友好样式"
      width="40%"
    />

    <BlockMarkdown :content="yph5" :useCJK="true" />

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

### 获取

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

const yph5 = `

### 关于科研绘图

我还想多分享一些信息。

以下是十分可靠的科研绘图建议，总的来说，要意识到“图不是装饰，是人与数据的接口”。先想清楚“给谁看、想让对方马上看到什么”，再决定图的形态与细节。
- 了解你的受众：受众不同，信息密度与精确度不同：合作者可略、期刊需完整、学生要多解释、大众科普要极简、抓重点。
- 明确你的信息：图的唯一任务是把一句核心结论/现象说清楚；信息明确后再选图型与设计。
- 适配展示介质：口头报告显示时间短、观看距离远，图要简、线要粗、字号大、对比强、少细节；避免竖排文字。期刊/打印可放更多细节与说明，标题/注释/放大视窗都可以加。
- 标注（图注）不是可选项：图中说不清的，在图注写清楚“如何读图”：变量含义、单位、处理方法、关键点位置。数值重要就给数值，别让读者对着柱高“猜”。
- 别迷信软件默认值：默认样式是“万金油”，从不最优。手动调：字号、线宽、刻度、标记、配色、网格、布局与留白。
- 不要误导读者：警惕自动重标/截断坐标轴导致的视觉夸大。圆点/气泡图要用面积映射数值（不是半径），否则比例感错误。少用3D图、饼图做数量比较；优先用最简单能清楚表达的图型。用完整坐标范围、清晰刻度与标签；让同事帮你做“误读测试”。
- 避免“图表垃圾”：去掉无信息的装饰：花哨背景、过多网格/刻度、冗余图例与色彩。但有信息的视觉辅助是允许的（例如灰底标示有效区间），关键在“是否传达了新信息”。
- 信息优先于美观：领域标准有助于可比与纠错，但很多情况要定制新图。借鉴优秀作品但不要只追求好看（信息与可读性永远第一）。草图/素描风格可用来传达“近似/概念性”而非定量精确的信息。

在文章 “The Rainbow Colour Map (repeatedly) considered harmful” 中，作者给出了以下结论，值得引起我们的关注：
- 在科学数据可视化中，应 避免使用彩虹色标 / 彩虹渐变（如 jet）—— 它常常是 “有害的”（harmful），因为它可能误导读者、伪造视觉边界、掩盖数据细节、不对色觉障碍者友好。
- 相反，应采用 感知均匀 / 漂亮又科学的配色（例如 Viridis、Magma、Inferno 或作者设计的 Davos 等），使得整个色标在亮度／对比感知方面更均匀，更忠实于数据本身。

此外，如果您对参与到这份脚本的开发中感兴趣，或是希望开发你自己的可视化助手，我向您推荐这篇[文章](https://realpython.com/python-matplotlib-guide/)。

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
