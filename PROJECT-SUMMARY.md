# 林间初见 · 第一代版本总结

**项目周期**：2026 年 4 月 27 日 — 5 月 29 日，72 次提交  
**技术栈**：Vue 3 + Vite 8 + Pinia + Vue Router + marked + highlight.js  
**部署**：Vercel + Cloudflare DNS，自定义域名 `www.thineiris.top`

---

## 页面体系（7 个）

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 大屏 + 碎碎念光斑 + 文章列表 + 分类筛选 |
| 分享 | `/share` | 图库网格 + 时间线 |
| 项目 | `/projects` | GitHub API 拉取仓库卡片，语言筛选，Contribution 日历 |
| 笔记 | `/notes` | Markdown 渲染 + 侧边栏导航 + 右侧目录 |
| 文章 | `/post/:id` | 随想正文 + 上下篇导航 |
| 关于 | `/about` | 个人介绍 + 技术栈 + 时间线 + 导航锚点 |
| 画廊 | `/gallery` | 图片展示页 |

---

## 组件体系（17 个）

### 全局
- `TopBar` — 全局导航栏，笔记页随侧边栏联动
- `AvatarChip` — 头像小组件
- `IconLink` — 社交链接图标
- `BackgroundWallpaper` — 全屏背景

### 音乐播放器
- `MusicDock` — 留声机浮动按钮
- `MusicPanel` — 频谱可视化播放面板
- `music.js` (Pinia) — 跨页面持久化，页面切换不中断

### 笔记页
- `Sidebar` — 侧边栏容器（最新/归档/实验室）
- `SidebarHeader` + `SidebarNav` + `SidebarNoteList` + `SidebarNoteCard` + `SidebarFooter`
- `SidebarIntro` — 归档/实验室引导文案
- `TableOfContents` — 右侧目录，IntersectionObserver 追踪 + 自动滚动
- `WelcomePanel` — 未选笔记时的欢迎页
- `PetalEffect` — 花瓣特效

### 数据模块
- `loadPosts.js` — 随想 Markdown 加载 + 渲染
- `loadNotes.js` — 笔记 Markdown 加载 + 渲染
- `sceneCards.js` + `shares.js` + `thoughts.js` + `contacts.js`

---

## 图片管理

### 一、封面图（glob 导入）

**文件夹**：`src/assets/saiset/`

| 目录 | 用途 | 导入位置 |
|------|------|---------|
| `think/` | 首页随想卡片封面 | `loadPosts.js` |
| `notes/` | 笔记列表/文章封面 | `loadNotes.js` |
| `share/` | 分享页画廊 | `shares.js` |
| `gallery/` | 画廊页 | 场景卡片 |
| `竖屏/` | 关于页壁纸 | `About.vue` |

**使用方式**：图扔进对应文件夹，Vite 构建时自动压缩 + 加哈希。Markdown frontmatter 里写 `cover: filename.png`，代码通过 `import.meta.glob` 匹配文件名。

### 二、正文内嵌图（public 直接引用）

**文件夹**：`public/images/`

**使用方式**：图扔进去，Markdown 正文里绝对路径引用：

```md
![描述](/images/filename.png)
```

`public/` 目录 Vite 原样复制到部署根目录，不压缩不改名，不依赖路由。

### 三、完整示例

```
public/images/
  ├── screenshot.png        ← 正文内嵌图
  └── diagram.jpg

src/assets/saiset/notes/
  ├── cover-1.jpg           ← 封面图

src/data/notes/my-note.md
```

`my-note.md`：

```md
---
title: 我的笔记
date: 2025-06-01
tags: [dev]
cover: cover-1.jpg          ← 从 saiset/notes/ 找封面
---

## 内容

![截图](/images/screenshot.png)   ← 从 public/images/ 加载
```

---

## 项目结构

```
src/
├── App.vue
├── views/          7 个页面
├── components/
│   ├── app/        全局组件 3 个
│   ├── Player/     音乐组件 2 个
│   └── tuberose/   笔记页组件 9 个
├── stores/         Pinia 2 个 (music, theme)
├── router/         Vue Router
├── data/           数据/加载模块 + 笔记 Markdown
├── posts/          随想 Markdown
├── assets/         图片/图标/svg
│   └── saiset/     封面图/画廊/壁纸
└── public/         静态资源
    └── images/     正文内嵌图
```

---

## 维护指南

### 新增随想文章
1. 在 `src/posts/` 下新建 `.md` 文件
2. 写 frontmatter：title, date, tags, category, summary, photo
3. 封面图放 `src/assets/saiset/think/`，frontmatter 里 `photo: 'filename.jpg'`
4. 构建部署即可

### 新增笔记
1. 在 `src/data/notes/` 下新建 `.md` 文件
2. 写 frontmatter：title, date, tags, summary, cover
3. 封面图放 `src/assets/saiset/notes/`，frontmatter 里 `cover: 'filename.jpg'`
4. 正文图片放 `public/images/`，markdown 里 `/images/xxx` 引用

### 常用命令
```bash
npm run dev       # 本地开发
npm run build     # 构建
```

---
*于林间初见，在代码中相逢。*
