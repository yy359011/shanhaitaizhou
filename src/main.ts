import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import 'element-plus/dist/index.css'
// 设计变量需在 Element Plus 样式之后引入，保证主题覆盖生效
import './styles/variables.css'
import './styles/global.css'
// 后台管理专用样式（登录页 + 内容区公用类）
import './styles/admin.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 全量注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
