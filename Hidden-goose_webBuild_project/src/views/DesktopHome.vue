<template>
  <div class="home">
    <TopBar />
    <MusicDock />

    <div class="scroller">
      <!-- 第1屏：欢迎 + 闲聊 + 联系方式 + 手账入口 -->
      <section class="screen hero">
        <BackgroundWallpaper image-src="xiaguang.jpg" />

        <div class="center">
          <div class="hello">欢迎光临</div>
          <div class="chat">
            初次见面。你可以在这里看看我的随想、计划、项目与手帐。
            如果你愿意，也可以点左下角的方式联系我。
          </div>
        </div>

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

        <div class="hint">向下滑动</div>
      </section>

      <!-- 第2屏：随想/诗句 + 时间线 -->
      <section class="screen thoughts">
        <div class="glass-bg"></div>

        <div class="thoughts-inner">
          <h2 class="t-title">随想</h2>
          <div class="cards">
            <div v-for="(t, i) in thoughts" :key="i" class="card">
              <div class="text">{{ t.text }}</div>
              <div class="from" v-if="t.from">{{ t.from }}</div>
            </div>
          </div>

          <h2 class="t-title timeline-heading">时间线</h2>
          <div class="timeline">
            <div v-for="(item, i) in timeline" :key="i" class="tl-item">
              <div class="tl-dot"></div>
              <div class="tl-card">
                <div class="tl-date">{{ item.date }}</div>
                <div class="tl-title">{{ item.title }}</div>
                <div class="tl-content">{{ item.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第3屏：精选项目 -->
      <section class="screen projects">
        <div class="glass-bg"></div>

        <div class="thoughts-inner">
          <h2 class="t-title">项目</h2>
          <div class="sub">来自 GitHub：yanzhuangnanqiang</div>

          <div class="cards">
            <a
              v-for="(p, i) in featuredProjects"
              :key="i"
              class="card proj-card"
              :href="p.url"
              target="_blank"
              rel="noreferrer"
            >
              <div class="proj-name">{{ p.name }}</div>
              <div class="text">{{ p.desc }}</div>
              <div class="proj-lang" v-if="p.lang">{{ p.lang }}</div>
            </a>
          </div>

          <router-link class="more-link" to="/projects">
            查看全部项目 →
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import BackgroundWallpaper from '@/components/BackgroundWallpaper.vue'
import IconLink from '@/components/app/IconLink.vue'
import { contacts } from '@/data/contacts'
import { thoughts } from '@/data/thoughts'
import { timeline } from '@/data/timeline'
import { featuredProjects } from '@/data/projects'
</script>

<style scoped>
.home {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}

.screen {
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  position: relative;
}

.hero {
  overflow: hidden;
}

.center {
  position: absolute;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--cold-white);
  text-shadow: var(--text-shadow);
  z-index: 5;
  width: min(720px, calc(100vw - 40px));
}

.hello {
  font-size: 3.2rem;
  letter-spacing: 6px;
  font-weight: 300;
}

.chat {
  margin-top: 16px;
  font-size: 1.05rem;
  opacity: 0.82;
  line-height: 1.7;
}

.left-bottom {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 6;
  display: flex;
  gap: 14px;
}

.right-bottom {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 6;
  text-decoration: none;
}

.hint {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 6;
  color: rgba(220, 230, 240, 0.7);
  font-size: 0.85rem;
  user-select: none;
}

.thoughts {
  background: transparent;
  min-height: 100vh;
  overflow: visible;
}

.glass-bg {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 20, 0.35);
  backdrop-filter: blur(16px);
}

.thoughts-inner {
  position: relative;
  z-index: 2;
  padding-top: 110px; /* 顶栏空间 */
  padding-left: 22px;
  padding-right: 22px;
  max-width: 980px;
  margin: 0 auto;
  color: rgba(220, 230, 240, 0.92);
}

.t-title {
  font-weight: 300;
  letter-spacing: 4px;
  font-size: 1.8rem;
}

.cards {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.card {
  padding: 14px 14px;
  border-radius: 16px;
  background: rgba(220, 230, 240, 0.10);
  border: 1px solid rgba(220, 230, 240, 0.15);
  backdrop-filter: blur(10px);
  animation: pop 500ms ease both;
}

.text {
  line-height: 1.7;
}

.from {
  margin-top: 10px;
  font-size: 0.82rem;
  opacity: 0.7;
}

.timeline-heading {
  margin-top: 36px;
}

.timeline {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: rgba(220, 230, 240, 0.2);
}

.tl-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  position: relative;
  animation: pop 500ms ease both;
}

.tl-dot {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  border-radius: 999px;
  background: var(--iris-purple);
  border: 2px solid rgba(220, 230, 240, 0.35);
  margin-top: 4px;
  z-index: 1;
}

.tl-card {
  flex: 1;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(220, 230, 240, 0.08);
  border: 1px solid rgba(220, 230, 240, 0.12);
  backdrop-filter: blur(8px);
  transition: 0.2s;
}

.tl-card:hover {
  background: rgba(220, 230, 240, 0.12);
}

.tl-date {
  font-size: 0.78rem;
  opacity: 0.6;
  letter-spacing: 1px;
}

.tl-title {
  font-size: 1rem;
  margin-top: 4px;
  color: #fff;
}

.tl-content {
  font-size: 0.88rem;
  margin-top: 6px;
  opacity: 0.8;
  line-height: 1.6;
}

.projects {
  background: transparent;
  min-height: 100vh;
  overflow: visible;
  padding-bottom: 40px;
}

.sub {
  margin-top: 8px;
  opacity: 0.65;
  font-size: 0.9rem;
}

.proj-name {
  font-size: 1.05rem;
  color: #fff;
}

.proj-card {
  text-decoration: none;
  color: inherit;
  display: block;
}

.proj-card:hover {
  background: rgba(220, 230, 240, 0.14);
  transform: translateY(-1px);
}

.proj-lang {
  margin-top: 10px;
  font-size: 0.8rem;
  opacity: 0.65;
}

.more-link {
  display: inline-block;
  margin-top: 20px;
  padding: 8px 20px;
  border-radius: 14px;
  background: rgba(220, 230, 240, 0.08);
  border: 1px solid rgba(220, 230, 240, 0.15);
  color: rgba(220, 230, 240, 0.9);
  text-decoration: none;
  font-size: 0.9rem;
  transition: 0.2s;
}

.more-link:hover {
  background: rgba(220, 230, 240, 0.14);
}

@keyframes pop {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 860px) {
  .hello { font-size: 2.4rem; }
  .cards { grid-template-columns: 1fr; }
}
</style>