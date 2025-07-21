<template>
  <PageWrapper>
      <BlockMarkdown :content="introText" />
      <BlockMarkdown :content="GPL1" />
      <BlockMarkdown :content="GPL2" />
      <BlockMarkdown :content="APL1" />
      <BlockMarkdown :content="APL2" />
      <BlockMarkdown :content="colab" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `
# 实验报告

欢迎您访问此实验报告分享页面。本页面旨在系统性地整理与分享一系列大学物理实验的资料，希望能为您的学习与探索之旅提供些许便利与参考。

## 引言

### 一、收录范围

本页面收录的资料，源自**中山大学物理与天文学院**物理学专业本科阶段的实验课程，涵盖了**大二、大三共四个学期**的绝大部分实验项目，具体包括：
基础物理实验 I 、基础物理实验 II 、近代物理实验 I 、近代物理实验 II 、电子技术实验 I 以及电子技术实验 II 。

这些资料不仅包含我本人在学习过程中完成的报告，也汇集了此分享项目的其他合作者们的辛勤成果。

### 二、项目内容

您将在这里找到以下几类资源：

* **实验报告**：提供完整的实验报告成品（PDF 格式）与相应的 TeX 源码。
* **数据处理代码**：部分实验所使用的数据处理代码。
* **实验数据**：绝大部分实验的测量数据。
* **相关资料**：我们收集整理的一部分与实验相关的参考资料。

### 三、项目缘起

我们发起这个项目的初衷，可以归结为以下三点：

1.  **节约时间，提升效率**：我们深知实验课程中，报告格式的调整、实验原理的复述以及课后思考题的解答往往会耗费大量时间。希望我们的整理能为后来的学弟学妹们节约宝贵的精力，让大家能更专注于实验本身。
2.  **改善体验，激发兴趣**：希望这份小小的努力，能让大家在面对繁重的实验任务时，依然能感受到物理实验的乐趣，甚至能对未来选择实验物理作为研究方向产生些许积极的影响。
3.  **抛砖引玉，共同进步**：我们希望能以此抛砖引玉，激励更多有能力、有想法的同学，在我们的工作基础上进行更深层次的探索与创新，将这些基础实验开发出新的价值。

### 四、内容组织

本项目的所有内容均托管于 GitHub 仓库，并已按照课程和来源进行了系统性的整理。在本页面，内容的呈现顺序如下：

1.  首先，列出由我个人维护的仓库中的所有实验项目。
2.  其次，集中列出由我们合作维护的公共仓库中的所有实验项目。
3.  最后，展示已获得分享授权的、由项目其他合作者个人维护的仓库中的实验项目。

### 五、使用须知

在您使用这些资源前，请务必仔细阅读以下注意事项：

1.  **关于实验报告**：报告的质量与完成时间大致呈正相关。早期的报告或有疏漏之处，若您想参考报告的行文结构与内容组织，建议从时间线靠后的报告看起。
2.  **关于 TeX 源码**：提供的源码主要用于参考与复制格式化内容（如表格、公式等），通常无法直接编译通过，敬请留意。
3.  **关于报告模板**：项目初期，我们使用了由 Huanyu Shi 学长创建的实验报告模板，在此表示感谢。后期我们在此模板基础上进行了二次开发，详情请参阅我们的相关项目主页。
4.  **关于代码**：仓库中的代码均为早期版本，可能已显陈旧。关于实验数据处理的更优实现，建议您关注我们的另一个专门项目。
5.  **关于数据**：请**不要**直接套用我们提供的实验数据来完成您自己的实验报告。一方面，这是严重的学术不端行为；另一方面，由于早期文件命名的极度不规范（对此我已进行深刻反思，并撰有随笔一篇，有兴趣可以来看看），您大概率也无法将数据与具体实验过程准确对应。更何况，所有纸质记录的原始数据均未包含在内。这些数据的预期使用方法是在您有兴趣的情况下找到对应数据来对比您的实验或增加数据量，达成所谓的“二次开发”。

### 六、版权声明

1.  **报告与代码**：本项目中所有原创的实验报告及代码，其版权归原作者所有。其中的代码部分，您可自由使用。但**严禁抄袭、挪用实验报告中的任何实质性内容**。若因此产生任何学术诚信问题（比如被老师发现），后果由当事人自负，本分享项目概不负责（很重要，请注意）。
2.  **引用资料**：项目中引用的部分参考资料，其版权归原始创作者所有。我们分享的初衷仅为学习交流。若您认为任何内容侵犯了您的合法权益，请立即与我们联系，我们将第一时间进行处理。

---

`

const GPL1 = `
## 基础物理实验 I

- GPL1-**1** [薄透镜焦距基本参数测量](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-1)
- GPL1-**2** [透镜组基本参数的测量](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-2)
- GPL1-**3** [单缝衍射的相对光强分布](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-3)
- GPL1-**4** [迈克尔逊干涉实验（激光干涉）](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-4)
- GPL1-**5** [光栅常数及光波波长的测量](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-5)
- GPL1-**6** [密里根油滴实验](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-6)
- GPL1-**7** [转动惯量和角动量守恒](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-7)
- GPL1-**8** [磁滞回线的测量](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-8)
- GPL1-**9** [传感器综合实验](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-9)
- GPL1-**10** [复摆与混沌](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-10)
- GPL1-**11** [伯努利原理实验](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-11)
- GPL1-**12** [冰的熔化热测量](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-12)
- GPL1-**13** [应用 AMR 测量磁场分布](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-13)
- GPL1-**14** [多普勒效应综合实验](https://github.com/pifuyuini/LabR/tree/main/GPL1/GPL1-14)

---

`

const GPL2 = `
## 基础物理实验 II

- GPL2-**1** [原子的发射和吸收光谱观测分析](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-1)
- GPL2-**2** [迈克尔白光干涉实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-2)
- GPL2-**3** [全息照相实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-3)
- GPL2-**4** [光学像差测量与分析](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-4)
- GPL2-**5** [双光栅测量微弱振动位移量](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-5)
- GPL2-**6** [偏振光实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-6)
- GPL2-**7** [热辐射实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-7)
- GPL2-**8** [夫兰克-赫兹实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-8)
- GPL2-**9** [TEC控温实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-9)
- GPL2-**10** [塞曼效应实验](https://github.com/pifuyuini/LabR/tree/main/GPL2/GPL2-10)

---

`

const APL1 = `
## 近代物理实验 I

- APL1-**1** [锁相放大器工作原理、基本参数与基本操作实验](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-1)
- APL1-**1-A** [电阻热噪声测量玻尔兹曼常量](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-1-A)
- APL1-**2** [材料真空兼容性测试和等离子特性研究](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-2)
- APL1-**3** [量子密钥分发实验](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-3)
- APL1-**4** [电子自旋共振实验](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-4)
- APL1-**5-and-6** [α粒子的能量损失 & γ能谱实验](https://github.com/pifuyuini/LabR/tree/main/APL1/APL1-5-and-6)

---

`

const APL2 = `
## 近代物理实验 II

- APL2-**1** [低温技术平台与高温超导研究](https://github.com/pifuyuini/LabR/tree/main/APL2/apl2-1)
- APL2-**3** [光泵磁共振实验](https://github.com/pifuyuini/LabR/tree/main/APL2/apl2-3)
- APL2-**5** [双光子纠缠源研究和量子非局域性验证](https://github.com/pifuyuini/LabR/tree/main/APL2/apl2-5)
- APL2-**6** [散射光成像实验](https://github.com/pifuyuini/LabR/tree/main/APL2/apl2-6)

---

`

const colab = `
## CoLabR —— **Co**llaborate to write a **Lab** **R**eport.

*物理实验合作库（~~然而与 Google 的 colab 重名了~~），“R” 代表 “Report” ，即这个库主要用于存放与实验报告相关的内容（完整报告、数据和代码）。*

本仓库收录了我们在本科阶段所**合作**完成的四门物理实验课程的实验报告与相关资料。

- [设计性实验 S.A.M.](https://github.com/TaLEsCuber/CoLabR/tree/main/GPL/proj-sam)
- ETL1-2 [基本电路元件伏安特性的测量](https://github.com/TaLEsCuber/CoLabR/tree/main/ETL/ETL1-2)
- ETL1-5 [一阶电路暂态过程的研究](https://github.com/TaLEsCuber/CoLabR/tree/main/ETL/ETL1-5)
- ETL1-6 [R、L、C元件阻抗特性研究](https://github.com/TaLEsCuber/CoLabR/tree/main/ETL/ETL1-6)
- ETL2-1 [蓝牙音箱的焊接和调试](https://github.com/TaLEsCuber/CoLabR/tree/main/ETL/ETL2-1)
- ETL2-2 [测量放大器设计与实验](https://github.com/TaLEsCuber/CoLabR/tree/main/ETL/ETL2-2)
- APL1-4 [电子自旋共振实验](https://github.com/TaLEsCuber/CoLabR/tree/main/APL/APL1-4)
- APL1-8 [氦氖激光综合实验](https://github.com/TaLEsCuber/CoLabR/tree/main/APL/APL1-8)
- APL2-1 [低温技术平台与高温超导研究](https://github.com/TaLEsCuber/CoLabR/tree/main/APL/APL2-1)
- APL2-3 [光泵磁共振实验](https://github.com/TaLEsCuber/CoLabR/tree/main/APL/APL2-3)
- APL2-6 [散射光成像实验](https://github.com/TaLEsCuber/CoLabR/tree/main/APL/APL2-6)



---

`
</script>
