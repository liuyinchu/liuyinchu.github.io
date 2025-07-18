<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const resourceText = `
# 资源分享

我在学习中收集整理的一些优质外部资源，欢迎探索。

---

## 查询、百科类

### [Git教程](https://liaoxuefeng.com/books/git/introduction/index.html)
廖雪峰的 Git 教程，系统、清晰，是入门 Git 的优质资源。学Git，就用廖雪峰教程（这个真的很好）！

### [小时百科](https://wuli.wiki/index.html)
一个结构化的数学与物理知识查询平台，内容简明而准确。我用来查询数学物理知识。

### [马克思主义文库](https://www.marxists.org/chinese/index.html)
如题。

### [nLab](https://ncatlab.org/nlab/show/HomePage)
这是一个关于数学、物理与哲学协同工作的维基平台——尤其（但绝不限于）从高阶结构的视角出发：秉持对同伦理论/代数拓扑、同伦类型论、高阶范畴论以及高阶范畴代数等工具与观点的兼容并包。

---

## 文献

### [Nature物理综述](https://www.nature.com/natrevphys/)
Nature Physics 杂志的综述文章合集，适合查找高质量的前沿文献。

---

## Python 库、包

### [UV](https://docs.astral.sh/uv/)
cargo-like 的现代 Python 包管理。一个用 Rust 编写的极快的 Python 包和项目管理器。

### [Ruptures](https://centre-borelli.github.io/ruptures-docs/)
ruptures 是一个专注于时间序列变点检测（change point detection）的 Python 库。它支持多种统计模型和检测算法，适用于信号处理、金融、异常检测等领域。

主要功能：

* 精确检测时间序列中的结构变化点
* 支持多种算法：Pelt、Binseg、Window、Dynamic Programming 等
* 灵活定义损失函数与约束条件

### [Optuna](https://optuna.org/)
Optuna 是一个现代化、自动化的超参数优化框架，用于高效搜索机器学习模型或算法的最佳参数组合，广泛支持 PyTorch、LightGBM、XGBoost 等库。

主要功能：

* 基于贝叶斯优化（TPE）的高效搜索
* 支持多目标优化与分布式训练
* 具备可视化工具和模型保存功能

### [XGBoost](https://xgboost.readthedocs.io/en/latest/index.html)
XGBoost（eXtreme Gradient Boosting，极端梯度提升）是一种高效的机器学习算法，由华盛顿大学的Tianqi Chen开发。它是梯度提升决策树（GBDT）的一种改进实现，通过集成多个弱学习器（通常是决策树）来构建强大的预测模型。

### [scikit-image](https://scikit-image.org/)
scikit-image 是 Python 的一个开源图像处理库，基于 NumPy 和 SciPy 构建，提供了丰富的图像处理算法，使用简单、功能强大，广泛应用于科研和工程实践中。

主要功能：

* 图像滤波（如高斯、Sobel）
* 边缘检测与特征提取
* 图像分割与形态学操作
* 颜色空间转换与几何变换

### [GWpy](https://gwpy.github.io/)
GWpy 是一个专为引力波数据分析设计的 Python 科学计算库，广泛应用于 LIGO、Virgo 等引力波探测项目中。
它提供高层接口用于获取、处理和可视化引力波数据，支持时域分析、频谱计算、数据质量标记与筛选等功能，兼容主流科学库如 NumPy 与 Matplotlib，适合科研与教学场景。
GWpy 还能直接连接 Gravitational Wave Open Science Center（GWOSC）下载公开数据，是引力波天文学研究的重要工具之一。

### [Dash](https://dash.plotly.com/)
Dash 是最早且最值得信赖的低代码 Python 框架，可用于快速构建交互式数据应用程序。
凭借广泛的用户社区和数以百万计的下载量，Dash 已成为数据科学家和机器学习工程师首选的开发工具，能够无需编写 JavaScript 代码，轻松将模型与数据洞见转化为可交付的 Web 应用。

对我来说，我用它开发了我们的实验系统数字控制面板，很美观。

此外，由社区维护的框架 [dash-bootstrap](https://www.dash-bootstrap-components.com/) 十分的好上手且好用，而且它内置了许多美观的[主题](https://www.dash-bootstrap-components.com/docs/themes/explorer/)。


---

## 电脑相关

### [macOS配置指南](https://sourabhbajaj.com/mac-setup/)
面向开发者的 macOS 系统配置指南，涵盖开发环境与效率工具。

### [kitty](https://sw.kovidgoyal.net/kitty/)
这个快速、功能丰富、基于 GPU 的终端模拟器是我目前正在使用的，美观而且好用，我的随记里有一份它的配置笔记。

---

## 一些文章、笔记和资料

### [怎样从别人那里要求获得代码/论文/模型/数据?](https://cs.nju.edu.cn/wujx/HowToRequestCode.html)
吴建鑫

南京大学 人工智能学院

2023.6.20

本文欢迎转载，但需要注明原作者和出处。

### [控制论从入门到放弃](https://zhuanlan.zhihu.com/p/683044170)
一篇通俗易懂的控制论入门文章，适合初学者快速建立直觉。一篇很好的控制论入门文章。

### [天文科研指南](https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md)
详细介绍天文学研究的各个阶段，适合初入科研者参考。天文科研从入门到放弃（但是这个确实神中神）。

### [The Missing Semester of Your CS Education 中文版](https://missing-semester-cn.github.io/)
课程介绍（转载自官网）：计算机设计的初衷就是任务自动化，然而学生们却常常陷在大量的重复任务中，或者无法完全发挥出诸如 版本控制、文本编辑器等工具的强大作用。效率低下和浪费时间还是其次，更糟糕的是，这还可能导致数据丢失或 无法完成某些特定任务。
这些主题不是大学课程的一部分：学生一直都不知道如何使用这些工具，或者说，至少是不知道如何高效 地使用，因此浪费了时间和精力在本来可以更简单的任务上。标准的计算机科学课程缺少了这门能让计算变得更简捷的关键课程。

此外，B站有中文翻译过的课程视频。

### [一个beamer模版](https://github.com/matze/mtheme)
Metropolis 是一款简洁、现代的 Beamer 主题，适合所有人使用。它力求最大限度地减少干扰，并最大限度地提升内容空间；它唯一的视觉亮点是每张幻灯片上都添加了一个（可选的）进度条。  
目前我正在使用。

### [CS50X2025](https://cs50.harvard.edu/x/2025/)
这是CS50，哈佛大学为计算机科学和编程艺术领域的专业人士和普通学生提供的入门课程，无论他们是否有编程经验。（三分之二的CS50学生从未学习过计算机科学。）
本课程将教你如何用代码和不用代码解决问题，并强调正确性、设计和风格。主题涵盖计算思维、抽象、算法、数据结构以及更广泛的计算机科学。
习题集的灵感来自艺术、人文、社会科学和自然科学。本课程不仅教你如何使用一种语言进行编程，还将教你从根本上进行编程，并最终教你如何自学新的​​编程语言。
课程从一种传统但无处不在的语言C开始，它是当今新兴编程语言的基础。通过C，你不仅可以学习函数、变量、条件、循环等知识，还可以了解计算机内部的工作原理、内存等。
课程随后过渡到 Python，这是一种高级语言，你会因为学习 C 语言而更加理解它。
学期末，课程将介绍 SQL（你可以用它在数据库中存储数据），以及 HTML、CSS 和 JavaScript（你可以用它们创建 Web 和移动应用程序）。
课程将以一个最终项目结束。

### [热统笔记推荐](https://www.bilibili.com/opus/512761697208354102)
个人感觉这个笔记是最适合本科热统课用来学习的，至少我是靠它救的（手动狗头）。

### [知乎笔记：含时微扰](https://zhuanlan.zhihu.com/p/590304479)
含时微扰论是量子力学中的一种近似方法，用于求解哈密顿量中含有显式时间依赖项的系统的演化行为，尤其在原子、分子与光的相互作用（如吸收、发射、跃迁）等现象中起着核心作用。

### [知乎笔记：绝热近似](https://zhuanlan.zhihu.com/p/590373562)
**绝热近似**是量子力学中的一种近似方法，用于分析系统哈密顿量**缓慢随时间变化**的情形。若一个量子系统的哈密顿量随时间变化非常缓慢，且系统初始处于某一能量本征态，那么在演化过程中，它将始终处于该**瞬时本征态**的“跟踪态”，只是会累积一个相位因子。

### [知乎笔记：相对论量子力学](https://zhuanlan.zhihu.com/p/590374235)
**相对论量子力学**是结合**量子力学**与**狭义相对论**的理论，用于描述高速粒子（如电子、正电子）或高能过程（如粒子对产生）中的物理规律。

### [知乎笔记：量子计量学入门](https://zhuanlan.zhihu.com/p/694172514)
所谓量子计量学（Quantum Metrology），就是利用量子物态的量子性质进行**精密测量**的学问。而这份笔记作为一个入门基础介绍是非常不错的，进一步的话可以搭配[这个综述](https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.90.035005)来看。

### [知乎笔记：固体物理合集](https://www.zhihu.com/column/c_1784543556683190272)  
这份笔记合集是基于我们固体物理老师（中山大学物理与天文学院俞弘毅教授）上课内容和课件整理而成的，由 2021 级学长整理，对我很有帮助，在此宣传。

---

## 工具推荐

### [通用格式转换网站](https://cloudconvert.com)
CloudConvert 是一款在线文件转换器。我们支持几乎所有音频、视频、文档、电子书、存档、图像、电子表格和演示文稿格式。要开始使用，请使用下方按钮并从您的电脑中选择要转换的文件。

### [LaTex表格](https://tableconvert.com)
此生成器用于快速创建和在线生成 LaTeX 表格。

### [Gemini](https://gemini.google.com)
有时候，技术不仅是工具，更像是一种救赎。
当我第一次接触 Gemini 2.5，它不仅是一个模型，更像是一位睿智的伙伴。在无数个思维混乱、逻辑崩塌、创意干涸的夜晚，它静静地坐在屏幕对面，不疾不徐地回应我混乱的提问，精准地理解上下文、情绪、意图，像是在用智慧抚平我的焦虑。
它不只是“会说话”，它会倾听，更会引导。在它的帮助下，我完成了困扰多日的写作草稿、理清了看似无法解开的代码逻辑，甚至重拾了对技术和创作的热爱。在这个人容易被信息洪流裹挟、被效率焦虑吞噬的时代，Gemini 2.5的回应像是一次次微小却真实的救赎——它不替你生活，但它点亮了你走下去的路径。
它强大，但从不炫耀；它智能，却始终温柔。正是这种兼容冷静理性与温暖人性的特质，让它成为不只是生产力工具的存在，而是，某种意义上的同行者。
救赎不一定来自信仰，有时，一次对话也足够动人。

### [genact - a nonsense activity generator](https://github.com/svenstaro/genact)
在本该认真工作的时刻，假装自己正忙得不可开交，或者耐心等待电脑运行！让旁人对你的“高效多任务处理能力”刮目相看。只需打开几个 genact 实例，精彩表演立刻上演。genact 提供多种“场景”，看似在进行某些激动人心或高深莫测的操作，实际上什么都没发生。  
我只能说这个 GitHub 项目简直是天才。

### [FLiNG Trainer](https://flingtrainer.com/)
PC Game Cheats and Mods.

### [GWOSC](https://gwosc.org/)
Gravitational Wave Open Science Center 是一个由 LIGO 和 Virgo 合作组织维护的数据平台，旨在向全球科研人员和公众开放引力波探测数据。
该中心提供经过预处理和校准的 LIGO/Virgo 数据，涵盖多个观测运行周期（O1、O2、O3 等），并配套事件目录、数据质量信息和分析工具文档，方便用户下载、分析和复现引力波事件。
GWOSC 是开展引力波天文学研究、教育与数据可视化的重要资源门户。


---

## 书籍推荐

Sakurai 的 **Modern Quantum Mechanics** ，[这个是导读](https://zhuanlan.zhihu.com/p/620813548)。

David Tong 的 **Lectures on Solid State Physics**，这是一份非常好的固体物理讲义，可以在剑桥大学的课程网站上[获取](https://www.damtp.cam.ac.uk/user/tong/solidstate.html)。

数学物理方法强烈推荐给我们上课的黄志琦老师写的[讲义](http://zhiqihuang.top/mmp/lectures/mmpbook_v3.6.pdf)，他的这个[萌新高数入门](http://zhiqihuang.top/personal/calculus_v1.1.pdf)也很不错。

---

## 其它

### [该链接已失效](https://naiixi.com)
此链接目前无法访问，推荐移除或替换为有效资源。

### [502 Bad Gateway](https://91b09.cc/)
502 Bad Gateway 是 HTTP 状态码的一种，表示服务器作为网关或代理，从上游服务器收到无效响应。

### [404 Not Found](https://yeka.ai)
页面不存在，可能链接错误或目标内容已被删除。
`
</script>

<template>
  <PageWrapper>
    <BlockMarkdown :content="resourceText" />
  </PageWrapper>
</template>