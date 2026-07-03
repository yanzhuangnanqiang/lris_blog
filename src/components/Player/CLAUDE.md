# src/components/Player/ — 音乐播放器

## 文件

| 文件 | 用途 | 关键依赖 |
|------|------|---------|
| `MusicDock.vue` | 留声机浮动按钮 + 面板容器 | `music.js` store, `MusicPanel.vue` |
| `MusicPanel.vue` | 频谱可视化播放面板 | `music.js` store, SVG 图标 |

## 架构
```
MusicDock (fixed, top:74px, right:28px)
  ├── disc-btn (留声机圆盘，spinning 动画)
  └── MusicPanel (v-show="open")
        ├── spectrum (46 条 bar 频谱)
        ├── controls (播放/上下曲/循环/爱心)
        └── volume (音量滑块)
```

## 关键交互
- **点击留声机**：`onDiscClick` → 打开面板 + 如果没播放则 `store.toggle()` 开始播放
- **AudioContext 生命周期**：见根 CLAUDE.md 陷阱 #1，source/analyser 只建一次，绝不 disconnect
- **面板生命周期**：`v-show` 控制显隐，`onMounted` 仅首次初始化音频
- **音乐文件**：`public/music/` 下 4 首 mp3，store 里 `tracks` 数组定义

## Store 接口 (useMusicStore)
```js
store.playing    // boolean
store.current    // { title, file, artist }
store.toggle()   // 播放/暂停
store.next()     // 下一曲
store.prev()     // 上一曲
store.bars       // 频谱数据 (length 46)
store.volume     // 0-1
```
