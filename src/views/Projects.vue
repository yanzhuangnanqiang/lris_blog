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

      <section v-if="!searchActive" class="calendar-section" :style="{ opacity: 0.35 + Math.min(0.65, Math.max(0, (scrollPct - 0.05) * 3)) }">
        <div class="cal-header">
          <span class="cal-label">活动日历</span>
          <span class="cal-count">{{ calendarStats.streak }} 天 · {{ calendarStats.total }} 次</span>
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
            <div v-for="(day, idx) in calendarCells" :key="idx" class="cal-day" :class="dayClass(day)" :data-tip="day ? `${day.date} · ${day.count} 次` : ''"></div>
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
import xinliBg from '@/assets/xinli.png'

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
  'yanzhuangnanqiang': '土壤档案',
  'yanzhuangnanqiang.github.io': '林间初见',
  'My-nest': '巢',
  'My-note': '拾穗',
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
  if (q) list = list.filter(r => r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.language || '').toLowerCase().includes(q))
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
  // 下滑超一屏 或 手动滚回顶部 → 退出搜索模式
  if (searchActive.value && !scrollingByCode.value) {
    if (el.scrollTop < 20 || el.scrollTop > window.innerHeight * 1.2) {
      searchActive.value = false
    }
  }
}

const weeksCount = 53
const calendarWeeks = ref([])
const calendarCells = ref([])
const calendarStats = ref({ streak: 0, total: 0 })
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

function buildCalendar(contributions, totalFromApi) {
  const now = new Date(); now.setHours(0,0,0,0)
  const daysCount = weeksCount * 7
  const end = new Date(now); end.setDate(end.getDate() + (6 - end.getDay())); end.setHours(0,0,0,0)
  const start = new Date(end); start.setDate(end.getDate() - (daysCount - 1)); start.setHours(0,0,0,0)
  const map = {}
  contributions.forEach(c => { map[c.date] = c.count })
  const cells = []
  const weeks = []
  let cursor = new Date(start)
  for (let w = 0; w < weeksCount; w++) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const key = cursor.toISOString().slice(0, 10)
      const cell = { date: key, count: map[key] || 0 }
      week.push(cell)
      cells.push(cell)
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  let streak = 0
  for (let i = 0; ; i++) {
    const t = new Date(now); t.setDate(now.getDate() - i)
    if ((map[t.toISOString().slice(0, 10)] || 0) > 0) streak++; else break
  }
  calendarWeeks.value = weeks
  calendarCells.value = cells
  calendarStats.value = {
    streak,
    total: typeof totalFromApi === 'number' ? totalFromApi : contributions.reduce((s, c) => s + c.count, 0),
  }
}
function dayClass(day) {
  if (!day || !day.count) return 'empty'
  if (day.count <= 1) return 'l1'; if (day.count <= 3) return 'l2'; if (day.count <= 6) return 'l3'
  return 'l4'
}

async function fetchWithTimeout(url, timeout = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try { return await fetch(url, { signal: ctrl.signal }) }
  finally { clearTimeout(t) }
}

onMounted(async () => {
  try {
    const res = await fetchWithTimeout('https://api.github.com/users/yanzhuangnanqiang/repos?sort=updated&per_page=100')
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    repos.value = data.filter(r => !r.fork).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  } catch (e) { error.value = e?.name === 'AbortError' ? '请求超时' : (e?.message || String(e)) }
  finally { loading.value = false }
  try {
    const cres = await fetchWithTimeout('https://github-contributions-api.deno.dev/yanzhuangnanqiang.json')
    if (cres.ok) {
      const json = await cres.json()
      let raw = json.contributions || json
      if (Array.isArray(raw[0])) raw = raw.flat()
      const contribs = raw.map(c => ({ date: c.date, count: c.contributionCount || c.count || 0 }))
      buildCalendar(contribs, json.totalContributions)
    }
  } catch (e) { console.error('contrib fetch error:', e) }
})
</script>

<style scoped>
.projects-page { width: 100%; height: 100%; overflow: hidden; position: relative; }
.bg-fixed { position: fixed; inset: 0; background-size: cover; background-position: center 30%; z-index: 0; background-attachment: scroll; -webkit-background-size: cover; -webkit-transform: translateZ(0); transform: translateZ(0); }
.fog-layer { position: fixed; inset: 0; z-index: 1; pointer-events: none; }

.scroller { position: relative; z-index: 2; width: 100%; height: 100%; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(91,63,211,0.4) transparent; }
.scroller::-webkit-scrollbar { width: 6px; }
.scroller::-webkit-scrollbar-thumb { background: rgba(91,63,211,0.4); border-radius: 3px; }

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
.cal-day { border-radius: 2px; position: relative; }
.cal-day::after { content: attr(data-tip); position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%); white-space: nowrap; font-size: 0.72rem; color: #fff; background: rgba(30,20,50,0.85); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); padding: 4px 10px; border-radius: 6px; pointer-events: none; opacity: 0; transition: opacity 0.15s ease; transition-delay: 0.6s; z-index: 10; letter-spacing: 0.5px; }
.cal-day:hover::after { opacity: 1; }
.cal-day.empty { background: rgba(255,255,255,0.08); }
.cal-day.l1 { background: rgba(91,63,211,0.3); }
.cal-day.l2 { background: rgba(91,63,211,0.55); }
.cal-day.l3 { background: rgba(91,63,211,0.75); }
.cal-day.l4 { background: #5B3FD3; }

.cal-legend { display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 8px; }
.leg-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
.leg-box { width: var(--cell); height: var(--cell); border-radius: 2px; }
.leg-box.empty { background: rgba(255,255,255,0.08); }
.leg-box.l1 { background: rgba(91,63,211,0.3); }
.leg-box.l2 { background: rgba(91,63,211,0.55); }
.leg-box.l3 { background: rgba(91,63,211,0.75); }
.leg-box.l4 { background: #5B3FD3; }

.loading-state, .error-state { text-align: center; padding: 48px 0; color: #444; letter-spacing: 2px; }
.error-state a { display: inline-block; margin-top: 10px; color: #5B3FD3; }
.result-hint { text-align: center; font-size: 0.82rem; color: #444; letter-spacing: 2px; margin-bottom: 18px; }

.repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
.repo-card { position: relative; display: flex; flex-direction: column; text-decoration: none; color: inherit; padding: 22px 20px 18px; border-radius: var(--radius-soft); max-width: 420px; background: linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(245,242,255,0.22) 100%); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.45); box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(60,40,90,0.12), 0 1px 0 rgba(255,255,255,0.6) inset; opacity: 0; transform: translateY(20px); animation: cardIn 0.5s ease forwards; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.repo-card:hover { background: linear-gradient(135deg, rgba(255,255,255,0.44) 0%, rgba(248,245,255,0.32) 100%); box-shadow: 0 8px 16px rgba(0,0,0,0.08), 0 20px 56px rgba(60,40,90,0.22), 0 1px 0 rgba(255,255,255,0.8) inset; transform: translateY(-6px); border-color: rgba(91,63,211,0.3); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.repo-card.picked { transform: translateY(-6px) scale(1.01) !important; border: 1.5px solid rgba(255,255,255,0.6) !important; box-shadow: 0 8px 32px rgba(60,40,90,0.2) !important; backdrop-filter: blur(16px) brightness(1.15) !important; -webkit-backdrop-filter: blur(16px) brightness(1.15) !important; background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(248,245,255,0.38) 100%) !important; }
.repo-card.dimmed { opacity: 0.45; filter: blur(1.5px); pointer-events: none; }
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
