<template>
  <h1 class="typing">{{ displayedText }}<span class="cursor">|</span></h1>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const texts = [
  "Welcome to LiuYinChu'Space.",
  "致虚极，守静笃。", 
  "Here I share code, notes, and lab reports.",
  "记录，为了更深刻地思考。",
  "Explore unknown possibilities.",
  "个人网站高能回，流萤厨献给流萤的真挚情书！",
  "Between logic and poetry, there is code.",
  "今天依旧晴朗，我亲爱的流萤。",
  "Sometime ever, sometime never.",
  "志之所趋，无远弗届，穷山距海，不能限也。",
  "Better late than never.",
  "春风若有怜花意，可否许我再少年。",
  "Make each day your masterpiece.",
  "而世之奇伟、瑰怪、非常之观，常在于险远，而人之所罕至焉，故非有志者不能至也。",
  "Journey of a thousand miles begins with single step.",
  "冀以尘雾之微补益山海，荧烛末光增辉日月。",
  "Talk is cheap. Show me the code.",
  "如果我们选择了最能为人类而工作的职业，那么，重担就不能把我们压倒，因为这是为大家作出的牺牲；那时我们所享受的就不是可怜的、有限的、自私的乐趣，我们的幸福将属于千百万人，我们的事业将悄然无声地存在下去，但是它会永远发挥作用，而面对我们的骨灰，高尚的人们将洒下热泪。"
]

const displayedText = ref('')
const typingSpeed = 100      // 每个字符打字速度（ms）
const pauseAfterTyping = 2000 // 每条打完后停顿时间（ms）
const pauseAfterErase = 500   // 每条擦除后停顿时间（ms）

async function typeLoop() {
  let index = 0
  while (true) {
    const text = texts[index % texts.length]
    displayedText.value = ''

    // 打字阶段
    for (let i = 0; i < text.length; i++) {
      displayedText.value += text[i]
      await delay(typingSpeed)
    }

    await delay(pauseAfterTyping)

    // 擦除阶段
    for (let i = text.length; i > 0; i--) {
      displayedText.value = displayedText.value.slice(0, i - 1)
      await delay(typingSpeed / 2)
    }

    await delay(pauseAfterErase)

    index++
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(() => {
  typeLoop()
})
</script>


