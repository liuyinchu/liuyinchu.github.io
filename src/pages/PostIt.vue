<template>
  <transition name="fade">
    <div v-if="showTransition" class="transition-overlay">
      <iframe src="/firefly_icon_anim.html" frameborder="0" class="animation-iframe"></iframe>
    </div>
  </transition>

  <div class="post-it-page">
    <header class="page-header">
      <div class="header-image-container">
        <img src="/bg/white_sweater.PNG" alt="Header Background" class="header-background-image" ref="parallaxImageRef">
        <div class="header-overlay"></div>
      </div>
      <h1 class="page-title">POST IT!</h1>
    </header>

    <main class="content-area">
      <transition-group name="card-list" tag="div">
        <div v-for="block in contentBlocks" :key="block.id" class="content-block">
          <PostItCard 
            v-if="block.type === 'postit'"
            :title="block.title"
            :content="block.content"
            :color="block.color"
          />
          <div 
            v-else 
            class="markdown-body" 
            v-html="block.content">
          </div>
        </div>
      </transition-group>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';
import PostItCard from '../components/PostItCard.vue'; // 引入新组件

const contentBlocks = ref([]); // 存储解析后的内容块数组
// --- 实验功能开关 ---
// 将这里改为 false 即可轻松禁用切换动画
const enableTransition = false;
// --------------------

const showTransition = ref(enableTransition); // 由上面的开关常量来初始化
const parallaxImageRef = ref(null);

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(mdContainer, 'postit'); // 只需注册容器，渲染逻辑在 JS 中处理

// --- 新增的核心函数：解析 Markdown 为组件数组 ---
const parseMarkdown = (markdownText) => {
  const tokens = md.parse(markdownText, {});
  const blocks = [];
  let currentBlock = { id: 0, type: 'default', content: '' };
  let blockIdCounter = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // 检查是否是便利贴容器的开始
    if (token.type === 'container_postit_open') {
      // 如果当前普通块有内容，先保存它
      if (currentBlock.content.trim()) {
        blocks.push(currentBlock);
        blockIdCounter++;
        currentBlock = { id: blockIdCounter, type: 'default', content: '' };
      }

      // 处理便利贴块
      const m = token.info.trim().match(/^postit\s+(.*)$/);
      const args = m[1].split(/\s+/);
      const title = args.shift() || 'Note';
      const color = args.length > 0 ? args[0].replace(/[\[\]']+/g, '') : 'default';

      let postitContentTokens = [];
      let nesting = 1;
      i++;
      // 收集便利贴内部的所有 token
      while (i < tokens.length && nesting > 0) {
        if (tokens[i].type === 'container_postit_open') nesting++;
        if (tokens[i].type === 'container_postit_close') nesting--;
        if (nesting > 0) {
          postitContentTokens.push(tokens[i]);
        }
        i++;
      }
      i--; // 回退一步，因为 for 循环会再 i++

      blocks.push({
        id: blockIdCounter++,
        type: 'postit',
        title: title,
        color: color,
        content: md.renderer.render(postitContentTokens, md.options, {})
      });
      
    } else {
      // 普通内容，直接渲染
      currentBlock.content += md.renderer.render([token], md.options, {});
    }
  }

  // 添加最后一个普通内容块
  if (currentBlock.content.trim()) {
    blocks.push(currentBlock);
  }
  
  return blocks;
};


onMounted(async () => {
  // ... 其他 onMounted 逻辑不变 ...
  if (showTransition.value) {
    setTimeout(() => { showTransition.value = false; }, 2500);
  }
  window.addEventListener('scroll', handleScroll);

  try {
    const response = await fetch('/post_it.md');
    const markdownContent = await response.text();
    // 使用新的解析函数
    contentBlocks.value = parseMarkdown(markdownContent);
  } catch (error) {
    console.error('Error processing markdown:', error);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// handleScroll 函数保持不变
const handleScroll = () => {
  if (parallaxImageRef.value) {
    parallaxImageRef.value.style.transform = `translateY(${window.scrollY * 0.5}px)`;
  }
};
</script>

<style scoped>
/* 这里的样式只管主布局，不再需要 :deep() 或全局 style, 代码更干净
*/
.page-header { position: relative; height: 75vh; display: flex; justify-content: center; align-items: center; overflow: hidden; color: var(--text-color); }
.header-image-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
.header-background-image { width: 100%; height: 100%; object-fit: cover; }
.header-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(30, 30, 46, 0.5); }
.page-title { position: relative; z-index: 2; font-size: 5rem; font-weight: 900; letter-spacing: 0.1em; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }

.content-area { max-width: 1500px; margin: 0 auto; padding: 40px 61.8px; }

.transition-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: var(--background-color); z-index: 9999; display: flex; justify-content: center; align-items: center; }
.animation-iframe { width: 100%; height: 100%; border: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.5s ease;
}
.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.card-list-leave-active {
  position: absolute;
}
</style>