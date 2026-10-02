/**
 * 按路由预加载「首屏大图」—— 在开屏加载页还显示的时候就把它们下起来。
 *
 * 为什么需要：所有页面都是懒加载（router 里全是 `() => import()`），
 * 所以各页的大图要等「主包 → router → 页面 chunk」一路走完才开始下载。
 * 手机上就是卡在这一段：加载页撤了、图还没到，内容先露出来。
 *
 * 在 main.js 里于 `app.mount()` **之前**调用，让这些图**和 JS 并行**下载。
 *
 * 两个原则：
 *   ★ 只预加载**当前路由首屏立刻要用**的图，别的路由一律不碰（不浪费流量）
 *   ★ 一律 `fetchpriority="low"` —— 请求尽早发出（这才是预加载的价值），
 *     但**带宽让给关键 JS**；否则这几百 KB 会和 JS 抢带宽，慢网上反而拖慢进站
 *
 * ★ 改了某个页面的首屏大图，记得回来同步这张表。
 */
import xiaguang from '@/assets/optimized/xiaguang.webp'
import yeguang from '@/assets/optimized/yeguang.webp'
import yaolan from '@/assets/optimized/yaolan.webp'
import aboutBg from '@/assets/optimized/saiset/竖屏/2.webp'
import leafLeft from '@/assets/optimized/叶幕-左-3.webp'
import leafRight from '@/assets/optimized/叶幕-右-3.webp'
import leafLeftMobile from '@/assets/optimized/移-左2.webp'
import leafRightMobile from '@/assets/optimized/移-右2.webp'

// 和 DesktopHome.vue 里 <picture> 的断点保持一致（那边 max-width: 860px 走竖构图）
const WIDE = '(min-width: 861px)'

/* 随想封面：要按 path 里的 id 查出那一篇的 photo 编号。
   ⚠️ 不能 import loadPosts —— 那个模块 eager 了**全部**文章正文（import.meta.glob ?raw eager），
   拉进主包会把整站 markdown 都打进来。这里改成"用到哪篇才取哪篇"的懒 glob。 */
const postSources = import.meta.glob('@/posts/*.md', { query: '?raw', import: 'default' })
const thinkCovers = import.meta.glob('@/assets/optimized/saiset/think/*.webp', {
  eager: true,
  import: 'default',
})

function preload(urls) {
  for (const url of urls) {
    if (!url) continue
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.setAttribute('fetchpriority', 'low')
    link.href = url
    document.head.appendChild(link)
  }
}

/** /post/:id → 取那篇 md 的 frontmatter（几 KB）→ 找到对应封面 → 预加载 */
async function preloadPostCover(id) {
  const key = Object.keys(postSources).find((k) => k.endsWith(`/${id}.md`))
  if (!key) return

  const raw = await postSources[key]()
  const m = raw.match(/^\s*photo:\s*["']?(\d+)/m)
  if (!m) return

  const cover = Object.keys(thinkCovers).find((k) => k.endsWith(`/${m[1]}.webp`))
  if (cover) preload([thinkCovers[cover]])
}

export function preloadRouteAssets() {
  const path = location.pathname
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (path === '/' || path === '') {
    // 系统开了"减弱动态"时开场不演（帘布根本不显示），预热那两张没意义，只留 hero 背景
    const curtain = reduced
      ? []
      : window.matchMedia(WIDE).matches
        ? [leafLeft, leafRight]
        : [leafLeftMobile, leafRightMobile]
    preload([...curtain, xiaguang])
    return
  }

  if (path === '/notes') return preload([yeguang])
  if (path === '/share') return preload([yaolan])
  if (path === '/about') return preload([aboutBg])
  if (path.startsWith('/post/')) return preloadPostCover(path.slice('/post/'.length))
}
