<template>
  <h1 class="typing">{{ displayedText }}<span class="cursor">|</span></h1>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const texts = [
  "Welcome to LiuYinChu'Space.",
  "为天地立心，为生民立命，为往圣继绝学，为万世开太平。",
  "Here I share code, notes, and lab reports.",
  "致虚极，守静笃。",
  "记录，为了更深刻地思考。",
  "Explore unknown possibilities.",
  "个人网站高能回，流萤厨献给流萤的真挚情书！",
  "Between logic and poetry, there is code.",
  "与君初相识，犹如故人归。",
  "Sometime ever, sometime never.",
  "志之所趋，无远弗届，穷山距海，不能限也。",
  "Better late than never.",
  "春风若有怜花意，可否许我再少年。",
  "Make each day your masterpiece.",
  "而世之奇伟、瑰怪、非常之观，常在于险远，而人之所罕至焉，故非有志者不能至也。",
  "Journey of a thousand miles begins with single step.",
  "冀以尘雾之微补益山海，荧烛末光增辉日月。",
  "Talk is cheap. Show me the code.",
  "且将新火试新茶，诗酒趁年华。",
  "今天依旧晴朗，我亲爱的流萤。",
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


