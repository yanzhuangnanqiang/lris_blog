import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/vs2015.css'

// 按需注册语言
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import powershell from 'highlight.js/lib/languages/powershell'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('powershell', powershell)

const marked = new Marked(
  markedHighlight({
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    }
  })
)

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
