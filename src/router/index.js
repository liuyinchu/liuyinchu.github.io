import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Code from '../pages/Code.vue'
import Resource from '../pages/Resource.vue'
import Notes from '../pages/Notes.vue'
import Space1 from '../pages/Space1.vue'           
import Space2 from '../pages/Space2.vue'           
import ArticleView from '../pages/ArticleView.vue' 
import About from '../pages/About.vue'
import Credit from '../pages/Credit.vue'
import Portal from '../pages/Portal.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/code', component: Code },
  { path: '/resource', component: Resource },
  { path: '/notes', component: Notes },
  { path: '/space1', component: Space1 },
  { path: '/space2', component: Space2 },
  { path: '/space1/:id', component: ArticleView },
  { path: '/about', component: About },
  { path: '/credit', component: Credit },
  { path: '/portal', component: Portal },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
