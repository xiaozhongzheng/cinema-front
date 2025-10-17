import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
import axios from 'axios'
import globalConstant from '@/utils/global-constant'
import SearchTableTemplate from "@/components/SearchTableTemplate.vue";
import '@/utils/rem.js'
import elementPlus from 'element-plus'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


const app = createApp(App)

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: typeof axios
    $echarts: typeof echarts
    $constant: typeof globalConstant
  }
}

app.config.globalProperties.$constant = globalConstant
app.config.globalProperties.$http = axios
app.config.globalProperties.$echarts = echarts

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(elementPlus)
app.use(pinia)
app.use(router)

app.component('SearchTableTemplate', SearchTableTemplate)
app.mount('#app')
