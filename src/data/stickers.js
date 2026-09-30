// 随想正文两侧的手帐贴纸（动图）。
//
// 原图在 src/assets/saiset/贴纸/（GIF，500×500×33 帧，单张 1.3~2.6MB，20 张共 45MB）。
// 这里用的是 optimized/ 里转好的动态 WebP（250px，每张 ~0.44MB）—— 转法与原因见
// scripts/optimize-stickers.mjs 的头部注释。
//
// ★ 加/换贴纸：新 GIF 丢进 src/assets/saiset/贴纸/ → 跑
//   node scripts/optimize-stickers.mjs
//   再在下面补一行 import、加进数组即可。

import s1 from '@/assets/optimized/saiset/贴纸/1.webp'
import s2 from '@/assets/optimized/saiset/贴纸/2.webp'
import s3 from '@/assets/optimized/saiset/贴纸/3.webp'
import s4 from '@/assets/optimized/saiset/贴纸/4.webp'
import s5 from '@/assets/optimized/saiset/贴纸/5.webp'
import s6 from '@/assets/optimized/saiset/贴纸/6.webp'
import s7 from '@/assets/optimized/saiset/贴纸/7.webp'
import s8 from '@/assets/optimized/saiset/贴纸/8.webp'
import s9 from '@/assets/optimized/saiset/贴纸/9.webp'
import s10 from '@/assets/optimized/saiset/贴纸/10.webp'
import s11 from '@/assets/optimized/saiset/贴纸/11.webp'
import s12 from '@/assets/optimized/saiset/贴纸/12.webp'
import s13 from '@/assets/optimized/saiset/贴纸/13.webp'
import s14 from '@/assets/optimized/saiset/贴纸/14.webp'
import s15 from '@/assets/optimized/saiset/贴纸/15.webp'
import s16 from '@/assets/optimized/saiset/贴纸/16.webp'
import s17 from '@/assets/optimized/saiset/贴纸/17.webp'
import s18 from '@/assets/optimized/saiset/贴纸/18.webp'
import s19 from '@/assets/optimized/saiset/贴纸/19.webp'
import s20 from '@/assets/optimized/saiset/贴纸/20.webp'

export const stickers = [
  s1, s2, s3, s4, s5, s6, s7, s8, s9, s10,
  s11, s12, s13, s14, s15, s16, s17, s18, s19, s20,
]

/**
 * 按正文字数决定放几张 —— 短文一张就够，长文多贴几张。**封顶 4 张**。
 *
 * 想调手感就改这张表。现有随想的长度是 110 / 193 / 343 / 538 / 866 / 969 / 2838 字，
 * 所以档位按这个分布切。
 */
export function stickerCountFor(chars) {
  if (chars >= 2500) return 4
  if (chars >= 1200) return 3
  if (chars >= 300) return 2
  return 1
}

/**
 * 随机取 n 张**不重复**的贴纸（n 超过总数就返回全部）。
 *
 * ★ 只在 setup 里调，并且**只在换文章时重掷**（见 PostDetail 里的 ref + watch）。
 *   放进 computed 或模板里会每次重渲染都重掷，贴纸会闪。
 *   跟 thoughts.js 的 spotTheme、PetalEffect 的 randomStyle 是同一个取法。
 */
export function randomStickers(n) {
  const pool = stickers.slice()
  const out = []
  for (let k = 0; k < n && pool.length; k++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  }
  return out
}
