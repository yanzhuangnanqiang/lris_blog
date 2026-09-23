<template>
  <div class="projects-page">
    <div class="bg-fixed" :style="{ backgroundImage: `url(${xinliBg})` }"></div>
    <div class="fog-layer" :style="fogStyle"></div>
    <TopBar />
    <MusicDock />

    <div ref="scrollerRef" class="scroller" @scroll="onScroll">
      <section class="hero" @click="searchActive && (searchActive = false)">
        <div class="hero-content" :class="{ sticky: searchActive }" :style="{ opacity: Math.max(0, 1 - scrollPct * 2) }">
          <h1 class="hero-title">Project</h1>
          <p class="hero-sub">于迷雾深处，代码自光中浮现</p>
        </div>
      </section>

      <div class="search-zone" :class="{ active: searchActive }">
        <div class="tool-search">
          <input
            ref="searchInputRef"
            v-model="repoSearch"
            type="text"
            placeholder="搜索项目、技术栈或描述..."
            @keyup.enter="searchActive = true"
            @keyup.esc="searchActive = false"
            @focus="searchActive = true"
            @blur="setTimeout(() => { if (!document.activeElement?.closest('.search-zone')) searchActive = false }, 150)"
          />
          <span v-if="repoSearch" class="search-clear" @click="repoSearch = ''">✕</span>
          <span v-else class="search-icon" @click="searchActive = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
        <div class="filter-row" v-if="searchActive">
          <button v-for="lang in allLanguages" :key="lang" class="ftag" :class="{ active: filterLangs.includes(lang) }" @click="toggleLang(lang)">{{ lang }}</button>
        </div>
      </div>

      <section v-if="!searchActive" class="calendar-section" :class="{ bloomed }" :style="{ opacity: 0.35 + Math.min(0.65, Math.max(0, (scrollPct - 0.05) * 3)) }">
        <div class="cal-header">
          <span class="cal-label">活动日历</span>
          <span class="cal-count">{{ calendarStats.activeDays }} 天有提交 · 共 {{ calendarStats.total }} 次</span>
        </div>
        <div class="cal-month-labels">
          <span v-for="i in weeksCount" :key="'ml'+i" class="cal-ml" :class="{ empty: !monthLabelByWeek[i-1] }">{{ monthLabelByWeek[i-1] || '' }}</span>
        </div>
        <div class="cal-body">
          <div class="cal-day-labels">
            <span style="grid-row:2">Mon</span>
            <span style="grid-row:4">Wed</span>
            <span style="grid-row:6">Fri</span>
          </div>
          <div class="cal-grid">
            <div v-for="(cell, idx) in calendarCells" :key="idx" class="cal-day" :class="dayClass(cell)" :style="cellStyle(cell)" :data-tip="cellTip(cell)"></div>
          </div>
        </div>
        <div class="cal-legend">
          <span class="leg-label">Less</span>
          <span class="leg-box empty"></span>
          <span class="leg-box l1"></span>
          <span class="leg-box l2"></span>
          <span class="leg-box l3"></span>
          <span class="leg-box l4"></span>
          <span class="leg-label">More</span>
        </div>
        <p v-if="contribError" class="cal-error">暂时取不到提交数据</p>
      </section>

      <div class="container" :style="{ opacity: searchActive ? 1 : Math.min(1, Math.max(0, (scrollPct - 0.1) * 3)) }">
        <div v-if="loading" class="loading-state">加载中…</div>
        <div v-else-if="error" class="error-state">
          <p>拉取失败：{{ error }}</p>
          <a href="https://github.com/yanzhuangnanqiang" target="_blank" rel="noreferrer">直接访问 GitHub →</a>
        </div>
        <div v-else>
          <div v-if="repoSearch || filterLangs.length" class="result-hint">
            {{ filteredRepos.length ? `找到 ${filteredRepos.length} 个项目` : '没有匹配的项目' }}
          </div>
          <div class="repo-grid" v-if="filteredRepos.length">
            <a v-for="(repo, i) in filteredRepos" :key="repo.id" class="repo-card" :class="{ picked: pickedRepo === repo.id, dimmed: pickedRepo && pickedRepo !== repo.id }" :href="repo.html_url" target="_blank" rel="noreferrer" :style="{ animationDelay: `${i * 60}ms` }" @click.stop="pickedRepo = pickedRepo === repo.id ? null : repo.id">
              <span v-if="isActive(repo)" class="repo-pulse" title="近期活跃"></span>
              <div class="repo-top">
                <span class="repo-name">{{ displayName(repo) }}</span>
                <span class="repo-slug">{{ repo.name }}</span>
              </div>
              <div class="repo-desc">{{ repo.description || '暂无描述' }}</div>
              <div class="repo-meta">
                <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
                <span>{{ starSymbol(repo.stargazers_count) }} {{ repo.stargazers_count }}</span>
                <span>{{ repo.updated_at.slice(0, 10) }}</span>
              </div>
              <div class="repo-line"></div>
            </a>
          </div>
        </div>
        <footer class="end-cap">每段代码都是一次花开</footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import xinliBg from '@/assets/optimized/xinli.webp'
import { loadContributions, irisColorOf } from '@/data/contributions'

const repos = ref([])
const loading = ref(true)
const error = ref('')
const scrollerRef = ref(null)
const scrollPct = ref(0)
const repoSearch = ref('')
const filterLangs = ref([])
const searchActive = ref(false)
const scrollingByCode = ref(false)
const pickedRepo = ref(null)

function toggleLang(lang) {
  const idx = filterLangs.value.indexOf(lang)
  if (idx >= 0) filterLangs.value.splice(idx, 1)
  else filterLangs.value.push(lang)
}

const displayNames = {
  'yanzhuangnanqiang': 'github主页',
  'yanzhuangnanqiang.github.io': '个人主页',
  'My-note': '我的笔记',
  'lris_blog': '个人博客',
}
function displayName(repo) { return displayNames[repo.name] || repo.name }

const langColors = {
  'JavaScript': '#f7df1e', 'TypeScript': '#3178c6', 'Vue': '#4fc08d',
  'CSS': '#563d7c', 'HTML': '#e34c26', 'Python': '#3572A5',
  'C++': '#f34b7d', 'C': '#555', 'Java': '#b07219',
  'Go': '#00ADD8', 'Rust': '#dea584', 'Ruby': '#701516',
}
function langColor(lang) { return langColors[lang] || '#888' }
function starSymbol(count) { return count >= 30 ? '✦' : count >= 5 ? '★' : '☆' }
function isActive(repo) { return (Date.now() - new Date(repo.updated_at).getTime()) < 7 * 86400000 }

const allLanguages = computed(() =>
  [...new Set(repos.value.map(r => r.language).filter(Boolean))]
)

const filteredRepos = computed(() => {
  let list = repos.value
  const q = repoSearch.value.trim().toLowerCase()
  if (q) list = list.filter(r => r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.language || '').toLowerCase().includes(q) || (displayName(r) || '').toLowerCase().includes(q))
  if (filterLangs.value.length) list = list.filter(r => filterLangs.value.includes(r.language))
  return list
})

const fogStyle = computed(() => {
  const p = scrollPct.value
  return {
    backdropFilter: `blur(${2 + p * 16}px)`,
    WebkitBackdropFilter: `blur(${2 + p * 16}px)`,
    maskImage: `linear-gradient(to top, black ${Math.min(100, 35 + p * 55)}%, transparent ${Math.min(100, 50 + p * 50)}%)`,
    WebkitMaskImage: `linear-gradient(to top, black ${Math.min(100, 35 + p * 55)}%, transparent ${Math.min(100, 50 + p * 50)}%)`,
  }
})

// 搜索激活/退出
watch(searchActive, async (val) => {
  if (val) {
    await nextTick()
    const el = document.querySelector('.search-zone')
    if (el && scrollerRef.value) {
      const rect = el.getBoundingClientRect()
      const target = scrollerRef.value.scrollTop + rect.top - 48
      scrollingByCode.value = true
      scrollerRef.value.scrollTo({ top: target, behavior: 'smooth' })
      setTimeout(() => { scrollingByCode.value = false }, 600)
    }
  } else {
    filterLangs.value = []
    repoSearch.value = ''
  }
})

// 下滑超过搜索栏位置 → 返回初始状态
function onScroll() {
  const el = scrollerRef.value
  if (!el) return
  const maxScroll = el.scrollHeight - el.clientHeight
  scrollPct.value = maxScroll > 0 ? Math.min(1, el.scrollTop / Math.min(maxScroll, window.innerHeight * 1.2)) : 0
  // 日历区开始可见 → 花开（只触发一次）
  if (!bloomed.value && scrollPct.value > 0.25) bloomed.value = true
  // 下滑超一屏 或 手动滚回顶部 → 退出搜索模式
  if (searchActive.value && !scrollingByCode.value) {
    if (el.scrollTop < 20 || el.scrollTop > window.innerHeight * 1.2) {
      searchActive.value = false
    }
  }
}

const weeksCount = 53
const calendarCells = ref([])
const calendarStats = ref({ activeDays: 0, total: 0 })
const contribError = ref(false)           // 拉不到数据时给个提示，别静默留一片空白
const bloomed = ref(false)                // 滚到日历区后触发花开
const calendarMonths = computed(() => {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const map = new Map()
  calendarCells.value.forEach((cell, idx) => {
    if (!cell) return
    const day = parseInt(cell.date.slice(8, 10))
    if (day === 1) {
      const m = cell.date.slice(5, 7)
      const col = Math.floor(idx / 7)
      map.set(m, { m, label: names[parseInt(m) - 1], week: col })
    }
  })
  if (calendarCells.value.length > 0) {
    const first = calendarCells.value[0]
    const m = first.date.slice(5, 7)
    if (!map.has(m)) {
      map.set(m, { m, label: names[parseInt(m) - 1], week: 0 })
    }
  }
  return [...map.values()].sort((a, b) => a.week - b.week)
})
const monthLabelByWeek = computed(() => {
  const map = {}
  calendarMonths.value.forEach(m => { map[m.week] = m.label })
  return map
})

/** 本地日期字符串。不能用 toISOString —— 本地 0 点转成 UTC 会倒推一天 */
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 把贡献数据铺满 53 周 */
function buildCalendar(days) {
  const now = new Date(); now.setHours(0,0,0,0)
  const daysCount = weeksCount * 7
  const end = new Date(now); end.setDate(end.getDate() + (6 - end.getDay())); end.setHours(0,0,0,0)
  const start = new Date(end); start.setDate(end.getDate() - (daysCount - 1)); start.setHours(0,0,0,0)

  const map = new Map(days.map(d => [d.date, d]))
  const cells = []
  let bloomOrder = 0
  const cursor = new Date(start)
  for (let i = 0; i < daysCount; i++) {
    const date = ymd(cursor)
    const day = map.get(date) || null
    // 花开次序按时间先后（不是数组下标），这样花会一朵接一朵地开
    cells.push({ date, day, order: day ? bloomOrder++ : -1 })
    cursor.setDate(cursor.getDate() + 1)
  }
  calendarCells.value = cells
}

function dayClass(cell) {
  return cell.day ? 'l' + cell.day.level : 'empty'
}
/** 每朵的颜色。颜色是装饰性的 —— 当天提交了几次由「开了多大」表示 */
function cellStyle(cell) {
  return cell.day ? { '--iris': irisColorOf(cell.date), '--i': cell.order } : null
}
function cellTip(cell) {
  return cell.day ? `${cell.date} · ${cell.day.count} 次提交` : ''
}

async function fetchWithTimeout(url, timeout = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try { return await fetch(url, { signal: ctrl.signal }) }
  finally { clearTimeout(t) }
}

const savedSearch = sessionStorage.getItem('projectSearch')
if (savedSearch) repoSearch.value = savedSearch
watch(repoSearch, (v) => { sessionStorage.setItem('projectSearch', v) })

const cached = sessionStorage.getItem('projectRepos')
if (cached) { try { repos.value = JSON.parse(cached); loading.value = false } catch (e) {} }

onMounted(async () => {
  try {
    const res = await fetchWithTimeout('https://api.github.com/users/yanzhuangnanqiang/repos?sort=updated&per_page=100')
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    repos.value = data.filter(r => !r.fork).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    sessionStorage.setItem('projectRepos', JSON.stringify(repos.value))
  } catch (e) { if (!repos.value.length) error.value = e?.name === 'AbortError' ? '请求超时' : (e?.message || String(e)) }
  finally { loading.value = false }

  // 花田用的贡献数据。失败不抛给用户看栈，只在日历下留一行提示
  try {
    const { days, total, activeDays } = await loadContributions()
    buildCalendar(days)
    calendarStats.value = { activeDays, total }
  } catch {
    contribError.value = true
  }
})
// 日历数据来自站内，setup 阶段就铺好了 —— 这里不再有任何外部请求

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') pickedRepo.value = null
})
</script>

<style scoped>
.projects-page { width: 100%; height: 100%; overflow: hidden; position: relative; }
.bg-fixed { position: fixed; inset: 0; background-size: cover; background-position: center 30%; z-index: 0; }
.fog-layer { position: fixed; inset: 0; z-index: 1; pointer-events: none; }

.scroller { position: relative; z-index: 2; width: 100%; height: 100%; overflow-y: auto; }

.hero { width: 100%; height: 77vh; position: relative; box-sizing: border-box; }
.hero-content { position: absolute; top: 25vh; left: 50%; transform: translateX(-50%); text-align: center; transition: all 0.4s ease; }
.hero-content.sticky { position: sticky; top: 0; left: auto; transform: none; padding: 14px 0; }
.hero-content.sticky .hero-title { font-size: 1.4rem; letter-spacing: 6px; color: #1a1a1a; text-shadow: none; font-style: normal; font-family: inherit; font-weight: 400; }
.hero-content.sticky .hero-sub { display: none; }
.hero-title { font-size: 3.2rem; font-weight: 200; letter-spacing: 12px; color: #fff; font-family: 'Georgia','Times New Roman',serif; font-style: italic; text-shadow: 0 0 40px rgba(180,160,220,0.5), 0 2px 12px rgba(0,0,0,0.5); margin: 0; }
.hero-sub { margin-top: 14px; font-size: 0.82rem; color: rgba(255,255,255,0.6); letter-spacing: 6px; font-weight: 300; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }

.search-zone { max-width: 520px; width: calc(100% - 48px); position: absolute; top: 42vh; left: 50%; transform: translateX(-50%); z-index: 3; transition: max-width 0.4s ease; }
.search-zone.active { position: relative; top: auto; left: auto; transform: none; max-width: 720px; margin: 48px auto 0; }
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; padding-left: 14px; }
.tool-search { position: relative; }
.tool-search input { width: 100%; padding: 10px 38px 10px 14px; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.12); border-radius: 14px; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-size: 0.85rem; color: #000; letter-spacing: 1px; outline: none; box-shadow: 0 4px 16px rgba(60,40,90,0.08); transition: border-color 0.35s, box-shadow 0.35s; }
.tool-search input::placeholder { color: rgba(91,63,211,0.35); letter-spacing: 2px; }
.tool-search input:focus { border-color: rgba(91,63,211,0.4); box-shadow: 0 0 0 4px rgba(91,63,211,0.08); }
.tool-search .search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0.35; cursor: pointer; transition: 0.2s; color: #555; display: flex; align-items: center; }
.tool-search .search-icon:hover { opacity: 0.7; color: #5B3FD3; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: #555; cursor: pointer; transition: 0.2s; }
.search-clear:hover { color: #1a1a1a; }

.filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.ftag { padding: 5px 14px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.1); background: rgba(255,255,255,0.4); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); font-size: 0.78rem; color: #222; cursor: pointer; letter-spacing: 1px; transition: 0.2s; }
.ftag:hover, .ftag.active { background: rgba(91,63,211,0.2); border-color: rgba(91,63,211,0.35); color: #5B3FD3; }

.calendar-section { --cell: 13px; --gap: 3px; max-width: 720px; margin: -20vh auto 0; padding: 0 24px 16px; min-height: 30vh; transition: opacity 0.5s; }
.container { max-width: 960px; width: min(960px, calc(100vw - 48px)); margin: 0 auto; padding: 24px 0 60px; transition: opacity 0.5s; min-height: 60vh; }
.cal-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.cal-label { font-size: 0.82rem; color: rgba(255,255,255,0.7); letter-spacing: 2px; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
.cal-count { font-size: 1.1rem; color: #fff; font-weight: 600; letter-spacing: 1px; text-shadow: 0 0 10px rgba(91,63,211,0.6), 0 1px 4px rgba(0,0,0,0.5); }
.cal-month-labels { display: grid; grid-template-columns: repeat(53, calc(var(--cell) + var(--gap))); column-gap: 0; justify-content: center; margin-bottom: 2px; }
.cal-ml { font-size: 0.6rem; color: rgba(255,255,255,0.35); text-align: left; padding-left: 12px; }
.cal-ml.empty { visibility: hidden; }
.cal-body { display: flex; align-items: flex-start; justify-content: center; gap: 8px; }
.cal-day-labels { display: grid; grid-template-rows: repeat(7, var(--cell)); gap: var(--gap); flex-shrink: 0; }
.cal-day-labels span { width: var(--cell); height: var(--cell); font-size: 0.55rem; color: rgba(255,255,255,0.35); display: flex; align-items: center; line-height: 1; }
.cal-grid { display: grid; grid-template-columns: repeat(53, var(--cell)); grid-template-rows: repeat(7, var(--cell)); grid-auto-flow: column; gap: var(--gap); justify-content: center; }
.cal-day { position: relative; }
.cal-day::after { content: attr(data-tip); position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); white-space: nowrap; font-size: 0.72rem; color: #fff; background: rgba(30,20,50,0.85); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); padding: 4px 10px; border-radius: 6px; pointer-events: none; opacity: 0; transition: opacity 0.15s ease; transition-delay: 0.6s; z-index: 10; letter-spacing: 0.5px; }
.cal-day:hover::after { opacity: 1; }
/* 有产出的日子 = 一朵鸢尾。
   花画在 ::before 上，不画在 .cal-day 本身 —— 因为 mask 会把元素连同它的
   ::after（悬停提示框）一起裁掉，那样提示永远看不见。::before / ::after
   是两个独立伪元素，mask 掉一个不影响另一个。 */
.cal-day.l1::before, .cal-day.l2::before, .cal-day.l3::before, .cal-day.l4::before,
.leg-box.l1::before, .leg-box.l2::before, .leg-box.l3::before, .leg-box.l4::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--iris);
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center; mask-position: center;
  -webkit-mask-size: var(--bloom-size); mask-size: var(--bloom-size);
}
/* 尺寸梯度拉得很开是刻意的：相邻两档在 13px 的格子里必须能看出差别。
   末档超过 100% 是有意的 —— 花开满时可以稍微溢到格子的间隙里。
   实际画出来的花约为 mask 尺寸的 94%（SVG 留了防裁切的边距）。
   L1 起点不低，因为一年里大部分日子只提交几次，那些花不能被淹掉。 */
.cal-day.l1::before, .leg-box.l1::before { --bloom-size: 48%;  -webkit-mask-image: url('../assets/iris-1.svg'); mask-image: url('../assets/iris-1.svg'); }
.cal-day.l2::before, .leg-box.l2::before { --bloom-size: 70%;  -webkit-mask-image: url('../assets/iris-2.svg'); mask-image: url('../assets/iris-2.svg'); }
.cal-day.l3::before, .leg-box.l3::before { --bloom-size: 92%;  -webkit-mask-image: url('../assets/iris-3.svg'); mask-image: url('../assets/iris-3.svg'); }
.cal-day.l4::before, .leg-box.l4::before { --bloom-size: 118%; -webkit-mask-image: url('../assets/iris-4.svg'); mask-image: url('../assets/iris-4.svg'); }

/* 空日不弹提示框 —— 否则 data-tip 是空串，会渲染成一个空方块 */
.cal-day.empty::after { content: none; }

/* 空日：一颗几乎看不见的土点，而不是一个方块 —— 田野本来就该有空地 */
.cal-day.empty::before, .leg-box.empty::before {
  content: '';
  position: absolute; left: 50%; top: 50%;
  width: 2px; height: 2px; margin: -1px 0 0 -1px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
}

/* 滚到日历区后，花一朵接一朵地开（--i 是该朵在全年中的次序） */
@keyframes bloom {
  from { opacity: 0; transform: scale(0.2); }
  to   { opacity: 1; transform: scale(1); }
}
/* 动的是 ::before（花本身），不是格子 —— 格子上的 transform 会拖累提示框。
   backwards 只在开演前压住初始态，跑完就把 transform 还回去。 */
.calendar-section.bloomed .cal-day:not(.empty)::before {
  animation: bloom 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  /* 上限封在 18：一年可能有三四十朵花，不封顶最后一朵要等两秒多 */
  animation-delay: calc(min(var(--i, 0), 18) * 45ms);
}

/* --iris 给图例里的四朵花用；图例讲的是「开了多大」，所以四朵同色 */
.cal-legend { --iris: #8B6FE8; display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 8px; }
.leg-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
.leg-box { width: var(--cell); height: var(--cell); position: relative; }

/* 拉不到数据时给一句话，别让人对着一片空白猜是不是坏了 */
.cal-error { margin: 6px 0 0; text-align: right; font-size: 0.72rem; color: rgba(255,255,255,0.45); letter-spacing: 1px; }

.loading-state, .error-state { text-align: center; padding: 48px 0; color: #444; letter-spacing: 2px; }
.error-state a { display: inline-block; margin-top: 10px; color: #5B3FD3; }
.result-hint { text-align: center; font-size: 0.82rem; color: #444; letter-spacing: 2px; margin-bottom: 18px; }

.repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
.repo-card { position: relative; display: flex; flex-direction: column; text-decoration: none; color: inherit; padding: 22px 20px 18px; border-radius: var(--radius-soft); max-width: 420px; background: linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(245,242,255,0.22) 100%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.45); box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(60,40,90,0.12), 0 1px 0 rgba(255,255,255,0.6) inset; opacity: 0; transform: translateY(20px); animation: cardIn 0.5s ease forwards; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.repo-card:hover { background: linear-gradient(135deg, rgba(255,255,255,0.44) 0%, rgba(248,245,255,0.32) 100%); box-shadow: 0 8px 16px rgba(0,0,0,0.08), 0 20px 56px rgba(60,40,90,0.22), 0 1px 0 rgba(255,255,255,0.8) inset; transform: translateY(-6px); border-color: rgba(91,63,211,0.3); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.repo-card.picked { transform: translateY(-6px) scale(1.01) !important; border: 1.5px solid rgba(255,255,255,0.6) !important; box-shadow: 0 8px 32px rgba(60,40,90,0.2) !important; backdrop-filter: blur(16px) brightness(1.15) !important; -webkit-backdrop-filter: blur(16px) brightness(1.15) !important; background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(248,245,255,0.38) 100%) !important; }
.repo-card.dimmed { opacity: 0.45; filter: blur(1.5px); }
.repo-card.dimmed:hover { transform: none; box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(60,40,90,0.12), 0 1px 0 rgba(255,255,255,0.6) inset; border-color: rgba(255,255,255,0.45); }
@keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
.repo-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.repo-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.repo-pulse { position: absolute; top: 12px; right: 14px; width: 7px; height: 7px; border-radius: 50%; background: #4fc08d; box-shadow: 0 0 6px rgba(79,192,141,0.5); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
.repo-name { font-size: 1rem; font-weight: 600; color: #1a1a1a; letter-spacing: 1px; transition: color 0.25s; }
.repo-card:hover .repo-name { color: #5B3FD3; }
.repo-slug { font-size: 0.65rem; color: #666; letter-spacing: 1px; flex: 1; }
.repo-lang { font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(91,63,211,0.1); color: #5B3FD3; letter-spacing: 1px; font-weight: 600; }
.repo-desc { font-size: 0.85rem; color: #333; line-height: 1.7; flex: 1; }
.repo-meta { margin-top: 12px; display: flex; align-items: center; gap: 16px; font-size: 0.76rem; color: #555; }
.repo-line { position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(91,63,211,0.12), transparent); }

.end-cap { text-align: center; padding: 60px 0 40px; color: rgba(100,80,140,0.3); font-size: 0.78rem; letter-spacing: 4px; }

@media (max-width: 860px) { .hero-title { font-size: 2rem; } }
@media (max-width: 540px) { .repo-grid { grid-template-columns: 1fr; } .calendar-section { --cell: 8px; --gap: 2px; } }
</style>
