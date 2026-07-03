# src/data/ — 数据模块

## JS 模块

| 文件 | 导出 | 用途 |
|------|------|------|
| `loadPosts.js` | `posts[]`, `resolveThinkPhoto()` | 随想 Markdown 加载 + marked 渲染 + 封面 glob |
| `loadNotes.js` | `notes[]`, `renderNote()` | 笔记 Markdown 加载 + 延迟渲染 + 封面 glob |
| `sceneCards.js` | `sceneCards[]` | 分享/画廊图片卡片数据 |
| `shares.js` | 图片 glob | 分享页图片集合 |
| `projects.js` | 项目数据 | GitHub 项目元数据 |
| `thoughts.js` | `whispers[]` | 首页碎碎念文字 |
| `sidebarIntro.js` | `intros` | 侧边栏归档/实验室引导文案 |
| `contacts.js` | `contacts[]` | 社交链接列表 |

## Markdown 处理流程
```
.md 文件 → import.meta.glob(?raw) → parseFrontmatter(raw)
  → { meta: {title, date, tags,...}, body: markdown string }
  → marked.parse(body) → HTML
  → note.bodyHtml 缓存（首次渲染后复用）
```

## 图片 glob 声明
```
loadPosts.js:  @/assets/saiset/think/*.{jpg,...}
loadNotes.js:  无独立 glob，封面从 TuberoseNotes.vue 的 notesImgModules 解析
sceneCards.js:  @/assets/saiset/gallery/*.{jpg,...}
shares.js:      @/assets/saiset/share/*.{jpg,...}
```

新增图片文件夹时需在对应加载模块中加 `import.meta.glob`。
