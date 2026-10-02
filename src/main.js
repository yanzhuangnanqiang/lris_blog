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
import { preloadRouteAssets } from './preload'
import './style.css'

inject()

// 趁开屏加载页还显示着，先把当前路由的首屏大图下起来（和 JS 并行，不等路由 chunk）
preloadRouteAssets()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 移除加载页。
// ★ 必须等 router.isReady()：所有页面都是懒加载，mount 完成时首页 chunk 还没到，
//   这时撤掉加载页会露出一段空白。isReady 之后首屏内容才算真的画好。
// ★ 4s 兜底：万一 chunk 加载失败，不能让用户永远卡在加载页。
/* 加载页最短显示时长。
   ★ 为什么要"最短"：页面的懒加载 chunk 一到 isReady 就撤，网快时加载页只活几百毫秒，
     开屏那句打字循环（「林间初见」→ 停 1s → 介绍）根本演不完 → 看起来"没有交替"。
   想让开场更长/更短，改这个数（单位 ms）。 */
const LOADER_MIN_MS = 3000
const loaderStart = Date.now()

let loaderGone = false
function hideLoader() {
  if (loaderGone) return
  loaderGone = true
  const wait = Math.max(0, LOADER_MIN_MS - (Date.now() - loaderStart))
  setTimeout(() => {
    const loader = document.getElementById('loader')
    if (loader) {
      loader.classList.add('hide')
      setTimeout(() => loader.remove(), 500)
    }
    /* ★ 告诉首页：加载页开始淡出了，开场（帘布 / 浮现 / 打字）从这一刻才开始。
       否则帘布会在加载页背后"偷偷开完"，用户看到的就是"帘子直接拉开了"。 */
    window.__loaderDone = true
    window.dispatchEvent(new Event('loader-done'))
  }, wait)
}

router.isReady().then(hideLoader)
setTimeout(hideLoader, 4000)