# public/ — 静态资源（Vite 原样复制）

## 目录结构

| 路径 | 内容 | 用途 |
|------|------|------|
| `music/` | 4 首 mp3 文件 | 音乐播放器音频源 |
| `images/` | 杂项图片 | Markdown 正文内嵌图 |
| `iris-icon.png` | 网站图标 | favicon |
| `favicon.ico` | 网站图标 | favicon |

## 图片引用方式
Markdown 正文里绝对路径引用：
```md
![描述](/images/filename.png)
```

## 规则
- `public/` 下文件 Vite 不处理（不压缩、不加哈希），直接复制到部署根目录
- 运行时通过绝对路径 `/xxx` 访问（不依赖路由）
- 和 `src/assets/saiset/` 的 glob 体系互不干扰
