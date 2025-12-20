<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Header />

  <!-- 页面过渡动画 -->
  <!-- <transition name="fade-slide" mode="out-in">
    <router-view />
  </transition> -->
  <transition name="seamless-fade" mode="out-in">
    <router-view />
  </transition>
  <Footer />
</template>

<style>
/* 页面切换过渡动画 */
/* .fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
} */
/* 1. 缩短时间：0.5s 太拖沓，0.25s 是人眼感觉“即时响应”但又有过渡的黄金时间 */
.seamless-fade-enter-active,
.seamless-fade-leave-active {
  transition: opacity 0.25s ease-in-out;
}

.seamless-fade-enter-from,
.seamless-fade-leave-to {
  opacity: 0;
}
</style>