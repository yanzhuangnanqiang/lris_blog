# src/components/ — 组件目录索引

## 子目录

| 目录 | 说明 | 组件数 |
|------|------|--------|
| `app/` | 全局通用组件 | 3 |
| `Player/` | 音乐播放器 | 2 |
| `tuberose/` | 笔记页专用组件群 | 9 |
| `home/` | （空，预留） | 0 |

另外根级还有 `BackgroundWallpaper.vue`。

## 组件树

```
App.vue
├── TopBar (全局)
│   └── AvatarChip
├── MusicDock (桌面固定浮动)
│   └── MusicPanel (v-show 面板, Pinia store 驱动)
├── BackgroundWallpaper (可选, 笔记页使用)
│
├── [/] DesktopHome
│   ├── PetalEffect
│   └── IconLink × N
│
├── [/post/:id] PostDetail
│
├── [/notes] TuberoseNotes
│   ├── Sidebar
│   │   ├── SidebarHeader
│   │   ├── SidebarNav
│   │   ├── SidebarIntro
│   │   ├── SidebarNoteList
│   │   │   └── SidebarNoteCard × N
│   │   └── SidebarFooter
│   ├── TableOfContents
│   ├── WelcomePanel
│   └── PetalEffect
│
├── [/projects] Projects
├── [/share] ShareTimeline
├── [/about] About
└── [/gallery] PhotoGallery
```

## 组件通信
- 组件间传值：props + emits
- 跨组件共享状态：Pinia store（`music.js`, `theme.js`）
- 笔记页侧边栏 → 主内容：`selectedId` prop + `$emit('select', id)`
