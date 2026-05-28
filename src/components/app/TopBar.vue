<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-28 14:20:27
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 15:11:29
 * @FilePath: \Hidden-goose_webBuild_project\src\components\app\TopBar.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <header
    class="topbar"
    :class="{ active: isHover || menuOpen, 'sidebar-open': !theme.isSidebarCollapsed }"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="left">
      <slot name="left-extra" />
      <div class="brand" @click="go('/')">
        <span class="brand-title">林间初见</span>
        <span class="brand-sub">Iris / Tuberose</span>
      </div>

      <nav class="nav desktop">
        <a :class="{ on: isOn('/') }" @click.prevent="go('/')">首页</a>
        <a :class="{ on: isOn('/share') }" @click.prevent="go('/share')">分享</a>
        <a :class="{ on: isOn('/projects') }" @click.prevent="go('/projects')">项目</a>
        <a :class="{ on: isOn('/notes') }" @click.prevent="go('/notes')">笔记</a>
        <a :class="{ on: isOn('/about') }" @click.prevent="go('/about')">关于</a>
      </nav>
    </div>

    <div class="right">
      <button class="menu-btn mobile" @click="menuOpen = !menuOpen">
        {{ menuOpen ? '✕' : '☰' }}
      </button>
      <AvatarChip class="avatar" @click="go('/about')" />
    </div>

    <div v-if="menuOpen" class="nav mobile-panel">
      <a :class="{ on: isOn('/') }" @click.prevent="goAndClose('/')">首页</a>
      <a :class="{ on: isOn('/share') }" @click.prevent="goAndClose('/share')">分享</a>
      <a :class="{ on: isOn('/projects') }" @click.prevent="goAndClose('/projects')">项目</a>
      <a :class="{ on: isOn('/notes') }" @click.prevent="goAndClose('/notes')">笔记</a>
      <a :class="{ on: isOn('/about') }" @click.prevent="goAndClose('/about')">关于</a>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/theme'
import AvatarChip from './AvatarChip.vue'

const router = useRouter()
const theme = useAppStore()
const route = useRoute()

const isHover = ref(false)
const menuOpen = ref(false)

function go(path) {
  router.push(path)
}
function goAndClose(path) {
  menuOpen.value = false
  go(path)
}
function isOn(path) {
  return route.path === path
}
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  z-index: 50;
  padding: 12px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 默认“隐身”但保留轻微结构 */
  background: rgba(0, 0, 0, 0);
  border-bottom: 1px solid rgba(255, 255, 255, 0);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0);

  /* 过渡更顺滑 */
  transition:
    background 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease,
    backdrop-filter 220ms ease,
    left 0.3s ease;

  /* 提升可读性：即使透明也让文字不至于太糊 */
  -webkit-font-smoothing: antialiased;

  /* 侧边栏展开时 TopBar 右移 */
  left: 0;
}
.topbar.sidebar-open {
  left: 25%;
}
@media (max-width: 1200px) {
  .topbar.sidebar-open { left: 300px; }
}
@media (max-width: 860px) {
  .topbar.sidebar-open { left: 260px; }
}

.topbar.active {
  /* 深灰毛玻璃：更“稳”、更接近你参考图的质感 */
  background: linear-gradient(
    to bottom,
    rgba(18, 18, 18, 0.62),
    rgba(18, 18, 18, 0.38)
  );

  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);

  /* 顶栏下缘高光线（很关键：质感来自这条线） */
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);

  /* 阴影让顶栏“浮”起来 */
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand {
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-title {
  color: var(--cold-white);
  font-size: 1.05rem;
  letter-spacing: 2px;
}

.brand-sub {
  color: rgba(220, 230, 240, 0.7);
  font-size: 0.75rem;
  letter-spacing: 1px;
  margin-top: 2px;
}

.nav a {
  color: rgba(220, 230, 240, 0.75);
  text-decoration: none;
  margin-right: 14px;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 12px;
  transition: 0.2s;
}

.nav a.on {
  color: #fff;
  background: rgba(220, 230, 240, 0.14);
}

.nav a:hover {
  color: #fff;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-btn {
  border: 1px solid rgba(220, 230, 240, 0.2);
  background: rgba(220, 230, 240, 0.12);
  color: var(--cold-white);
  border-radius: 12px;
  padding: 6px 10px;
  cursor: pointer;
}

.desktop {
  display: flex;
}
.mobile {
  display: none;
}
.mobile-panel {
  display: none;
}

@media (max-width: 860px) {
  .desktop {
    display: none;
  }
  .mobile {
    display: inline-flex;
  }
  .mobile-panel {
    position: absolute;
    top: 100%;
    left: 12px;
    right: 12px;
    margin-top: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    background: rgba(20, 20, 20, 0.55);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
  }
  .mobile-panel a {
    margin-right: 0;
  }
}
</style>