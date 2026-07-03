# src/components/tuberose/ — 笔记页组件群（9 个）

## 组件清单

| 组件 | 用途 | 关键 props/emits |
|------|------|-----------------|
| `Sidebar.vue` | 侧边栏容器，fixed 左侧，滑入/滑出 | `selectedId` → `@select` |
| `SidebarHeader.vue` | 侧边栏顶部品牌区 | - |
| `SidebarNav.vue` | 标签切换（最新/归档/实验室） | `theme.js` store |
| `SidebarNoteList.vue` | 笔记列表容器 | `selectedId`, `@select` |
| `SidebarNoteCard.vue` | 单篇笔记卡片 | `note`, `active` → `@select` |
| `SidebarFooter.vue` | 底部版本号 + 设置入口 | - |
| `SidebarIntro.vue` | 归档/实验室引导文案 | `tab` (archive/lab) |
| `TableOfContents.vue` | 右侧文章目录 | `headings[]` |
| `WelcomePanel.vue` | 未选笔记时的欢迎页 | `@random` |
| `PetalEffect.vue` | 花瓣飘落特效 | `theme.js` store |

## 侧边栏交互
- **展开/收起**：`theme.toggleSidebar()`，CSS `transform: translateX(-100%)`
- **移动端**：触摸滑动检测（`touchstart`/`touchend`，dx < -60px 关闭）
- **标签切换**：`theme.currentNav` = `'latest'` | `'archive'` | `'lab'`
- **笔记选择**：`selectedId` 通过 `@select` 冒泡到 TuberoseNotes

## 目录 (TableOfContents) 关键参数
- **断点**：1350px 桌面 fixed，以下浮层 overlay
- **检测区 rootMargin**：`-10% 0px -58% 0px`（不要随意改动）
- **标题提取**：DOMParser 解析 `.rp-body` 内 h2/h3
- **自动滚动**：IntersectionObserver 追踪 + `scrollBy` 保持激活标签可见
- **scroll-margin**：`3vh` 保持激活标签不贴边

## 注意事项
- 侧边栏宽度：桌面 25%（min 280, max 520），1200px→300px，860px→260px
- 移动端目录按钮 `.toc-mobile-btn`：右上角，下滑隐藏，上滑出现
- SidebarFilters.vue 已废弃（功能移除，文件保留）
