<template>
  <div class="gallery-page">
    <TopBar />
    <MusicDock />

    <div class="scroller">
      <div class="container">
        <router-link class="back-link" to="/share">← 返回时光花束</router-link>

        <h1 class="page-title">🖼️ 图片分享</h1>

        <div class="tab-bar">
          <button :class="{ active: tag === '全部' }" @click="tag = '全部'">全部</button>
          <button :class="{ active: tag === '风景' }" @click="tag = '风景'">🏞️ 风景</button>
          <button :class="{ active: tag === '动漫' }" @click="tag = '动漫'">🎨 动漫</button>
        </div>

        <div class="gallery-grid">
          <div v-for="(item, i) in visibleItems" :key="i" class="frame-card" @click="lightbox = item">
            <div class="frame"><img :src="item.src" :alt="item.text" loading="lazy" /></div>
            <p class="frame-note">{{ item.text }}</p>
          </div>
        </div>

        <div v-if="!filteredItems.length" class="empty-state">
          <span class="empty-icon">🌿</span>
          <p>这个分类还没有照片</p>
        </div>

        <button
          v-if="visibleItems.length < filteredItems.length"
          class="load-more"
          @click="perPage += 12"
        >加载更多</button>

        <footer class="end-cap">林间初见 · 难忘夏光</footer>
      </div>
    </div>

    <!-- 灯箱 -->
    <div v-if="lightbox" class="lightbox" @click="lightbox = null">
      <div class="lightbox-inner" @click.stop>
        <img :src="lightbox.src" :alt="lightbox.text" />
        <p>{{ lightbox.text }}</p>
        <button class="lb-close" @click="lightbox = null">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import { gallery } from '@/data/shares'

const tag = ref('全部')
const perPage = ref(12)
const lightbox = ref(null)

const filteredItems = computed(() => {
  if (tag.value === '全部') return gallery
  return gallery.filter(g => g.tag === tag.value)
})

const visibleItems = computed(() => filteredItems.value.slice(0, perPage.value))
</script>

<style scoped>
.gallery-page {
  width: 100%; height: 100%;
  overflow: hidden; position: relative;
  background: linear-gradient(180deg, var(--page-top) 0%, var(--page-bottom) 100%);
}

.scroller {
  width: 100%; height: 100%;
  overflow-y: auto;
}

.container { max-width: 960px; width: min(960px, calc(100vw - 48px)); margin: 0 auto; padding: 90px 0 40px; }

.back-link {
  display: inline-block; margin-bottom: 20px;
  font-size: 0.85rem; color: var(--text-body);
  text-decoration: none; letter-spacing: 2px; transition: 0.2s;
}
.back-link:hover { color: var(--text-dark); }

.page-title {
  font-size: 1.8rem; font-weight: 400; letter-spacing: 4px;
  color: var(--text-dark); text-align: center; margin: 0 0 22px;
}

.tab-bar { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
.tab-bar button {
  padding: 6px 18px; border-radius: 20px;
  border: 1px solid var(--mint-green);
  background: var(--card-bg);
  color: var(--text-body); font-size: 0.88rem;
  cursor: pointer; transition: 0.3s ease; letter-spacing: 1px;
}
.tab-bar button.active,
.tab-bar button:hover { background: var(--mint-green); color: var(--text-dark); }

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.frame-card {
  cursor: pointer; transition: 0.3s ease;
  background: var(--card-bg); border-radius: 6px;
  padding: 10px 10px 12px;
  box-shadow: var(--shadow-card);
}
.frame-card:hover { box-shadow: var(--shadow-card-hover); transform: scale(1.015); }

.frame { width: 100%; aspect-ratio: 4/3; overflow: hidden; border-radius: 3px; background: var(--skeleton); }
.frame img { width: 100%; height: 100%; object-fit: cover; }

.frame-note { margin-top: 8px; font-size: 0.78rem; color: var(--text-body); letter-spacing: 1px; }

.load-more {
  display: block; margin: 24px auto 0;
  padding: 10px 32px; border-radius: 14px;
  border: 1px solid var(--mint-green);
  background: transparent;
  color: var(--text-dark); font-size: 0.88rem;
  cursor: pointer; letter-spacing: 2px; transition: 0.2s;
}
.load-more:hover { background: var(--mint-green); }

.lightbox {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(10px);
}
.lightbox-inner { max-width: 80vw; max-height: 90vh; text-align: center; }
.lightbox-inner img { max-width: 100%; max-height: 70vh; border-radius: 10px; }
.lightbox-inner p { margin-top: 12px; color: rgba(255,255,255,0.75); font-size: 0.9rem; letter-spacing: 2px; }
.lb-close {
  position: absolute; top: 20px; right: 30px;
  border: none; background: transparent;
  color: rgba(255,255,255,0.5); font-size: 1.5rem; cursor: pointer;
}

.empty-state { text-align: center; padding: 32px 0; }
.empty-icon { font-size: 2rem; opacity: 0.4; display: block; margin-bottom: 8px; }
.empty-state p { font-size: 0.85rem; color: rgba(0,0,0,0.22); letter-spacing: 2px; }

.end-cap {
  text-align: center; padding: 48px 0 20px;
  color: rgba(0,0,0,0.18); font-size: 0.82rem; letter-spacing: 4px;
}

@media (max-width: 540px) {
  .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
}
</style>
