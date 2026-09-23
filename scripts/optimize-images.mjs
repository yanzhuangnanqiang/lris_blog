#!/usr/bin/env node
/**
 * 为 src/assets 下的大图生成「优化版」，输出到 src/assets/optimized/ 镜像目录。
 *
 * 原图一概不动 —— 网格/封面用 optimized/ 里的小图，灯箱看大图时才用原图。
 *
 * 用法：
 *   node scripts/optimize-images.mjs --dry-run    # 只报告，不落盘
 *   node scripts/optimize-images.mjs              # 生成全部优化版
 *   node scripts/optimize-images.mjs --only saiset/gallery/12.png
 */
import { readdir, stat, mkdir, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const ASSETS = path.join(ROOT, 'src/assets')
const OUT = path.join(ASSETS, 'optimized')
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif'])
// 动图不重编码，原样复制进 optimized/（否则转出来只剩第一帧）
const COPY_EXTS = new Set(['.gif'])

// 小于这个体积就不必再生成优化版
const MIN_BYTES = 60 * 1024

// 全站零引用的文件，不做优化版
const SKIP = new Set([
  'chanpian.png', // 2048x2048 3.8MB，无任何 import
  'avatar2.jpg',  // 2088x1175 1.8MB，无任何 import
])

// 按用途决定宽度（约实际显示尺寸的 2 倍，留 retina 余量）
const RULES = [
  [/saiset[\\/]gallery[\\/]/, 800],  // 图库网格（灯箱会另取原图）
  [/saiset[\\/]share[\\/]/, 700],    // 说说配图网格
  [/saiset[\\/]think[\\/]/, 1400],   // 随想封面，详情页头图 720px
  [/saiset[\\/]notes[\\/]/, 1400],   // 笔记封面
  [/saiset[\\/]竖屏[\\/]/, 1920],    // 关于页整屏背景
  [/^[^\\/]+$/, 1920],               // 顶层整屏大图（相对路径里没有前缀，靠"无斜杠"识别）
]
const DEFAULT_WIDTH = 1400

function widthFor(rel) {
  for (const [re, w] of RULES) if (re.test(rel)) return w
  return DEFAULT_WIDTH
}

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === 'optimized') continue
    if (SKIP.has(e.name)) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await walk(p, out)
    else if (EXTS.has(path.extname(e.name).toLowerCase())) out.push(p)
  }
  return out
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null

const files = await walk(ASSETS)
const targets = only
  ? files.filter(f => path.relative(ASSETS, f).split(path.sep).join('/').includes(only))
  : files

if (!targets.length) {
  console.error(`没找到匹配的图片${only ? `：${only}` : ''}`)
  process.exit(1)
}

const kb = n => (n / 1024).toFixed(0).padStart(5) + 'K'
const rows = []
let before = 0
let after = 0

for (const file of targets) {
  const rel = path.relative(ASSETS, file).split(path.sep).join('/')
  const src = await stat(file)

  if (COPY_EXTS.has(path.extname(file).toLowerCase())) {
    const outFile = path.join(OUT, rel)
    if (!dryRun) {
      await mkdir(path.dirname(outFile), { recursive: true })
      await copyFile(file, outFile)
    }
    before += src.size
    after += src.size
    rows.push([rel, `${kb(src.size)} → 原样复制（动图）`])
    continue
  }

  const target = widthFor(rel)

  let meta
  try {
    meta = await sharp(file).metadata()
  } catch (err) {
    rows.push([rel, `读取失败：${err.message}`])
    continue
  }

  const w = meta.width ?? 0
  const scale = w > target ? target / w : 1

  const relOut = rel.replace(/\.(png|jpe?g)$/i, '.webp')
  const outFile = path.join(OUT, relOut)

  let buf
  try {
    buf = await sharp(file)
      .rotate() // 按 EXIF 摆正
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 80, alphaQuality: 100, effort: 5 })
      .toBuffer()
  } catch (err) {
    rows.push([rel, `转换失败：${err.message}`])
    continue
  }

  before += src.size
  after += buf.length

  if (!dryRun) {
    await mkdir(path.dirname(outFile), { recursive: true })
    await writeFile(outFile, buf)
  }

  rows.push([
    rel,
    `${w}x${meta.height} → ${Math.round(w * scale)}x${Math.round((meta.height ?? 0) * scale)}` +
      `   ${kb(src.size)} → ${kb(buf.length)}`,
  ])
}

console.log(`\n${dryRun ? '【预演，未落盘】' : '【已生成优化版】'} ${targets.length} 个文件 → src/assets/optimized/\n`)
for (const [rel, note] of rows) console.log(`  ${rel.padEnd(44)} ${note}`)

if (before > 0) {
  console.log(
    `\n合计：${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB` +
      `  （省 ${(100 - (after / before) * 100).toFixed(0)}%）`
  )
}
console.log('\n原图未改动。')
