import Vue3Mindmap from './components/index.vue'
import { App } from 'vue'

export default (app: App) => {
  app.component('VMindmap', Vue3Mindmap)
}
