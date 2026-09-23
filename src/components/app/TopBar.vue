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
    :class="{ active: isHover || menuOpen, 'sidebar-open': !theme.isSidebarCollapsed && route.path === '/notes' }"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="left">
      <slot name="left-extra" />
      <a class="brand" href="/" @click="onNavClick($event, '/')">
        <span class="brand-title">林间初见</span>
        <span class="brand-sub">Iris / Tuberose</span>
      </a>

      <nav ref="navRef" class="nav desktop">
        <!-- 刻度线在下层，跟着激活项滑动；文字靠 z-index 压在上面 -->
        <span class="nav-tick" :style="tickStyle" aria-hidden="true"></span>
        <a
          v-for="l in links"
          :key="l.path"
          :href="l.path"
          :class="{ on: isOn(l.path) }"
          @click="onNavClick($event, l.path)"
        ><span class="lbl">{{ l.label }}</span></a>
      </nav>
    </div>

    <div class="right">
      <button
        class="menu-btn mobile"
        :aria-expanded="menuOpen"
        aria-label="导航菜单"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>
      <AvatarChip class="avatar" @click="go('/about')" />
    </div>

    <div v-if="menuOpen" class="nav mobile-panel">
      <a
        v-for="l in links"
        :key="l.path"
        :href="l.path"
        :class="{ on: isOn(l.path) }"
        @click="onNavClick($event, l.path, true)"
      >{{ l.label }}</a>
    </div>
  </header>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/theme'
import AvatarChip from './AvatarChip.vue'

const router = useRouter()
const theme = useAppStore()
const route = useRoute()

const isHover = ref(false)
const menuOpen = ref(false)

const links = [
  { path: '/', label: '首页' },
  { path: '/share', label: '分享' },
  { path: '/projects', label: '项目' },
  { path: '/notes', label: '笔记' },
  { path: '/about', label: '关于' },
]

const navRef = ref(null)
// 刻度线是定长的，所以滑动只需要 translateX —— 不用碰 width（见 .nav-tick 的注释）
const TICK_W = 18 // 必须和 CSS 里 .nav-tick 的 width 一致
// 初始 opacity 0：/post/:id 和 /gallery 匹配不到任何一项，刻度线本来就该是隐形的
const tickStyle = ref({ opacity: 0 })
let ready = false

// 把刻度线移到当前激活项正下方居中。只在路由变化和 resize 时量，不在滚动或每帧里量。
// 用 offsetLeft/offsetWidth 而不是百分比：标签宽度不等时百分比会错位。
function syncTick() {
  const nav = navRef.value
  if (!nav) return
  const el = [...nav.querySelectorAll('a')].find(a => a.classList.contains('on'))
  if (!el) {
    tickStyle.value = { ...tickStyle.value, opacity: 0 }
    ready = true
    return
  }
  tickStyle.value = {
    opacity: 1,
    transform: `translateX(${el.offsetLeft + el.offsetWidth / 2 - TICK_W / 2}px)`,
    // 首次测量先关掉过渡，否则进页面能看到刻度线从最左边滑过来
    transition: ready ? '' : 'none',
  }
  ready = true
}

function go(path) {
  router.push(path)
}

// 只接管不带修饰键的左键点击，其余（Ctrl/Cmd/中键）交还浏览器，
// 这样「在新标签页打开」走原生行为，而不是被 preventDefault 吃掉。
function onNavClick(e, path, closeMenu = false) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  if (closeMenu) menuOpen.value = false
  go(path)
}

function isOn(path) {
  return route.path === path
}

watch(() => route.path, () => nextTick(syncTick))
onMounted(() => {
  nextTick(syncTick)
  window.addEventListener('resize', syncTick)
})
onUnmounted(() => window.removeEventListener('resize', syncTick))
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
  text-decoration: none;
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

/* position: relative 让 offsetLeft 的参照系和药丸的 left: 0 对齐 */
.nav {
  position: relative;
  display: flex;
  gap: 14px;
}

/* 定长刻度线。宽度恒定是有意的 —— 移动只靠 translateX，
   不去 animate width（那会触发布局，也不符合性能守则里的 transform/opacity 约束）。
   改宽度时记得同步 JS 里的 TICK_W。 */
.nav-tick {
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 18px;
  height: 2px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.75);
  pointer-events: none;
  transition:
    transform 0.6s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.3s ease;
}

.nav a {
  position: relative;
  z-index: 1;
  overflow: hidden;
  color: rgba(220, 230, 240, 0.75);
  text-decoration: none;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 12px;
  transition: color 0.2s;
}

.nav a.on {
  color: #fff;
}

.nav a:hover {
  color: #fff;
}

.nav a .lbl {
  display: block;
}

/* 文字比药丸晚半拍滚入，看起来像「落位」而不是「一起扑上来」。
   both 让延迟期间停在起始态，所以不会先正常再跳一下。 */
.nav a.on .lbl {
  animation: navRoll 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) 120ms both;
}

@keyframes navRoll {
  from {
    transform: translateY(38%);
    opacity: 0.25;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
}
</style>