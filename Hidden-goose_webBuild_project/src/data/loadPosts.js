import { Marked } from 'marked'
import { resolvePhotoSrc } from './sceneCards.js'

const marked = new Marked()

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const metaBlock = match[1]
  const body = match[2]

  const meta = {}
  for (const line of metaBlock.split('\n')) {
    const kv = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/)
    if (kv) meta[kv[1]] = kv[2]
  }

  return { meta, body }
}

function extractExcerpt(md) {
  const clean = md
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/[*_~`>#\[\]|!-]/g, '')
    .trim()
  const firstBreak = clean.indexOf('\n\n')
  if (firstBreak > 0) return clean.slice(0, firstBreak).replace(/\n/g, ' ')
  const firstLine = clean.indexOf('\n')
  if (firstLine > 0) return clean.slice(0, firstLine)
  return clean.slice(0, 120)
}

/**
 * 加载所有 .md 文章
 * 返回排序后的文章列表
 */
const postModules = import.meta.glob('@/posts/*.md', { query: '?raw', import: 'default', eager: true })

export const posts = Object.entries(postModules)
  .map(([path, raw]) => {
    const { meta, body } = parseFrontmatter(raw)
    return {
      id: path.replace(/.*\/(.+)\.md$/, '$1'),
      title: meta.title || path.replace(/.*\/(.+)\.md$/, '$1').replace(/-/g, ' '),
      date: meta.date || '',
      category: meta.category || '未分类',
      photo: meta.photo || '1',
      photoSrc: resolvePhotoSrc(meta.photo || '1'),
      excerpt: extractExcerpt(body),
      bodyMd: body.trim(),
      bodyHtml: marked.parse(body.trim()),
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

/**
 * 按分类筛选
 */
export function filterPosts(category) {
  if (!category || category === 'all') return posts
  return posts.filter(p => p.category === category)
}
