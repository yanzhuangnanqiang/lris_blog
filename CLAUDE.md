# 林间初见 (Iris/Tuberose) — 项目架构

## 概述
个人博客，静态 SPA，Vue 3.5 + Vite 8 + Pinia + Vue Router + marked + highlight.js。部署 Vercel + Cloudflare DNS，域名 `www.thineiris.top`。仓库 `yanzhuangnanqiang/lris_blog`。72 次提交，7 个页面，17 个组件，2 个 Pinia store。

## 页面架构
```
App.vue → <router-view />
  /              → DesktopHome     Hero + 碎碎念 + 文章卡片
  /post/:id      → PostDetail      随想正文 + 上下篇导航
  /notes         → TuberoseNotes   笔记侧边栏 + 目录 + Markdown
  /projects      → Projects        GitHub API 仓库卡片
  /share         → ShareTimeline   图库网格 + 时间线
  /about         → About          个人信息 + 导航锚点
  /gallery       → PhotoGallery    图片展示
  /*             → redirect /
```

## 数据流
```
Markdown (.md)
  → import.meta.glob (raw text)
  → parseFrontmatter() → { meta, body }
  → marked.parse(body) → HTML string
  → v-html 渲染
```
posts 在 `src/posts/`，notes 在 `src/data/notes/`，均 eager glob 加载。

## 图片体系（两条规则，不可混用）
- **封面图**：`src/assets/saiset/{think,notes,share}/` → Vite glob 导入 → 打包压缩加哈希 → frontmatter 中 `photo`/`cover` 字段引用。新增文件夹需同步加 glob。
- **正文图**：`public/images/` → Vite 原样复制 → Markdown 正文 `![描述](/images/xxx)` 绝对路径。

## CSS 变量
- `--cold-white: #f8fafc` — 冷白文字
- `--glass-bg / --glass-blur / --glass-border` — 毛玻璃
- `--iris-purple` — 紫色强调
- `--mint-green` — 首页暖色
- `--text-dark / --text-body / --text-muted` — 文字层级
- `--page-top / --page-bottom` — 背景渐变
- `--shadow-card / --shadow-card-hover` — 卡片阴影

## 响应式断点
| 断点 | 控制 |
|------|------|
| 1350px | 笔记目录 desktop/fixed → 浮层 overlay |
| 1200px | 侧边栏宽度 300px |
| 860px | 移动端导航 + 侧边栏 260px |
| 780px | 通用移动端适配 |
| 540px | 极小屏 |

## 全局陷阱（禁止重犯）

1. **AudioContext 只建一次** — `createMediaElementSource(audio)` 每个 audio 元素只能调一次。`src/stores/music.js` 里 AudioContext/source/analyser 放 `if (!audioCtx)` 里，`stopVisualizer` 禁止 disconnect。

2. **图片路径两套体系互不混用** — 封面走 Vite glob，正文走 `public/images/`。

3. **scrollBehavior 只影响 window，不影响 `.scroller`** — 首页用自定义 `.scroller` 元素滚动，路由 `scrollBehavior` 返回 `{ top: 0 }` 只控制 window。

4. **sessionStorage 恢复时机** — 保存：`onBeforeRouteLeave` 或点击瞬间。恢复：`nextTick → rAF → setTimeout(80ms)` 等多级延迟等图片就绪。

5. **flex 弹性顺序** — spacer flex-shrink 优先级 > 文章，否则屏幕缩小时文章宽度变化而非左边距缩小。

6. **keep-alive 在自定义 scroller 下无效** — `display: none` 重置 scrollTop，用 sessionStorage。

7. **移动端 touch-action** — `.scroller` 设 `touch-action: pan-y`，光斑 `.spot` 设 `touch-action: none`。

8. **Vite glob 热更新** — `eager: true` 下新增文件不会热更新，需重启 dev server。

## 禁止擅改清单
- 所有断点值（除非用户明确要求）
- 图片体系结构（glob 路径、public/images 路径）
- 音乐 store 的 AudioContext 生命周期
- 进入 plan mode 的规则（用户要求常驻）
- Toc 检测区 rootMargin 值

## 关键文件索引
- 路由：`src/router/index.js`
- 音乐 store：`src/stores/music.js`
- 主题 store：`src/stores/theme.js`
- 文章加载：`src/data/loadPosts.js`
- 笔记加载：`src/data/loadNotes.js`
- 项目总结：`PROJECT-SUMMARY.md`
