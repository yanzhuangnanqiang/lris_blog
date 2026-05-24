<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:04:25
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 16:38:46
 * @FilePath: \Hidden-goose_webBuild_project\src\components\tuberose\Sidebar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <aside class="sidebar" :class="theme.isSidebarCollapsed ? 'panel-right-close' : 'panel-right-open'">
    <div class="sidebar-inner">
      <div class="top-row">
        <button class="collapse-btn" @click="theme.toggleSidebar" title="收起侧边栏">
          <img src="@/assets/panel-right-close.svg" alt="收起" />
        </button>
      </div>
      <SidebarHeader />
      <SidebarNav />
      <SidebarFilters />
      <SidebarNoteList :selected-id="selectedId" @select="id => $emit('select', id)" />
      <SidebarFooter />
    </div>
  </aside>
</template>

<script setup>
import { useAppStore } from '@/stores/theme'
import SidebarHeader from './SidebarHeader.vue'
import SidebarNav from './SidebarNav.vue'
import SidebarFilters from './SidebarFilters.vue'
import SidebarNoteList from './SidebarNoteList.vue'
import SidebarFooter from './SidebarFooter.vue'

defineProps({ selectedId: { type: String, default: null } })
defineEmits(['select'])
const theme = useAppStore()
</script>

<style scoped>
.sidebar {
  position: fixed;          /* 必须固定，否则 transform 失效 */
  left: 0;
  top: 54px;
  z-index: 10;

  width: 25%;
  min-width: 280px;
  max-width: 520px;
  height: calc(100% - 54px);
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
  padding: 20px 16px;
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

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