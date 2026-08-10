import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
const Code = () => import('../pages/Code.vue')
const Resource = () => import('../pages/Resource.vue')
// import Notes from '../pages/Notes.vue'
const Space1 = () => import('../pages/Space1.vue')
const Space2 = () => import('../pages/Space2.vue')
const Space3 = () => import('../pages/Space3.vue')
const Space4 = () => import('../pages/Space4.vue')
const Talk = () => import('../pages/Talk.vue')
const VisitorCenter = () => import('../pages/VisitorCenter.vue')
const ArticleView = () => import('../pages/ArticleView.vue')
const About = () => import('../pages/About.vue')
const AboutIntro = () => import('../pages/AboutIntro.vue')
const Credit = () => import('../pages/Credit.vue')
const Portal = () => import('../pages/Portal.vue')
const LabReport = () => import('../pages/LabReport.vue')
// import PostIt from '../pages/PostIt.vue'
const Academic = () => import('../pages/Academic.vue')
const YsyLatex = () => import('../pages/YsyLatex.vue')
const YsyDataAnalysisHelper = () => import('../pages/YsyDataAnalysisHelper.vue')
const BriskNexus = () => import('../pages/BriskNexus.vue')
const PaperSwitchBrush = () => import('../pages/PaperSwitchBrush.vue')
const Research = () => import('../pages/Research.vue')
const CyberMatch = () => import('../pages/CyberMatch.vue')
const LYC2048 = () => import('../pages/LYC2048.vue')
const ResourceDirectory = () => import('../pages/ResourceDirectory.vue')
const ResourceLiterature = () => import('../pages/ResourceLiterature.vue')
const ResourceProgramming = () => import('../pages/ResourceProgramming.vue')
const ResourceComputer = () => import('../pages/ResourceComputer.vue')
const ResourceMaterials = () => import('../pages/ResourceMaterials.vue')
const ResourceTools = () => import('../pages/ResourceTools.vue')
const ResourceFiles = () => import('../pages/ResourceFiles.vue')
const AcademicGuide = () => import('../pages/AcademicGuide.vue')
const LifeTree = () => import('../pages/LifeTree.vue')
const ModernControlCourse = () => import('../pages/ModernControlCourse.vue')
const MarkdownComponents = () => import('../pages/MarkdownComponents.vue')
const PrecisionPhyskit = () => import('../pages/PrecisionPhyskit.vue')


const routes = [
  { path: '/', component: Home },
  { path: '/code', component: Code },
  { path: '/resource', component: Resource },
  // { path: '/notes', component: Notes },
  { path: '/space1', component: Space1 },
  { path: '/space2', component: Space2 },
  { path: '/space3', component: Space3 },
  { path: '/space4', component: Space4 },
  { path: '/talk', component: Talk },
  { path: '/visitor-center', component: VisitorCenter },
  { path: '/space1/post_it', redirect: '/talk' },
  { path: '/space1/:id', component: ArticleView },
  { path: '/about', component: About },
  { path: '/about/self', component: AboutIntro },
  { path: '/credit', component: Credit },
  { path: '/portal', component: Portal },
  { path: '/labreport', component: LabReport },
  // { path: '/postit', component: PostIt },
  { path: '/academic', component: Academic },
  { path: '/ysy-latex', component: YsyLatex },
  { path: '/ysy-data-analysis-helper', component: YsyDataAnalysisHelper },
  { path: '/brisk-nexus', component: BriskNexus },
  { path: '/paper-switch-brush', component: PaperSwitchBrush },
  { path: '/research', component: Research },
  { path: '/cyber-match', component: CyberMatch },
  { path: '/lyc2048', component: LYC2048 },
  { path: '/rd', component: ResourceDirectory },
  { path: '/rliterature', component: ResourceLiterature },
  { path: '/rprogramming', component: ResourceProgramming },
  { path: '/rmaterials', component: ResourceMaterials },
  { path: '/rcomputer', component: ResourceComputer },
  { path: '/rtools', component: ResourceTools },
  { path: '/rfiles', component: ResourceFiles },
  { path: '/academic-plot-guide', component: AcademicGuide },
  { path: '/life-tree', component: LifeTree },
  { path: '/modern-control-course', component: ModernControlCourse },
  { path: '/markdown-components', component: MarkdownComponents },
  { path: '/precision-physkit', component: PrecisionPhyskit },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 88,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      }
    }
    if (savedPosition) {
      return savedPosition
    } else {
      // 切换页面时，瞬间回到顶部，配合 fade 动画，视觉上就是“新页面直接出现在眼前”
      return { top: 0 }
    }
  }
})

export default router
