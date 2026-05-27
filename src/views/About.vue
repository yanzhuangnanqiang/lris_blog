<template>
  <div class="about-page">
    <!-- 极简背景：淡紫灰渐变，无图 -->
    <div class="bg-layer"></div>
    <div class="bg-fog" :style="fogStyle"></div>

    <TopBar />
    <MusicDock />

    <div ref="scrollerRef" class="scroller" @scroll="onScroll">
      <section class="hero">
        <div class="hero-bg">
          <img :src="aboutBg" alt="" />
          <div class="hero-bg-fade"></div>
        </div>
        <div
          class="hero-content"
          :class="{ sticky: collapsed }"
          :style="{ opacity: Math.max(0, 1 - scrollPct * 2.5) }"
        >
          <h1 class="hero-title">About</h1>
        </div>
      </section>

      <!-- 导航锚点：中间偏下，替代搜索栏的功能位置 -->
      <nav class="about-nav" :class="{ scrolled: collapsed }" :style="navStyle">
        <button
          v-for="sec in sections"
          :key="sec.id"
          class="nav-pill"
          :class="{ active: activeSection === sec.id }"
          @click="scrollToSection(sec.id)"
        >
          {{ sec.label }}
        </button>
      </nav>

      <!-- 内容区：窄列，适合阅读 -->
      <main class="content">
        <!-- 简介卡片 -->
        <section id="intro" class="sect" ref="sectRefs.intro">
          <div class="glass-card intro-card">
            <div class="avatar-wrap">
              <img :src="avatar" alt="avatar" class="avatar" />
              <div class="avatar-ring"></div>
            </div>
            <h2 class="name">Hidden Goose</h2>
            <p class="bio">于林间初见，在代码中相逢。</p>
            <p class="desc">
              一个相信文字与代码都有温度的人。喜欢把复杂的东西拆成简单的零件，再重新组装成别人能看懂的样子。
              目前在前端与算法的交界处游荡，偶尔写点随笔，记录那些「原来可以这样」的瞬间。
            </p>
            <div class="meta-row">
              <span class="meta-item"><b>7</b> 仓库</span>
              <span class="meta-item"><b>3</b> 关注者</span>
              <span class="meta-item"><b>4</b> 星标</span>
            </div>
          </div>
        </section>

        <!-- 技术栈 -->
        <section id="stack" class="sect" ref="sectRefs.stack">
          <h3 class="sect-title">技术栈</h3>
          <div class="glass-card">
            <div class="stack-grid">
              <div class="stack-group">
                <h4>前端</h4>
                <div class="stack-tags">
                  <span class="stag">Vue 3</span><span class="stag">TypeScript</span><span class="stag">CSS</span><span class="stag">React</span>
                </div>
              </div>
              <div class="stack-group">
                <h4>工具 & 工程</h4>
                <div class="stack-tags">
                  <span class="stag">Git</span><span class="stag">Vite</span><span class="stag">Docker</span><span class="stag">Linux</span>
                </div>
              </div>
              <div class="stack-group">
                <h4>其他</h4>
                <div class="stack-tags">
                  <span class="stag">Python</span><span class="stag">C++</span><span class="stag">Markdown</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 经历时间线 -->
        <section id="timeline" class="sect" ref="sectRefs.timeline">
          <h3 class="sect-title">经历</h3>
          <div class="timeline">
            <div class="t-item">
              <div class="t-dot"></div>
              <div class="t-content glass-card">
                <span class="t-time">2026/5/13 — 至今</span>
                <h4>个人博客「林间初见」</h4>
                <p>用 Vue 前端框架做的静态博客,尝试在github上发布。集成了音乐播放器、GitHub 动态、RSS 订阅。</p>
              </div>
            </div>
            <div class="t-item">
              <div class="t-dot"></div>
              <div class="t-content glass-card">
                <span class="t-time">更早</span>
                <h4>开始做项目</h4>
                <p>在大一下学期,因为兴趣做了一个大鱼吃小鱼的游戏,花了许多天时间吧</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 兴趣 -->
        <section id="interest" class="sect" ref="sectRefs.interest">
          <h3 class="sect-title">兴趣</h3>
          <div class="glass-card interest-card">
            <ul class="interest-list">
              <li><span class="li-dot"></span>阅读 —— 技术书与科幻小说混读，也偶尔读一些诗歌</li>
              <li><span class="li-dot"></span>音乐 —— 写代码时必须有背景音，喜欢mc的背景音乐和钢琴独奏</li>
              <li><span class="li-dot"></span>跑步 —— 我是一个跑步爱好者</li>
              <li><span class="li-dot"></span>整理笔记 —— 用 Obsidian 和 花笺 来写一些笔记</li>
            </ul>
          </div>
        </section>

        <!-- 联系 -->
        <section id="contact" class="sect" ref="sectRefs.contact">
          <h3 class="sect-title">联系</h3>
          <div class="glass-card contact-card">
            <p class="contact-hint">有想法、问题，或者单纯想聊聊？</p>
            <div class="contact-links">
              <a href="https://github.com/yanzhuangnanqiang" target="_blank" rel="noreferrer" class="c-link">
                <span class="c-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></span>
                GitHub
              </a>
              <a href="mailto:your@email.com" class="c-link">
                <span class="c-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                Email
              </a>
            </div>
          </div>
        </section>

        <footer class="end-cap">于林间初见，在代码中相逢</footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import aboutBg from '@/assets/saiset/竖屏/2.jpg'

import avatarImg from '@/assets/avatar.jpg'
const avatar = avatarImg

const scrollerRef = ref(null)
const scrollPct = ref(0)
const collapsed = ref(false)
const activeSection = ref('intro')

const sections = [
  { id: 'intro', label: '简介' },
  { id: 'stack', label: '技术栈' },
  { id: 'timeline', label: '经历' },
  { id: 'interest', label: '兴趣' },
  { id: 'contact', label: '联系' },
]

const sectRefs = {
  intro: ref(null),
  stack: ref(null),
  timeline: ref(null),
  interest: ref(null),
  contact: ref(null),
}

const navStyle = computed(() => {
  const p = Math.min(1, Math.max(0, (scrollPct.value - 0.08) / 0.32))
  const bgAlpha = (p * 0.2).toFixed(2)
  const blurPx = (p * 10).toFixed(1)
  return {
    top: `calc(${(56 * (1 - p)).toFixed(1)}vh + ${(56 * p).toFixed(1)}px)`,
    background: `rgba(255,255,255,${bgAlpha})`,
    backdropFilter: `blur(${blurPx}px)`,
    WebkitBackdropFilter: `blur(${blurPx}px)`,
  }
})

const fogStyle = computed(() => {
  const p = scrollPct.value
  return {
    backdropFilter: `blur(${2 + p * 12}px)`,
    WebkitBackdropFilter: `blur(${2 + p * 12}px)`,
    background: `rgba(250,248,255,${p * 0.35})`,
  }
})

function onScroll() {
  const el = scrollerRef.value
  if (!el) return
  const max = el.scrollHeight - el.clientHeight
  scrollPct.value = max > 0 ? Math.min(1, el.scrollTop / (window.innerHeight * 0.8)) : 0
  collapsed.value = el.scrollTop > window.innerHeight * 0.18

  // 高亮当前章节
  const offsets = sections.map(s => ({
    id: s.id,
    top: sectRefs[s.id].value?.offsetTop ?? 0,
  }))
  const current = offsets.reduce((prev, cur) => {
    const scrollTop = el.scrollTop + 120
    return Math.abs(cur.top - scrollTop) < Math.abs(prev.top - scrollTop) ? cur : prev
  })
  activeSection.value = current.id
}

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el && scrollerRef.value) {
    const target = el.offsetTop - 100
    scrollerRef.value.scrollTo({ top: target, behavior: 'smooth' })
  }
}

onMounted(() => {
  // 初始计算一次
  onScroll()
})
</script>

<style scoped>
/* ===== 基础 ===== */
.about-page { width: 100%; height: 100%; overflow: hidden; position: relative; }
.scroller { position: relative; z-index: 2; width: 100%; height: 100%; overflow-y: auto; scrollbar-color: rgba(91,63,211,0.25) transparent; }
.scroller::-webkit-scrollbar-thumb { background: rgba(91,63,211,0.25); }

/* ===== 背景：极淡紫灰渐变，无图 ===== */
.bg-layer {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(160deg, #f8f6ff 0%, #f0eef8 40%, #e8e4f0 100%);
}
.bg-fog { position: fixed; inset: 0; z-index: 1; pointer-events: none; transition: all 0.3s; }

/* ===== Hero：标题在上四分点 ===== */
.hero { width: 100%; height: 100vh; position: relative; overflow: hidden; }
.hero-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; pointer-events: none; }
.hero-bg img { width: 100%; height: 100%; object-fit: contain; filter: blur(0px) brightness(0.9); pointer-events: none; }
.hero-bg-fade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(248,246,255,0.2) 30%, rgba(248,246,255,0.7) 70%, #f8f6ff 100%); }
.hero-content {
  position: absolute; top: 25vh; left: 50%; transform: translateX(-50%);
  text-align: center; transition: all 0.4s ease; width: 100%;
}
.hero-content.sticky {
  position: fixed; top: 0; left: 0; right: 0; transform: none;
  padding: 14px 0; z-index: 100;
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.hero-title {
  font-size: 3.2rem; font-weight: 200; letter-spacing: 12px;
  color: #3d3650;
  font-family: 'Georgia','Times New Roman',serif;
  font-style: italic;
  text-shadow: 0 0 40px rgba(180,160,220,0.3), 0 2px 8px rgba(0,0,0,0.06);
  margin: 0;
}
.hero-content.sticky .hero-title {
  font-size: 1.4rem; letter-spacing: 6px; color: #4a4060;
  text-shadow: none; font-style: normal; font-weight: 400;
}

/* ===== 导航：中间偏下，点击滚动到对应章节 ===== */
.about-nav {
  position: fixed; left: 50%; transform: translateX(-50%);
  z-index: 50; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  transition: top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-pill {
  padding: 6px 16px; border-radius: 20px;
  border: 1px solid rgba(91,63,211,0.12);
  background: rgba(255,255,255,0.35);
  backdrop-filter: blur(6px);
  font-size: 0.78rem; color: #5a5070; cursor: pointer;
  letter-spacing: 2px; transition: all 0.25s;
}
.nav-pill:hover, .nav-pill.active {
  background: rgba(91,63,211,0.12);
  border-color: rgba(91,63,211,0.3);
  color: #5B3FD3;
}

/* ===== 内容容器：窄列，适合阅读 ===== */
.content {
  max-width: 680px;
  width: min(680px, calc(100% - 48px));
  margin: 0 auto;
  padding: 40px 0 80px;
}

/* ===== 通用毛玻璃卡片 ===== */
.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(250,248,255,0.32) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.55);
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(60,40,90,0.03), 0 8px 24px rgba(60,40,90,0.06), 0 1px 0 rgba(255,255,255,0.6) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
  border-color: rgba(91,63,211,0.2);
  box-shadow: 0 4px 12px rgba(60,40,90,0.06), 0 16px 40px rgba(60,40,90,0.1), 0 1px 0 rgba(255,255,255,0.8) inset;
}

/* ===== 章节标题 ===== */
.sect { margin-bottom: 36px; }
.sect-title {
  font-size: 0.9rem; font-weight: 500; color: #5B3FD3;
  letter-spacing: 4px; margin-bottom: 16px; padding-left: 4px;
  opacity: 0.8;
}

/* ===== 简介卡片 ===== */
.intro-card { padding: 36px 32px 28px; text-align: center; margin-left: -12px; }
.avatar-wrap { position: relative; width: 88px; height: 88px; margin: 0 auto 16px; }
.avatar {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
  position: relative; z-index: 2;
  box-shadow: 0 4px 16px rgba(60,40,90,0.15);
}
.avatar-ring {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 1.5px solid rgba(91,63,211,0.15);
  animation: ringPulse 3s ease-in-out infinite;
}
@keyframes ringPulse { 0%,100%{ transform: scale(1); opacity: 0.6; } 50%{ transform: scale(1.05); opacity: 0.3; } }
.name { font-size: 1.3rem; font-weight: 600; color: #2d2540; letter-spacing: 2px; margin: 0 0 6px; }
.bio { font-size: 0.85rem; color: #7a7090; letter-spacing: 3px; margin-bottom: 18px; }
.desc { font-size: 0.92rem; color: #4a4058; line-height: 1.9; text-align: left; margin-bottom: 20px; }
.meta-row { display: flex; justify-content: center; gap: 32px; }
.meta-item { font-size: 0.75rem; color: #8a8098; letter-spacing: 1px; }
.meta-item b { display: block; font-size: 1.2rem; color: #3d3650; font-weight: 600; margin-bottom: 2px; }

/* ===== 技术栈 ===== */
.stack-grid { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
.stack-group h4 { font-size: 0.8rem; color: #7a7090; letter-spacing: 2px; margin-bottom: 10px; font-weight: 500; }
.stack-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.stag {
  padding: 5px 14px; border-radius: 10px;
  background: rgba(91,63,211,0.08); color: #5B3FD3;
  font-size: 0.8rem; letter-spacing: 1px;
  border: 1px solid rgba(91,63,211,0.1);
}

/* ===== 时间线 ===== */
.timeline { position: relative; padding-left: 20px; }
.timeline::before {
  content: ''; position: absolute; left: 6px; top: 8px; bottom: 24px;
  width: 1px; background: linear-gradient(to bottom, rgba(91,63,211,0.2), rgba(91,63,211,0.05));
}
.t-item { position: relative; margin-bottom: 20px; }
.t-dot {
  position: absolute; left: -18px; top: 14px;
  width: 7px; height: 7px; border-radius: 50%;
  background: #5B3FD3; box-shadow: 0 0 8px rgba(91,63,211,0.3);
}
.t-content { padding: 20px 24px; }
.t-time { font-size: 0.72rem; color: #9a90a8; letter-spacing: 1px; display: block; margin-bottom: 6px; }
.t-content h4 { font-size: 1rem; color: #2d2540; margin: 0 0 8px; letter-spacing: 1px; }
.t-content p { font-size: 0.88rem; color: #5a5070; line-height: 1.8; margin: 0; }

/* ===== 兴趣列表 ===== */
.interest-card { padding: 24px 28px; }
.interest-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.interest-list li {
  font-size: 0.9rem; color: #4a4058; line-height: 1.8;
  display: flex; align-items: flex-start; gap: 10px;
}
.li-dot {
  width: 6px; height: 6px; border-radius: 50%; background: rgba(91,63,211,0.25);
  margin-top: 9px; flex-shrink: 0;
}

/* ===== 联系 ===== */
.contact-card { padding: 28px 32px; text-align: center; }
.contact-hint { font-size: 0.88rem; color: #6a6080; margin-bottom: 18px; letter-spacing: 1px; }
.contact-links { display: flex; justify-content: center; gap: 16px; }
.c-link {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(91,63,211,0.15);
  color: #5B3FD3; font-size: 0.85rem; text-decoration: none;
  letter-spacing: 1px; transition: all 0.25s;
}
.c-link:hover {
  background: rgba(91,63,211,0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91,63,211,0.1);
}
.c-icon { display: flex; align-items: center; opacity: 0.8; }

/* ===== 结尾 ===== */
.end-cap { text-align: center; padding: 40px 0; color: rgba(140,130,160,0.3); font-size: 0.78rem; letter-spacing: 4px; }

@media (max-width: 540px) {
  .hero-title { font-size: 2.2rem; }
  .about-nav { gap: 4px; padding: 6px 8px 0; }
  .about-nav.scrolled { opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .nav-pill { padding: 4px 10px; font-size: 0.7rem; letter-spacing: 1px; }
  .content { width: calc(100% - 32px); }
  .intro-card, .t-content { padding: 24px 20px; }
  .meta-row { gap: 20px; }
}
</style>