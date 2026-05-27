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
      cover: meta.cover || '',
      bodyMd: body.trim(),
      bodyHtml: null, // 延迟渲染，首次点开时计算
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

let _renderer = null
async function ensureRenderer() {
  if (_renderer) return _renderer
  const [{ Marked }, { markedHighlight }, hljsMod, bash, javascript, typescript, css, xml, python, json, markdown, yaml, powershell] = await Promise.all([
    import('marked'),
    import('marked-highlight'),
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/css'),
    import('highlight.js/lib/languages/xml'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/markdown'),
    import('highlight.js/lib/languages/yaml'),
    import('highlight.js/lib/languages/powershell'),
  ])
  const hljs = hljsMod.default
  hljs.registerLanguage('bash', bash.default)
  hljs.registerLanguage('javascript', javascript.default)
  hljs.registerLanguage('typescript', typescript.default)
  hljs.registerLanguage('css', css.default)
  hljs.registerLanguage('html', xml.default)
  hljs.registerLanguage('python', python.default)
  hljs.registerLanguage('json', json.default)
  hljs.registerLanguage('markdown', markdown.default)
  hljs.registerLanguage('yaml', yaml.default)
  hljs.registerLanguage('powershell', powershell.default)
  _renderer = new Marked(
    markedHighlight({
      highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value
        }
        return hljs.highlightAuto(code).value
      }
    })
  )
  return _renderer
}

export async function renderNote(note) {
  await import('highlight.js/styles/vs2015.css')
  const marked = await ensureRenderer()
  return marked.parse(note.bodyMd)
}
