import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Code from '../pages/Code.vue'
import Resource from '../pages/Resource.vue'
import Notes from '../pages/Notes.vue'
import Space1 from '../pages/Space1.vue'           // 空间一：一些讨论
import Space2 from '../pages/Space2.vue'           // 空间二：待定栏目
import ArticleView from '../pages/ArticleView.vue' // Markdown 文章展示页
import About from '../pages/About.vue'
import Credit from '../pages/Credit.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/code', component: Code },
  { path: '/resource', component: Resource },
  { path: '/notes', component: Notes },

  // 新增开放空间
  { path: '/space1', component: Space1 },
  { path: '/space2', component: Space2 },

  // Markdown 文章路由（支持 /space1/article1 等路径）
  { path: '/space1/:id', component: ArticleView },
  { path: '/about', component: About },
  { path: '/credit', component: Credit },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
