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
      // 可选：frontmatter 里写 category 就能自定义分类；不写则由笔记页退回用第一个 tag
      category: meta.category || '',
      cover: meta.cover || '',
      bodyMd: body.trim(),
      bodyHtml: null, // 延迟渲染，首次点开时计算
    }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

let _renderer = null
// 每次 renderNote 前重置，用来收集这一篇的标题
let _headings = []
let _seen = null

// marked 18 起不再自动给标题加 id，得自己生成。
// 必须去重：两处同名标题若共用一个 id，目录里两项都会跳到同一个位置。
function slugify(text) {
  const base = text.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'
  let id = base
  for (let n = 1; _seen.has(id); n++) id = `${base}-${n}`
  _seen.add(id)
  return id
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' }

// 目录条目要的是纯文字，但 marked 给的是行内 HTML
function plainText(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#?\w+);/g, (m, e) => ENTITIES[e] ?? m)
    .trim()
}

async function ensureRenderer() {
  if (_renderer) return _renderer
  const [{ Marked, Renderer }, { markedHighlight }, hljsMod, bash, javascript, typescript, css, xml, python, json, markdown, yaml, powershell] = await Promise.all([
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
  _renderer.use({
    renderer: {
      heading({ tokens, depth }) {
        const inline = this.parser.parseInline(tokens)
        if (depth !== 2 && depth !== 3) return `<h${depth}>${inline}</h${depth}>\n`
        const text = plainText(inline)
        const id = slugify(text)
        _headings.push({ level: depth, id, text })
        return `<h${depth} id="${id}">${inline}</h${depth}>\n`
      },
      table(token) {
        // 窄屏下宽表格会撑破阅读面板，包一层让它自己横向滚动
        return `<div class="table-wrap">${Renderer.prototype.table.call(this, token)}</div>\n`
      },
    },
  })
  return _renderer
}

export async function renderNote(note) {
  await import('highlight.js/styles/vs2015.css')
  const marked = await ensureRenderer()
  _headings = []
  _seen = new Set()
  const html = marked.parse(note.bodyMd)
  note.headings = _headings
  return html
}
