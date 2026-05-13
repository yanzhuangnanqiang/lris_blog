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

      <!-- 第2屏：随想/诗句 -->
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
  overflow: hidden;
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

@keyframes pop {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 860px) {
  .hello { font-size: 2.4rem; }
  .cards { grid-template-columns: 1fr; }
}
</style>