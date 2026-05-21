<template>
  <div class="detail">
    <TopBar />
    <MusicDock />

    <div class="detail-scroller">
      <div class="detail-container">
        <router-link class="back" to="/">← 返回首页</router-link>

        <div v-if="!post" class="not-found">
          <p>文章未找到</p>
          <router-link to="/">回到首页</router-link>
        </div>

        <template v-else>
          <div class="post-hero">
            <img :src="post.photoSrc" :alt="post.title" />
          </div>

          <div class="post-info">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-meta">
              <span class="post-cat">{{ post.category }}</span>
              <span class="post-date">{{ post.date }}</span>
            </div>
          </div>

          <div class="post-body" v-html="post.bodyHtml"></div>

          <router-link class="back bottom" to="/">← 返回首页</router-link>
        </template>

        <footer class="end-cap">林间初见 · 难忘夏光</footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import { posts } from '@/data/loadPosts'

const route = useRoute()
const post = computed(() => posts.find(p => p.id === route.params.id))
</script>

<style scoped>
.detail {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #f5f7f3;
}

.detail-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--mint-green) transparent;
}
.detail-scroller::-webkit-scrollbar { width: 6px; }
.detail-scroller::-webkit-scrollbar-thumb { background: var(--mint-green); border-radius: 3px; }

.detail-container {
  max-width: 720px;
  width: min(720px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 90px 0 40px;
}

.back {
  display: inline-block;
  margin-bottom: 24px;
  font-size: 0.85rem;
  color: var(--text-body);
  text-decoration: none;
  letter-spacing: 2px;
  transition: 0.2s;
}
.back:hover { color: var(--text-dark); }

.back.bottom {
  margin-top: 40px;
  margin-bottom: 0;
}

/* ---- 头图 ---- */
.post-hero {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 24px;
}

.post-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- 信息 ---- */
.post-info {
  margin-bottom: 32px;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--text-dark);
  letter-spacing: 3px;
  margin: 0 0 12px;
}

.post-meta {
  display: flex;
  gap: 14px;
  align-items: center;
}

.post-cat {
  font-size: 0.75rem;
  padding: 3px 12px;
  border-radius: 10px;
  background: var(--mint-green);
  color: var(--text-dark);
  letter-spacing: 1px;
}

.post-date {
  font-size: 0.8rem;
  color: rgba(0,0,0,0.35);
}

/* ---- 正文 ---- */
.post-body {
  line-height: 2;
  color: var(--text-body);
}

.post-body :deep(h1),
.post-body :deep(h2),
.post-body :deep(h3),
.post-body :deep(h4) {
  color: var(--text-dark);
  font-weight: 400;
  letter-spacing: 2px;
  margin: 32px 0 14px;
}
.post-body :deep(h1) { font-size: 1.5rem; }
.post-body :deep(h2) { font-size: 1.3rem; }
.post-body :deep(h3) { font-size: 1.1rem; }
.post-body :deep(h4) { font-size: 1rem; }

.post-body :deep(p) {
  margin: 0 0 16px;
  font-size: 0.95rem;
}

.post-body :deep(strong) {
  color: var(--text-dark);
}

.post-body :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 18px;
  border-left: 3px solid var(--mint-green);
  background: rgba(214,232,214,0.3);
  border-radius: 0 10px 10px 0;
  color: rgba(0,0,0,0.55);
  font-style: italic;
}

.post-body :deep(blockquote p) {
  margin: 4px 0;
}

.post-body :deep(ul), .post-body :deep(ol) {
  margin: 12px 0 16px;
  padding-left: 22px;
}

.post-body :deep(li) {
  margin-bottom: 6px;
  font-size: 0.93rem;
}

.post-body :deep(code) {
  background: var(--mint-green);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.88rem;
}

.post-body :deep(pre) {
  background: #f0f4ef;
  padding: 14px 18px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

.post-body :deep(pre code) {
  background: none;
  padding: 0;
}

.post-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(0,0,0,0.08);
  margin: 28px 0;
}

.post-body :deep(a) {
  color: var(--text-dark);
  text-decoration: underline;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 12px 0;
}

/* ---- 未找到 ---- */
.not-found {
  text-align: center;
  padding: 60px 0;
  color: var(--text-body);
}

.not-found a {
  color: var(--text-dark);
}

/* ---- 尾 ---- */
.end-cap {
  text-align: center;
  padding: 48px 0 20px;
  color: rgba(0,0,0,0.18);
  font-size: 0.82rem;
  letter-spacing: 4px;
}
</style>
