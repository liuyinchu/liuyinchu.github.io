import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import Code from '../pages/Code.vue'
import Resource from '../pages/Resource.vue'
import Notes from '../pages/Notes.vue'
import Space1 from '../pages/Space1.vue'           
import Space2 from '../pages/Space2.vue' 
import Space3 from '../pages/Space3.vue'          
import ArticleView from '../pages/ArticleView.vue' 
import About from '../pages/About.vue'
import Credit from '../pages/Credit.vue'
import Portal from '../pages/Portal.vue'
import LabReport from '../pages/LabReport.vue'
import PostIt from '../pages/PostIt.vue'
import Academic from '../pages/Academic.vue'
import YsyLatex from '../pages/YsyLatex.vue'
import YsyDataAnalysisHelper from '../pages/YsyDataAnalysisHelper.vue'
import BriskNexus from '../pages/BriskNexus.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/code', component: Code },
  { path: '/resource', component: Resource },
  { path: '/notes', component: Notes },
  { path: '/space1', component: Space1 },
  { path: '/space2', component: Space2 },
  { path: '/space3', component: Space3 },
  { path: '/space1/:id', component: ArticleView },
  { path: '/about', component: About },
  { path: '/credit', component: Credit },
  { path: '/portal', component: Portal },
  { path: '/labreport', component: LabReport },
  { path: '/postit', component: PostIt },
  { path: '/academic', component: Academic },
  { path: '/ysy-latex', component: YsyLatex },
  { path: '/ysy-data-analysis-helper', component: YsyDataAnalysisHelper },
  { path: '/brisk-nexus', component: BriskNexus },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
