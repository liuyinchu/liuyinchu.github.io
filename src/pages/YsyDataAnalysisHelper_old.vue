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

    <BlockMarkdown :content="mamplotly2" :useCJK="true" />

    <ImageBlock
      src="/fig/a_new_example.png"
      alt="使用 mamplot “一键绘图”"
      width="40%"
    />

    <LinkButtons :buttons="[
      { text: 'Comming Soon ...', url: 'https://github.com' }
    ]" />

    <BlockMarkdown :content="mamplotly1" :useCJK="true" />

    <LinkButtons :buttons="[
      { text: 'Click Here to Visit Its GitHub Repository !', url: 'https://github.com/liuyinchu/ysy-data-analysis-helper' }
    ]" />

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

# 我的绘图/数据处理工具包

这是一个合集，它包含于我们的更大的 **Phy-Lab Digital Helper** (PlDH) 项目，本页面展示我负责的部分 **"YDAH -- Ysy's Data Analysis Helper"** 包含：
- 绘图系列：
  - （新）个人绘图助手 \`MamPlotly\` （曼波～，v1.7）
  - （推荐）\`MamPlotly\` 轻量级封装 \`ysy_mamplot.py\` （曼波～，v1.8） + 全新绘图指引
  - （旧）个人绘图助手 \`ysy_plot_helper.py\` (v1.6，暂停后续更新～)
- 频域分析系列
  - \`YiLPSD\`（iLPSD 的 Rust 封装，可作为 Python 包调用，v0 版本试验中）
  - \`WelchPSDHelper\` 开发中～
- 未完成/待定

`

const mamplotly2 = `
## 全新轻量级绘图助手 \`ysy_mamplot.py\`

\`ysy_mamplot\` 是一个极小、务实的 Matplotlib 绘图辅助模块，专注解决两件最常见但又最烦人的事：
第一，把日常画线图/散点图的样板代码压缩成一次调用；第二，用一种很轻的方式把你常用的 \`.mplstyle\` 片段组合起来，并且只在一小段代码范围内生效，不污染全局环境。

它的定位很明确：
不试图替代 Matplotlib，也不提供复杂布局能力；它只是让你在 notebook、脚本、论文出图时，更快、更一致、更少“每次都要调一遍 rcParams”。

你会得到这些体验：
- \`mamplot(...)\` 一句出图：对单曲线、多曲线、散点提供统一入口；默认样式干净，支持把 legend 放到图外（论文/报告常用），也支持一键导出 SVG。
- \`temp_style(...)\` 临时样式管理器：把多个预设样式片段（layout + 配色）拼成一个临时 \`.mplstyle\` 文件，在 \`with\` 块或装饰器作用域内应用，退出后恢复 Matplotlib 默认值。
- 预设风格可组合：\`PRESET_STYLES\` 里把“排版类”和“配色类”拆成小片段，按需混搭；\`print_preset_styles()\` 可以快速查看可用 key。
- 保持轻量：整个模块就是“薄薄一层”，适合当作个人科研/工程绘图工作流里的稳定组件。

### 安装与导入

如果你是作为单文件脚本使用：把 ysy_mamplot.py 放进项目目录，然后：
\`\`\`python
import ysy_mamplot as mb
from ysy_mamplot import mamplot, temp_style, print_preset_styles
\`\`\`

### 核心概念：两类能力
#### 1) mamplot(...)：一键绘图（线图 / 散点）

它的目标是把你最常画的图变成“一句写完”。
支持两种输入模式：
- \`y\` 是一个序列：画单条曲线/散点
- \`y\` 是一个列表或元组，里面每个元素是一组 y：画多条曲线/散点（此时 \`legend_name\` 也必须是等长列表/元组）

它还支持这些常用选项：
- \`legend_out=True\`：legend 放到图外右上角（\`bbox_to_anchor=(1.02, 1)\`）
- \`legend_up=True\`：legend 放到图上方居中（多曲线时常用）
\`svg_save=True\`：按标题自动命名导出 SVG（会把不安全字符替换成 _）
\`logx/logy=True\`：对数坐标
\`return_fig=True\`：返回 (fig, ax)（但注意：如果 fig_show=True 会强制不返回）

> 重要提醒：mamplot 目前用的是 \`plt.plot/plt.scatter/plt.legend\` 的 pyplot 流程；如果你需要复杂布局（多子图、双 y 轴、secondary axis 等），建议直接用 Matplotlib 原生写法，再用 \`temp_style\` 负责样式。

#### 2) temp_style(...)：临时组合并应用样式（with / decorator 双模式）

\`temp_style\` 的用法有两种：
- 上下文管理器：\`with temp_style([...]): ...\`
- 装饰器：\`@temp_style([...])\` 或者裸装饰器 \`@temp_style\`

它做的事情是：
从 \`PRESET_STYLES\` 里按 key 把若干段 \`.mplstyle\` 文本拼起来，再追加你传入的 \`extra_style\`（你可以用它覆盖任何 \`rcParams\`），写入临时 \`.mplstyle\` 文件并 \`mplstyle.use(...)\`，退出作用域后 \`mplstyle.use("default")\` 并删除临时文件。
注意：退出后恢复的是 Matplotlib 的 "default"，不是“进入前的 style 栈”。也就是说，它的恢复策略是“回到默认”，而不是“回到你原来当时的某个自定义 style”。

`

const mamplotly1 = `

---

## 新的绘图助手包封装 **MamPlotly**

> A Personal Data Analysis Utils Group. Tiny, pragmatic helpers for day-to-day data analysis.

保持 \`matplotlib/plotly\` 的全部灵活性，同时减少样板代码，统一风格，适用于实验记录、报告插图、频域分析与论文制图。

由于首个较完善的实用发布包有个好听的别名 \`mamplotly\`（曼波地，曼波～曼波～），所以你也可以称这个包为 **MamPlotly**。

本项目与安装包目前正式名称均为 \`ysy-data-analysis-helper\`（核心实现带有强烈的 YSY 风格）。

一个简单的例子：
\`\`\`python
import numpy as np
import mamplotly as mb                    # 推荐：别名“曼波地”
from ysy_data_analysis_helper import iplot, mam_bode_plot, register_all  # Ultra

x = np.linspace(0, 10, 1000)
y = np.sin(x)

# 一行快速成图
mb.mamplot(x, y, 'sin(x)', plot_title='Single', y_label='Amplitude')

# 交互绘图（Notebook 中常设 return_fig=False）
iplot(x, [np.sin(x+i) for i in range(3)], [f'sin({i})' for i in range(3)],
      'Test iplot', legend_title='Functions', return_fig=False)
\`\`\`

更完整示例见仓库的 \`mamplotly_example.ipynb\`。

### 它完美兼容了原版 \`ysy_plot_helper.py\`

\`\`\`python
# 兼容原版（保持可用）
import ysy_data_analysis_helper as yph
yph.plot(...); yph.temp_style(...); yph.print_preset_styles()
\`\`\`

**而原版功能详见下（绘图助手 \`ysy_plot_helper.py\`）。**

### 安装

\`\`\`bash
pip install https://raw.githubusercontent.com/liuyinchu/ysy-data-analysis-helper/main/artifacts/ysy_data_analysis_helper-1.7.0-py3-none-any.whl
\`\`\`

### 设计理念：薄封装，快速出图与风格一致；不企图替代 \`matplotlib/plotly\` ，而是与之配合。
`

const yph1 = `

---

## 初代绘图助手脚本 \`ysy_plot_helper.py\`

### 这份 \`.py\` 绘图脚本被我们改造为了新的功能更强大全面的 \`MamPlotly\` 包，目前进行了试用版的发布与测试，如前所述。留在这里的这个原绘图脚本及其设计想法停留在了 v1.6 这个版本，不过我们仍公开供其它开发者使用。

---

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

---

## 关于科研绘图

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
