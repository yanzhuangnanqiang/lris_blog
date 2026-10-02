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
        <LeafFall />

        <!-- 帘布揭幕：每次刷新 / 新开标签播一次 -->
        <div class="curtain" :class="{ open: curtainOpen }" aria-hidden="true">
          <!-- 用 <picture> 按断点选图：浏览器只会下载匹配的那一组，不会两组都拉 -->
          <div class="leaf leaf-left">
            <picture>
              <source media="(max-width: 860px)" :srcset="leafLeftMobile" />
              <img :src="leafLeft" alt="" />
            </picture>
          </div>
          <div class="leaf leaf-right">
            <picture>
              <source media="(max-width: 860px)" :srcset="leafRightMobile" />
              <img :src="leafRight" alt="" />
            </picture>
          </div>
        </div>

        <div class="hero-content" :class="{ show: contentShown, fading: scrollProgress > 0.3 }">
          <h1 class="hero-title" :style="{ color: titleColor }" @click="cycleColor">林间初见</h1>
          <p class="hero-line1">{{ typedLine1 }}<span v-if="cursorLine === 1" class="cursor">|</span></p>
          <p class="hero-line2">{{ typedLine2 }}<span v-if="cursorLine === 2" class="cursor">|</span></p>

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
          <img :src="chevronDown" class="arrow" alt="向下滚动" />
        </div>
      </section>

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

          <div class="posts-layout">
            <aside class="posts-side">
              <ProfileCard />
              <AnnouncementCard />
              <LatestNotesCard />
            </aside>
            <div class="posts-main">
              <div class="post-list">
            <article
              v-for="(post, i) in filteredPosts"
              :key="post.id"
              class="post-card"
              :style="{ animationDelay: `${0.1 + i * 0.12}s` }"
              @click="goToPost(post.id)"
            >
              <div class="post-info">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-meta">
                  <span class="post-cat">{{ post.category }}</span>
                  <span class="post-date">{{ post.date }}</span>
                </div>
                <p class="post-excerpt">{{ post.excerpt }}</p>
                <div class="post-foot">
                  <span class="post-words">{{ post.wordCount }} 字</span>
                  <span class="post-expand">— 阅读全文</span>
                </div>
              </div>
              <div class="post-cover">
                <img :src="post.photoSrc" :alt="post.title" loading="lazy" decoding="async" @load="onImgLoad" />
              </div>
            </article>
              </div>
            </div>
          </div>

          <footer class="end-cap">
            林间初见 · 难忘夏光
            <a class="end-rss" href="/feed.xml" title="RSS 订阅" target="_blank" rel="noopener">
              <svg class="rss-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="18" r="2"/><path d="M4 4a16 16 0 0 1 16 16h-4A12 12 0 0 0 4 8z"/><path d="M4 4a16 16 0 0 1 16 16h-4A12 12 0 0 0 4 8z"/></svg>
              <span>RSS</span>
            </a>
          </footer>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// 页面级标记，故意不用 sessionStorage：
// F5 / 新开标签会重置它，而从其它页切回首页（组件重新挂载）不会。
let introPlayed = false
</script>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import IconLink from '@/components/app/IconLink.vue'
import PetalEffect from '@/components/tuberose/PetalEffect.vue'
import LeafFall from '@/components/home/LeafFall.vue'
import ProfileCard from '@/components/home/ProfileCard.vue'
import AnnouncementCard from '@/components/home/AnnouncementCard.vue'
import LatestNotesCard from '@/components/home/LatestNotesCard.vue'
import { whispers } from '@/data/thoughts'
import { posts } from '@/data/loadPosts'
import heroBg from '@/assets/optimized/xiaguang.webp'
// 帘布已整体换成第三代（左右各一张横构图，2080×1152）
import leafLeft from '@/assets/optimized/叶幕-左-3.webp'
import leafRight from '@/assets/optimized/叶幕-右-3.webp'
// 移动端换竖构图那一对（横图硬填竖屏会被裁掉 74%）。
// 这两张是镜像的：左帘「左实右虚」、右帘「左虚右实」，
// 所以闭合时两张在中线处互补交叉，不会像实心图那样叠出糊边。
import leafLeftMobile from '@/assets/optimized/移-左2.webp'
import leafRightMobile from '@/assets/optimized/移-右2.webp'
import chevronDown from '@/assets/chevron-down.svg'

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

// 打字沿用站点原有的「同一会话只播一次」；帘布另用页面级 introPlayed（见普通 script 块）
const TYPED_KEY = 'homeTyped'
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const curtainOpen = ref(reduceMotion || introPlayed)
/* 内容浮现：**等帘布滑完再开始**（帘布 800ms 起滑、1.8s 滑完）。
   沿用和 curtainOpen 同一套页面级标记：从别的页切回首页时是 true → 内容直接显示、不演。 */
const contentShown = ref(reduceMotion || introPlayed)

let scrollerEl = null

function onScroll() {
  if (!scrollerEl) return
  const heroH = scrollerEl.clientHeight
  const y = scrollerEl.scrollTop
  scrollProgress.value = Math.min(y / (heroH * 0.6), 1)

  if (y > heroH * 0.4) {
    mistLifted.value = true
  } else if (y < heroH * 0.2) {
    mistLifted.value = false
  }
}

const categories = computed(() => {
  const cats = new Set(posts.map(p => p.category))
  return ['全部', ...cats]
})

const filteredPosts = computed(() => {
  if (activeCat.value === '全部') return posts
  return posts.filter(p => p.category === activeCat.value)
})

function saveScroll() {
  if (scrollerEl) sessionStorage.setItem('homeScroll', String(scrollerEl.scrollTop))
}
function restoreScroll() {
  const saved = sessionStorage.getItem('homeScroll')
  if (!saved || !scrollerEl) return
  nextTick(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollerEl.scrollTop = parseInt(saved, 10)
        sessionStorage.removeItem('homeScroll')
        onScroll()
      }, 80)
    })
  })
}
function goToPost(id) {
  saveScroll()
  router.push(`/post/${id}`)
}
function onImgLoad(e) {
  e.target.classList.add('loaded')
}
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

// —— 打字浮现效果 ——
const fullLine1 = '像一株在晨光里悄然绽放的鸢尾'
const fullLine2 = '这是一场安静的梦，也是一次不期而遇的心动。'
const typedLine1 = ref('')
const typedLine2 = ref('')
const cursorLine = ref(0)

async function startTyping() {
  cursorLine.value = 1
  await typeLine(fullLine1, typedLine1, 80)
  cursorLine.value = 2
  await typeLine(fullLine2, typedLine2, 65)
  cursorLine.value = 0
}

function typeLine(text, target, delay) {
  return new Promise(resolve => {
    let i = 0
    const timer = setInterval(() => {
      target.value = text.slice(0, i + 1)
      i++
      if (i >= text.length) { clearInterval(timer); resolve() }
    }, delay)
  })
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

  // 帘布：每次刷新 / 新开标签都播；从其它页切回首页不播
  const playIntro = !introPlayed && !reduceMotion
  introPlayed = true

  if (scrollerEl) {
    scrollerEl.addEventListener('scroll', onScroll, { passive: true })
    if (playIntro) {
      // 开场必须从顶部看：跳过滚动恢复，并把上次残留的位置清掉
      scrollerEl.scrollTop = 0
      sessionStorage.removeItem('homeScroll')
    } else {
      restoreScroll()
    }
  }
  onScroll()
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onDragEnd)

  if (playIntro) {
    setTimeout(() => { curtainOpen.value = true }, 800)
    // 帘布 800ms 起滑、1.8s 滑完；内容提前到 1600ms 开始浮现 ——
    // 这时帘布滑到一半、两侧已经让开了，看起来像"被帘布揭开"
    setTimeout(() => { contentShown.value = true }, 1600)
  }

  // 打字沿用原来的「同一会话只播一次」，不随帘布一起重置；
  // 开场时推迟到帘布开完再打
  if (reduceMotion || sessionStorage.getItem(TYPED_KEY)) {
    typedLine1.value = fullLine1
    typedLine2.value = fullLine2
  } else {
    // 开场时等「帘布滑完(2600) + 内容浮现完(0.6s)」再打字，否则字是在不可见的内容里打的
    const typingDelay = playIntro ? 3200 : 600
    setTimeout(() => startTyping().then(() => sessionStorage.setItem(TYPED_KEY, '1')), typingDelay)
  }
})

onBeforeRouteLeave(() => {
  saveScroll()
})

onBeforeUnmount(() => {
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
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}


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

/* ---- 帘布揭幕 ----
   z-index 4：压在 hero-content(3) 之上盖住内容，开完滑走露出；
   仍在 TopBar(50)、MusicDock 之下。hero 有 overflow:hidden，滑出即被裁掉。 */
.curtain {
  position: absolute;
  inset: 0;
  z-index: 4;
  overflow: hidden;
  pointer-events: none;
}

/* 闭合期间吃掉误点（光斑/滚动箭头），打开后放行 */
.curtain:not(.open) {
  pointer-events: auto;
}

.leaf {
  position: absolute;
  top: -2%;
  left: -2%;
  width: 104%;
  height: 104%;
  transition: transform 1.8s cubic-bezier(0.55, 0.06, 0.35, 0.96);
  will-change: transform;
}

/* <picture> 默认是 inline，得撑满，里面的 img 才能按 100% 算 */
.leaf picture {
  display: block;
  width: 100%;
  height: 100%;
}

.leaf img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 原图偏暗，轻提一档（多提会发白） */
  filter: brightness(1.12) saturate(0.98);
  /* 像树枝一样随风轻摆。
     ⚠️ 必须加在 img 上，不能加在 .leaf 上 —— .leaf 的 transform 留给"滑走"，
     挤在同一个元素上会互相覆盖。scale 留 6% 余量，免得摆动时露出边缘。 */
  transform-origin: 50% 100%;
  will-change: transform;
  animation: leaf-sway 7s ease-in-out infinite;
}

/* 四段不规则摆动（跟 LeafFall 的 leafSway 同一路子）——
   规律的一来一回看久了发机械，四段才像真树枝被风推。 */
@keyframes leaf-sway {
  0%, 100% { transform: scale(1.06) rotate(0deg) translateX(0); }
  25%      { transform: scale(1.06) rotate(0.9deg) translateX(0.5%); }
  50%      { transform: scale(1.06) rotate(-0.45deg) translateX(-0.3%); }
  75%      { transform: scale(1.06) rotate(0.3deg) translateX(0.15%); }
}

/* 左右错开相位，不然两片像被同一阵风吹、显得假 */
.leaf-right img {
  animation-duration: 8.6s;
  animation-delay: -2.4s;
}

@media (prefers-reduced-motion: reduce) {
  .leaf img { animation: none; }
}

/* 102% 而不是 100%：留余量，免得边缘差 1px 漏缝 */
.curtain.open .leaf-left {
  transform: translateX(-102%);
}

.curtain.open .leaf-right {
  transform: translateX(102%);
}

/* 移动端没有单独的揭幕规则：走上面同一套左右滑。
   只换了图（竖构图那两张，见 <picture>）。 */

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  transition: opacity 0.6s ease, transform 0.6s ease;
  margin-top: 100px;
  opacity: 0;
  transform: translateY(28px); /* 起点偏下 → .show 时浮回原位，「从下往上浮现」 */
}

.hero-content.show {
  opacity: 1;
  transform: translateY(0);
}

/* 必须排在 .show 之后：滚动淡出要压过 show 的 opacity: 1 */
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
  min-height: 1.5em;
}

.cursor {
  display: inline-block;
  color: #c9a96e;
  font-weight: 300;
  animation: cursorBlink 0.7s step-end infinite;
  margin-left: 1px;
}
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
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

/* ---- 先标题、后气泡 ----
   这几个动画原本一挂载就播，而那时 .hero-content 还是 opacity: 0 ——
   等于"在看不见的地方演完了"。所以把它们挂到 .show 上：内容浮现之后才进场，
   再推迟 0.45s 让标题先到位。（一个值会套用到列表里所有动画，飘动/呼吸晚 0.45s 起步，无感） */
.hero-content:not(.show) .spot { animation: none; }
.hero-content.show .spot { animation-delay: 0.45s; }

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
  width: 30px;
  height: 30px;
  color: rgba(255,255,255,0.55);
  animation: bounce 2s ease infinite;
  display: block;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* ---- 角落 ---- */
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
  max-width: 1200px;
  width: min(1200px, calc(100vw - 48px));
  margin: 0 auto;
}

.posts-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.posts-side {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}

.posts-main {
  flex: 1;
  min-width: 0;
  max-width: 720px;
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
  gap: 18px;
}

.post-card {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(0,0,0,0.04);
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: var(--shadow-card);
}

.post-card:hover {
  background: rgba(250,252,251,0.98);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}

.post-card:active {
  transform: scale(0.985);
  opacity: 0.8;
  transition: 0.1s ease;
}

.post-cover {
  width: 200px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #e2ece3 0%, #d8e5da 50%, #e2ece3 100%);
}

.post-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%);
  transform: translateX(-100%);
  animation: cardShimmer 1.8s ease-in-out infinite;
}

.post-cover img {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  filter: blur(12px);
  transform: scale(1.06);
  transition: opacity 0.7s ease, filter 0.7s ease, transform 0.7s ease;
}

.post-cover img.loaded {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.post-card:hover .post-cover img.loaded {
  transform: scale(1.06);
}

@keyframes cardShimmer {
  0% { transform: translateX(-100%); }
  60%, 100% { transform: translateX(100%); }
}

.post-info {
  flex: 1;
  min-width: 0;
  padding: 16px 20px;
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
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--text-dark);
  margin: 0 0 8px;
  letter-spacing: 1px;
  border-left: 3px solid var(--iris-purple);
  padding-left: 12px;
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

.post-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.post-words {
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.post-expand {
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

.end-rss {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 14px;
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}
.end-rss:hover {
  color: #e09040;
}

.rss-icon {
  width: 13px;
  height: 13px;
  opacity: 0.7;
}

@keyframes fadeUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 860px) {
  .hero-title { font-size: 2.8rem; }
  .posts-side { display: none; }
  .post-cover { width: 130px; }
  .post-info { padding: 12px 14px; }
}
</style>