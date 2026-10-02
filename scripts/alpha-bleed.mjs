#!/usr/bin/env node
/**
 * alpha bleed —— 把边缘颜色「渗」进透明区
 *
 * 用途：和 remove-white-fringe.mjs 配合。擦掉白边后，透明区的 RGB 往往还是
 * 白的（或 webp 编码会把它变成黑的），缩放插值时又会被拉回边缘、重新变成
 * 白/黑毛边。所以擦完要再把叶子自己的颜色渗进透明区，插值拉到的就是绿色。
 *
 * 做法：把不透明像素的颜色逐圈向外扩散，**只改 RGB、不动 alpha**。
 *
 * 用法：
 *   node scripts/alpha-bleed.mjs <图.png ...> [--passes=8]
 *
 * ⚠️ 会**原地覆盖**输入文件 —— 跑之前先备份。
 * 跑完记得重新生成优化版：node scripts/optimize-images.mjs --only <图>
 */
import sharp from 'sharp'

const args = process.argv.slice(2)
const passesArg = args.find((a) => a.startsWith('--passes'))
const passes = passesArg ? Number(passesArg.split('=')[1]) : 8
const files = args.filter((a) => !a.startsWith('--'))

if (!files.length) {
  console.error('用法: node scripts/alpha-bleed.mjs <图.png ...> [--passes=8]')
  process.exit(1)
}

for (const file of files) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: C } = info

  // known[i] = 这个像素的颜色是否可信（不透明 → 可信）
  const known = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) known[i] = data[i * C + 3] > 0 ? 1 : 0

  let filled = 0
  for (let p = 0; p < passes; p++) {
    const prev = known.slice()
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (prev[i]) continue
        let r = 0, g = 0, b = 0, n = 0
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy
          if (ny < 0 || ny >= H) continue
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            if (nx < 0 || nx >= W) continue
            const j = ny * W + nx
            if (!prev[j]) continue
            r += data[j * C]; g += data[j * C + 1]; b += data[j * C + 2]; n++
          }
        }
        if (!n) continue
        data[i * C] = Math.round(r / n)
        data[i * C + 1] = Math.round(g / n)
        data[i * C + 2] = Math.round(b / n)
        known[i] = 1
        filled++
      }
    }
  }

  await sharp(data, { raw: { width: W, height: H, channels: C } })
    .png({ compressionLevel: 9 })
    .toFile(file)

  console.log(`${file}  →  外渗 ${passes} 圈，填了 ${filled} 个透明像素`)
}
