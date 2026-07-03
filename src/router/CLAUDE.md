# src/router/ — Vue Router

## 路由表

| 路径 | 名称 | 页面组件 | 说明 |
|------|------|---------|------|
| `/` | Home | `DesktopHome.vue` | 首页 |
| `/share` | Share | `ShareTimeline.vue` | 分享 |
| `/projects` | Projects | `Projects.vue` | 项目 |
| `/notes` | Notes | `TuberoseNotes.vue` | 笔记 |
| `/about` | About | `About.vue` | 关于 |
| `/gallery` | Gallery | `PhotoGallery.vue` | 画廊 |
| `/post/:id` | Post | `PostDetail.vue` | 随想文章 |
| `/:pathMatch(.*)*` | - | redirect `/` | 404 兜底 |

## 关键配置
- `createWebHistory('/')` — HTML5 History 模式
- `scrollBehavior` — 始终返回 `{ top: 0 }`（只影响 window，不影响 `.scroller` 元素）

## 注意事项
- 所有页面 lazy loaded（`() => import(...)`）
- 404 兜底必须在所有路由最后
- 没有 keep-alive（历史原因，见根 CLAUDE.md 陷阱 #6）
