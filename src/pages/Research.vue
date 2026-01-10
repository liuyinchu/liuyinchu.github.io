<template>
  <PageWrapper>
    <img class="name" src="/fig/name.svg" alt="name" />

    <BlockMarkdown :content="introText" />

    <BlockMarkdown :content="learningText" />

    <BlockMarkdown :content="foucsingText" />

  </PageWrapper>
</template>

<script setup>
import PageWrapper from '../components/common/PageWrapper.vue'
import BlockMarkdown from '../components/common/BlockMarkdown.vue'
import LinkButtons from '../components/common/LinkButtons.vue'
import ImageBlock from '../components/common/ImageBlock.vue'

const introText = `

### Welcome to my academic homepage !

I am Shuyun Yang, an undergraduate student majoring in physics. My research focuses on intelligent dynamical control. Currently, I am undertaking an internship in a laboratory specializing in ground-based simulation and dynamical control, where I am also completing my bachelor’s thesis.

The "[My Academia](/academic)" page of this site summarizes my academic resume, research interests, and achievements. The "[Code](/code)" page shares my open-source projects, while "[Jottings](/space1)" contains my study notes and thoughts. Additionally, you can find other interesting content on the [homepage](https://liuyinchu.github.io/). Here, I hope to share more about the process of learning and research, rather than just showcasing the results (**of course, for confidentiality reasons, some content will not be made public, and I am very cautious about this**).

Overall, I am dedicated to a vibrant and passionate research field, focusing on **applying advanced intelligent technologies to dynamical control**, and promoting the development of data-driven methods. I hope to contribute to the field of **space-based gravitational wave detection**.

`
const learningText = `
## Learning

My recent studies have primarily focused on building my knowledge base in two major areas: control theory and artificial intelligence.

In my studies in the field of control, I have completed a quick start, from signals and systems to automatic control principles and then to modern control theory.

I have currently learned and put the following into practice:
- Basic feedback loop analysis
- Classical PID controllers & time lag compensators and notch filters
- Classical open-loop shaping methods
- Optimal control, LQR, Kalman filtering & LQG
- More advanced loop shaping techniques

In artificial intelligence, my current focus is on deep reinforcement learning.

I am also paying attention to the following advanced deep learning technologies:

- Transformer
- Diffusion Model
- Flow Matching

You can find many of my insights on them on [this page](/space1).
`

const foucsingText = `
## Focusing

My current research interests lie in applying advanced intelligent technologies to precision control, particularly ground-based ultra-low frequency active vibration isolation and drag-free space control technologies. 

Recently, I have been working on the Deep Loop Shaping technology proposed by LIGO in 2025.

`
</script>

<style scoped>
.name { display: block; margin: 10px auto 0; width: min(120%, 680px); max-width: 120%; }
</style>
