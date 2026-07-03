# src/views/ — 页面组件（7 个）

## 文件清单

| 文件 | 路由 | 核心功能 | 关键子组件 | 数据源 |
|------|------|---------|-----------|--------|
| `DesktopHome.vue` | `/` | Hero + 碎碎念光斑 + 文章列表 + 分类筛选 | TopBar, MusicDock, PetalEffect, IconLink | `loadPosts.js`, `thoughts.js`, `contacts.js` |
| `PostDetail.vue` | `/post/:id` | 随想文章详情 + 上下篇导航 | TopBar, MusicDock | `loadPosts.js` |
| `TuberoseNotes.vue` | `/notes` | 笔记侧边栏 + Markdown 渲染 + TOC | TopBar, Sidebar, TableOfContents, WelcomePanel, PetalEffect | `loadNotes.js`, `theme.js` |
| `Projects.vue` | `/projects` | GitHub 仓库卡片 + 语言筛选 + 贡献日历 | TopBar | GitHub API fetch, `projects.js` |
| `ShareTimeline.vue` | `/share` | 图库网格 + 时间线 | TopBar | `shares.js`, `sceneCards.js` |
| `About.vue` | `/about` | 个人信息 + 技术栈 + 时间线 + 锚点导航 | TopBar, MusicDock | 本地静态数据 |
| `PhotoGallery.vue` | `/gallery` | 图片展示 | - | `sceneCards.js` |

## 注意事项
- DesktopHome 使用自定义 `.scroller` 滚动（非 window），scrollBehavior 不生效
- DesktopHome 滚动保存见根 CLAUDE.md 陷阱 #3、#4、#6
- TuberoseNotes 目录断点 1350px，与 TableOfContents 组件的 `@media` 同步
- Projects 搜索状态用 sessionStorage 持久化，repos 数据有 sessionStorage 缓存
