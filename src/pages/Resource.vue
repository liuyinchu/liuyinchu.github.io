<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import ImageBlock from '../components/common/ImageBlock.vue'
import LinkButtons from '../components/common/LinkButtons.vue'

const resourceText = `
# 资源分享

我在学习中收集整理的一些优质外部资源，欢迎探索。

---
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

---

## 电脑相关

### [macOS配置指南](https://sourabhbajaj.com/mac-setup/)
面向开发者的 macOS 系统配置指南，涵盖开发环境与效率工具。

---

## 一些文章、笔记和资料

### [控制论从入门到放弃](https://zhuanlan.zhihu.com/p/683044170)
一篇通俗易懂的控制论入门文章，适合初学者快速建立直觉。一篇很好的控制论入门文章。

### [天文科研指南](https://gitlab.com/dr-guangtou/taotie/blob/master/research/getting_started_cn.md)
详细介绍天文学研究的各个阶段，适合初入科研者参考。天文科研从入门到放弃（但是这个确实神中神）。

### [The Missing Semester of Your CS Education 中文版](https://missing-semester-cn.github.io/)
课程介绍（转载自官网）：计算机设计的初衷就是任务自动化，然而学生们却常常陷在大量的重复任务中，或者无法完全发挥出诸如 版本控制、文本编辑器等工具的强大作用。效率低下和浪费时间还是其次，更糟糕的是，这还可能导致数据丢失或 无法完成某些特定任务。
这些主题不是大学课程的一部分：学生一直都不知道如何使用这些工具，或者说，至少是不知道如何高效 地使用，因此浪费了时间和精力在本来可以更简单的任务上。标准的计算机科学课程缺少了这门能让计算 变得更简捷的关键课程。

此外，B站有中文翻译过的课程视频。

### [一个beamer模版](https://github.com/matze/mtheme)
看起来不错。

Metropolis 是一款简洁、现代的 Beamer 主题，适合所有人使用。它力求最大限度地减少干扰，并最大限度地提升内容空间；它唯一的视觉亮点是每张幻灯片上都添加了一个（可选的）进度条。

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
**绝热近似**是量子力学中的一种近似方法，用于分析系统哈密顿量**缓慢随时间变化**的情形。若一个量子系统的哈密顿量 $\\hat{H}(t)$ 随时间变化非常缓慢，且系统初始处于某一能量本征态 $|n(t_0)\\rangle$，那么在演化过程中，它将始终处于该**瞬时本征态** $|n(t)\\rangle$ 的“跟踪态”，只是会累积一个相位因子。

### [知乎笔记：相对论量子力学](https://zhuanlan.zhihu.com/p/590374235)
**相对论量子力学**是结合**量子力学**与**狭义相对论**的理论，用于描述高速粒子（如电子、正电子）或高能过程（如粒子对产生）中的物理规律。


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

---
---

## 书籍推荐

Sakurai 的 Modern Quantum Mechanics ，[这个是导读](https://zhuanlan.zhihu.com/p/620813548)。

---
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