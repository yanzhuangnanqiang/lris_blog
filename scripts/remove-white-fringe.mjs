#!/usr/bin/env node
/**
 * 去白边 —— 抹掉素材轮廓上的白色辉光
 *
 * 背景：帘布图（叶幕-左/右-3）的叶子轮廓外有一圈白雾边。数据上它不是
 * 「切图软边」，而是合成时白底没算干净：alpha 还有 244 的时候，RGB 已经
 * 是 249,255,229（近纯白）了。所以 CSS 模糊、alpha bleed 都治不了，
 * 只能在像素层面把这批像素抹掉。
 *
 * 做法：把「半透明 + 近白」的像素直接设为全透明（alpha = 0）。
 *   - 不动 alpha === 255 的像素 → 叶子上受光的近白高光会被保住，否则破洞
 *   - 不动 alpha === 0 的像素 → 本来就透明，无所谓
 *
 * 用法：
 *   node scripts/remove-white-fringe.mjs <图.png ...>
 *        [--min=200]     判定「近白」的通道下限（RGB 三个都要 > min）
 *        [--spread=45]   判定「灰/无彩」的容差（max(RGB) - min(RGB) < spread）
 *
 * ⚠️ 会**原地覆盖**输入文件 —— 跑之前先备份。
 * 跑完记得重新生成优化版：node scripts/optimize-images.mjs --only <图>
 */
import sharp from 'sharp'

const args = process.argv.slice(2)
const num = (flag, dflt) => {
  const hit = args.find((a) => a.startsWith(flag))
  return hit ? Number(hit.split('=')[1]) : dflt
}
const MIN = num('--min', 200)
const SPREAD = num('--spread', 45)
const files = args.filter((a) => !a.startsWith('--'))

if (!files.length) {
  console.error('用法: node scripts/remove-white-fringe.mjs <图.png ...> [--min=200] [--spread=45]')
  process.exit(1)
}

for (const file of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: C } = info

  let killed = 0
  for (let i = 0; i < W * H; i++) {
    const a = data[i * C + 3]
    if (a === 0 || a === 255) continue
    const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2]
    if (Math.min(r, g, b) > MIN && Math.max(r, g, b) - Math.min(r, g, b) < SPREAD) {
      data[i * C + 3] = 0
      killed++
    }
  }

  await sharp(data, { raw: { width: W, height: H, channels: C } })
    .png({ compressionLevel: 9 })
    .toFile(file)

  console.log(`${file}  →  抹掉 ${killed} 个「半透明 + 近白」像素（min>${MIN}, spread<${SPREAD}）`)
}
