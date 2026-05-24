<template>
  <div class="share-page">
    <TopBar />
    <MusicDock />

    <div ref="scrollerRef" class="scroller" @scroll="onScroll">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg" :style="{ backgroundImage: `url(${yaolanBg})` }"></div>
        <div class="hero-content">
          <h1 class="hero-title">时光的花束</h1>
          <p class="hero-sub">收集日常的光影与碎碎念</p>
        </div>
      </section>

      <div class="container">
        <!-- 三张堆叠预览 -->
        <section class="block hidden" :class="{ visible: stackRevealed }">
          <h2 class="section-title">🖼️ 图片分享</h2>
          <div class="stack-wrapper" @click="router.push('/gallery')">
            <div class="stack-card s3"><div class="photo" :style="bg(2)"></div></div>
            <div class="stack-card s2"><div class="photo" :style="bg(1)"></div></div>
            <div class="stack-card s1"><div class="photo" :style="bg(0)"></div></div>
            <div class="stack-label">查看全部 {{ gallery.length }} 张 →</div>
          </div>
        </section>

        <!-- 计划 -->
        <section class="block hidden" :class="{ visible: stackRevealed }">
          <h2 class="section-title">🌱 花束清单</h2>
          <div class="plan-grid">
            <div class="plan-col daily">
              <div class="plan-header">
                <h3>☀️ 每日</h3>
                <span class="plan-progress" :class="{ done: dailyProgress === 7 }">{{ dailyProgress }}/7</span>
              </div>
              <div class="plan-progress-bar"><span :style="{ width: (dailyProgress / 7 * 100) + '%' }"></span></div>
              <label v-for="(t, i) in plans.daily" :key="'d'+i" class="plan-item">
                <input type="checkbox" v-model="dailyDone[i]" />
                <span class="plan-checkbox"></span>
                <span class="plan-text">{{ t }}</span>
              </label>
            </div>
            <div class="plan-col weekly">
              <div class="plan-header">
                <h3>🌙 每周</h3>
                <span class="plan-progress" :class="{ done: weeklyProgress === 7 }">{{ weeklyProgress }}/7</span>
              </div>
              <div class="plan-progress-bar"><span :style="{ width: (weeklyProgress / 7 * 100) + '%' }"></span></div>
              <label v-for="(t, i) in plans.weekly" :key="'w'+i" class="plan-item">
                <input type="checkbox" v-model="weeklyDone[i]" />
                <span class="plan-checkbox"></span>
                <span class="plan-text">{{ t }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- 说说 -->
        <section class="block hidden" :class="{ visible: stackRevealed }">
          <h2 class="section-title">💬 说说</h2>

          <div class="search-area">
            <div class="cal-wrap">
              <button class="cal-trigger" :class="{ active: calOpen || selectedMonth }" @click="calOpen = !calOpen">
                📅 {{ calYear }}年{{ calMonth + 1 }}月 ▾
              </button>
              <div v-if="calOpen" class="cal-float">
                <div class="cal-nav">
                  <button @click="changeCalMonth(-1)">◂</button>
                  <span class="cal-nav-label" :class="{ active: isMonthFiltered }" @click="toggleMonthFilter">{{ calYear }}年{{ calMonth + 1 }}月</span>
                  <button @click="changeCalMonth(1)">▸</button>
                </div>
                <div class="cal-grid">
                  <span v-for="d in '日一二三四五六'" :key="d" class="cal-dow">{{ d }}</span>
                  <span
                    v-for="(d, i) in calDays"
                    :key="i"
                    class="cal-day"
                    :class="{ empty: !d, has: d && hasEntry(calYear, calMonth + 1, d) }"
                    @click="d && hasEntry(calYear, calMonth + 1, d) && scrollToDate(calYear, calMonth + 1, d)"
                  >{{ d || '' }}</span>
                </div>
              </div>
            </div>
            <div class="search-box">
              <input v-model="searchQuery" @input="onSearchInput" @keyup.enter="searchActive = true" @focus="searchActive = true" type="text" placeholder="搜索标签或内容..." />
              <span v-if="searchQuery" class="search-clear" @click="searchQuery = ''; searchActive = false">✕</span>
              <span v-else class="search-icon" @click="searchActive = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>
          </div>

          <div class="journal" v-for="day in visibleJournal" :key="day.date" :data-month="day.date.slice(0, 7)">
            <div class="day-head" :data-date="day.date">
              <span class="day-dot"></span>
              <span class="day-label">{{ day.date }}</span>
            </div>
            <div class="day-cards">
              <div
                v-for="(item, j) in day.items" :key="j"
                class="jcard"
                :class="{ expanded: expandedId === `${day.date}-${j}` }"
                @click="toggleExpand(`${day.date}-${j}`)"
              >
                <div v-if="expandedId === `${day.date}-${j}`" class="jc-date">{{ day.date }}</div>
                <div class="jc-tag">{{ item.tag }}</div>
                <p class="jc-text">{{ item.text }}</p>
                <div v-if="item.photoSrcs.length" class="jc-photos" :class="{ wide: expandedId === `${day.date}-${j}` }">
                  <img v-for="(src, k) in item.photoSrcs" :key="k" :src="src" alt="" loading="lazy" @click.stop="lightbox = src" />
                </div>
                <div v-if="expandedId === `${day.date}-${j}`" class="jc-actions">
                  <div class="jc-nav">
                    <button class="jc-nav-btn" :class="{ dim: !canExpandPrev }" @click.stop="expandPrev">← 上一篇</button>
                    <button class="jc-nav-btn" :class="{ dim: !canExpandNext }" @click.stop="expandNext">下一篇 →</button>
                  </div>
                  <button class="jc-collapse" @click.stop="expandedId = null">收起 ↑</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!filteredJournal.length && (searchQuery || selectedMonth)" class="empty-state">
            <span class="empty-icon">🌿</span>
            <p>这里还没有记录</p>
          </div>

          <button v-if="hasMore" class="load-more" @click="loadMore">加载更多</button>
        </section>

        <footer class="end-cap">林间初见 · 难忘夏光</footer>
      </div>

      <button v-if="showBackTop" class="back-top" @click="scrollToTop">↑</button>
    </div>

    <div v-if="lightbox" class="lightbox" @click="lightbox = null">
      <div class="lightbox-inner" @click.stop>
        <img :src="lightbox" alt="" />
        <button class="lb-close" @click="lightbox = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import { gallery, plans, lifeJournal } from '@/data/shares'
import yaolanBg from '@/assets/yaolan.jpg'

const router = useRouter()
function loadChecks(key, len) {
  try { const arr = JSON.parse(localStorage.getItem(key)); if (Array.isArray(arr) && arr.length === len) return arr } catch {}
  return Array(len).fill(false)
}
const dailyDone = ref(loadChecks('plan-daily', plans.daily.length))
const weeklyDone = ref(loadChecks('plan-weekly', plans.weekly.length))
watch(dailyDone, v => localStorage.setItem('plan-daily', JSON.stringify(v)), { deep: true })
watch(weeklyDone, v => localStorage.setItem('plan-weekly', JSON.stringify(v)), { deep: true })
const dailyProgress = computed(() => dailyDone.value.filter(Boolean).length)
const weeklyProgress = computed(() => weeklyDone.value.filter(Boolean).length)
const stackRevealed = ref(false)
const lightbox = ref(null)
const expandedId = ref(null)
const showBackTop = ref(false)
const scrollerRef = ref(null)
const calOpen = ref(false)
const calYear = ref(2026)
const calMonth = ref(4)
const searchQuery = ref('')
const searchActive = ref(false)
const selectedMonth = ref('')
const visibleCount = ref(6)

const journal = ref([...lifeJournal])

const filteredJournal = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const m = selectedMonth.value
  let result = journal.value
  if (m) result = result.filter(d => d.date.startsWith(m))
  if (q) {
    result = result.filter(day =>
      day.items.some(item =>
        item.tag.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      )
    )
  }
  return result
})

const visibleJournal = computed(() => filteredJournal.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredJournal.value.length)

function loadMore() { visibleCount.value += 6 }
function onSearchInput() { visibleCount.value = 6 }

// ---- 日历 ----
const calDays = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

const entrySet = computed(() => {
  const set = new Set()
  journal.value.forEach(d => set.add(d.date))
  return set
})

function hasEntry(y, m, d) {
  const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return entrySet.value.has(key)
}

async function scrollToDate(y, m, d) {
  const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  calOpen.value = false
  selectedMonth.value = ''
  const idx = filteredJournal.value.findIndex(day => day.date === key)
  if (idx >= 0 && visibleCount.value <= idx) visibleCount.value = idx + 3
  await nextTick()
  const el = document.querySelector(`[data-date="${key}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('flash')
    setTimeout(() => el.classList.remove('flash'), 1500)
  }
}

const currentCalMonth = computed(() =>
  `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}`
)
const isMonthFiltered = computed(() => selectedMonth.value === currentCalMonth.value)

function toggleMonthFilter() {
  selectedMonth.value = isMonthFiltered.value ? '' : currentCalMonth.value
  visibleCount.value = 6
}

function changeCalMonth(delta) {
  calMonth.value += delta
  if (calMonth.value < 0) { calMonth.value = 11; calYear.value-- }
  if (calMonth.value > 11) { calMonth.value = 0; calYear.value++ }
}

// ---- 原位展开 ----
const allFlatItems = computed(() => {
  const flat = []
  visibleJournal.value.forEach(day => {
    day.items.forEach((_, j) => flat.push({ id: `${day.date}-${j}` }))
  })
  return flat
})

function toggleExpand(id) { expandedId.value = expandedId.value === id ? null : id }

const canExpandPrev = computed(() => {
  if (!expandedId.value) return false
  return allFlatItems.value.findIndex(x => x.id === expandedId.value) > 0
})
const canExpandNext = computed(() => {
  if (!expandedId.value) return false
  const idx = allFlatItems.value.findIndex(x => x.id === expandedId.value)
  return idx >= 0 && idx < allFlatItems.value.length - 1
})

function expandPrev() {
  const idx = allFlatItems.value.findIndex(x => x.id === expandedId.value)
  if (idx > 0) expandedId.value = allFlatItems.value[idx - 1].id
}
function expandNext() {
  const idx = allFlatItems.value.findIndex(x => x.id === expandedId.value)
  if (idx >= 0 && idx < allFlatItems.value.length - 1) expandedId.value = allFlatItems.value[idx + 1].id
}

// ---- 回顶 ----
function onScroll() { showBackTop.value = scrollerRef.value?.scrollTop > 600 }
function scrollToTop() { scrollerRef.value?.scrollTo({ top: 0, behavior: 'smooth' }) }

function onDocClick(e) {
  if (calOpen.value && !e.target.closest('.cal-wrap')) calOpen.value = false
}

onMounted(() => {
  setTimeout(() => { stackRevealed.value = true }, 400)
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => { document.removeEventListener('click', onDocClick) })

function bg(i) {
  const item = gallery[i]
  return item ? { backgroundImage: `url(${item.src})` } : {}
}
</script>

<style scoped>
.share-page { width: 100%; height: 100%; overflow: hidden; position: relative; background: linear-gradient(180deg, #f8f4ff 0%, #ece0f4 40%, #d8cce8 100%); }

.scroller {
  width: 100%; height: 100%; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--mint-green) transparent;
}
.scroller::-webkit-scrollbar { width: 6px; }
.scroller::-webkit-scrollbar-thumb { background: rgba(111,66,193,0.3); border-radius: 3px; }

/* ---- Hero ---- */
.hero { width: 100%; height: 55vh; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.35)); z-index: 1; }
.hero-content { position: relative; z-index: 2; text-align: center; }
.hero-title { font-size: 2.6rem; font-weight: 500; letter-spacing: 6px; color: #fff; text-shadow: 0 0 40px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.3); margin: 0; }
.hero-sub { margin-top: 12px; font-size: 0.95rem; color: rgba(255,255,255,0.7); letter-spacing: 4px; text-shadow: 0 1px 3px rgba(0,0,0,0.25); }

/* ---- 主体 ---- */
.container { max-width: 720px; width: min(720px, calc(100vw - 48px)); margin: 0 auto; padding: 50px 0 40px; }
.block.hidden { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
.block.visible { opacity: 1; transform: translateY(0); }
.block { margin-top: 40px; }
.section-title { font-weight: 400; letter-spacing: 2px; font-size: 1.05rem; color: var(--text-dark); text-align: left; margin-bottom: 16px; }

/* ---- 三张堆叠 ---- */
.stack-wrapper { position: relative; width: 280px; height: 260px; margin: 0 auto; cursor: pointer; }
.stack-card { position: absolute; inset: 0; border-radius: 6px; background: var(--card-bg); padding: 10px; box-shadow: var(--shadow-image); transition: transform 0.3s ease; }
.stack-card .photo { width: 100%; height: 100%; background-size: cover; background-position: center; border-radius: 3px; }
.s1 { z-index: 3; transform: rotate(-3deg); }
.s2 { z-index: 2; transform: rotate(5deg) translate(6px, -4px); }
.s3 { z-index: 1; transform: rotate(-1deg) translate(-4px, -8px); }
.stack-wrapper:hover .s1 { transform: rotate(0deg) scale(1.04) translateY(-4px); }
.stack-wrapper:hover .s2 { transform: rotate(-6deg) translate(-20px, -6px) scale(1.02); }
.stack-wrapper:hover .s3 { transform: rotate(8deg) translate(18px, -10px) scale(1.01); }
.stack-label { position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); font-size: 0.82rem; color: var(--text-dark); letter-spacing: 2px; white-space: nowrap; }

/* ---- 计划 ---- */
.plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.plan-col { padding: 20px; border-radius: 16px; background: var(--card-bg); border: 1px solid rgba(180,210,180,0.3); }
.plan-col.daily { border-top: 3px solid #c9b96e; }
.plan-col.weekly { border-top: 3px solid #6e9ac9; }
.plan-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.plan-header h3 { font-weight: 400; color: var(--text-dark); letter-spacing: 2px; }
.plan-progress { font-size: 0.72rem; color: var(--text-muted); letter-spacing: 1px; transition: color 0.3s; }
.plan-progress.done { color: var(--mint-green); font-weight: 600; }
.plan-progress-bar { height: 3px; border-radius: 3px; background: rgba(0,0,0,0.04); margin-bottom: 14px; overflow: hidden; }
.plan-progress-bar span { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.plan-col.daily .plan-progress-bar span { background: #c9b96e; }
.plan-col.weekly .plan-progress-bar span { background: #6e9ac9; }
.plan-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; cursor: pointer; position: relative; border-radius: 6px; transition: background 0.25s; margin: 0 -10px; }
.plan-item:hover { background: rgba(0,0,0,0.02); }
.plan-item:has(input:checked) { background: linear-gradient(90deg, rgba(184,212,184,0.25) 0%, transparent 10%); }
.plan-item input { position: absolute; opacity: 0; width: 0; height: 0; }
.plan-checkbox { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; border-radius: 5px; border: 1.5px solid var(--mint-green); background: var(--card-bg); transition: 0.2s; position: relative; }
.plan-col.daily .plan-checkbox { border-color: #c9b96e; }
.plan-col.weekly .plan-checkbox { border-color: #6e9ac9; }
.plan-item input:checked ~ .plan-checkbox { border-color: transparent; }
.plan-col.daily .plan-item input:checked ~ .plan-checkbox { background: #c9b96e; }
.plan-col.weekly .plan-item input:checked ~ .plan-checkbox { background: #6e9ac9; }
.plan-item input:checked ~ .plan-checkbox::after { content: '✓'; position: absolute; left: 4px; top: -1px; font-size: 0.75rem; color: #fff; font-weight: 600; animation: check-pop 0.28s ease; }
@keyframes check-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.35); } 100% { transform: scale(1); opacity: 1; } }
.plan-text { flex: 1; font-size: 0.88rem; color: var(--text-body); line-height: 1.7; }
.plan-item input:checked ~ .plan-text { color: var(--text-muted); text-decoration: line-through; }

/* ---- 搜索 + 日历 ---- */
.search-area { z-index: 10; max-width: 500px; margin: 0 auto 14px; }
.cal-wrap { position: relative; z-index: 100; display: flex; justify-content: center; margin-bottom: 8px; }
.cal-trigger { padding: 5px 14px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); background: var(--card-bg); font-size: 0.78rem; color: var(--text-muted); cursor: pointer; letter-spacing: 1px; transition: 0.2s; }
.cal-trigger:hover, .cal-trigger.active { color: var(--text-dark); background: var(--mint-soft); border-color: var(--mint-green); }
.cal-float { position: absolute; z-index: 200; top: calc(100% + 4px); left: 50%; transform: translateX(-50%); width: 300px; padding: 12px 14px 8px; background: var(--card-bg); border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 8px 32px rgba(28,49,34,0.12); animation: calIn 0.15s ease; }
@keyframes calIn { from { opacity: 0; transform: translateX(-50%) translateY(-6px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
.cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.cal-nav-label { font-size: 0.82rem; color: var(--text-dark); letter-spacing: 1px; cursor: pointer; transition: 0.2s; padding: 3px 10px; border-radius: 10px; }
.cal-nav-label:hover { background: rgba(214,232,214,0.3); }
.cal-nav-label.active { background: var(--mint-green); color: var(--text-dark); }
.cal-nav button { width: 26px; height: 26px; border-radius: 50%; border: none; background: transparent; color: rgba(0,0,0,0.4); font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
.cal-nav button:hover { background: rgba(214,232,214,0.4); color: var(--text-dark); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
.cal-dow { font-size: 0.65rem; color: rgba(0,0,0,0.25); padding: 4px 0; letter-spacing: 1px; }
.cal-day { font-size: 0.78rem; padding: 6px 0; color: var(--text-body); border-radius: 8px; transition: 0.15s; }
.cal-day.empty { pointer-events: none; }
.cal-day.has { background: rgba(184,212,184,0.4); color: var(--text-dark); font-weight: 500; cursor: pointer; }
.cal-day.has:hover { background: var(--mint-green); }
.cal-day.has:active { transform: scale(0.82); background: rgba(168,196,168,0.9); transition: transform 0.1s ease; }

.search-box { position: relative; }
.search-box input { width: 100%; padding: 10px 38px 10px 14px; border: 1px solid rgba(0,0,0,0.06); border-radius: 20px; background: var(--card-bg); font-size: 0.85rem; color: var(--text-dark); letter-spacing: 1px; outline: none; box-sizing: border-box; transition: border-color 0.35s ease, box-shadow 0.35s ease; }
.search-box input::placeholder { color: var(--text-muted); letter-spacing: 2px; transition: opacity 0.5s ease; }
.search-box input:focus { border-color: rgba(180,210,180,0.6); box-shadow: 0 0 0 4px rgba(214,232,214,0.2); }
.search-box input:focus::placeholder { opacity: 0.5; }
.search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0.35; cursor: pointer; transition: 0.2s; color: #555; display: flex; align-items: center; }
.search-icon:hover { opacity: 0.7; color: var(--mint-green); }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: #555; cursor: pointer; transition: 0.2s; }
.search-clear:hover { color: #1a1a1a; }

/* ---- 时间轴 ---- */
.journal { position: relative; padding-left: 32px; margin-bottom: 24px; }
.journal::before { content: ''; position: absolute; left: 7px; top: 24px; bottom: 0; border-left: 1.5px dashed rgba(168,216,185,0.22); }
.day-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.day-dot { position: absolute; left: 2px; width: 10px; height: 10px; border-radius: 50%; background: var(--mint-green); }
.day-label { font-size: 0.82rem; color: var(--text-dark); letter-spacing: 3px; font-weight: 400; }
.day-cards { display: flex; flex-direction: column; gap: 10px; }

.jcard { padding: 16px 18px; border-radius: 14px; background: var(--card-bg); border: 1px solid rgba(0,0,0,0.04); box-shadow: var(--shadow-card); transition: 0.2s ease; cursor: pointer; }
.jcard:hover { box-shadow: var(--shadow-card-hover); }
.jcard.expanded { border-color: rgba(184,212,184,0.4); box-shadow: var(--shadow-card-hover); }

.jc-tag { display: inline-block; font-size: 0.68rem; padding: 2px 10px; border-radius: 10px; background: var(--mint-soft); color: var(--text-dark); letter-spacing: 1px; margin-bottom: 8px; }
.jc-text { font-size: 0.9rem; color: var(--text-body); line-height: 1.7; margin: 0; }
.jc-date { font-size: 0.68rem; color: var(--text-muted); letter-spacing: 4px; font-family: 'Georgia', 'Times New Roman', serif; margin-bottom: 8px; }
.jc-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; margin-top: 12px; }
.jc-photos.wide { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.jc-photos img { width: 100%; border-radius: 10px; object-fit: cover; aspect-ratio: 1; cursor: pointer; background: var(--skeleton); }

.jc-actions { margin-top: 18px; }
.jc-nav { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.jc-nav-btn { border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; background: transparent; padding: 6px 18px; font-size: 0.78rem; color: var(--text-body); cursor: pointer; letter-spacing: 1px; transition: 0.2s; }
.jc-nav-btn:hover:not(.dim) { background: var(--mint-green); color: var(--text-dark); }
.jc-nav-btn.dim { opacity: 0.2; pointer-events: none; }
.jc-collapse { display: block; margin: 0 auto; border: none; background: transparent; font-size: 0.8rem; color: var(--text-muted); cursor: pointer; letter-spacing: 2px; padding: 4px 12px; transition: 0.2s; }
.jc-collapse:hover { color: var(--text-dark); }

/* ---- 空状态 ---- */
.empty-state { text-align: center; padding: 32px 0; }
.empty-icon { font-size: 2rem; opacity: 0.4; display: block; margin-bottom: 8px; }
.empty-state p { font-size: 0.85rem; color: var(--text-muted); letter-spacing: 2px; }

/* ---- 加载更多 ---- */
.load-more { display: block; margin: 16px auto 0; padding: 10px 36px; border-radius: 20px; border: 1px solid var(--mint-green); background: var(--card-bg); color: var(--text-dark); font-size: 0.88rem; cursor: pointer; letter-spacing: 2px; transition: 0.3s ease; }
.load-more:hover { background: var(--mint-green); }

/* ---- 灯箱 ---- */
.lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.88); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
.lightbox-inner { max-width: 80vw; max-height: 90vh; text-align: center; }
.lightbox-inner img { max-width: 100%; max-height: 70vh; border-radius: 10px; }
.lb-close { position: absolute; top: 20px; right: 30px; border: none; background: transparent; color: rgba(255,255,255,0.5); font-size: 1.5rem; cursor: pointer; }

/* ---- 回顶 ---- */
.back-top { position: fixed; right: 20px; bottom: 60px; z-index: 50; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.08); background: var(--card-bg); color: var(--text-body); font-size: 1.2rem; cursor: pointer; box-shadow: var(--shadow-card); transition: opacity 0.3s, transform 0.3s; animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.back-top:hover { background: var(--mint-green); transform: translateY(-2px); }

/* ---- 尾 ---- */
.end-cap { text-align: center; padding: 48px 0 20px; color: rgba(0,0,0,0.18); font-size: 0.82rem; letter-spacing: 4px; }

@media (max-width: 860px) { .hero-title { font-size: 2rem; } }
@media (max-width: 540px) { .plan-grid { grid-template-columns: 1fr; } .stack-wrapper { width: 220px; height: 200px; } }
</style>
