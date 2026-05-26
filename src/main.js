/*
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 16:59:20
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-27 17:18:12
 * @FilePath: \Hidden-goose_webBuild_project\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { inject } from '@vercel/analytics'
import './style.css'

inject()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 移除加载页
const loader = document.getElementById('loader')
if (loader) {
  loader.classList.add('hide')
  setTimeout(() => loader.remove(), 500)
}