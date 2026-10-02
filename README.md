# 林间初见 · Iris / Tuberose

> 写点随想，记些笔记，分享生活。

线上站点：**[www.thineiris.top](https://www.thineiris.top)**

## 关于

一个静态单页博客，把**随想文章**、**技术笔记**、**项目记录**和**图片分享**放在同一个站点里。

没有后台、没有数据库写文章 —— 发文就是往仓库里丢一个 `.md`，`git push` 完事。

## 技术栈

| 层 | 用了什么 |
|----|----------|
| 框架 | Vue 3 + Vite + Pinia + Vue Router |
| 内容 | Markdown（marked 渲染）+ highlight.js 代码高亮 |
| 评论 | Waline（服务端部署在 Vercel，数据存 Supabase，图片存 Supabase Storage） |
| 部署 | Vercel + Cloudflare DNS |

## 页面

| 路由 | 页面 |
|------|------|
| `/` | 首页：开场帘布、碎碎念、随想列表 |
| `/post/:id` | 随想正文 + 评论区 |
| `/notes` | 笔记：侧边栏 + 目录 + Markdown |
| `/projects` | GitHub 仓库卡片 + 提交日历 |
| `/share` | 图库网格 + 时间线 |
| `/gallery` | 画廊 |
| `/about` | 关于 |

## 本地开发

环境要求：Node ≥ 20.19（或 ≥ 22.12）、pnpm

```sh
pnpm install
pnpm dev        # 开发
pnpm build      # 构建
pnpm preview    # 预览构建结果
```

## 目录结构

```text
src/
├── views/        页面组件（7 个）
├── components/   通用组件（app / Player / tuberose / home）
├── data/         数据与加载模块 + 笔记 Markdown
├── posts/        随想 Markdown
├── stores/       Pinia（music、theme）
├── router/       路由
├── assets/       图片资源（封面走 saiset/ 的 glob）
└── preload.js    首屏大图预加载（换首屏图记得同步那张路由表）
public/           原样发布的静态资源（正文插图、歌曲、开屏动画）
scripts/          构建辅助与图片优化脚本（optimize-images / optimize-stickers）
```

## 特别鸣谢

页面与评论区的设计参考了下面几个开源博客项目，感谢作者：

- [Aemeath](https://github.com/Jarvis0227/Aemeath) — Jarvis0227
- [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs) — heiehiehi
- [AyeezBlog](https://github.com/Ayeez757/AyeezBlog) — Ayeez757
- [SakuraBlog](https://github.com/soft-zihan/SakuraBlog) — soft-zihan

也感谢 Vue、Vite、marked、highlight.js、Waline、Supabase、Vercel 等所有开源项目及其贡献者。
