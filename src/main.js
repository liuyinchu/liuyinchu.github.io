import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import 'aplayer/dist/APlayer.min.css'
import router from './router'
import { installInteractionMotion } from './utils/interactionMotion'

createApp(App).use(router).mount('#app')

const removeInteractionMotion = installInteractionMotion()

if (import.meta.hot) {
  import.meta.hot.dispose(removeInteractionMotion)
}
