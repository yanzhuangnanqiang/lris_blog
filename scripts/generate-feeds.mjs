// 构建时从 markdown 生成 sitemap.xml / feed.xml / robots.txt
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SITE_URL = 'https://www.thineiris.top'
const SITE_TITLE = '林间初见'
const SITE_DESC = '林间初见 · 难忘夏光'
const POSTS_DIR = join(process.cwd(), 'src', 'posts')
const PUBLIC_DIR = join(process.cwd(), 'public')

// 解析 frontmatter（跟 loadPosts.js 一样的逻辑）
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!m) return { meta: {}, body: raw }
  const meta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/)
    if (kv) meta[kv[1]] = kv[2]
  }
  return { meta, body: m[2] }
}

// 读所有文章，得到 slug / title / date
const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(POSTS_DIR, f), 'utf-8')
    const { meta } = parseFrontmatter(raw)
    return {
      slug: f.replace(/\.md$/, ''),
      title: meta.title || f.replace(/\.md$/, ''),
      date: meta.date || '',
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

// 1. sitemap.xml —— 搜索引擎看的网址清单
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}/</loc></url>\n${posts
  .map((p) => `  <url><loc>${SITE_URL}/post/${p.slug}</loc></url>`)
  .join('\n')}\n</urlset>\n`

// 2. feed.xml —— 给别人订阅的 RSS 更新流
const items = posts
  .map((p) => {
    const pubDate = p.date ? new Date(p.date).toUTCString() : ''
    return `    <item>\n      <title>${p.title}</title>\n      <link>${SITE_URL}/post/${p.slug}</link>\n      <guid>${SITE_URL}/post/${p.slug}</guid>\n      <pubDate>${pubDate}</pubDate>\n    </item>`
  })
  .join('\n')

const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${SITE_TITLE}</title>\n    <link>${SITE_URL}</link>\n    <description>${SITE_DESC}</description>\n    <language>zh-CN</language>\n${items}\n  </channel>\n</rss>\n`

// 3. robots.txt —— 告诉搜索引擎 sitemap 在哪
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`

mkdirSync(PUBLIC_DIR, { recursive: true })
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemap)
writeFileSync(join(PUBLIC_DIR, 'feed.xml'), feed)
writeFileSync(join(PUBLIC_DIR, 'robots.txt'), robots)

console.log(`✅ 已生成 ${posts.length} 篇文章的 sitemap.xml / feed.xml / robots.txt`)
