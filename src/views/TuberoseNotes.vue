<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-05-28 11:17:34
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-09-26 15:57:58
 * @FilePath     : /myweb-Hiddengoose/src/views/TuberoseNotes.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<template>
  <div class="notes-layout">
    <TopBar>
      <template #left-extra>
        <button class="sidebar-toggle" @click="theme.toggleSidebar" :title="theme.isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <img :src="theme.isSidebarCollapsed ? openIcon : closeIcon" alt="" />
        </button>
      </template>
    </TopBar>

    <BackgroundWallpaper image-src="yeguang.jpg" />

    <Sidebar :selected-id="selectedId" @select="id => selectedId = id" />

    <main ref="mainRef" class="main-content" :class="{ expanded: theme.isSidebarCollapsed }" @scroll="onScroll" @click="onContentClick">

    <button v-if="tocHeadings.length" class="toc-mobile-btn" :class="{ hidden: hideTocBtn }" @click.stop="tocRef?.open()"><img :src="listIcon" alt="目录" /></button>

      <!-- 没打开文章 → 音乐控件停在页面最下角 -->
      <div v-if="!selectedNote" class="music-corner"><NotesMusic /></div>

      <!-- 悬浮的「回到顶部」。
           ⚠️ 必须挂在 <main> 下，不能放进 .reader-panel ——
           那个面板有 backdrop-filter: blur(20px)，而 backdrop-filter 会让元素
           成为 position:fixed 后代的包含块，按钮就会被钉在面板上、跟着文章滚，
           不再是悬浮（transform / filter / perspective / contain 同理）。 -->
      <button v-if="selectedNote && showTopBtn" class="back-top" :style="backTopStyle" aria-label="回到顶部" @click="scrollToTop">
        <svg class="back-top-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span>置顶</span>
      </button>

      <!-- ===== 最新 ===== -->
      <template v-if="theme.currentNav === 'latest'">
        <WelcomePanel v-if="!selectedNote" @random="randomNote" />
        <PetalEffect v-if="theme.isPetalEnabled && !selectedNote" />
        <div v-if="selectedNote" class="reader-wrapper">
          <!-- 打开文章 → 音乐控件移到正文左边这一列 -->
          <aside class="reader-aside"><NotesAside :exclude-id="selectedId" @pick="onAsidePick" /></aside>
          <article class="reader-panel" :style="panelStyle">
            <button class="rp-back" @click="selectedId = null">← 返回</button>
            <div v-if="coverImg" class="rp-cover" :style="{ backgroundImage: `url(${coverImg})` }"></div>
            <div class="rp-header">
              <h1>{{ selectedNote.title }}</h1>
              <div class="rp-meta">
                <span>{{ selectedNote.date }}</span>
                <span v-for="t in selectedNote.tags" :key="t" class="rp-tag"># {{ t }}</span>
              </div>
            </div>
            <div class="rp-body" v-html="renderedHtml"></div>
            <!-- 评论区：每篇一个独立讨论串（term 用笔记 id），可在 .md 的
                 frontmatter 里写 comment: false 单独关掉。
                 dark 是因为这块在深色阅读面板里，标题区（不在 iframe 内）要翻成浅色。 -->
            <WalineComment
              v-if="selectedNote.comment"
              :key="selectedNote.id"
              :path="`/notes/${selectedNote.id}`"
              accent="purple"
              dark
            />
          </article>
          <!-- 右列：统计卡在上（跟着页面滚走），目录在下（sticky 吸顶）—— 纯 CSS 接力，无 JS -->
          <div class="reader-right">
            <SiteStatsCard class="stats-slot" />
            <WidgetCard v-if="tocHeadings.length" class="toc-slot" title="文章目录">
              <TableOfContents ref="tocRef" :headings="tocHeadings" />
            </WidgetCard>
          </div>
        </div>
      </template>

      <!-- ===== 归档 ===== -->
      <template v-else-if="theme.currentNav === 'archive'">
        <div v-if="selectedNote" class="reader-wrapper">
          <aside class="reader-aside"><NotesAside :exclude-id="selectedId" @pick="onAsidePick" /></aside>
          <article class="reader-panel" :style="panelStyle">
            <button class="rp-back" @click="selectedId = null">← 返回列表</button>
            <div v-if="coverImg" class="rp-cover" :style="{ backgroundImage: `url(${coverImg})` }"></div>
            <div class="rp-header">
              <h1>{{ selectedNote.title }}</h1>
              <div class="rp-meta">
                <span>{{ selectedNote.date }}</span>
                <span v-for="t in selectedNote.tags" :key="t" class="rp-tag"># {{ t }}</span>
              </div>
            </div>
            <div class="rp-body" v-html="renderedHtml"></div>
            <!-- 评论区：每篇一个独立讨论串（term 用笔记 id），可在 .md 的
                 frontmatter 里写 comment: false 单独关掉。
                 dark 是因为这块在深色阅读面板里，标题区（不在 iframe 内）要翻成浅色。 -->
            <WalineComment
              v-if="selectedNote.comment"
              :key="selectedNote.id"
              :path="`/notes/${selectedNote.id}`"
              accent="purple"
              dark
            />
          </article>
          <!-- 右列：统计卡在上（跟着页面滚走），目录在下（sticky 吸顶）—— 纯 CSS 接力，无 JS -->
          <div class="reader-right">
            <SiteStatsCard class="stats-slot" />
            <WidgetCard v-if="tocHeadings.length" class="toc-slot" title="文章目录">
              <TableOfContents ref="tocRef" :headings="tocHeadings" />
            </WidgetCard>
          </div>
        </div>

        <div v-else class="archive-view">
          <div class="av-search">
            <div class="av-search-box">
              <input v-model="archiveQuery" placeholder="搜索标题或标签..." aria-label="搜索笔记" />
              <span class="av-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>
          </div>
          <div class="av-tags">
            <button
              v-for="t in allTags"
              :key="t"
              type="button"
              class="av-tag"
              :class="{ active: activeTags.includes(t) }"
              :aria-pressed="activeTags.includes(t)"
              @click="toggleTag(t)"
            ># {{ t }}</button>
          </div>

          <div class="av-result">
            <div class="av-views" role="group" aria-label="切换视图">
              <button
                type="button"
                :class="{ on: archiveView === 'grid' }"
                :aria-pressed="archiveView === 'grid'"
                @click="archiveView = 'grid'"
              >网格</button>
              <button
                type="button"
                :class="{ on: archiveView === 'timeline' }"
                :aria-pressed="archiveView === 'timeline'"
                @click="archiveView = 'timeline'"
              >时间线</button>
              <button
                type="button"
                :class="{ on: archiveView === 'zigzag' }"
                :aria-pressed="archiveView === 'zigzag'"
                @click="archiveView = 'zigzag'"
              >之字形</button>
            </div>
            <button v-if="archiveQuery || activeTags.length" type="button" class="av-clear" @click="clearFilters">清除筛选</button>
            <p class="av-count" aria-live="polite">{{ filteredArchive.length }} 篇笔记</p>
          </div>

          <!-- ===== 之字形视图（照 XinghuisamaBlogs 的 TimelineNode：左右交替的大卡片）===== -->
          <div v-if="archiveView === 'zigzag' && filteredArchive.length" class="av-zigzag">
            <span class="zz-spine" aria-hidden="true"></span>
            <button
              v-for="(n, i) in filteredArchive"
              :key="n.id"
              type="button"
              class="zz-node"
              :class="{ right: i % 2 === 1 }"
              @click="selectedId = n.id"
            >
              <span class="zz-mid"><span class="zz-dot"></span></span>
              <span class="zz-card">
                <span class="zz-cover" :style="{ backgroundImage: `url(${resolveCover(n) || noteImgForId(n.id)})` }"></span>
                <span class="zz-body">
                  <span class="zz-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                    </svg>
                    {{ n.date }}
                  </span>
                  <span class="zz-title">{{ n.title }}</span>
                  <span v-if="n.tags.length" class="zz-tags">
                    <span v-for="t in n.tags" :key="t"># {{ t }}</span>
                  </span>
                  <span v-if="n.summary" class="zz-desc">{{ n.summary }}</span>
                </span>
              </span>
            </button>
          </div>

          <!-- ===== 时间线视图（照参考站 ArchivePanel 的三栏排法：日期 ｜ 线+点 ｜ 标题）===== -->
          <!-- ⚠️ 这三块必须是 v-if / v-else-if / v-else-if 一条链。
               之前时间线和网格各写各的 v-if，网格用 v-else 只跟得上"时间线"那一个，
               结果切到之字形时网格也跟着渲染了（多出一层卡片）。 -->
          <div v-else-if="archiveView === 'timeline' && filteredArchive.length" class="av-timeline">
            <div v-for="g in timelineGroups" :key="g.year" class="tl-group">
              <button
                type="button"
                class="tl-year"
                :class="{ collapsed: collapsedYears.has(g.year) }"
                :aria-expanded="!collapsedYears.has(g.year)"
                @click="toggleYear(g.year)"
              >
                <span class="tl-year-num">{{ g.year }}</span>
                <span class="tl-mark"><span class="tl-ring"></span></span>
                <span class="tl-count">
                  {{ g.items.length }} 篇
                  <svg class="tl-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>

              <button
                v-for="n in (collapsedYears.has(g.year) ? [] : g.items)"
                :key="n.id"
                type="button"
                class="tl-row"
                @click="selectedId = n.id"
              >
                <span class="tl-date">{{ n.date.slice(5) }}</span>
                <span class="tl-mark"><span class="tl-dot"></span></span>
                <span class="tl-title" :title="n.title">{{ n.title }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="archiveView === 'grid'" class="av-grid">
            <!-- 卡片里有 h4/div，用不了 <button>（button 只允许行内内容），
                 所以用 role + tabindex 补上键盘可达性 -->
            <div
              v-for="note in filteredArchive"
              :key="note.id"
              class="av-card"
              role="button"
              tabindex="0"
              @click="selectedId = note.id"
              @keydown.enter.prevent="selectedId = note.id"
              @keydown.space.prevent="selectedId = note.id"
            >
              <div class="avc-cover" :style="{ backgroundImage: `url(${resolveCover(note) || noteImgForId(note.id)})` }"></div>
              <div class="avc-main">
                <h4>{{ note.title }}</h4>
                <span class="avc-date">{{ note.date }}</span>
              </div>
              <div class="avc-tags">
                <span v-for="t in note.tags" :key="t"># {{ t }}</span>
              </div>
            </div>
          </div>

          <div v-if="!filteredArchive.length" class="av-empty">没有匹配的笔记</div>
        </div>
      </template>

      <!-- ===== 实验室 ===== -->
      <div v-else class="lab-placeholder">
        <div class="lab-card">
          <span class="lab-icon">🧪</span>
          <h2>实验室</h2>
          <p class="lab-sub">正在调配试剂，不久将开启。</p>
          <div class="lab-bar-wrap">
            <span class="lab-bar-label">构建进度</span>
            <div class="lab-bar"><span class="lab-bar-fill"></span></div>
          </div>
          <p class="lab-hint">交互式 Demo · 代码片段 · 可视化实验 · 更多好玩的东西在路上</p>
        </div>
      </div>
    </main>

  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useReveal } from '@/composables/useReveal'
import TopBar from '@/components/app/TopBar.vue'
import BackgroundWallpaper from '@/components/BackgroundWallpaper.vue'
import NotesMusic from '@/components/tuberose/NotesMusic.vue'
import NotesAside from '@/components/tuberose/NotesAside.vue'
import SiteStatsCard from '@/components/tuberose/SiteStatsCard.vue'
import WidgetCard from '@/components/app/WidgetCard.vue'
import WalineComment from '@/components/app/WalineComment.vue'
import Sidebar from '@/components/tuberose/Sidebar.vue'
import WelcomePanel from '@/components/tuberose/WelcomePanel.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import { useAppStore } from '@/stores/theme'
import { useBgSettings } from '@/composables/useBgSettings'
import { notes, renderNote } from '@/data/loadNotes'
import TableOfContents from '@/components/tuberose/TableOfContents.vue'
import openIcon from '@/assets/panel-right-open.svg'
import closeIcon from '@/assets/panel-right-close.svg'
import listIcon from '@/assets/list.svg'

// 缩略图由 scripts/optimize-images.mjs 生成；笔记封面无灯箱，不需要原图
// 注意：写成 *.webp 而不是 *.{webp} —— Vite 的 glob 不支持单元素花括号，会静默返回空
const notesImgModules = import.meta.glob('@/assets/optimized/saiset/notes/*.webp', { eager: true, import: 'default' })
const notesImgs = Object.values(notesImgModules)
function noteImgForId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash |= 0 }
  return notesImgs[Math.abs(hash) % notesImgs.length] || ''
}
// frontmatter 的 cover 字段（如 cover:2.png）指向的是原图，而 optimized/ 里
// 统一转成了 .webp，扩展名对不上。所以只比对主文件名，忽略扩展名。
const stripExt = p => p.replace(/\.[^.]+$/, '')
function resolveCover(note) {
  if (!note.cover) return null
  const want = stripExt(note.cover).replace(/.*\//, '')
  for (const [k, v] of Object.entries(notesImgModules)) {
    if (stripExt(k).endsWith('/' + want)) return v
  }
  return null
}

const theme = useAppStore()
const { settings: bgSettings } = useBgSettings()
const selectedId = ref(null)
const selectedNote = computed(() => notes.find(n => n.id === selectedId.value) || null)
const renderedHtml = ref('')
// 标题 id 由 loadNotes 在渲染时写进 HTML，这里直接取同一趟产出的列表。
// 必须是 ref 而不是从 note 上读 —— notes 是普通数组（非 reactive），
// 异步渲染完再挂 note.headings 不会触发更新。
const tocHeadings = ref([])

/** 阅读面板动态样式 —— 模糊度可调（CSS 变量方式，支持媒体查询覆盖） */
const panelStyle = computed(() => ({
  '--panel-blur': `${bgSettings.panelBlur}px`,
}))

// 目录只要 1 级标题（笔记正文从 ## 起，h3 是子节，不收）。
// 抽成函数是因为这里有两个赋值点（缓存分支 / 首次渲染分支），
// 分开写过一次，结果只改到一处、表现不一致：首次打开列全 h2+h3、再打开只剩 h2。
const tocOf = note => (note.headings ?? []).filter(h => h.level === 2)

watch(selectedId, async (id) => {
  mainRef.value?.scrollTo(0, 0)
  if (!id) { renderedHtml.value = ''; tocHeadings.value = []; return }
  const note = notes.find(n => n.id === id)
  if (!note) return
  if (note.bodyHtml) {
    renderedHtml.value = note.bodyHtml
    tocHeadings.value = tocOf(note)
    return
  }
  renderedHtml.value = await renderNote(note)
  tocHeadings.value = tocOf(note)
  note.bodyHtml = renderedHtml.value
})

const coverImg = computed(() => {
  if (!selectedNote.value) return null
  return resolveCover(selectedNote.value) || noteImgForId(selectedNote.value.id)
})
const mainRef = ref(null)
// 之字形时间线的入场动效。复用分享页那套 useReveal（IntersectionObserver +
// 只播一次 + 认 prefers-reduced-motion），不引 framer-motion 之类的库。
// root 传 mainRef —— 本页的滚动发生在这个自定义容器里，不能留空。
const { reveal } = useReveal(mainRef)
const tocRef = ref(null)
const showTopBtn = ref(false)
const hideTocBtn = ref(false)
let lastScrollY = 0
function randomNote() {
  if (notes.length) selectedId.value = notes[0].id
}
function onContentClick() {
  if (!theme.isSidebarCollapsed) theme.toggleSidebar()
  tocRef.value?.close()
}
function onScroll() {
  const top = mainRef.value?.scrollTop || 0
  showTopBtn.value = top > 300
  hideTocBtn.value = top > lastScrollY && top > 100
  lastScrollY = top
}
function scrollToTop() { mainRef.value?.scrollTo({ top: 0, behavior: 'smooth' }) }

// 「置顶」按钮要贴在文章卡片右侧外面。但正文是居中的，右边缘随窗口宽度和
// 侧边栏展开/收起而变，纯 CSS 算不出来 —— 卡片宽度是 flex 撑出来的，不是定值。
// 所以用 JS 量一次卡片的位置，把左边距写进内联样式（fixed 是相对视口的）。
const BTN_W = 52
const backTopStyle = ref({ left: '24px' })

function syncBackTop() {
  const panel = mainRef.value?.querySelector('.reader-panel')
  if (!panel) return
  const want = panel.getBoundingClientRect().right + 14          // 贴卡片右侧外，留 14px 缝
  const max = window.innerWidth - BTN_W - 12                     // 别跑出屏幕右边
  backTopStyle.value = { left: `${Math.max(12, Math.min(want, max))}px` }
}

watch([selectedId, () => theme.isSidebarCollapsed, showTopBtn], () => nextTick(syncBackTop))
onMounted(() => {
  nextTick(syncBackTop)
  window.addEventListener('resize', syncBackTop)
})
onUnmounted(() => window.removeEventListener('resize', syncBackTop))

// 归档状态
const archiveQuery = ref('')
const activeTags = ref([])
const allTags = computed(() => [...new Set(notes.flatMap(n => n.tags))])
function toggleTag(t) {
  const i = activeTags.value.indexOf(t)
  if (i >= 0) activeTags.value.splice(i, 1)
  else activeTags.value.push(t)
}
function clearFilters() {
  archiveQuery.value = ''
  activeTags.value = []
}
const filteredArchive = computed(() => {
  let list = notes
  if (archiveQuery.value) {
    const q = archiveQuery.value.toLowerCase()
    list = list.filter(n =>
      n.title.toLowerCase().includes(q)
      || (n.category || '').toLowerCase().includes(q)
      || n.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  if (activeTags.value.length) list = list.filter(n => activeTags.value.some(t => n.tags.includes(t)))
  return list
})

// 归档页两种视图：grid = 卡片网格 / timeline = 按年折叠的时间线
const archiveView = ref('grid')

// 时间线分组：按年，年内的顺序沿用 filteredArchive 的倒序
const timelineGroups = computed(() => {
  const m = new Map()
  for (const n of filteredArchive.value) {
    const y = (n.date || '').slice(0, 4) || '未知'
    if (!m.has(y)) m.set(y, [])
    m.get(y).push(n)
  }
  return [...m]
    .map(([year, items]) => ({ year, items }))
    .sort((a, b) => b.year.localeCompare(a.year))
})

// 默认只展开最新那年、其余收起（照参考站 foldArticle 的做法）。
// 分组一变（换筛选 / 换页签）就重置回默认。
const collapsedYears = ref(new Set())
watch(timelineGroups, (gs) => {
  collapsedYears.value = new Set(gs.slice(1).map(g => g.year))
}, { immediate: true })

function toggleYear(year) {
  const s = new Set(collapsedYears.value)
  if (s.has(year)) s.delete(year)
  else s.add(year)
  collapsedYears.value = s
}

// 切到之字形时让它逐条浮现（切走再回来会重演 —— v-if 重建了元素，
// useReveal 靠的 data-revealed 标记随之清空）
watch(archiveView, (v) => {
  if (v === 'zigzag') nextTick(() => reveal('.zz-node', { stagger: 0.06 }))
})

// 左列「分类 / 标签」点一下 → 切到归档页签并套上筛选。
// 必须 await nextTick：切页签会触发上面那个 watch 清空筛选，而 watch 是 pre-flush、
// 跑在 nextTick 回调之前 —— 顺序反了刚设的筛选就被清掉了。
async function onAsidePick({ kind, value }) {
  // 「随机推荐」点了直接开这篇，不切页签、不套筛选
  if (kind === 'note') {
    selectedId.value = value
    return
  }
  theme.setNav('archive')
  await nextTick()
  if (kind === 'category') {
    archiveQuery.value = value
    activeTags.value = []
  } else {
    archiveQuery.value = ''
    activeTags.value = [value]
  }
}

// 点页签就刷新状态 —— 包括**重复点当前已激活的那个**（这也是「刷新」）。
//   一律清掉归档筛选；点到「归档」还要退回网格，否则 selectedNote 优先级更高、
//   会停在阅读页上，"归档"等于点不进去。
// 用 navVersion 而不是 currentNav：后者重复点同一个值不变，watch 根本不触发。
// 注：点「最新」不会关掉正在读的那篇（那太容易误伤），只清筛选。要改成关掉说一声。
watch(() => theme.navVersion, () => {
  archiveQuery.value = ''
  activeTags.value = []
  if (theme.currentNav === 'archive') {
    selectedId.value = null
    mainRef.value?.scrollTo(0, 0)
  }
})

// 离开笔记页时复位，下次进来是干净状态（也能完整看到侧边栏的进入动画）。
// 只重置这一页自己的状态：不碰音乐 store、首页滚动恢复、项目页搜索这些有意保留的。
onBeforeRouteLeave(() => {
  theme.setNav('latest')
  if (theme.isSidebarCollapsed) theme.toggleSidebar()
})
</script>

<style scoped>
.notes-layout {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  position: relative;
  height: 100%;
  overflow-y: auto;
  background: transparent;
  padding-top: 70px;
  scrollbar-width: none;
}
.main-content::-webkit-scrollbar { display: none; }

/* ===== 阅读器 + 目录容器 =====
   三栏并排：左卡片 ｜ 正文 ｜ 目录+统计，整块居中。

   两条别改（都试过，都会把页面搞散）：
   1) 别「左对齐 + padding-left 预留侧边栏宽度」：2K 屏上侧边栏最宽 520px，
      预留 260px 挡不住，正文左边会被盖掉一大截。
   2) 别把右列改成绝对定位「脱流」：它会被 right:0 甩到屏幕最右边，
      和正文之间空出一大片。 */
.reader-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin: 0 0 60px;
}
/* 正文左边那一列，装着音乐/内容统计/标签三张卡。

   侧边栏展开时（默认态）跟着消失，收起后才留着 —— 和右列同步。
   ⚠️ align-self: stretch 必须有 —— .reader-wrapper 是 align-items:flex-start，
   不加这行本列就只有卡片那么高，里面 .aside-stack 的 sticky 没有行程可用，
   等于没写（之前就是这样，卡片不跟着滞留）。右列一直有这行，所以目录能粘住。 */
.reader-aside {
  flex: 0 1 280px;
  min-width: 0;
  align-self: stretch;
  display: none;
}
.main-content.expanded .reader-aside { display: block; }
/* 阅读态左列：三张卡叠在一起，跟着文章滚，滚到和目录同一个高度就停住
   （top: 2px 是 .toc-slot 的值，两边对齐，滚动时不会错开）。
   卡片加起来超过一屏时，让左列自己滚，不去撑高整页。 */
.reader-aside :deep(.aside-stack) {
  position: sticky;
  top: 2px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
}
.reader-aside :deep(.aside-stack)::-webkit-scrollbar { display: none; }

/* 右列：站点统计卡在上 + 目录在下。
   align-self: stretch 是关键 —— 让它撑到和文章一样高，
   否则 sticky 目录的活动范围只有这个小容器那么高，往下滚两屏就"粘不住"了。 */
/* 右列：正常 flex 项，紧挨着正文右边 —— 就是参考站那种 [左卡片][正文][目录]
   三栏并排的排法。
   不要改成绝对定位去"脱流"：试过，右列会被 right:0 甩到屏幕最右边，
   和正文之间空出一大片，整页散掉。
   代价：三栏同时出现时整块居中，正文的净位移只有约 20px（几何上绕不开）。 */
.reader-right {
  flex-shrink: 0;
  width: 240px;
  flex-direction: column;
  gap: 10px;
  align-self: stretch;
  /* 侧边栏展开时（默认态）整列藏起来，只留文章正文；
     点一下收起侧边栏它们才出现。 */
  display: none;
}
.main-content.expanded .reader-right { display: flex; }

/* ===== 两侧卡片出现时的入场 =====
   收起侧边栏 → 左右两列从各自外侧滑进来淡入，列里的卡片再依次落位。
   和 Sidebar.vue 那套是同一套做法：
     · 整列负责 opacity + translate（从外侧向内侧收）
     · 列里的卡片只做 translate，不碰 opacity —— 两层都淡会相乘、中段发闷
     · fill-mode 用 backwards 不用 both，动画结束不残留 translate
   元素从 display:none 变回有盒子时动画才会启动，所以每次点开都会重演。 */
.main-content.expanded .reader-aside {
  display: block;
  animation: colInLeft 0.42s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.main-content.expanded .reader-right {
  display: flex;
  animation: colInRight 0.42s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes colInLeft {
  from { opacity: 0; translate: -18px 0; }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes colInRight {
  from { opacity: 0; translate: 18px 0; }
  to   { opacity: 1; translate: 0 0; }
}

/* 列里的卡片错开落位（只做位移，透明度交给外层） */
.main-content.expanded .reader-aside :deep(.wcard),
.main-content.expanded .reader-right > :deep(.wcard) {
  animation: cardRise 0.4s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.main-content.expanded .reader-aside :deep(.wcard:nth-child(1)) { animation-delay: 0.06s; }
.main-content.expanded .reader-aside :deep(.wcard:nth-child(2)) { animation-delay: 0.12s; }
.main-content.expanded .reader-aside :deep(.wcard:nth-child(3)) { animation-delay: 0.18s; }
.main-content.expanded .reader-right > :deep(.wcard:nth-child(1)) { animation-delay: 0.06s; }
.main-content.expanded .reader-right > :deep(.wcard:nth-child(2)) { animation-delay: 0.12s; }

@keyframes cardRise {
  from { translate: 0 10px; }
  to   { translate: 0 0; }
}

/* 大屏（>1600px）：正文和右列放宽，否则 2K 上两边各空 600+。
   正文 900 → 1080（一行约 52 → 64 个汉字），右列 220 → 260。
   ⚠️ 左列不在这里放宽 —— 音乐卡宽度写死 260（见 Player/MusicPanel.vue），
   左列跟着放到 300 的话卡片右边会空出一条。 */
@media (min-width: 1600px) {
  .reader-panel { max-width: 1080px; }
  .reader-right { width: 280px; }
}

/* 1350–1439px：三栏排不下（左 280 + 正文 900 + 右 240 + 间距 = 1440）。
   这段里正文会被挤到 900 以下、左列也跟着缩水，所以**牺牲右列**
   （站点统计 + 目录），只留 [左列][正文] 居中，正文能拿回完整 900。
   两条选择器都要写：外面那条 .main-content.expanded .reader-right 权重是 (0,3,0)，
   只写 .reader-right 压不住，收起侧边栏时右列还会冒出来。
   代价：这段宽度下目录就没了（窄屏 ≤1349 另有一套：目录变成右上角的抽屉按钮）。 */
@media (min-width: 1350px) and (max-width: 1439px) {
  .reader-right,
  .main-content.expanded .reader-right { display: none; }
}

/* 桌面端：目录和统计卡共用同一张 WidgetCard 外壳（大圆角 + 1px 浅边框 + 阴影 + 毛玻璃），
   所以这里把 TableOfContents 自己那层玻璃剥掉，并让吸顶改由外层卡片负责。
   必须限定 min-width:1350px —— 窄屏 .toc-panel 是那个抽屉浮层，它有自己的背景，
   剥掉就露馅了。 */
@media (min-width: 1350px) {
  .toc-slot {
    position: sticky;   /* 统计卡滚走后，由这张卡吸顶 */
    /* -4px = 原来的 2px 再上移 6px。
       注：左列那三张卡（.aside-stack）还是 top: 2px，所以吸顶后目录会比它们
       高 6px —— 你要求的，不对再说。 */
    top: -4px;
  }
  .reader-right :deep(.toc-wrapper) {
    position: static;   /* 它自己也有一份 sticky，这里交出去 */
    width: auto;
  }
  .reader-right :deep(.toc-panel) {
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
    backdrop-filter: none;
    /* 目录限高 7 分之 4 屏高；无滑块 */
    max-height: calc(100vh * 4 / 7);
    overflow-y: auto;
    scrollbar-width: none;
  }
  .reader-right :deep(.toc-panel)::-webkit-scrollbar { display: none; }
}

/* 没打开文章时的音乐控件：停在页面右下角，卡片向上展开
   （左下角被侧边栏占着 —— 品牌区/页签/列表/页脚一直到底） */
.music-corner {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 60;
}
.music-corner :deep(.nm-dock) {
  flex-direction: column-reverse;
  align-items: flex-end;
}

/* ===== 阅读面板 ===== */
.reader-panel {
  flex: 1 0 700px;
  /* 900px 约合一行 52 个汉字（舒适区一般算到 50 左右，已经是偏宽的一档）*/
  max-width: 900px;
  padding: 40px 56px;
  background: rgba(30, 42, 50, 0.5);
  /* ⚠️ 只写标准属性 —— 手写 -webkit- 会让构建把标准那条丢掉（Firefox 就没模糊了） */
  backdrop-filter: blur(var(--panel-blur, 20px));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  color: rgba(230,235,240,0.92);
}

.rp-back {
  display: inline-block;
  margin-bottom: 24px;
  padding: 4px 0;
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  font-size: 0.82rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.2s;
}
.rp-back:hover { color: rgba(255,255,255,0.8); }

.rp-cover {
  width: 100%;
  /* 跟上原图的 16:9。写死高度会把 16:9 的图上下裁掉，人脸正好在切口里 */
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  background-size: cover;
  background-position: center;
  margin-bottom: 32px;
}

.rp-header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.rp-header h1 { font-size: 1.8rem; font-weight: 300; color: #fff; letter-spacing: 4px; margin: 0 0 14px; line-height: 1.3; }
.rp-meta { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: rgba(255,255,255,0.35); letter-spacing: 1px; flex-wrap: wrap; }
.rp-tag { padding: 3px 12px; border-radius: 10px; background: rgba(217,130,180,0.2); color: #e8a0c8; font-size: 0.72rem; }

.rp-body { line-height: 2; font-size: 0.95rem; color: rgba(225,230,235,0.85); }
.rp-body :deep(h2) { font-size: 1.35rem; color: #fff; font-weight: 300; margin: 36px 0 14px; letter-spacing: 3px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.rp-body :deep(h3) { font-size: 1.1rem; color: rgba(255,255,255,0.9); font-weight: 400; margin: 28px 0 10px; letter-spacing: 2px; }
.rp-body :deep(h4) { font-size: 1rem; color: rgba(255,255,255,0.75); font-weight: 500; margin: 22px 0 8px; }
.rp-body :deep(p) { margin: 0 0 1.2em; }
.rp-body :deep(ul), .rp-body :deep(ol) { margin: 8px 0 18px; padding-left: 24px; }
.rp-body :deep(li) { margin-bottom: 6px; }
.rp-body :deep(strong) { color: #fff; font-weight: 600; }
.rp-body :deep(code) { background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 5px; font-size: 0.88rem; color: #e0a8c8; font-family: 'Cascadia Code','Fira Code','JetBrains Mono',Consolas,monospace; }
.rp-body :deep(pre) { background: #1e1e1e; padding: 20px 24px; border-radius: 12px; overflow-x: auto; margin: 20px 0; border: 1px solid rgba(255,255,255,0.06); font-family: 'Cascadia Code','Fira Code','JetBrains Mono',Consolas,monospace; scrollbar-width: thin; scrollbar-color: rgba(111,66,193,0.3) transparent; }
.rp-body :deep(pre)::-webkit-scrollbar { height: 4px; }
.rp-body :deep(pre)::-webkit-scrollbar-thumb { background: rgba(111,66,193,0.3); border-radius: 2px; }
.rp-body :deep(pre code) { background: none; padding: 0; color: #d4d4d4; font-size: 0.84rem; line-height: 1.7; }
.rp-body :deep(blockquote) { margin: 18px 0; padding: 14px 20px; border-left: 3px solid rgba(111,66,193,0.35); background: rgba(255,255,255,0.03); border-radius: 0 10px 10px 0; color: rgba(255,255,255,0.55); font-style: italic; }
.rp-body :deep(blockquote p) { margin: 4px 0; }
.rp-body :deep(a) { color: #c0a8f0; text-decoration: none; border-bottom: 1px solid rgba(192,168,240,0.3); }
.rp-body :deep(a:hover) { border-bottom-color: #c0a8f0; }
.rp-body :deep(hr) { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 32px 0; }
/* 不要写死高度：小图会被拉大、长图会被压扁 */
.rp-body :deep(img) { max-width: 100%; height: auto; border-radius: 12px; margin: 16px auto; display: block; }
/* 表格由 loadNotes 的 renderer.table 包了一层，窄屏时横向滚动而不是撑破面板 */
.rp-body :deep(.table-wrap) { overflow-x: auto; margin: 16px 0; }
.rp-body :deep(.table-wrap > table) { margin: 0; }
.rp-body :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.88rem; }
.rp-body :deep(th), .rp-body :deep(td) { padding: 8px 14px; border: 1px solid rgba(255,255,255,0.08); text-align: left; }
.rp-body :deep(th) { background: rgba(255,255,255,0.05); color: #fff; font-weight: 500; }

/* ===== 归档视图 =====
   1500px 是"4 列卡片都能长到上限 360px"的宽度：4×360 + 3×18(间距) = 1494。
   原来写的 1000px 只够 3 列，所以大屏再怎么宽也停在 3 列、两边越空越多。 */
.archive-view {
  max-width: 1500px;
  /* 左右各 24px。48px 是左右加起来：想改就写成 2N px（N = 每边留多少） */
  width: calc(100% - 48px);
  margin: 0 auto 60px;
}
/* 搜索框。surface 和 .av-card 统一：同一个底色、同一根 1px 浅边框、同档圆角。
   去掉 backdrop-filter —— 下面的卡片本来就没有模糊，而且这页多数在窄屏
   （窄屏那套早做过"去毛玻璃"）。配色没动，还是粉线焦点。 */
.av-search { margin-bottom: 18px; display: flex; justify-content: center; }
.av-search-box { position: relative; max-width: 460px; width: 100%; }
.av-search input {
  width: 100%;
  padding: 12px 44px 12px 18px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 42, 50, 0.6);
  color: rgba(255, 255, 255, 0.88);
  font-family: inherit;      /* input 不继承字体，不加会掉出中文字体栈 */
  font-size: 0.86rem;
  letter-spacing: 1px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.25s, background 0.25s;
}
.av-search input::placeholder { color: rgba(255, 255, 255, 0.28); }
.av-search input:hover { background: rgba(30, 42, 50, 0.72); }
.av-search input:focus {
  border-color: rgba(217, 130, 180, 0.45);      /* 粉线，跟标签同色系 */
  background: rgba(30, 42, 50, 0.78);
}
.av-search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.25s;
}
/* 聚焦时放大镜也跟着亮 —— 比原来那个死板的 opacity: 0.3 有反馈 */
.av-search-box:focus-within .av-search-icon { color: rgba(240, 184, 216, 0.9); }

/* 标签栏：一整块容器，和卡片同一套 surface（同底色 + 同边框 + 同圆角）。
   宽度不跟网格走 —— 网格可以很宽（横排看图），但工具栏是阅读型的，通铺到 1500px
   会让 9 个小胶囊挤在最左边、右边空一大片。780px 够它们排一行。 */
.av-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 780px;
  margin: 0 auto 18px;
  padding: 16px 18px;
  background: rgba(30, 42, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
/* 胶囊圆角比容器小一档（16 → 11），嵌套看起来才不糊 */
.av-tag {
  padding: 6px 14px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e8a0c8;
  font-family: inherit;   /* 按钮不会继承字体，不加会掉出中文字体栈 */
  font-size: 0.78rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}
.av-tag:hover {
  background: rgba(217, 130, 180, 0.14);
  border-color: rgba(217, 130, 180, 0.35);
  color: #f0b8d8;
  transform: translateY(-1px);
}
.av-tag:active { transform: translateY(0); }
.av-tag.active {
  background: rgba(217, 130, 180, 0.26);
  border-color: rgba(217, 130, 180, 0.55);
  color: #ffd0e8;
}

/* ===== 视图切换（网格 / 时间线）===== */
.av-views {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: rgba(30, 42, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
.av-views button {
  padding: 5px 14px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  font-size: 0.76rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.av-views button:hover { color: rgba(255, 255, 255, 0.8); }
.av-views button.on { background: rgba(217, 130, 180, 0.22); color: #ffd0e8; }

/* ===== 时间线 =====
   照参考站 ArchivePanel 的三栏排法：日期 ｜ 虚线+圆点 ｜ 标题。
   它用 w-[15%] / w-[15%] / w-[70%]（桌面 10/10/80），这里换成固定像素。 */
.av-timeline {
  padding: 10px 18px 16px;
  background: rgba(30, 42, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

/* 年份行和文章行共用这套三栏骨架 */
.tl-year,
.tl-row {
  display: grid;
  grid-template-columns: 66px 32px 1fr;
  align-items: center;
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.tl-mark {
  position: relative;
  align-self: stretch;
  display: grid;
  place-items: center;
}
/* 竖虚线只画在文章行上（年份行断开，和参考站一致），靠它把上下串成一条线 */
.tl-row .tl-mark::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px dashed rgba(255, 255, 255, 0.13);
}

/* ---- 年份行 ---- */
.tl-year { height: 54px; border-radius: 10px; transition: background 0.2s; }
.tl-year:hover { background: rgba(255, 255, 255, 0.04); }
.tl-year-num {
  text-align: right;
  padding-right: 4px;
  font-size: 1.35rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s;
}
.tl-year:hover .tl-year-num { color: #ffd0e8; }
/* 年份是空心圆，和文章那个小实心点区分开 */
.tl-ring {
  position: relative;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid rgba(217, 130, 180, 0.6);
}
.tl-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.42);
  transition: color 0.2s;
}
.tl-year:hover .tl-count { color: rgba(255, 255, 255, 0.75); }
.tl-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.tl-year.collapsed .tl-arrow { transform: rotate(-90deg); }

/* ---- 文章行 ---- */
.tl-row { min-height: 42px; border-radius: 10px; transition: background 0.2s; }
.tl-row:hover { background: rgba(217, 130, 180, 0.1); }
.tl-date {
  text-align: right;
  padding-right: 4px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  font-variant-numeric: tabular-nums;
}
/* 小实心点，hover 时拉成一小段竖线（参考站是 h-1 → h-5） */
.tl-dot {
  position: relative;
  width: 3px;
  height: 3px;
  border-radius: 2px;
  background: rgba(217, 130, 180, 0.65);
  transition: height 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s;
}
.tl-row:hover .tl-dot { height: 18px; background: rgba(240, 184, 216, 0.95); }
.tl-title {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.78);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.tl-row:hover .tl-title { color: #fff; }

/* ===== 之字形时间线 =====
   照 XinghuisamaBlogs 的 TimelineNode：左右交替的大卡片 + 中间一列圆点。
   它用 w-5/12 ｜ w-6 h-6 节点 ｜ w-5/12，这里换成 1fr 44px 1fr 的三栏网格。
   入场动效复用项目已有的 useReveal（滚进视口逐条浮现，只播一次），不引动画库。 */
.av-zigzag { position: relative; padding: 6px 0; }

/* 中轴竖线，被圆点的实心底盖住，所以看起来是断开的 */
.zz-spine {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.zz-node {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 44px 1fr;
  align-items: center;
  width: 100%;
  margin-bottom: 26px;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.zz-node:last-child { margin-bottom: 0; }

.zz-mid { grid-column: 2; display: grid; place-items: center; }
/* 圆点：实心底盖住中轴线（参考站是 border-4 圈 + ring-4 外圈光晕） */
.zz-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #d982b4;
  background: #1b2630;
  box-shadow: 0 0 0 4px rgba(217, 130, 180, 0.14);
  transition: box-shadow 0.3s, border-color 0.3s;
}
.zz-node:hover .zz-dot {
  border-color: #f0b8d8;
  box-shadow: 0 0 0 7px rgba(217, 130, 180, 0.22);
}

/* 偶数在左栏、奇数在右栏。
   justify-self 让它俩各自**贴着中间的中轴**，而不是贴在外侧 ——
   卡片封顶之后如果不靠拢，窄卡就会离圆点十万八千里。 */
.zz-node:not(.right) .zz-card { grid-column: 1; justify-self: end; }
.zz-node.right .zz-card { grid-column: 3; justify-self: start; }

.zz-card {
  width: 100%;
  /* 封顶 440px。不封的话卡片会跟着归档区一起长：
     归档区 1500 时每张 728px 宽、封面 410px 高，整张 530px，一屏只看得到一张。 */
  max-width: 440px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(30, 42, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s, box-shadow 0.3s;
}
.zz-node:hover .zz-card {
  transform: translateY(-3px);
  border-color: rgba(217, 130, 180, 0.35);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.32);
}

.zz-cover {
  aspect-ratio: 16 / 9;
  background-size: cover;
  background-position: center 30%;
  background-color: rgba(30, 42, 50, 0.6);
}
.zz-body { display: flex; flex-direction: column; gap: 7px; padding: 12px 14px 14px; }
.zz-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: rgba(232, 160, 200, 0.9);
  font-variant-numeric: tabular-nums;
}
.zz-date svg { width: 13px; height: 13px; flex-shrink: 0; }
.zz-title {
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.35;
  color: #fff;
  /* 最多两行、超出省略（不需要 clamp 插件） */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.zz-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.zz-tags span {
  padding: 2px 8px;
  border-radius: 7px;
  background: rgba(217, 130, 180, 0.12);
  border: 1px solid rgba(217, 130, 180, 0.2);
  color: #e8a0c8;
  font-size: 0.66rem;
}
.zz-desc {
  font-size: 0.74rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.42);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 结果行（视图切换 / 清除筛选 / 篇数）跟标签栏同宽，不然图标和计数会飘到屏幕两头 */
.av-result {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 780px;
  margin: 0 auto 24px;
}
.av-count { font-size: 0.78rem; color: rgba(255,255,255,0.35); letter-spacing: 2px; margin: 0 0 0 auto; }
.av-clear {
  padding: 4px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(15,20,30,0.45);
  color: rgba(255,255,255,0.6);
  font-family: inherit;
  font-size: 0.72rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
}
.av-clear:hover { background: rgba(15,20,30,0.65); color: #fff; }

/* 键盘焦点环 —— 沿用已有的粉色，不引入新颜色 */
.av-card:focus-visible,
.av-tag:focus-visible,
.av-clear:focus-visible {
  outline: 2px solid rgba(217,130,180,0.6);
  outline-offset: 2px;
}

.av-grid {
  display: grid;
  /* 卡片一律铺满：轨道上限用 1fr，随容器伸缩，不留居中空白。
     用 auto-fit 而不是 auto-fill —— 空轨道会被收掉，所以只剩一张卡时它也铺满整行。
     （原为封顶 360px + justify-content: center，窄容器里两边各空约 100px；
     2026-09 按需求改成一律铺满，代价是宽屏只有两三张卡时每张会明显变宽。）
     min(320px, 100%) 给极窄屏兜底，免得轨道比容器还宽撑出横向滚动。 */
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 18px;
}

/* 分离式：图片单独一行，文字在图片**外面**的卡片底色上，不往图上叠任何遮罩。
   原来图和字是叠在一起的（.avc-main 一条半透明渐变 + .avc-tags 一块实色），
   两套做法拼在一起就是「盖上去又没盖上去」的观感。 */
.av-card {
  display: flex;
  flex-direction: column;
  background: rgba(30, 42, 50, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;          /* 靠它把封面上面两角裁成 16px 圆角 */
  cursor: pointer;
  transition: 0.25s;
}
.av-card:hover {
  border-color: rgba(111,66,193,0.25);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

/* 封面。2:1 是照参考站 PostCard 的手机比例（它用 aspect-2/1，桌面才改横排）。
   16:9 会让卡片明显偏高，2:1 更接近改动前的 160px 高度。
   代价：16:9 的图上下各裁掉约 5.5%（人脸在 y≈20–43%，切不到）。 */
.avc-cover {
  aspect-ratio: 2 / 1;
  background-size: cover;
  background-position: center 30%;
  background-color: rgba(30, 42, 50, 0.6);   /* 图缺失时的兜底 */
}

.avc-main {
  display: flex;
  align-items: baseline;     /* 标题和日期按基线对齐，不再靠底边 */
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px 6px;
  background: none;          /* 不再是那条渐变 */
}
.avc-main h4 {
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: 1px;
  margin: 0;
  /* 原来有 text-shadow 是为了压在图上时保证可读；现在文字在纯色底上，
     留着只会显脏 */
}
.avc-date { font-size: 0.7rem; color: rgba(255,255,255,0.45); letter-spacing: 1px; white-space: nowrap; }
.avc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 14px 14px;
  background: none;          /* 不再是那块实色 */
  /* 标题有一行/两行的差异时，标签仍贴在卡片底部，同一排卡片对齐 */
  margin-top: auto;
}
.avc-tags span {
  font-size: 0.68rem;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(0,0,0,0.35);
  color: #e0a8c8;
}
.av-empty {
  text-align: center;
  padding: 80px 0;
  color: rgba(255,255,255,0.25);
  letter-spacing: 2px;
  font-size: 0.95rem;
}

/* ===== 实验室占位 ===== */
.lab-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.lab-card {
  text-align: center;
  color: rgba(255,255,255,0.5);
  max-width: 360px;
}
.lab-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
.lab-card h2 { font-size: 1.4rem; font-weight: 400; color: rgba(255,255,255,0.6); letter-spacing: 3px; margin: 0 0 8px; }
.lab-sub { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin: 0 0 20px; }
.lab-bar-wrap { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 16px; }
.lab-bar-label { font-size: 0.7rem; color: rgba(255,255,255,0.3); white-space: nowrap; }
.lab-bar { width: 160px; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); overflow: hidden; }
.lab-bar-fill { display: block; width: 35%; height: 100%; border-radius: 2px; background: linear-gradient(90deg, rgba(160,140,200,0.6), rgba(140,180,210,0.6)); animation: labBarPulse 2.5s ease-in-out infinite; }
@keyframes labBarPulse {
  0%, 100% { width: 28%; }
  50% { width: 42%; }
}
.lab-hint { color: rgba(255,255,255,0.2); font-size: 0.78rem !important; letter-spacing: 1px; line-height: 1.6; }

/* ===== 侧边栏浮动按钮 ===== */
.sidebar-toggle {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  border-radius: 6px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.sidebar-toggle img { width: 18px; height: 18px; opacity: 0.4; }

.sidebar-toggle:hover {
  background: rgba(0,0,0,0.05);
}
.sidebar-toggle:hover img { opacity: 0.7; }
.sidebar-fab::after {
  content: '展开侧边栏';
  position: absolute;
  left: calc(100% + 6px);
  white-space: nowrap;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.8);
  background: rgba(20,20,30,0.85);
  padding: 4px 10px;
  border-radius: 6px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
}
.sidebar-fab:hover::after { opacity: 1; }
/* 「置顶」按钮：悬浮的圆形，贴在文章卡片右侧外面（左边距由 JS 量卡片位置后写进内联样式）。
   材质和 WidgetCard 那套卡片统一：深色玻璃 + 1px 浅边框 + 柔和阴影。
   ⚠️ 只写标准 backdrop-filter —— 手写 -webkit- 会让构建把标准那条丢掉（Firefox 就废了）。 */
.back-top {
  position: fixed;
  right: auto;              /* 横向位置由 :style 的 left 决定 */
  left: 24px;               /* 兜底，JS 量到之前先落在左边 */
  bottom: 24px;
  z-index: 55;                 /* 顶栏 50 / 侧边栏 10 / 音乐浮层 60 */
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  background: rgba(30, 42, 50, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.25),
    0 8px 10px -6px rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.72);
  font-family: inherit;        /* 按钮不继承字体，不加会掉出中文字体栈 */
  font-size: 0.6rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
}
.back-top-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: #a0d2b9;
}
.back-top:hover {
  color: #fff;
  background: rgba(40, 54, 64, 0.7);
  border-color: rgba(160, 210, 185, 0.4);
  transform: translateY(-2px);
}
.back-top:active { transform: translateY(0); }

@keyframes fabHint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.65; }
}

.toc-mobile-btn {
  display: none;
}
@media (max-width: 1349px) {
  .toc-mobile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 0;
    top: 80px;
    z-index: 90;
    width: 32px;
    height: 48px;
    border-radius: 8px 0 0 8px;
    border: 1px solid rgba(255,255,255,0.1);
    border-right: none;
    background: rgba(30,42,50,0.28);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: rgba(255,255,255,0.45);
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  .toc-mobile-btn:active { color: #fff; background: rgba(30,42,50,0.5); }
  .toc-mobile-btn img { width: 16px; height: 16px; opacity: 0.85; }
  .toc-mobile-btn.hidden { transform: translateX(100%); opacity: 0; pointer-events: none; }
  .reader-wrapper { display: block; max-width: none; width: auto; margin: 0 0 60px; }
  /* 窄屏没有「正文左边那一列」（wrapper 变成 block 了），三张卡放不下，整列收起。
     两条选择器都要写：外面那条 .main-content.expanded .reader-aside 权重更高
     （0,3,0），只写 .reader-aside 压不住它，收起侧边栏时左列还是会冒出来。
     阅读态下窄屏就没有音乐控件了 —— 回列表页（右下角那条胶囊）还能用。 */
  /* 窄屏三张卡放不下，左列整列收起 */
  .reader-aside,
  .main-content.expanded .reader-aside { display: none; }
  /* 但右列必须始终可渲染：窄屏的目录是 position:fixed 的抽屉浮层，
     祖先 display:none 会把它一起干掉，那个「目录」按钮就点不出来了。
     两条都写，靠源码顺序压过外面那条 .main-content.expanded .reader-right。 */
  .main-content .reader-right,
  .main-content.expanded .reader-right { display: flex; }
  /* 统计卡在窄屏没地方搁，藏掉。
     ⚠️ 只能藏统计卡 —— 目录现在也是 .wcard，按 .wcard 藏会把目录一起干掉。 */
  .reader-right :deep(.stats-slot) { display: none; }
  /* 目录卡在浮层里不再叠一层玻璃。
     ⚠️ 标题栏也必须藏 —— 窄屏的目录列表是 position:fixed 的抽屉浮层，
     壳剥掉之后标题会孤零零留在页面流里，在文章下面单独出一行「▌文章目录」。 */
  .toc-slot {
    background: none;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    border-radius: 0;
    padding: 0;
  }
  .toc-slot :deep(.wcard-head) { display: none; }
  .reader-panel { padding: 28px 20px; width: calc(100% - 24px); margin: 0 auto 60px; max-width: 900px; }
  .rp-body :deep(img) { max-width: 100%; height: auto; }
  .rp-header h1 { font-size: 1.4rem; }
  .archive-view { width: calc(100% - 24px); }
  /* 只收间距，不再强制单列 —— 单列会把卡片压成 6:1 的横条，人脸全被裁掉 */
  .av-grid { gap: 12px; }
}

/* ===== 移动端：去掉毛玻璃 =====
   backdrop-filter 很贵——背后画面每变一次，就要把整块重新模糊一遍。
   阅读面板又大又长，是这一页掉帧的主因；搜索框和标签栏同理。
   底色本来就是深色半透明，alpha 提上去之后观感几乎不变。
   ≥861px 不受影响，桌面端一个像素都不动。
   那两个小圆钮（回到顶部 / 目录）面积只有几百像素，模糊开销可忽略，
   而且模糊正是它们的外观特征，所以保留。 */
@media (max-width: 860px) {
  /* 搜索框和标签栏已经不写 backdrop-filter 了（基础样式就没有），
     这两条覆盖已删 —— 留着只会在窄屏把底色换成另一套，白白不一致。 */
  /* 窄屏保留毛玻璃，但只取一半：backdrop-filter 在移动端很贵，全量会把低端机拖卡。
     底色同时降一点，否则 0.86 太实、糊了也看不出来。
     ⚠️ 仍然只写标准属性，别手写 -webkit-。 */
  .reader-panel {
    backdrop-filter: blur(calc(var(--panel-blur, 20px) * 0.5));
    background: rgba(30, 42, 50, 0.66);
  }
  /* 之字形窄屏不再左右交替，全部靠左一列（参考站也是 md 以下不交替） */
  .zz-spine { left: 17px; }
  .zz-node { grid-template-columns: 34px 1fr; }
  .zz-mid { grid-column: 1; }
  .zz-node:not(.right) .zz-card,
  .zz-node.right .zz-card { grid-column: 2; }
}

/* ===== 极小屏 ===== */
@media (max-width: 540px) {
  .reader-panel { padding: 20px 16px; }
  .rp-header h1 { font-size: 1.2rem; letter-spacing: 2px; }
  .rp-back { margin-bottom: 18px; }
  /* min-height 已经不存在了（分离式靠封面撑高），这里只剩内边距微调 */
  .avc-main { padding: 12px 14px 6px; }
  .avc-tags { padding: 0 14px 14px; }
  .av-result { margin-bottom: 18px; }
}
</style>