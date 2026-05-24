import { Marked } from 'marked'

const marked = new Marked()

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) meta[kv[1]] = kv[2].trim()
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
      tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
      summary: meta.summary || '',
      bodyMd: body.trim(),
      bodyHtml: marked.parse(body.trim()),
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))
