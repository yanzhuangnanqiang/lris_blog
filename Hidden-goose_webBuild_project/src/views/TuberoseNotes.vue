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

    <main class="main-content" :class="{ expanded: theme.isSidebarCollapsed }">
      <WelcomePanel v-if="!selectedNote" />
      <PetalEffect v-if="theme.isPetalEnabled && !selectedNote" />

      <article v-if="selectedNote" class="reader-panel">
        <button class="rp-back" @click="selectedId = null">← 返回</button>
        <div class="rp-header">
          <h1>{{ selectedNote.title }}</h1>
          <div class="rp-meta">
            <span>{{ selectedNote.date }}</span>
            <span v-for="t in selectedNote.tags" :key="t" class="rp-tag">{{ t }}</span>
          </div>
        </div>
        <div class="rp-body" v-html="selectedNote.bodyHtml"></div>
      </article>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import BackgroundWallpaper from '@/components/BackgroundWallpaper.vue'
import Sidebar from '@/components/tuberose/Sidebar.vue'
import WelcomePanel from '@/components/tuberose/WelcomePanel.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import { useAppStore } from '@/stores/theme'
import { notes } from '@/data/loadNotes'
const theme = useAppStore()
const selectedId = ref(null)
const selectedNote = computed(() => notes.find(n => n.id === selectedId.value) || null)
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
}

/* 阅读面板 */
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

.rp-header { margin-bottom: 28px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.rp-header h1 { font-size: 1.6rem; font-weight: 400; color: #fff; letter-spacing: 3px; margin: 0 0 12px; }
.rp-meta { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; color: rgba(255,255,255,0.4); letter-spacing: 1px; flex-wrap: wrap; }
.rp-tag { padding: 2px 10px; border-radius: 10px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); font-size: 0.7rem; }

.rp-body { line-height: 2; font-size: 0.93rem; }
.rp-body :deep(h2) { font-size: 1.2rem; color: #fff; font-weight: 400; margin: 28px 0 10px; letter-spacing: 2px; }
.rp-body :deep(h3) { font-size: 1rem; color: rgba(255,255,255,0.9); font-weight: 400; margin: 22px 0 8px; }
.rp-body :deep(p) { margin: 0 0 14px; }
.rp-body :deep(code) { background: rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 4px; font-size: 0.85rem; }
.rp-body :deep(pre) { background: rgba(0,0,0,0.3); padding: 14px 18px; border-radius: 12px; overflow-x: auto; margin: 14px 0; }
.rp-body :deep(pre code) { background: none; padding: 0; }
.rp-body :deep(blockquote) { margin: 14px 0; padding: 10px 16px; border-left: 3px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.55); font-style: italic; }
.rp-body :deep(a) { color: #b8a0e0; }

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
@keyframes fabHint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.65; }
}
</style>
