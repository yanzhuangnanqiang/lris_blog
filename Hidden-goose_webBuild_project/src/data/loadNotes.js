import { Marked } from 'marked'

const marked = new Marked()

function parseFrontmatter(raw) {
  raw = raw.replace(/\r\n/g, '\n')
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      const key = kv[1]
      let val = kv[2].trim()
      if (key === 'tags') {
        val = val.replace(/^\[|\]$/g, '').split(',').map(t => t.trim().replace(/^['"]|['"]$/g, ''))
      } else {
        val = val.replace(/^['"]|['"]$/g, '')
      }
      meta[key] = val
    }
  }
  return { meta, body: match[2] }
}

const noteModules = import.meta.glob('@/data/notes/*.md', { query: '?raw', import: 'default', eager: true })

export const notes = Object.entries(noteModules)
  .map(([path, raw]) => {
    const { meta, body } = parseFrontmatter(raw)
    const id = path.replace(/.*\/(.+)\.md$/, '$1')
    return {
      id,
      title: meta.title || id.replace(/-/g, ' '),
      date: meta.date || '',
      tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
      summary: meta.summary || '',
      bodyMd: body.trim(),
      bodyHtml: marked.parse(body.trim()),
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))
