# src/stores/ — Pinia Store

## 文件

| 文件 | 用途 | 关键状态 |
|------|------|---------|
| `music.js` | 音乐播放器全局状态，跨路由持久化 | `playing`, `idx`, `volume`, `bars[]` |
| `theme.js` | 主题 + 侧边栏 + 花瓣开关 | `currentNav`, `isSidebarCollapsed`, `isPetalEnabled` |

## music.js 内部结构
- 全局单例 `audio` 元素，永不销毁
- `audioCtx` / `source` / `analyser` 只创建一次（见根 CLAUDE.md 陷阱 #1）
- 4 首曲目定义在 `tracks[]`，文件在 `public/music/`
- `idx` 变化 → `watch` 自动 `loadTrack()`
- 频谱 `bars` 46 条，`requestAnimationFrame` 循环

## theme.js 内部结构
- `currentNav`: `'latest'` | `'archive'` | `'lab'`
- `isSidebarCollapsed`: 侧边栏展开/收起
- `isPetalEnabled`: 花瓣特效开关
- `toggleSidebar()` 切换侧边栏状态
