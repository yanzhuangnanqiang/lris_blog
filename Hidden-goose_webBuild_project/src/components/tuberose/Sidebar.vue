<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:04:25
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 16:38:46
 * @FilePath: \Hidden-goose_webBuild_project\src\components\tuberose\Sidebar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <aside class="sidebar" :class="{ collapsed: theme.isSidebarCollapsed }">
    <div class="sidebar-inner">
      <div class="top-controls">
        <button class="lang-btn">中</button>
        <button class="collapse-btn" @click="theme.toggleSidebar">
          ◀
        </button>
      </div>
      <SidebarHeader />
      <SidebarNav />
      <SidebarFilters />
      <SidebarNoteList />
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

const theme = useAppStore()
</script>

<style scoped>
.sidebar {
  position: fixed;          /* 必须固定，否则 transform 失效 */
  left: 0;
  top: 0;
  z-index: 10;

  width: 25%;
  min-width: 280px;
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
  padding-top: 40px;
}

/* 收缩态：完全移出屏幕 */
.sidebar.collapsed {
  transform: translateX(-100%);
}

/* 收缩后隐藏内部，防止滚动条/按钮残留 */
.sidebar.collapsed .sidebar-inner {
  visibility: hidden;
  /* 或者用 opacity: 0; transition: opacity 0.2s; 更柔和 */
}

.sidebar-inner {
  padding: 20px 16px;
  padding-top: 24px;       /* 给顶部控件留呼吸空间 */
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
}

.collapse-btn, .lang-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--cold-white);
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
}
</style>