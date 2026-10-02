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
              南昌大学一个普普通通的计科学生，只是喜欢做点东西。这里是存放思考和随笔的地方，也会分享一些小项目和笔记。希望你能在这里找到有趣的东西。
            </p>
            <div class="meta-row">
              <span class="meta-item"><b>{{ ghStats?.repos ?? '—' }}</b> 仓库</span>
              <span class="meta-item"><b>{{ ghStats?.followers ?? '—' }}</b> 关注者</span>
              <span class="meta-item"><b>{{ ghStats?.stars ?? '—' }}</b> 星标</span>
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
                <p>用 Vue 搭的静态博客，发布在 GitHub 上。集成了音乐播放器、GitHub 动态和 RSS 订阅。</p>
              </div>
            </div>
            <div class="t-item">
              <div class="t-dot"></div>
              <div class="t-content glass-card">
                <span class="t-time">更早</span>
                <h4>开始做项目</h4>
                <p>大一下学期，因为兴趣写了一个大鱼吃小鱼的小游戏，前后花了不少天。</p>
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
              <!-- 复用 contacts.js —— 和页脚同一份数据，不会再出现"两处不同步"
                   （这里原本的邮箱还是占位符 your@email.com） -->
              <a
                v-for="c in contacts"
                :key="c.name"
                :href="c.url"
                class="c-link"
                :target="c.url.startsWith('mailto:') ? undefined : '_blank'"
                :rel="c.url.startsWith('mailto:') ? undefined : 'noreferrer'"
              >
                <span class="c-icon"><img :src="contactIcons[c.icon]" alt="" /></span>
                {{ c.name }}
              </a>
            </div>
          </div>
        </section>

        <footer class="end-cap">于林间初见，在代码中相逢</footer>
        <SiteFooter />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import SiteFooter from '@/components/app/SiteFooter.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import aboutBg from '@/assets/optimized/saiset/竖屏/2.webp'
import { contacts } from '@/data/contacts'
/* 联系方式图标：复用 assets 里现成的三个 svg（和 IconLink 同一套做法） */
import iconGithub from '@/assets/github.svg'
import iconBilibili from '@/assets/bilibili.svg'
import iconMail from '@/assets/mail.svg'

import avatarImg from '@/assets/optimized/avatar.webp'
const avatar = avatarImg

const contactIcons = { github: iconGithub, bilibili: iconBilibili, mail: iconMail }

/* 「简介」卡片上那三个数字：从 GitHub 现拉。
   优先读项目页存过的 sessionStorage 缓存 —— 未认证的 GitHub API 只有 60 次/小时，
   不宜每次进关于页都打接口。拿不到就保持 null → 模板显示「—」，不显示假数字。 */
const ghStats = ref(null)

async function loadGithubStats() {
  const USER = 'yanzhuangnanqiang'
  try {
    let repos = null
    try {
      const cached = sessionStorage.getItem('projectRepos')
      if (cached) repos = JSON.parse(cached)
    } catch { /* 缓存坏了就当没有 */ }

    if (!Array.isArray(repos)) {
      const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=updated&per_page=100`)
      if (!res.ok) throw new Error(String(res.status))
      repos = (await res.json()).filter((r) => !r.fork)
      sessionStorage.setItem('projectRepos', JSON.stringify(repos))
    }

    let followers = null
    try {
      const cachedUser = sessionStorage.getItem('githubUser')
      if (cachedUser) followers = JSON.parse(cachedUser).followers
    } catch { /* 同上 */ }

    if (typeof followers !== 'number') {
      const res = await fetch(`https://api.github.com/users/${USER}`)
      if (res.ok) {
        followers = (await res.json()).followers
        sessionStorage.setItem('githubUser', JSON.stringify({ followers }))
      }
    }

    ghStats.value = {
      repos: repos.length,
      stars: repos.reduce((n, r) => n + (r.stargazers_count || 0), 0),
      followers,
    }
  } catch { /* 超时 / 限流都算了，保持 null → 显示 — */ }
}

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
  loadGithubStats()
})
</script>

<style scoped>
/* ===== 基础 ===== */
.about-page { width: 100%; height: 100%; overflow: hidden; position: relative; }
.scroller { position: relative; z-index: 2; width: 100%; height: 100%; overflow-y: auto; }

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
/* 图标现在是 <img>（assets 里的 svg），得显式给尺寸 —— 原来是内联 svg 自带 width/height */
.c-icon img { width: 18px; height: 18px; display: block; }

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