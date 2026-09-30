// 项目展示区（/projects）的卡面图 —— 只有这一拨。
//
//   · 项目卡面 5 张 = 9–13（配套的一组，并排才像"一套"）
//   · 点击卡片后放大出来的面板，用的是同一张卡面图
//
// 尺寸实测：这几张都在 1080×1400 上下 —— 当卡片够用（约 200–400px 宽），
// 面板里放大到 500px 左右也还行，但不要拿去铺满整屏（会软）。
//
// ★ 换图：新图丢进 src/assets/saiset/竖屏/ → 跑
//   node scripts/optimize-images.mjs --only saiset/竖屏/xx.png
//   生成 optimized/竖屏/xx.webp 后改下面 import。

import v9 from '@/assets/optimized/saiset/竖屏/9.webp'
import v10 from '@/assets/optimized/saiset/竖屏/10.webp'
import v11 from '@/assets/optimized/saiset/竖屏/11.webp'
import v12 from '@/assets/optimized/saiset/竖屏/12.webp'
import v13 from '@/assets/optimized/saiset/竖屏/13.webp'

/** 卡面图池 —— 按序号取用，5 张互不相同 */
export const showcaseArt = [v9, v10, v11, v12, v13]
