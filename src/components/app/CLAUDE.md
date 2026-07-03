# src/components/app/ — 全局组件

## 文件

| 文件 | 用途 | 关键 props |
|------|------|-----------|
| `TopBar.vue` | 全局导航栏，fixed 顶部 | slot `left-extra`, 鼠标悬浮展开 |
| `AvatarChip.vue` | 头像小组件 | - |
| `IconLink.vue` | 社交链接图标按钮 | `name`, `icon`, `url` |

## TopBar 注意事项
- `sidebar-open` class 仅在 `/notes` 路由生效（`route.path === '/notes'`），其他页面不受侧边栏影响
- 悬浮展开用 `isHover || menuOpen` 控制 `.active` class
- 移动端菜单用 `menuOpen` ref 控制显隐
