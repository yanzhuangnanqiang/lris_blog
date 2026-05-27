<template>
  <div class="notes-layout">
    <TopBar />

    <BackgroundWallpaper image-src="yeguang.jpg" />

    <Sidebar :selected-id="selectedId" @select="id => selectedId = id" />

    <button
      v-if="theme.isSidebarCollapsed"
      class="sidebar-fab"
      @click="theme.toggleSidebar"
      title="展开侧边栏"
    >
      <img src="@/assets/panel-right-open.svg" alt="展开" />
    </button>

    <main ref="mainRef" class="main-content" :class="{ expanded: theme.isSidebarCollapsed }" @scroll="onScroll">
      <!-- ===== 最新 ===== -->
      <template v-if="theme.currentNav === 'latest'">
        <WelcomePanel v-if="!selectedNote" />
        <PetalEffect v-if="theme.isPetalEnabled && !selectedNote" />
        <article v-if="selectedNote" class="reader-panel">
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
        </article>
      </template>

      <!-- ===== 归档 ===== -->
      <template v-else-if="theme.currentNav === 'archive'">
        <article v-if="selectedNote" class="reader-panel">
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
        </article>

        <div v-else class="archive-view">
          <div class="av-search">
            <div class="av-search-box">
              <input v-model="archiveQuery" placeholder="搜索标题或标签..." />
              <span class="av-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>
          </div>
          <div class="av-tags">
            <span
              v-for="t in allTags"
              :key="t"
              class="av-tag"
              :class="{ active: activeTags.includes(t) }"
              @click="toggleTag(t)"
            ># {{ t }}</span>
          </div>
          <p class="av-count">{{ filteredArchive.length }} 篇笔记</p>

          <div class="av-grid">
            <div
              v-for="(note, idx) in filteredArchive"
              :key="note.id"
              class="av-card"
              :style="{ backgroundImage: `url(${resolveCover(note) || noteImgForId(note.id)})` }"
              @click="selectedId = note.id"
            >
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
          <p>还在设计中，敬请期待</p>
          <p class="lab-hint">这里将用于代码演示、可视化与交互实验</p>
        </div>
      </div>
    </main>

    <button v-if="showTopBtn" class="back-top" @click="scrollToTop" title="回到顶部">↑</button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import BackgroundWallpaper from '@/components/BackgroundWallpaper.vue'
import Sidebar from '@/components/tuberose/Sidebar.vue'
import WelcomePanel from '@/components/tuberose/WelcomePanel.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import { useAppStore } from '@/stores/theme'
import { notes, renderNote } from '@/data/loadNotes'

const notesImgModules = import.meta.glob('@/assets/saiset/notes/*.{jpg,jpeg,png,JPG,JPEG,PNG,webp}', { eager: true, import: 'default' })
const notesImgs = Object.values(notesImgModules)
function noteImg(idx) { return notesImgs[idx % notesImgs.length] || '' }
function noteImgForId(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash |= 0 }
  return projectImgs[Math.abs(hash) % projectImgs.length]
}
// frontmatter cover 字段手动指定封面 → 优先从 notes/ 找，再从 project/ 找
function resolveCover(note) {
  if (!note.cover) return null
  for (const [k, v] of Object.entries(notesImgModules)) {
    if (k.endsWith('/' + note.cover)) return v
  }
  return null
}

const theme = useAppStore()
const selectedId = ref(null)
const selectedNote = computed(() => notes.find(n => n.id === selectedId.value) || null)
const renderedHtml = ref('')

watch(selectedId, async (id) => {
  if (!id) { renderedHtml.value = ''; return }
  const note = notes.find(n => n.id === id)
  if (!note) return
  if (note.bodyHtml) { renderedHtml.value = note.bodyHtml; return }
  renderedHtml.value = await renderNote(note)
  note.bodyHtml = renderedHtml.value
})

const coverImg = computed(() => {
  if (!selectedNote.value) return null
  return resolveCover(selectedNote.value) || noteImg(notes.findIndex(n => n.id === selectedNote.value.id))
})
const mainRef = ref(null)
const showTopBtn = ref(false)
function onScroll() { showTopBtn.value = (mainRef.value?.scrollTop || 0) > 300 }
function scrollToTop() { mainRef.value?.scrollTo({ top: 0, behavior: 'smooth' }) }

// 归档状态
const archiveQuery = ref('')
const activeTags = ref([])
const allTags = computed(() => [...new Set(notes.flatMap(n => n.tags))])
function toggleTag(t) {
  const i = activeTags.value.indexOf(t)
  if (i >= 0) activeTags.value.splice(i, 1)
  else activeTags.value.push(t)
}
const filteredArchive = computed(() => {
  let list = notes
  if (archiveQuery.value) {
    const q = archiveQuery.value.toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)))
  }
  if (activeTags.value.length) list = list.filter(n => activeTags.value.some(t => n.tags.includes(t)))
  return list
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
  transition: margin-left 0.3s ease;
  padding-top: 70px;
  scrollbar-width: none;
}
.main-content::-webkit-scrollbar { display: none; }

/* ===== 阅读面板 ===== */
.reader-panel {
  max-width: 1000px;
  width: calc(100% - 48px);
  margin: 0 auto 60px;
  padding: 40px 56px;
  background: rgba(30, 42, 50, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  color: rgba(230,235,240,0.92);
  scrollbar-width: thin;
  scrollbar-color: rgba(111,66,193,0.25) transparent;
}
.reader-panel::-webkit-scrollbar { height: 4px; }
.reader-panel::-webkit-scrollbar-thumb { background: rgba(111,66,193,0.25); border-radius: 2px; }

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
  height: 240px;
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
.rp-body :deep(p) { margin: 0 0 18px; }
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
.rp-body :deep(img) { max-width: 100%; border-radius: 12px; margin: 16px 0; }
.rp-body :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.88rem; }
.rp-body :deep(th), .rp-body :deep(td) { padding: 8px 14px; border: 1px solid rgba(255,255,255,0.08); text-align: left; }
.rp-body :deep(th) { background: rgba(255,255,255,0.05); color: #fff; font-weight: 500; }

/* ===== 归档视图 ===== */
.archive-view {
  max-width: 1000px;
  width: calc(100% - 48px);
  margin: 0 auto 60px;
}
.av-search { margin-bottom: 20px; display: flex; justify-content: center; }
.av-search-box { position: relative; max-width: 420px; width: 100%; }
.av-search input {
  width: 100%;
  padding: 10px 38px 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(30,42,50,0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255,255,255,0.85);
  font-size: 0.85rem;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}
.av-search input::placeholder { color: rgba(255,255,255,0.3); }
.av-search input:focus { border-color: rgba(111,66,193,0.4); }
.av-search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0.3; color: rgba(255,255,255,0.6); display: flex; }

.av-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 14px 18px; background: rgba(15,20,30,0.28); border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.av-tag {
  padding: 5px 14px;
  border-radius: 14px;
  background: rgba(15,20,30,0.45);
  border: 1px solid rgba(255,255,255,0.1);
  color: #e8a0c8;
  font-size: 0.78rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
}
.av-tag:hover { background: rgba(15,20,30,0.65); color: #f0b8d8; }
.av-tag.active {
  background: rgba(217,130,180,0.25);
  border-color: rgba(217,130,180,0.4);
  color: #f0b8d8;
}

.av-count { font-size: 0.78rem; color: rgba(255,255,255,0.35); letter-spacing: 2px; margin-bottom: 24px; text-align: right; }

.av-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.av-card {
  position: relative;
  background-size: cover;
  background-position: center;
  background-color: rgba(30,42,50,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.25s;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.av-card:hover {
  border-color: rgba(111,66,193,0.25);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.avc-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px 20px 10px;
  background: linear-gradient(to top, rgba(15,22,30,0.92) 0%, rgba(15,22,30,0.5) 60%, transparent 100%);
}
.avc-main h4 {
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}
.avc-date { font-size: 0.7rem; color: rgba(255,255,255,0.45); letter-spacing: 1px; white-space: nowrap; }
.avc-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 20px 18px;
  background: rgba(15,22,30,0.92);
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
}
.lab-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
.lab-card h2 { font-size: 1.4rem; font-weight: 400; color: rgba(255,255,255,0.6); letter-spacing: 3px; margin: 0 0 8px; }
.lab-card p { font-size: 0.9rem; margin: 0 0 4px; }
.lab-hint { color: rgba(255,255,255,0.25); font-size: 0.8rem !important; letter-spacing: 1px; }

/* ===== 侧边栏浮动按钮 ===== */
.sidebar-fab {
  position: fixed;
  left: 12px;
  top: 10%;
  transform: translateY(-50%);
  z-index: 80;
  width: 32px;
  height: 52px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fabHint 2.5s ease-in-out infinite;
}
.sidebar-fab img { width: 18px; height: 18px; opacity: 0.7; }

.sidebar-fab:hover {
  color: rgba(255, 255, 255, 0.7);
  animation: none;
}
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
.back-top {
  position: fixed;
  right: 24px;
  bottom: 80px;
  z-index: 60;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(30,42,50,0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.5);
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-top:hover { color: #fff; background: rgba(30,42,50,0.7); transform: translateY(-2px); }

@keyframes fabHint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.65; }
}

@media (max-width: 780px) {
  .reader-panel { padding: 28px 20px; width: calc(100% - 24px); }
  .rp-cover { height: 180px; }
  .rp-header h1 { font-size: 1.4rem; }
  .archive-view { width: calc(100% - 24px); }
  .av-grid { grid-template-columns: 1fr; gap: 12px; }
  .av-search-box { max-width: 100%; }
}
</style>
