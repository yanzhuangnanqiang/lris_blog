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

          <nav class="post-nav">
            <router-link v-if="prevPost" :to="`/post/${prevPost.id}`" class="pn-btn prev">← 上一篇 · {{ prevPost.title }}</router-link>
            <router-link v-if="nextPost" :to="`/post/${nextPost.id}`" class="pn-btn next"> {{ nextPost.title }} · 下一篇 →</router-link>
          </nav>
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
const postIndex = computed(() => posts.findIndex(p => p.id === route.params.id))
const post = computed(() => posts[postIndex.value] || null)
const prevPost = computed(() => postIndex.value < posts.length - 1 ? posts[postIndex.value + 1] : null)
const nextPost = computed(() => postIndex.value > 0 ? posts[postIndex.value - 1] : null)
</script>

<style scoped>
.detail {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, var(--page-top) 0%, var(--page-bottom) 100%);
}

.detail-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.detail-container {
  max-width: 720px;
  width: min(720px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 90px 0 40px;
}

.back {
  display: inline-block;
  margin-bottom: 24px;
  font-size: 0.8rem;
  color: #5a7a62;
  text-decoration: none;
  letter-spacing: 2px;
  position: relative;
  padding-bottom: 3px;
  transition: color 0.25s;
}
.back::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 1px;
  background: #5a7a62;
  transition: width 0.3s ease, left 0.3s ease;
}
.back:hover { color: #3d5a42; }
.back:hover::after { width: 100%; left: 0; }

.post-nav {
  display: flex;
  justify-content: center;
  gap: 245px;
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.pn-btn {
  color: #5a7a62;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 2px;
  position: relative;
  padding-bottom: 3px;
  transition: color 0.25s;
}
.pn-btn::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 1px;
  background: #5a7a62;
  transition: width 0.3s ease, left 0.3s ease;
}
.pn-btn:hover { color: #3d5a42; }
.pn-btn:hover::after { width: 100%; left: 0; }
.pn-btn.disabled { display: none; }
@media (max-width: 540px) {
  .post-nav { gap: 20px; }
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
  background: var(--card-bg);
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
