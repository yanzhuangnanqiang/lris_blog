<template>
  <div class="projects-page" :class="{ enter: entered }">
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

      <section v-if="!searchActive" class="calendar-section" :class="{ bloomed }">
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

      <!-- ===== 项目展示 =====
           卡片就是普通内容：一次性全部呈现 —— 不 pin、不进滚动进度、不做入场动画。
           卡片不是链接：跳转链接在点开的面板里（<a> 里不能套 <a>）。
           卡片是 role="button"，回车/空格开面板；Esc 或点外面收起。 -->
      <section v-if="showcaseRepos.length" class="works">
        <div class="panels">
          <div
            v-for="(repo, i) in showcaseRepos"
            :key="repo.id"
            class="panel"
            :class="{ active: expandedId === repo.id }"
            role="button"
            tabindex="0"
            :aria-label="`${displayName(repo)}，回车查看详情`"
            @click="openExpand(repo)"
            @keydown.enter.prevent="openExpand(repo)"
            @keydown.space.prevent="openExpand(repo)"
          >
            <img :src="showcaseArt[i % showcaseArt.length]" alt="" />

            <!-- 常显：序号 + 项目名 -->
            <span class="pcopy">
              <span class="pno">0{{ i + 1 }}</span>
              <span class="pname">{{ displayName(repo) }}</span>
            </span>

            <!-- 悬停/聚焦时浮出的轻量信息；详情点开面板看 -->
            <span class="pinfo">
              <span v-if="repo.language" class="plang" :style="{ '--dot': langColor(repo.language) }">{{ repo.language }}</span>
              <span>{{ starSymbol(repo.stargazers_count) }} {{ repo.stargazers_count }}</span>
              <span class="pmore">点开看详情</span>
            </span>
          </div>
        </div>

        <p v-if="repoSearch || filterLangs.length" class="works-hint">
          {{ filteredRepos.length ? `找到 ${filteredRepos.length} 个项目` : '没有匹配的项目' }}
        </p>
        <p v-if="filteredRepos.length > SHOWCASE_MAX" class="works-hint dim">
          还有 {{ filteredRepos.length - SHOWCASE_MAX }} 个仓库 ·
          <a :href="GITHUB_URL" target="_blank" rel="noreferrer">去 GitHub →</a>
        </p>

        <!-- 点开的面板：fixed 定位，居中盖在屏幕上 -->
        <div v-if="expandedRepo" class="exp-mask" @click="closeExpand">
          <div class="expand" @click.stop>
            <button class="exp-close" aria-label="关闭" @click="closeExpand">✕</button>
            <div class="exp-art" :style="{ backgroundImage: `url(${artFor(expandedIndex)})` }"></div>
            <div class="exp-main">
              <h3 class="exp-name">{{ displayName(expandedRepo) }}</h3>
              <p class="exp-desc">{{ expandedRepo.description || '暂无描述' }}</p>
              <dl class="exp-meta">
                <div><dt>语言</dt><dd>{{ expandedRepo.language || '—' }}</dd></div>
                <div><dt>Star</dt><dd>{{ expandedRepo.stargazers_count }}</dd></div>
                <div><dt>Fork</dt><dd>{{ expandedRepo.forks_count }}</dd></div>
                <div><dt>协议</dt><dd>{{ expandedRepo.license?.spdx_id || '—' }}</dd></div>
                <div><dt>最近更新</dt><dd>{{ expandedRepo.updated_at.slice(0, 10) }}</dd></div>
              </dl>
              <a class="exp-link" :href="expandedRepo.html_url" target="_blank" rel="noreferrer">打开 GitHub →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== 数据状态 =====
           卡片是这页唯一的项目入口，所以这几种态都不能是空白：
           加载中 / 拉取失败 / 拉到 0 个 / 筛不出结果。 -->
      <section v-if="!showcaseRepos.length" class="static-works">
        <p v-if="loading" class="sw-state">加载中…</p>

        <template v-else-if="error">
          <p class="sw-state">拉取失败：{{ error }}</p>
          <a class="sw-link" href="https://github.com/yanzhuangnanqiang" target="_blank" rel="noreferrer">直接访问 GitHub →</a>
        </template>

        <p v-else-if="!repos.length" class="sw-state">暂时没有可展示的项目</p>
        <p v-else-if="!filteredRepos.length" class="sw-state">没有匹配的项目</p>

        <ul v-else class="sw-list">
          <li v-for="repo in filteredRepos" :key="repo.id">
            <a class="sw-item" :href="repo.html_url" target="_blank" rel="noreferrer">
              <span class="sw-top">
                <span class="sw-name">{{ displayName(repo) }}</span>
                <span v-if="repo.language" class="plang" :style="{ '--dot': langColor(repo.language) }">{{ repo.language }}</span>
              </span>
              <span class="sw-desc">{{ repo.description || '暂无描述' }}</span>
              <span class="sw-meta">
                <span>{{ starSymbol(repo.stargazers_count) }} {{ repo.stargazers_count }}</span>
                <span>⑂ {{ repo.forks_count }}</span>
                <span v-if="repo.license">{{ repo.license.spdx_id }}</span>
                <span>{{ repo.updated_at.slice(0, 10) }}</span>
              </span>
            </a>
          </li>
        </ul>
      </section>

      <!-- ===== 项目总简介 =====
           注意这和「每个项目的信息」是两回事：那个在卡片的面板里，这个是你对所有项目的一段总述。
           普通一节，下翻到就能读，不 pin、不翻转。
           ★ 文字在 src/data/projectIntro.js —— 改那个文件就够了，不用动这里。 -->
      <section class="project-intro">
        <h2 class="pi-title">{{ projectIntro.title }}</h2>

        <p v-for="(para, i) in projectIntro.paragraphs" :key="i" class="pi-text">{{ para }}</p>

        <dl v-if="projectStats" class="pi-stats">
          <div><dt>仓库</dt><dd>{{ projectStats.count }}</dd></div>
          <div><dt>Star</dt><dd>{{ projectStats.stars }}</dd></div>
          <div><dt>语言</dt><dd>{{ projectStats.langs }}</dd></div>
          <div><dt>最近更新</dt><dd>{{ projectStats.latest }}</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import xinliBg from '@/assets/optimized/xinli.webp'
import { loadContributions, irisColorOf } from '@/data/contributions'
import { projectIntro } from '@/data/projectIntro'
import { showcaseArt } from '@/data/showcaseCards'
import { useReveal } from '@/composables/useReveal'

const repos = ref([])
const loading = ref(true)
const error = ref('')
const scrollerRef = ref(null)
const scrollPct = ref(0)
const repoSearch = ref('')
const filterLangs = ref([])
const searchActive = ref(false)
const scrollingByCode = ref(false)

// 进场自动播的开关：onMounted 置 true，CSS 里靠 .enter 启动那三下浮现
const entered = ref(false)

// 滚进视口时逐条浮现（复用项目里现成的封装，root 已指向本页的 .scroller）
const { reveal } = useReveal(scrollerRef)

function revealOnScreen() {
  const scope = scrollerRef.value ?? document
  reveal('.calendar-section', { scope })
  reveal('.panels', { scope })
}

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

/* ==================== 项目展示 ====================
   卡片就是普通内容：一次性全部呈现 —— 不进滚动进度、不 pin、不做入场动画。
   （曾经按文章那样做成"滚动到某个进度才解锁"，结果是搜完看不到结果、卡片一闪而过。
     内容不该被绑在滚动上。）花田那边有自己的 pin，量测在下面，两边互不相干。 */

/** 一次最多摆几张卡（多出来的用下面那行提示指去 GitHub）。 */
const SHOWCASE_MAX = 5
const GITHUB_URL = 'https://github.com/yanzhuangnanqiang'

/** 展示哪几个项目：搜索/筛选之后的**前 5 个**（repos 已按 updated 倒序）。
 *  筛选作用在这里，所以搜索结果是立刻生效的 —— 不再需要滚到某个进度才解锁。 */
const showcaseRepos = computed(() => filteredRepos.value.slice(0, SHOWCASE_MAX))

/** 点击卡片后展开的那个面板看的是哪个仓库 */
const expandedId = ref(null)
const expandedRepo = computed(() => showcaseRepos.value.find(r => r.id === expandedId.value) ?? null)
const expandedIndex = computed(() => showcaseRepos.value.findIndex(r => r.id === expandedId.value))

const artFor = i => showcaseArt[Math.max(0, i) % showcaseArt.length]

function openExpand(repo) {
  expandedId.value = expandedId.value === repo.id ? null : repo.id
}
function closeExpand() {
  expandedId.value = null
}
/** Esc 关闭面板（挂在 window 上，不用卡片自己抢焦点） */
function onKeydown(e) {
  if (e.key === 'Escape' && expandedId.value) closeExpand()
}

/** 结尾那段的数字总结。全部从已有的 repos 上算，不新增请求。 */
const projectStats = computed(() => {
  const list = repos.value
  if (!list.length) return null
  return {
    count: list.length,
    stars: list.reduce((n, r) => n + r.stargazers_count, 0),
    langs: new Set(list.map(r => r.language).filter(Boolean)).size,
    latest: list.map(r => r.updated_at).sort().at(-1)?.slice(0, 10) ?? '',
  }
})

// 换一批卡（搜索/筛选）时，把点开的面板收起来 —— 否则面板里指向的可能已经不是这一批了
watch(showcaseRepos, () => { expandedId.value = null })

/* 花田的花开：进视口时触发一次。
   以前是拿「全页滚动比例 > 0.25」算的 —— 页面一变长就不准，那个坑踩过。 */
let bloomIO = null
function armBloom() {
  bloomIO?.disconnect()
  const el = scrollerRef.value?.querySelector('.calendar-section')
  if (!el) return
  bloomIO = new IntersectionObserver(
    entries => {
      if (!entries.some(e => e.isIntersecting)) return
      bloomed.value = true
      bloomIO.disconnect()
    },
    { root: scrollerRef.value, threshold: 0, rootMargin: '0px 0px -15% 0px' }
  )
  bloomIO.observe(el)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // 进场自动播：标题 → 副标题 → 搜索栏展开。同步置位，免得先画一帧完整内容再"跳"回隐藏态
  entered.value = true
  nextTick(() => {
    revealOnScreen()
    armBloom()
  })
})

// 花田是 v-if 的（搜索时会被拔掉）、卡片要等仓库拉回来 → 每次显隐都重新武装一次
watch([searchActive, showcaseRepos], () => {
  nextTick(() => {
    revealOnScreen()
    if (!searchActive.value) armBloom()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  bloomIO?.disconnect()
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

/* ===== 进场自动播 =====
   驱动力是「时间」不是「滚动」：进页面就依次浮现，不用滚。
   用独立的 translate 属性（不是 transform）—— .hero-content 自己有 transform: translateX(-50%)，
   用 transform 会被动画覆盖掉，translate 和它各自生效。 */
.projects-page.enter .hero-title { animation: enterUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0s both; }
.projects-page.enter .hero-sub { animation: enterUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
.projects-page.enter .search-zone { animation: enterUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }
/* 搜索栏「从窄条展开」：最大宽度用 px→px 才插值得动（56px → 和 .search-zone 同宽） */
.projects-page.enter .tool-search { animation: searchOpen 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }

@keyframes enterUp {
  from { opacity: 0; translate: 0 14px; }
  to { opacity: 1; translate: 0 0; }
}
@keyframes searchOpen {
  from { max-width: 56px; opacity: 0.4; }
  to { max-width: 520px; opacity: 1; }
}

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

/* 花田独占一屏、内容居中 —— 滚到这里，这一屏就是花田。
   透明度的淡入由模板上的行内样式驱动（跟着滚动比例走）。 */
.calendar-section {
  --cell: 13px;
  --gap: 3px;
  max-width: 720px;
  width: calc(100% - 48px);
  margin: 0 auto;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
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
  animation-delay: calc(min(var(--i, 0), 10) * 30ms);
}

/* --iris 给图例里的四朵花用；图例讲的是「开了多大」，所以四朵同色 */
.cal-legend { --iris: #8B6FE8; display: flex; align-items: center; justify-content: flex-end; gap: 3px; margin-top: 8px; }
.leg-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
.leg-box { width: var(--cell); height: var(--cell); position: relative; }

/* 拉不到数据时给一句话，别让人对着一片空白猜是不是坏了 */
.cal-error { margin: 6px 0 0; text-align: right; font-size: 0.72rem; color: rgba(255,255,255,0.45); letter-spacing: 1px; }

/* ===== 静态兜底：reduced-motion / 加载中 / 拉取失败 / 筛不出结果 =====
   展示区是这页唯一的项目入口，所以这几种态都不能留白。
   reduced-motion 走的就是这份列表 —— 不依赖动画，顺带能看全（不被 5 张的上限卡着）。 */
.static-works {
  max-width: 900px;
  width: calc(100% - 48px);
  margin: 0 auto;
  padding: 40px 0 80px;
}

.sw-state {
  padding: 40px 0;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

.sw-link { display: block; margin-top: 10px; text-align: center; font-size: 0.85rem; letter-spacing: 1px; color: rgba(255, 255, 255, 0.85); }

.sw-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }

.sw-item {
  display: block;
  padding: 16px 18px;
  border-radius: var(--radius-soft, 12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
  text-decoration: none;
  transition: background 0.25s, border-color 0.25s;
}
.sw-item:hover, .sw-item:focus-visible {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.4);
}

.sw-top { display: flex; align-items: center; gap: 10px; }
.sw-name { font-size: 0.95rem; font-weight: 600; letter-spacing: 1px; color: #fff; }
.sw-desc { display: block; margin: 6px 0 10px; font-size: 0.82rem; line-height: 1.7; color: rgba(255, 255, 255, 0.72); }
.sw-meta { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.72rem; color: rgba(255, 255, 255, 0.5); }

/* ===== 项目总简介 =====
   普通一节：不 pin、不翻转，下翻到就能读。
   注意它和「每个项目的信息」（卡片面板里那份）是两回事。 */
.project-intro {
  position: relative;
  z-index: 2;
  max-width: 720px;
  width: calc(100% - 48px);
  margin: 0 auto;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 0;
}

.pi-title {
  margin: 0 0 24px;
  font-size: 1rem;
  font-weight: 300;
  letter-spacing: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.pi-text {
  margin: 0 0 16px;
  font-size: 0.86rem;
  line-height: 2;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.78);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
}

.pi-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 22px 40px;
  margin: 38px 0 0;
  padding: 24px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.pi-stats > div { text-align: left; }
.pi-stats dt { font-size: 0.68rem; letter-spacing: 3px; color: rgba(255, 255, 255, 0.45); }
.pi-stats dd { margin: 6px 0 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 1.5rem; color: #fff; }

/* ==================== 项目展示：滚动叙事 ====================
   长容器提供滚动距离，舞台 sticky 固定在视口里。
   360vh 是「时间轴的可用长度」，不是动画时长；真正可用的滚动距离 = 容器高 − 视口高。 */
/* ===== 项目展示 =====
   也独占一屏、内容居中。卡片一次性完整展示 ——
   不 pin、不进滚动进度、不做入场动画：滚到这一屏，五张卡就是齐的。 */
.works {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  width: calc(100% - 48px);
  margin: 0 auto;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 0;
}

/* ---- 卡 ---- */
.panels {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(10px, 1.6vw, 22px);
}

.panel {
  display: block;
  position: relative;
  margin: 0;
  width: clamp(140px, 17vw, 220px);
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.panel:hover { transform: translateY(-6px); box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55); }

/* 键盘走到卡片时给焦点环 —— 回车能打开详情面板 */
.panel:focus-visible { outline: 2px solid rgba(255, 255, 255, 0.8); outline-offset: 3px; }

.panel img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms ease-out;   /* 照 Aemeath PhotoCard 的 group-hover:scale-105 */
}
.panel:hover img { transform: scale(1.05); }

/* 常显：序号 + 项目名 */
.pcopy {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 30px 12px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78), transparent);
}

.pno {
  display: block;
  margin-bottom: 5px;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 0.68rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.55);
}

.pname {
  display: block;
  overflow: hidden;
  font-size: 0.78rem;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.94);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- 悬停/聚焦浮出的轻量信息（语言 + ★ + 一句提示）。
       完整的信息（描述/时间/fork/协议/链接）在点开的面板里 —— 那里才是手机也能到的路径。 ---- */
.pinfo {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 10px;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(8, 10, 14, 0.78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  transition: opacity 260ms ease;
}
.panel:hover .pinfo,
.panel:focus-within .pinfo { opacity: 1; }

.pmore { color: rgba(255, 255, 255, 0.5); font-size: 0.64rem; }

/* 语言前面那颗小圆点，取该语言的品牌色 */
.plang { display: inline-flex; align-items: center; gap: 4px; }
.plang::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--dot, #888);
}

/* ---- 搜索反馈 / 截断提示：放在舞台里，pin 住的那段时间也看得到 ---- */
.works-hint {
  margin: 20px 0 0;
  text-align: center;
  font-size: 0.78rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
.works-hint.dim { font-size: 0.72rem; color: rgba(255, 255, 255, 0.55); }
.works-hint.dim a { color: rgba(255, 255, 255, 0.85); }

/* ---- 点开的面板 ----
   fixed 定位：居中盖在屏幕上，不参与卡片布局 —— 其他卡不动。 */
.exp-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 10, 0.55);
  animation: expIn 0.22s ease both;
}
@keyframes expIn { from { opacity: 0; } to { opacity: 1; } }

.expand {
  position: relative;
  display: flex;
  gap: 26px;
  width: min(720px, 88%);
  max-height: 74svh;
  overflow: auto;
  padding: 26px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(12, 15, 20, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  animation: expGrow 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes expGrow { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.exp-close {
  position: absolute;
  top: 12px; right: 12px;
  width: 30px; height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.exp-close:hover { background: rgba(0, 0, 0, 0.55); color: #fff; }

.exp-art {
  flex: 0 0 200px;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
}

.exp-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.exp-name { margin: 0 0 10px; font-size: 1.1rem; font-weight: 600; letter-spacing: 1px; color: #fff; }
.exp-desc { margin: 0 0 18px; font-size: 0.84rem; line-height: 1.85; letter-spacing: 0.5px; color: rgba(255, 255, 255, 0.78); }

.exp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  margin: 0 0 20px;
  padding: 16px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.exp-meta dt { font-size: 0.64rem; letter-spacing: 3px; color: rgba(255, 255, 255, 0.42); }
.exp-meta dd { margin: 5px 0 0; font-size: 0.9rem; color: #fff; }

.exp-link {
  margin-top: auto;
  align-self: flex-start;
  font-size: 0.82rem;
  letter-spacing: 1px;
  color: #fff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding-bottom: 2px;
  transition: border-color 0.2s;
}
.exp-link:hover { border-color: #fff; }

/* ---- 快门：两条竖横幅，竖图被放大裁成竖条 ---- */

/* 关掉动效的用户：进场直接是终态，不播 */
@media (prefers-reduced-motion: reduce) {
  .projects-page.enter .hero-title,
  .projects-page.enter .hero-sub,
  .projects-page.enter .search-zone,
  .projects-page.enter .tool-search { animation: none; }
}

@media (max-width: 860px) { .hero-title { font-size: 2rem; } }
@media (max-width: 640px) {
  /* 点开的面板在窄屏上堆成一栏 */
  .expand { flex-direction: column; gap: 16px; padding: 20px; }
  .exp-art { flex: none; width: 100%; max-width: 190px; aspect-ratio: 1 / 1; }
}

@media (max-width: 540px) { .calendar-section { --cell: 8px; --gap: 2px; } }
</style>
