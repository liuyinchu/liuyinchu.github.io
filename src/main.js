import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import 'aplayer/dist/APlayer.min.css'
import router from './router'

createApp(App).use(router).mount('#app')
