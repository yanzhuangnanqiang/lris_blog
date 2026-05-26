<template>
  <div class="home">
    <TopBar />
    <MusicDock />

    <div class="scroller">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg" :class="{ loaded: heroLoaded }" :style="{ backgroundImage: `url(${heroBg})` }">
          <img :src="heroBg" class="preload" @load="heroLoaded = true" />
        </div>
        <PetalEffect />

        <div class="hero-content" :class="{ fading: scrollProgress > 0.3 }">
          <h1 class="hero-title" :style="{ color: titleColor }" @click="cycleColor">林间初见</h1>
          <p class="hero-line1">像一株在晨光里悄然绽放的鸢尾</p>
          <p class="hero-line2">这是一场安静的梦，也是一次不期而遇的心动。</p>

          <div class="light-spots" ref="spotsContainer">
            <p
              v-for="(w, i) in whispers"
              :key="i"
              class="spot"
              :class="[dragId === i ? 'dragging' : `float-${i}`, `theme-${spotTheme[i]}`]"
              :style="spotStyle(i)"
              @mousedown.prevent="onDragStart($event, i)"
              @touchstart.prevent="onDragStart($event, i)"
            >{{ w }}</p>
          </div>
        </div>

        <div class="scroll-hint" @click="scrollToPosts">
          <span class="arrow">↓</span>
        </div>
      </section>

      <!-- 社交链接 -->
      <div class="left-bottom">
        <IconLink
          v-for="c in contacts"
          :key="c.name"
          :name="c.name"
          :icon="c.icon"
          :url="c.url"
        />
      </div>
      <router-link class="right-bottom" to="/notes">
        <IconLink name="手帐" icon="notebook" url="javascript:void(0)" />
      </router-link>

      <!-- 文章区 -->
      <section class="posts-section" ref="postsRef">
        <div class="posts-mist" :class="{ lifted: mistLifted }" ref="mistRef"></div>
        <div class="posts-container" :class="{ revealed: mistLifted }">
          <h2 class="section-title">— 随 想 —</h2>

          <div class="filter-bar">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="{ active: activeCat === cat }"
              @click="switchCat(cat)"
            >{{ cat }}</button>
          </div>

          <div class="post-list">
            <article
              v-for="(post, i) in filteredPosts"
              :key="post.id"
              class="post-card"
              :style="{ animationDelay: `${0.1 + i * 0.12}s` }"
              @click="router.push(`/post/${post.id}`)"
            >
              <div class="post-left">
                <img :src="post.photoSrc" :alt="post.title" loading="lazy" decoding="async" />
              </div>
              <div class="post-right">
                <div class="post-meta">
                  <span class="post-cat">{{ post.category }}</span>
                  <span class="post-date">{{ post.date }}</span>
                </div>
                <h3 class="post-title">{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.excerpt }}</p>
                <span class="post-expand">— 阅读全文</span>
              </div>
            </article>
          </div>

          <footer class="end-cap">林间初见 · 难忘夏光</footer>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import IconLink from '@/components/app/IconLink.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import { contacts } from '@/data/contacts'
import { whispers } from '@/data/thoughts'
import { posts } from '@/data/loadPosts'
import heroBg from '@/assets/xiaguang.jpg'

const router = useRouter()
const activeCat = ref('全部')
function switchCat(cat) {
  const el = document.querySelector('.scroller')
  const top = el ? el.scrollTop : 0
  activeCat.value = cat
  nextTick(() => { if (el) el.scrollTop = top })
}
const heroLoaded = ref(false)
const postsRef = ref(null)
const mistRef = ref(null)
const scrollProgress = ref(0)
const mistLifted = ref(false)

let scrollerEl = null
let scrollRafId = null

function onScroll() {
  if (scrollRafId) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    if (!scrollerEl) return
    const heroH = scrollerEl.clientHeight
    const y = scrollerEl.scrollTop
    scrollProgress.value = Math.min(y / (heroH * 0.6), 1)

    // 双向阈值：往下 40% 雾散，往上退回 20% 雾聚，避免临界抖动
    if (y > heroH * 0.4) {
      mistLifted.value = true
    } else if (y < heroH * 0.2) {
      mistLifted.value = false
    }
  })
}

const categories = computed(() => {
  const cats = new Set(posts.map(p => p.category))
  return ['全部', ...cats]
})

const filteredPosts = computed(() => {
  if (activeCat.value === '全部') return posts
  return posts.filter(p => p.category === activeCat.value)
})

function scrollToPosts() {
  postsRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// 标题点击变色，深绿色系循环
const greens = ['#2d5a27', '#3d6b35', '#1e4028', '#4a7c3f', '#2a5030']
const colorIdx = ref(0)
const titleColor = ref(greens[0])
function cycleColor() {
  colorIdx.value = (colorIdx.value + 1) % greens.length
  titleColor.value = greens[colorIdx.value]
}

// 随机主题色
const themes = ['mint', 'pink', 'blue', 'iris']
const spotTheme = whispers.map(() => themes[Math.floor(Math.random() * themes.length)])

// 碎碎念 — 可拖动光斑，初始散落位置
const spots = ref([
  { x: -140, y: -8 },
  { x: 160,  y: 20 },
  { x: -160, y: 56 },
  { x: 110,  y: 94 },
])
const dragId = ref(-1)
const dragStart = ref({ x: 0, y: 0, elX: 0, elY: 0 })
const spotsContainer = ref(null)

function spotStyle(i) {
  const s = spots.value[i]
  return {
    left: `calc(50% + ${s.x}px)`,
    top: s.y + 'px',
  }
}

function onDragStart(e, i) {
  const el = spots.value[i]
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  dragId.value = i
  dragStart.value = { x: clientX, y: clientY, elX: el.x, elY: el.y }
}

function onMove(e) {
  if (dragId.value < 0) return
  e.preventDefault()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  const dx = clientX - dragStart.value.x
  const dy = clientY - dragStart.value.y
  spots.value[dragId.value] = {
    x: dragStart.value.elX + dx,
    y: dragStart.value.elY + dy,
  }
}

function onDragEnd() {
  dragId.value = -1
}

onMounted(() => {
  scrollerEl = document.querySelector('.scroller')
  if (scrollerEl) {
    scrollerEl.addEventListener('scroll', onScroll, { passive: true })
  }
  onScroll()
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onDragEnd)
})
onUnmounted(() => {
  if (scrollRafId) cancelAnimationFrame(scrollRafId)
  if (scrollerEl) {
    scrollerEl.removeEventListener('scroll', onScroll)
  }
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onDragEnd)
})
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, var(--page-top) 0%, var(--page-bottom) 100%);
}

.scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--mint-green) transparent;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
.scroller::-webkit-scrollbar { width: 6px; }
.scroller::-webkit-scrollbar-thumb { background: var(--mint-green); border-radius: 3px; }

/* ---- Hero ---- */
.hero {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 30%;
  background-color: #2d3a24;
  transition: opacity 0.6s ease;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(214,232,214,0.12), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

.hero-bg.loaded::after {
  display: none;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.preload {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* 浮光 + 暗角 */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 35% at 50% 15%, rgba(255,255,240,0.22) 0%, transparent 60%),
    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 30% 20% at 25% 30%, rgba(255,250,230,0.18) 0%, transparent 50%),
    radial-gradient(ellipse 25% 15% at 65% 45%, rgba(255,245,220,0.12) 0%, transparent 50%);
  animation: floatLight 8s ease-in-out infinite;
}

@keyframes floatLight {
  0%, 100% {
    opacity: 0.5;
    transform: translate(0, 0);
  }
  25% {
    opacity: 1;
    transform: translate(3%, -2%);
  }
  50% {
    opacity: 0.4;
    transform: translate(-2%, 3%);
  }
  75% {
    opacity: 0.9;
    transform: translate(2%, 1%);
  }
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.hero-content.fading {
  opacity: 0.25;
  transform: translateY(-20px);
  pointer-events: none;
}

.hero-title {
  font-size: 4rem;
  font-weight: 300;
  letter-spacing: 8px;
  color: #1e4028;
  text-shadow:
    -1px -1px 0 rgba(0,0,0,0.15),
    1px -1px 0 rgba(0,0,0,0.15),
    -1px 1px 0 rgba(0,0,0,0.15),
    1px 1px 0 rgba(0,0,0,0.15),
    0 0 18px rgba(255,255,255,0.85),
    0 0 40px rgba(255,255,255,0.5),
    0 0 70px rgba(255,255,255,0.3);
  margin: 0;
  cursor: pointer;
  user-select: none;
  transition: color 0.5s ease, text-shadow 0.5s ease;
}

.hero-line1 {
  margin-top: 18px;
  font-size: 1.2rem;
  color: #c9a96e;
  letter-spacing: 4px;
  font-weight: 300;
  text-shadow:
    -1px -1px 0 rgba(0,0,0,0.12),
    1px 1px 0 rgba(0,0,0,0.12),
    0 0 6px rgba(201,169,110,0.5),
    0 0 14px rgba(0,0,0,0.25);
  animation: deepGold 3.5s ease-in-out infinite;
}

.hero-line2 {
  margin-top: 10px;
  font-size: 1rem;
  color: #b8944f;
  letter-spacing: 2px;
  font-weight: 300;
  text-shadow:
    -1px -1px 0 rgba(0,0,0,0.1),
    1px 1px 0 rgba(0,0,0,0.1),
    0 0 4px rgba(184,148,79,0.45),
    0 0 10px rgba(0,0,0,0.25);
  animation: deepGold 3.5s ease-in-out 1s infinite;
}

@keyframes deepGold {
  0%, 100% {
    text-shadow:
      -1px -1px 0 rgba(0,0,0,0.12),
      1px 1px 0 rgba(0,0,0,0.12),
      0 0 5px rgba(201,169,110,0.4),
      0 0 12px rgba(0,0,0,0.2);
  }
  35% {
    text-shadow:
      -1px -1px 0 rgba(0,0,0,0.12),
      1px 1px 0 rgba(0,0,0,0.12),
      0 0 10px rgba(218,165,80,0.7),
      0 0 24px rgba(196,148,65,0.45),
      0 0 45px rgba(160,120,50,0.25),
      0 0 14px rgba(0,0,0,0.3);
  }
  60% {
    text-shadow:
      -1px -1px 0 rgba(0,0,0,0.12),
      1px 1px 0 rgba(0,0,0,0.12),
      0 0 6px rgba(201,169,110,0.5),
      0 0 16px rgba(0,0,0,0.22);
  }
}

@keyframes goldShimmer {
  0%, 100% {
    text-shadow:
      0 0 8px rgba(232,213,163,0.5),
      0 0 16px rgba(0,0,0,0.25);
  }
  30% {
    text-shadow:
      0 0 10px rgba(255,245,200,1),
      0 0 25px rgba(255,235,170,0.9),
      0 0 50px rgba(240,210,140,0.6),
      0 0 80px rgba(220,190,120,0.35),
      0 0 18px rgba(0,0,0,0.35);
  }
  55% {
    text-shadow:
      0 0 9px rgba(232,213,163,0.55),
      0 0 22px rgba(0,0,0,0.28);
  }
}

/* ---- 光斑散落 ---- */
.light-spots {
  margin-top: 52px;
  position: relative;
  width: 100%;
  max-width: 660px;
  height: 130px;
  margin-left: auto;
  margin-right: auto;
}

.spot {
  position: absolute;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 2px;
  padding: 7px 15px;
  border-radius: 15px;
  background: rgba(0,0,0,0.15);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  white-space: nowrap;
  transform: translateX(-50%);
  animation: spotIn 1s ease both;
  cursor: grab;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  touch-action: none;
}

.theme-mint {
  background: rgba(214, 232, 214, 0.25) !important;
  border: 1px solid rgba(214, 232, 214, 0.4);
}
.theme-pink {
  background: rgba(248, 215, 218, 0.22) !important;
  border: 1px solid rgba(248, 215, 218, 0.35);
}
.theme-blue {
  background: rgba(204, 229, 255, 0.22) !important;
  border: 1px solid rgba(204, 229, 255, 0.35);
}
.theme-iris {
  background: rgba(111, 66, 193, 0.15) !important;
  border: 1px solid rgba(111, 66, 193, 0.3);
}

.spot:active {
  cursor: grabbing;
}

.spot.dragging {
  cursor: grabbing;
  animation: none;
  z-index: 10;
  box-shadow: 0 0 40px rgba(255,255,255,0.4), 0 0 16px rgba(255,255,255,0.25);
}

@keyframes spotIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* 各自浮动节奏 + 呼吸光晕 */
.float-0 { animation: spotIn 1s ease both, driftA 5s ease-in-out 0.8s infinite, glow0 4.5s ease-in-out 0.5s infinite; }
.float-1 { animation: spotIn 1s ease both, driftB 5.5s ease-in-out 1.1s infinite, glow1 5s ease-in-out 1s infinite; }
.float-2 { animation: spotIn 1s ease both, driftA 6s ease-in-out 1.4s infinite, glow0 5.5s ease-in-out 1.6s infinite; }
.float-3 { animation: spotIn 1s ease both, driftB 5.2s ease-in-out 0.9s infinite, glow1 4.8s ease-in-out 0.6s infinite; }

@keyframes glow0 {
  0%, 100% { box-shadow: 0 0 36px rgba(255,255,255,0.3), 0 0 14px rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 8px rgba(255,255,255,0.06), 0 0 3px rgba(255,255,255,0.03); }
}
@keyframes glow1 {
  0%, 100% { box-shadow: 0 0 30px rgba(255,255,255,0.25), 0 0 12px rgba(255,255,255,0.18); }
  50% { box-shadow: 0 0 6px rgba(255,255,255,0.05), 0 0 2px rgba(255,255,255,0.02); }
}

@keyframes driftA {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}
@keyframes driftB {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-8px); }
}

/* ---- Scroll hint ---- */
.scroll-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  cursor: pointer;
}
.scroll-hint .arrow {
  font-size: 1.3rem;
  color: rgba(255,255,255,0.4);
  animation: bounce 2s ease infinite;
  display: block;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* ---- 角落 ---- */
.left-bottom {
  position: fixed;
  left: 18px;
  bottom: 18px;
  z-index: 60;
  display: flex;
  gap: 14px;
}
.right-bottom {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 60;
  text-decoration: none;
}

/* ---- Posts section ---- */
.posts-section {
  position: relative;
  z-index: 2;
  padding: 80px 0 40px;
  background: linear-gradient(180deg, rgba(184,212,184,0.45) 0%, var(--page-bottom) 100%);
  will-change: transform;
}

/* 雾层 */
.posts-mist {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgba(250,252,251,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(8px);
  transition: opacity 0.8s ease, backdrop-filter 0.8s ease;
  pointer-events: none;
}

.posts-mist.lifted {
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

/* 卡片入场 */
.posts-container {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
}

.posts-container.revealed {
  opacity: 1;
  transform: translateY(0);
}

.post-card {
  opacity: 0;
  animation: cardSlideIn 0.5s ease both;
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.posts-container {
  max-width: 820px;
  width: min(820px, calc(100vw - 48px));
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-weight: 300;
  font-size: 1.6rem;
  letter-spacing: 6px;
  color: var(--text-dark);
  margin: 0 0 32px;
}

/* ---- Filter ---- */
.filter-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.filter-bar button {
  padding: 6px 18px;
  border-radius: 20px;
  border: 1px solid var(--mint-green);
  background: var(--card-bg);
  color: var(--text-body);
  font-size: 0.88rem;
  cursor: pointer;
  transition: 0.3s ease;
  letter-spacing: 2px;
}

.filter-bar button.active,
.filter-bar button:hover {
  background: var(--mint-green);
  color: var(--text-dark);
}

/* ---- Post cards ---- */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  display: flex;
  gap: 20px;
  padding: 16px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(0,0,0,0.04);
  cursor: pointer;
  transition: 0.3s ease;
  position: relative;
  flex-wrap: wrap;
  box-shadow: var(--shadow-card);
}

.post-card:hover {
  background: rgba(250,252,251,0.98);
  box-shadow: var(--shadow-card-hover);
  transform: scale(1.008);
}

.post-left {
  flex-shrink: 0;
  width: 160px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
}

.post-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-right {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 6px;
}

.post-cat {
  font-size: 0.72rem;
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--mint-soft);
  color: var(--text-dark);
  letter-spacing: 1px;
}

.post-date {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.post-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-dark);
  margin: 0 0 6px;
  letter-spacing: 1px;
}

.post-excerpt {
  font-size: 0.85rem;
  color: var(--text-body);
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-expand {
  margin-top: 8px;
  font-size: 0.75rem;
  color: rgba(0,0,0,0.3);
  letter-spacing: 2px;
  transition: 0.2s;
}

.post-card:hover .post-expand {
  color: var(--text-dark);
}

/* ---- End ---- */
.end-cap {
  text-align: center;
  padding: 48px 0 20px;
  color: rgba(0,0,0,0.2);
  font-size: 0.82rem;
  letter-spacing: 4px;
}

@keyframes fadeUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 860px) {
  .hero-title { font-size: 2.8rem; }
  .post-card { flex-direction: column; }
  .post-left { width: 100%; height: 180px; }
  .left-bottom { gap: 8px; }
}
</style>
