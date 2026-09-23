<!--
  站点统计卡。结构照 Jarvis0227/Aemeath 的 widget/SiteStats.astro：
  ▌站点统计 + 若干行「图标 + 标签 …… 数值」。
  数据全部本仓现算，不新增数据文件。
-->
<template>
  <WidgetCard title="站点统计">
    <div class="rows">
      <div v-for="s in stats" :key="s.label" class="row">
        <span class="ico" aria-hidden="true" v-html="s.icon"></span>
        <span class="label">{{ s.label }}</span>
        <span class="value">{{ s.value }}</span>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { computed } from 'vue'
import WidgetCard from '@/components/app/WidgetCard.vue'
import { posts } from '@/data/loadPosts'
import { notes } from '@/data/loadNotes'
import { countChars } from '@/data/loadPosts'

// 细线图标，跟着 currentColor 走
const I = {
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 4.8 4 6l-1.2 8 8.6 8.6a2 2 0 0 0 2.8 0l6.4-6.4a2 2 0 0 0 0-2.8z"/><circle cx="8.5" cy="9.5" r="1.2"/></svg>',
  text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 11h16M4 16h10"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l3-7 4 14 3-7h6"/></svg>',
}

// 全站内容 = 随笔 + 笔记
const allContent = computed(() => [
  ...posts.map(p => ({ date: p.date, category: p.category, tags: [], body: p.bodyMd, words: p.wordCount })),
  // 笔记的正文还没渲染过，字数这里现算（和 post 用同一个 countChars，免得两处不一致）
  ...notes.map(n => ({ date: n.date, category: n.category || n.tags[0] || '未分类', tags: n.tags, body: n.bodyMd, words: countChars(n.bodyMd) })),
])

function toTime(d) {
  const t = new Date(d).getTime()
  return Number.isNaN(t) ? 0 : t
}

const totalWords = computed(() => allContent.value.reduce((s, c) => s + (c.words || 0), 0))
const categoryCount = computed(() => new Set(allContent.value.map(c => c.category).filter(Boolean)).size)
const tagCount = computed(() => new Set(allContent.value.flatMap(c => c.tags)).size)

// 起始日取最早的一篇 —— 不用再单独配一个「建站日期」常量
const earliest = computed(() => {
  const ds = allContent.value.map(c => toTime(c.date)).filter(Boolean)
  return ds.length ? new Date(Math.min(...ds)) : null
})
const latest = computed(() => {
  const ds = allContent.value.map(c => toTime(c.date)).filter(Boolean)
  return ds.length ? new Date(Math.max(...ds)) : null
})

function daysBetween(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.max(0, Math.round((b - a) / 86400000))
}

const runningDays = computed(() => (earliest.value ? daysBetween(earliest.value, new Date()) : 0))
const lastActiveText = computed(() => {
  if (!latest.value) return '—'
  const d = daysBetween(latest.value, new Date())
  return d === 0 ? '今天' : `${d} 天前`
})

const stats = computed(() => [
  { icon: I.doc, label: '文章', value: allContent.value.length },
  { icon: I.folder, label: '分类', value: categoryCount.value },
  { icon: I.tag, label: '标签', value: tagCount.value },
  { icon: I.text, label: '总字数', value: totalWords.value.toLocaleString() },
  { icon: I.clock, label: '运行时长', value: `${runningDays.value} 天` },
  { icon: I.pulse, label: '最后活动', value: lastActiveText.value },
])
</script>

<style scoped>
.rows { display: flex; flex-direction: column; }

.row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 2px;
}
.ico {
  display: inline-flex;
  flex-shrink: 0;
  color: #a0d2b9;
  opacity: 0.85;
}
.ico :deep(svg) { width: 18px; height: 18px; }
.label {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.65);
}
.value {
  margin-left: auto;
  font-size: 0.96rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
</style>