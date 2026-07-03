# src/assets/ — 静态资源

## 图片资源 (saiset/)

| 目录 | 用途 | 全局导入位置 |
|------|------|-------------|
| `saiset/think/` | 首页随想卡片封面 | `loadPosts.js` glob |
| `saiset/notes/` | 笔记封面 | `TuberoseNotes.vue` 的 `notesImgModules` |
| `saiset/share/` | 分享页画廊 | `shares.js` glob |
| `saiset/gallery/` | 画廊页 | `sceneCards.js` glob |
| `saiset/竖屏/` | 关于页壁纸 | `About.vue` 单独 import |
| `saiset/misc/` | 杂项图片 | （未 glob，如需用加声明） |

## SVG 图标

| 文件 | 用途 |
|------|------|
| `chevron-left.svg` | 侧边栏收起按钮 |
| `panel-right-open.svg` | 侧边栏展开图标 |
| `panel-right-close.svg` | 侧边栏收起图标 |
| `list.svg` | 移动端目录按钮 |
| `skip-back.svg/png`, `skip-forward.svg/png` | 音乐上下曲 |
| `play.svg/png`, `pause.svg/png` | 播放/暂停 |
| `refresh-cw.svg/png` | 循环开关 |
| `heart.svg` | 爱心按钮 |
| `volume-1.svg`, `volume-2.svg`, `volume-off.svg` | 音量图标 |

## 其他资源
- `avatar.jpg` — 头像
- `xiaguang.jpg` — 首页 Hero 背景
- `yeguang.jpg` — 笔记页背景
- `liushenji.png` — 音乐留声机圆盘图
- `doroangry.gif` — 表情动图
- `tubarose.png` — 黛尾花品牌图标

## 规则
- 图片尽量放 `saiset/` 子目录，不要散落在 assets 根目录
- 新增图片文件夹必须同步更新对应加载模块的 `import.meta.glob`
