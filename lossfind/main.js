import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/element-variables.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/global.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export function createApp() {
  const app = createSSRApp(App)

  // 注册 Pinia
  const pinia = createPinia()
  app.use(pinia)

  // 注册 Element Plus（中文）
  app.use(ElementPlus, { locale: zhCn })

  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  return {
    app
  }
}
// #endif