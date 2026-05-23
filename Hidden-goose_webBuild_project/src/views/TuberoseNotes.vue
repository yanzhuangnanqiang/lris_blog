<template>
  <div class="notes-layout">
    <TopBar />

    <BackgroundWallpaper image-src="yeguang.jpg" />

    <Sidebar />

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
  padding-top: 70px;
}

.sidebar-fab {
  position: fixed;
  left: 12px;
  top: 10%;
  transform: translateY(-50%);
  z-index: 80;
  width: 32px;
  height: 52px;
  border-radius: 16px;
  background: rgba(20, 20, 20, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  cursor: pointer;
}

.sidebar-fab:hover {
  background: rgba(20, 20, 20, 0.35);
  color: rgba(255, 255, 255, 0.95);
  transform: translateY(-50%) scale(1.05);
}
</style>
