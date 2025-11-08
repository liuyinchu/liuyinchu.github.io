<template>
  <PageWrapper>
    <img class="name" src="/fig/name.svg" alt="name" />

    <BlockMarkdown :content="introText" />

    <BlockMarkdown :content="learningText" />

    <BlockMarkdown :content="foucsingText" />

    <BlockMarkdown :content="practicingText" />

    <BlockMarkdown :content="collectingText" />

    <BlockMarkdown :content="zhText" :useCJK="true" />
  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

### Welcome to my academic homepage !

I am Shuyun Yang, an undergraduate student majoring in physics. My research focuses on intelligent data-driven dynamical control. Currently, I am undertaking an internship in a laboratory specializing in ground-based simulation and dynamical control, where I am also completing my bachelor’s thesis.

The "[My Academia](/academic)" page of this site summarizes my academic resume, research interests, and achievements. The "[Code](/code)" page shares my open-source projects, while "[Jottings](/space1)" contains my study notes and thoughts. Additionally, you can find other interesting content on the [homepage](https://liuyinchu.github.io/). Here, I hope to share more about the process of learning and research, rather than just showcasing the results (**of course, for confidentiality reasons, some content will not be made public, and I am very cautious about this**).

Overall, I am dedicated to a vibrant and passionate research field, focusing on **applying advanced intelligent technologies to dynamical modeling and control**, and promoting the development of data-driven methods. I hope to contribute to the field of **space-based gravitational wave detection**. Meanwhile, I closely follow the cutting-edge advancements in **robotics** (especially humanoid robots) and draw inspiration from emerging technologies and solutions in this area.

`
const learningText = `
## Learning

My recent studies have primarily focused on building my knowledge base in two major areas: control theory and artificial intelligence.

In my studies in the field of control, I have completed a quick start, from signals and systems to automatic control principles and then to modern control theory. Currently, my focus is on robust control with feedback and frequency domain-based controller design.

In artificial intelligence, my current focus is on deep learning and reinforcement learning.

### Control Theory and Design
I am systematically organizing my study notes on this topic, you can find them on [this page](/space1).
- A Note of Basic Control Knowledge
- A Note of Signal Process
- Six-DOF Two-Stage Torsional Pendulum System

### Deep Learning
Coming soon ...

### Reinforcement Learning
Coming soon ...
`

const foucsingText = `
## Focusing

My current research interests focus mainly on two areas:

1. **Advanced AI Technology Used in Gravitational Wave Detection and Precision Measurement**  
   I am systematically studying related papers to deepen my understanding of the field.

2. **System Identification and Dynamic Modeling**   
   I am exploring [how machine learning methods can be applied to nonlinear dynamical systems](https://arxiv.org/abs/1712.09707). At present, I am paying particular attention to the following directions:
   
   * **[Sparse Identification of Nonlinear Dynamics (SINDy)](https://pysindy.readthedocs.io/en/latest/summary.html):** Planning to start with the **PySINDy** library for initial experiments.
   * **Koopman Operator Methods:** Concentrating on three aspects of study—*[notes](https://fluids.ac.uk/files/meetings/KoopmanNotes.1575558616.pdf), [dynamical modeling](https://arxiv.org/pdf/2102.02522), and [operator theory](https://arxiv.org/abs/2405.07312)*—and continuing to learn in this area.
   
   At the same time, I am also paying attention to the practice of applied data-driven system identification methods and trying to apply them in our experiments.
`

const practicingText = `
## Practicing

I am designing small-scale experiments to apply the control theory knowledge I have learned to practical problems, in order to strengthen my understanding and gain hands-on experience.

I participated in experiments related to the six-degree-of-freedom ultra-low frequency active vibration isolation platform and learned very useful knowledge and techniques.

`

const collectingText = `
## Collecting

**Here I organize and share some resources closely related to my study and research:**

* [awesome-control-theory](https://github.com/A-make/awesome-control-theory)
* [DRL-Pytorch](https://github.com/XinJingHao/DRL-Pytorch)
* [PyTorch Q-learning Tutorial](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)
* [minimind](https://github.com/jingyaogong/minimind)
* [Control Tutorials for MATLAB and Simulink](http://ctms.engin.umich.edu/CTMS/index.php?aux=Home)

**About the robotic:**

- [Robotic Systems](https://motion.cs.illinois.edu/RoboticSystems/)
- [Open-Source Robotics](https://www.osrobotics.org/osr/)
- [PythonRobotics](https://atsushisakai.github.io/PythonRobotics/index.html)

`

const zhText = `

---

## 欢迎访问我的学术主页。

我是杨舒云，物理学本科生。我的研究方向聚焦于智能化的数据驱动动力学控制。目前，我在一个从事地面模拟与动力学控制的研究室实习，并在此完成本科毕业设计。

本站“[我的学术](/academic)”页面汇总了我的学术履历、研究兴趣及成果。“[代码](/code)”页面分享了我的开源项目，而“[随记](/space1)”则记录了我的学习笔记与思考。此外，在本站[主页](https://liuyinchu.github.io/)你也能找到一些其它的有趣的内容。在这里，我更希望分享的是学习与科研的过程，而非仅仅展示结果（当然，出于保密原因，部分内容不会公开，我对此十分谨慎）。

总体而言，我投身于一个充满热情与活力的研究方向，专注于将先进的智能技术应用于动力学建模与控制，推动数据驱动方法的发展，希望能为空间引力波探测贡献自己的力量。同时，我密切关注机器人学（特别是人形机器人）的前沿进展，并从中汲取新兴技术与解决方案的灵感。

## 更多优质的学习资源（持续更新中）
- [强化学习的数学原理](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning)及其优质配套[网课](https://www.bilibili.com/video/BV1sd4y167NS)
- [动力学建模网课](https://space.bilibili.com/230105574/lists/1814739)
- [自动控制原理网课](https://space.bilibili.com/230105574/lists/1814627)
- [高阶控制理论网课](https://space.bilibili.com/230105574/lists/1814743)
`
</script>

<style scoped>
.name { display: block; margin: 10px auto 0; width: min(120%, 680px); max-width: 120%; }
</style>
