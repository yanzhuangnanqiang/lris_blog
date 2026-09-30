#!/usr/bin/env node
/**
 * 把随想页的动图贴纸转成「能上网页」的格式。
 *
 * 为什么不让 optimize-images.mjs 一起干：
 *   那个脚本遇到 .gif 是**原样复制**的（怕重编码后只剩第一帧），而它的 GIF 分支
 *   还给 saiset/share/doroangry.gif 用着 —— 改它会波及分享页。
 *   贴纸要的是另一件事：保留动画 + 缩尺寸 + 转 WebP，所以单独一个脚本。
 *
 * 为什么要缩：贴纸实际显示约 120px，源图却是 500x500x33 帧（单张 1.3~2.6MB，20 张共 45MB）。
 *   只转格式不缩 → 每张还要 ~1MB；缩到 250px → 每张 ~0.4MB。省的 84% 主要来自缩尺寸。
 *
 * 原图一概不动。输出到 src/assets/optimized/saiset/贴纸/。
 *
 * 用法：
 *   node scripts/optimize-stickers.mjs --dry-run        # 只报告，不落盘
 *   node scripts/optimize-stickers.mjs                  # 全部生成
 *   node scripts/optimize-stickers.mjs --only 7.gif     # 只做一张
 *   node scripts/optimize-stickers.mjs --width 300      # 换输出宽度（默认 250）
 */
import { readdir, stat, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const SRC_DIR = path.join(ROOT, 'src/assets/saiset/贴纸')
const OUT_DIR = path.join(ROOT, 'src/assets/optimized/saiset/贴纸')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null
const widthIdx = args.indexOf('--width')
const WIDTH = widthIdx >= 0 ? Number(args[widthIdx + 1]) : 250
const QUALITY = 70

const kb = n => (n / 1024).toFixed(0).padStart(5) + 'K'

let names
try {
  names = (await readdir(SRC_DIR)).filter(f => /\.gif$/i.test(f))
} catch {
  console.error(`找不到贴纸目录：${path.relative(ROOT, SRC_DIR)}`)
  process.exit(1)
}

const targets = only ? names.filter(n => n === only) : names
if (!targets.length) {
  console.error(`没找到匹配的贴纸${only ? `：${only}` : ''}`)
  process.exit(1)
}

const rows = []
let before = 0
let after = 0

for (const name of targets.sort((a, b) => Number(a) - Number(b))) {
  const file = path.join(SRC_DIR, name)
  const outFile = path.join(OUT_DIR, name.replace(/\.gif$/i, '.webp'))
  const src = await stat(file)

  let buf
  let meta
  try {
    // animated: true 是保留动画的关键 —— 不加就只剩第一帧
    const img = sharp(file, { animated: true })
    meta = await img.metadata()
    buf = await img.resize(WIDTH, WIDTH).webp({ quality: QUALITY, effort: 4 }).toBuffer()
  } catch (err) {
    rows.push([name, `转换失败：${err.message}`])
    continue
  }

  before += src.size
  after += buf.length

  if (!dryRun) {
    await mkdir(OUT_DIR, { recursive: true })
    await writeFile(outFile, buf)
  }

  rows.push([
    name,
    // 动图的 metadata.height 是「每帧高 × 帧数」，要报每帧高得用 pageHeight
    `${meta.width}x${meta.pageHeight ?? meta.height} ${meta.pages ?? 1}帧 → ${WIDTH}px   ${kb(src.size)} → ${kb(buf.length)}`,
  ])
}

console.log(`\n${dryRun ? '【预演，未落盘】' : '【已生成】'} ${targets.length} 张贴纸 → src/assets/optimized/saiset/贴纸/\n`)
for (const [name, note] of rows) console.log(`  ${name.padEnd(12)} ${note}`)

if (before > 0) {
  console.log(
    `\n合计：${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB` +
      `  （省 ${(100 - (after / before) * 100).toFixed(0)}%）`
  )
}
console.log('\n原图未改动。')
