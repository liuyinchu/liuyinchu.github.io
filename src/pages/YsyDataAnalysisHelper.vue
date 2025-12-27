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
      width="70%"
    />

    <LinkButtons :buttons="[
      { text: 'Comming Soon ...', url: 'https://github.com' }
    ]" />

    <LinkButtons :buttons="[
      { text: 'You can visit this page to use mamplotly-web-tools !', url: 'https://github.com' }
    ]" />

    <BlockMarkdown :content="mamplotly1" :useCJK="true" />

    <LinkButtons :buttons="[
      { text: 'Click Here to Visit Its GitHub Repository !', url: 'https://github.com/liuyinchu/ysy-data-analysis-helper' }
    ]" />

  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

# 我的绘图/数据处理工具包

这是一个合集，它包含于我们的更大的 **Phy-Lab Digital Helper** (PlDH) 项目，本页面展示我负责的部分 **"YDAH -- Ysy's Data Analysis Helper"** 包含：
- 绘图系列：
  - （推荐）\`MamPlotly\` 轻量级封装 \`ysy_mamplot.py\` （曼波～，v1.9 即将更新） + 全新绘图指引
  - 个人绘图助手 \`MamPlotly\` （曼波～，v1.7，目前版本）
- 频域分析系列
  - \`YiLPSD\`（iLPSD 的 Rust 封装，可作为 Python 包调用，v0 版本试验中）
  - \`WelchPSDHelper\` 开发中～
- 未完成/待定

`

const mamplotly2 = `

---

## 轻量级绘图助手 \`ysy_mamplot.py\`

\`ysy_mamplot\` 是一个极小、务实的 Matplotlib 绘图辅助模块，专注解决两件最常见但又最烦人的事：
第一，把日常画线图/散点图的样板代码压缩成一次调用；第二，用一种很轻的方式把你常用的 \`.mplstyle\` 片段组合起来，并且只在一小段代码范围内生效，不污染全局环境。

它的定位很明确：
不试图替代 Matplotlib，也不提供复杂布局能力；它只是让你在 notebook、脚本、论文出图时，更快、更一致、更少“每次都要调一遍 rcParams”。

你会得到这些体验：
- \`mamplot(...)\` 一句出图：对单曲线、多曲线、散点提供统一入口；默认样式干净，支持把 legend 放到图外（论文/报告常用），也支持一键导出 SVG。
- \`temp_style(...)\` 临时样式管理器：把多个预设样式片段（layout + 配色）拼成一个临时 \`.mplstyle\` 文件，在 \`with\` 块或装饰器作用域内应用，退出后恢复 Matplotlib 默认值。
- 预设风格可组合：\`PRESET_STYLES\` 里把“排版类”和“配色类”拆成小片段，按需混搭；\`print_preset_styles()\` 可以快速查看可用 key。
- 保持轻量：整个模块就是“薄薄一层”，适合当作个人科研/工程绘图工作流里的稳定组件。
- 新增多子图排版工具；新增配色。
- 新增高质量绘图指引。

### 安装与导入

如果你是作为单文件脚本使用：把 ysy_mamplot.py 放进项目目录，然后：
\`\`\`python
import ysy_mamplot as mb
from ysy_mamplot import mamplot, temp_style, print_preset_styles
\`\`\`

### 核心概念：两类能力
#### 1) \`mamplot(...)\`：一键绘图（线图 / 散点）

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

#### 2) \`temp_style(...)\`：临时组合并应用样式（with / decorator 双模式）

\`temp_style\` 的用法有两种：
- 上下文管理器：\`with temp_style([...]): ...\`
- 装饰器：\`@temp_style([...])\` 或者裸装饰器 \`@temp_style\`

它做的事情是：
从 \`PRESET_STYLES\` 里按 key 把若干段 \`.mplstyle\` 文本拼起来，再追加你传入的 \`extra_style\`（你可以用它覆盖任何 \`rcParams\`），写入临时 \`.mplstyle\` 文件并 \`mplstyle.use(...)\`，退出作用域后 \`mplstyle.use("default")\` 并删除临时文件。
注意：退出后恢复的是 Matplotlib 的 "default"，不是“进入前的 style 栈”。也就是说，它的恢复策略是“回到默认”，而不是“回到你原来当时的某个自定义 style”。


#### 3) \`get_academic_style(...)\`：多子图排版工具。

`

const mamplotly1 = `

---

## 绘图助手封装 **MamPlotly**

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

> “真正的科研工作者总是前赴后继地奔赴那片荒原。”

希望这份小小的脚本，能为您的探索之路提供些许便利。

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
