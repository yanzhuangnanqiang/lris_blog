<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:02:35
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 16:45:08
 * @FilePath: \Hidden-goose_webBuild_project\src\views\TuberoseNotes.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="notes-layout">
    <TopBar />

    <BackgroundWallpaper image-src="yeguang.jpg" />

    <Sidebar />

    <!-- 折叠后永远可展开的浮标按钮 -->
    <button
      v-if="theme.isSidebarCollapsed"
      class="sidebar-fab"
      @click="theme.toggleSidebar"
      title="展开侧边栏"
    >
      ▶
    </button>

    <main class="main-content" :class="{ expanded: theme.isSidebarCollapsed }">
      <WelcomePanel />
      <PetalEffect v-if="theme.isPetalEnabled" />
    </main>
  </div>
</template>

<script setup>
import TopBar from '@/components/app/TopBar.vue'
import BackgroundWallpaper from '@/components/BackgroundWallpaper.vue'
import Sidebar from '@/components/tuberose/Sidebar.vue'
import WelcomePanel from '@/components/tuberose/WelcomePanel.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import { useAppStore } from '@/stores/theme'
const theme = useAppStore()
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
  overflow: hidden;
  background: transparent;
  transition: margin-left 0.3s ease;
  padding-top: 70px; /* 顶栏空间 */
}

/*.sidebar-fab {
  position: fixed;
  left: 10px;
  top: 10%;
  transform: translateY(-50%); 
  z-index: 80;

  width: 34px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid rgba(220, 230, 240, 0.18);
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(12px);
  color: rgba(220, 230, 240, 0.92);
  cursor: pointer;
} */

.sidebar-fab {
  position: fixed;
  left: 12px;
  top: 10%;
  transform: translateY(-50%);
  z-index: 80;

  /* 尺寸更协调 */
  width: 32px;
  height: 52px;

  /* 圆角更柔和 */
  border-radius: 16px;

  /* 更淡、更通透、不突兀 */
  background: rgba(20, 20, 20, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  
  /* 文字颜色更柔和 */
  color: rgba(255, 255, 255, 0.7);

  /* 动画更顺滑，不生硬 */
  transition: all 0.3s ease;
  cursor: pointer;
}

/* 悬浮时才稍微明显一点，平时几乎隐形 */
.sidebar-fab:hover {
  background: rgba(20, 20, 20, 0.35);
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.05);
}

</style>
