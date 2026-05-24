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
          <span class="cal-count">{{ calendarStats.streak }} 天</span>
        </div>
        <div class="cal-grid">
          <div v-for="(week, wi) in calendarWeeks" :key="wi" class="cal-week">
            <div v-for="(day, di) in week" :key="di" class="cal-day" :class="dayClass(day)" :title="day?.date"></div>
          </div>
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
            <a v-for="(repo, i) in filteredRepos" :key="repo.id" class="repo-card" :href="repo.html_url" target="_blank" rel="noreferrer" :style="{ animationDelay: `${i * 60}ms` }">
              <div class="repo-top">
                <span class="repo-name">{{ displayName(repo) }}</span>
                <span class="repo-slug">{{ repo.name }}</span>
                <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
              </div>
              <div class="repo-desc">{{ repo.description || '暂无描述' }}</div>
              <div class="repo-meta">
                <span>★ {{ repo.stargazers_count }}</span>
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

// 搜索激活时，滚到搜索栏置顶
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

const calendarWeeks = ref([])
const calendarStats = ref({ streak: 0 })

function buildCalendar(contributions) {
  const weeks = []; let week = []
  const now = new Date()
  const start = new Date(now); start.setDate(start.getDate() - start.getDay() - 52 * 7)
  const map = {}
  contributions.forEach(c => { map[c.date] = c.count })
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    week.push({ date: d.toISOString().slice(0, 10), count: map[d.toISOString().slice(0, 10)] || 0 })
    if (d.getDay() === 6) { weeks.push(week); week = [] }
  }
  if (week.length) weeks.push(week)
  let streak = 0
  const sorted = contributions.filter(c => c.count > 0).map(c => c.date).sort().reverse()
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]), e = new Date(now); e.setDate(e.getDate() - i)
    if (d.toISOString().slice(0, 10) === e.toISOString().slice(0, 10)) streak++; else break
  }
  calendarStats.value = { streak }
  calendarWeeks.value = weeks
}
function dayClass(day) {
  if (!day || !day.count) return 'empty'
  if (day.count <= 2) return 'l1'; if (day.count <= 5) return 'l2'; if (day.count <= 10) return 'l3'
  return 'l4'
}

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/users/yanzhuangnanqiang/repos?sort=updated&per_page=100')
    if (!res.ok) throw new Error(`${res.status}`)
    const data = await res.json()
    repos.value = data.filter(r => !r.fork).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  } catch (e) { error.value = e?.message || String(e) }
  finally { loading.value = false }
  try {
    const cres = await fetch('https://github-contributions-api.deno.dev/yanzhuangnanqiang.json')
    if (cres.ok) buildCalendar((await cres.json()).contributions || [])
  } catch {}
})
</script>

<style scoped>
.projects-page { width: 100%; height: 100%; overflow: hidden; position: relative; }
.bg-fixed { position: fixed; inset: 0; background-size: cover; background-position: center 30%; z-index: 0; }
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

.calendar-section { max-width: 720px; margin: -20vh auto 0; padding: 0 24px 16px; min-height: 30vh; transition: opacity 0.5s; }
.container { max-width: 960px; width: min(960px, calc(100vw - 48px)); margin: 0 auto; padding: 24px 0 60px; transition: opacity 0.5s; min-height: 60vh; }
.cal-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.cal-label { font-size: 0.82rem; color: var(--text-muted); letter-spacing: 2px; }
.cal-count { font-size: 1.1rem; color: #5B3FD3; font-weight: 500; letter-spacing: 1px; }
.cal-grid { display: flex; gap: 3px; justify-content: center; }
.cal-week { display: flex; flex-direction: column; gap: 3px; }
.cal-day { width: 11px; height: 11px; border-radius: 2px; }
.cal-day.empty { background: rgba(255,255,255,0.12); }
.cal-day.l1 { background: rgba(91,63,211,0.2); }
.cal-day.l2 { background: rgba(91,63,211,0.4); }
.cal-day.l3 { background: rgba(91,63,211,0.65); }
.cal-day.l4 { background: rgba(91,63,211,0.9); }

.loading-state, .error-state { text-align: center; padding: 48px 0; color: #444; letter-spacing: 2px; }
.error-state a { display: inline-block; margin-top: 10px; color: #5B3FD3; }
.result-hint { text-align: center; font-size: 0.82rem; color: #444; letter-spacing: 2px; margin-bottom: 18px; }

.repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
.repo-card { position: relative; display: flex; flex-direction: column; text-decoration: none; color: inherit; padding: 22px 20px 18px; border-radius: var(--radius-soft); background: rgba(255,255,255,0.28); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.45); box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(60,40,90,0.12), 0 1px 0 rgba(255,255,255,0.6) inset; opacity: 0; transform: translateY(20px); animation: cardIn 0.5s ease forwards; transition: 0.3s ease; }
.repo-card:hover { background: rgba(255,255,255,0.4); box-shadow: 0 4px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(60,40,90,0.18), 0 1px 0 rgba(255,255,255,0.7) inset; transform: translateY(-3px); border-color: rgba(91,63,211,0.25); }
@keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
.repo-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.repo-name { font-size: 1rem; font-weight: 600; color: #1a1a1a; letter-spacing: 1px; }
.repo-slug { font-size: 0.65rem; color: #666; letter-spacing: 1px; flex: 1; }
.repo-lang { font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; background: rgba(91,63,211,0.1); color: #5B3FD3; letter-spacing: 1px; font-weight: 600; }
.repo-desc { font-size: 0.85rem; color: #333; line-height: 1.7; flex: 1; }
.repo-meta { margin-top: 12px; display: flex; gap: 16px; font-size: 0.76rem; color: #555; }
.repo-line { position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(91,63,211,0.12), transparent); }

.end-cap { text-align: center; padding: 60px 0 40px; color: rgba(100,80,140,0.3); font-size: 0.78rem; letter-spacing: 4px; }

@media (max-width: 860px) { .hero-title { font-size: 2rem; } }
@media (max-width: 540px) { .repo-grid { grid-template-columns: 1fr; } .cal-day { width: 8px; height: 8px; } }
</style>
