<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:04:25
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 16:38:46
 * @FilePath: \Hidden-goose_webBuild_project\src\components\tuberose\Sidebar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <aside class="sidebar" :class="theme.isSidebarCollapsed ? 'panel-right-close' : 'panel-right-open'" @touchstart="onSwipeStart" @touchmove="onSwipeMove" @touchend="onSwipeEnd">
    <div class="sidebar-inner">
      <div class="top-row">
        <button class="collapse-btn" @click="theme.toggleSidebar" title="收起侧边栏">
          <img src="@/assets/chevron-left.svg" alt="收起" />
        </button>
      </div>
      <SidebarHeader />
      <SidebarNav />
      <p class="list-hint">浏览全部笔记（{{ notes.length }} 篇）</p>
      <SidebarIntro v-if="theme.currentNav !== 'latest'" :tab="theme.currentNav" />
      <SidebarNoteList :selected-id="selectedId" @select="id => $emit('select', id)" />
      <SidebarFooter />
    </div>
  </aside>
</template>

<script setup>
import { useAppStore } from '@/stores/theme'
import { notes } from '@/data/loadNotes'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarNoteList from './SidebarNoteList.vue'
import SidebarFooter from './SidebarFooter.vue'
import SidebarIntro from './SidebarIntro.vue'

defineProps({ selectedId: { type: String, default: null } })
defineEmits(['select'])
const theme = useAppStore()

let swipeX = 0
function onSwipeStart(e) { swipeX = e.touches[0].clientX }
function onSwipeMove() { /* tracked in start/end only */ }
function onSwipeEnd(e) {
  const dx = e.changedTouches[0].clientX - swipeX
  if (dx < -60 && !theme.isSidebarCollapsed) theme.toggleSidebar()
}
</script>

<style scoped>
.sidebar {
  position: fixed;          /* 必须固定，否则 transform 失效 */
  left: 0;
  top: 0;
  z-index: 10;

  width: 25%;
  min-width: 280px;
  max-width: 520px;
  height: 100%;
  background: rgba(30, 42, 50, 0.5);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  color: var(--cold-white);

  /* 动画 */
  transition: transform 0.3s ease;
  transform: translateX(0);
}

/* 收缩态：完全移出屏幕 */
.sidebar.panel-right-close {
  transform: translateX(-100%);
}

/* 收缩后隐藏内部，防止滚动条/按钮残留 */
.sidebar.panel-right-close .sidebar-inner {
  visibility: hidden;
  /* 或者用 opacity: 0; transition: opacity 0.2s; 更柔和 */
}

.sidebar-inner {
  padding: 14px 16px 20px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;
}
.sidebar-inner::-webkit-scrollbar { display: none; }

/* ===== 进入动画 =====
   只在挂载时跑一次（切路由会重建 Sidebar），之后收起/展开照旧走 .sidebar 的 transform 过渡。

   整块这层必须挂在 .sidebar-inner 上，不能挂 .sidebar ——
   .sidebar 自己带 backdrop-filter，而 opacity < 1 会新建 backdrop root，
   模糊会整段消失、动画结束再跳回来。
   用独立的 translate 属性而不是 transform，免得和 .sidebar 的 translateX 收起态互相覆盖。 */
.sidebar-inner {
  animation: sideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
@keyframes sideIn {
  from { opacity: 0; translate: -24px 0; }
  to   { opacity: 1; translate: 0 0; }
}

/* 内部各块只做位移，透明度交给上面那层 ——
   两层都淡的话是相乘的，动画中段会整片发闷。
   排除 .note-list：卡片是它的子元素，父子都位移会让位移翻倍。 */
.sidebar-inner > *:not(.note-list) {
  animation: sideItemIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.sidebar-inner :deep(.note-card) {
  animation: sideItemIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
@keyframes sideItemIn {
  from { translate: 0 12px; }
  to   { translate: 0 0; }
}

/* 延迟阶梯。用类名定位而不是 nth-child ——
   SidebarIntro 是 v-if，它一出现所有 nth-child 索引就整体错位一格。 */
.sidebar-inner > .top-row    { animation-delay: 0.04s; }
.sidebar-inner > .header     { animation-delay: 0.10s; }
.sidebar-inner > .nav        { animation-delay: 0.16s; }
.sidebar-inner > .list-hint  { animation-delay: 0.22s; }
.sidebar-inner > .intro      { animation-delay: 0.22s; }
.sidebar-inner :deep(.note-card:nth-child(1)) { animation-delay: 0.28s; }
.sidebar-inner :deep(.note-card:nth-child(2)) { animation-delay: 0.34s; }
.sidebar-inner :deep(.note-card:nth-child(3)) { animation-delay: 0.40s; }
.sidebar-inner :deep(.note-card:nth-child(4)) { animation-delay: 0.46s; }
.sidebar-inner > .footer     { animation-delay: 0.52s; }

.top-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.collapse-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
  display: flex;
  position: relative;
  animation: btnHint 2.5s ease-in-out infinite;
}
.collapse-btn:hover { opacity: 0.7; animation: none; }
.collapse-btn img { width: 18px; height: 18px; }

.list-hint {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.22);
  letter-spacing: 2px;
  margin: 0 0 12px;
  text-align: center;
}


.collapse-btn::after {
  content: '收起侧边栏';
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
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
.collapse-btn:hover::after { opacity: 1; }
@keyframes btnHint {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@media (max-width: 1200px) {
  .sidebar { width: 300px; min-width: 300px; max-width: 300px; }
}
@media (max-width: 860px) {
  .sidebar { width: 260px; min-width: 260px; max-width: 260px; }
}
</style>