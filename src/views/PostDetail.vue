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
          <!-- 两侧留白里的手帐贴纸。纯装饰：读屏跳过、鼠标穿透、窄屏不显示。
               张数按正文字数定，沿文章纵向均匀铺开，左右交替。 -->
          <img
            v-for="(s, i) in stickerList"
            :key="`${post.id}-${i}`"
            class="sticker"
            :class="i % 2 === 0 ? 'sticker-left' : 'sticker-right'"
            :style="{ top: stickerTop(i) }"
            :src="s"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />

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

          <!-- 文末落款贴纸：只在小屏出现（桌面走两侧那套）。
               纯装饰：读屏跳过、鼠标穿透。loading=lazy：桌面上不显示时不会被下载 -->
          <div class="sticker-footer">
            <img
              v-for="(s, i) in stickerList"
              :key="`f-${i}`"
              :src="s"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          </div>

          <!-- key 用文章 id：SPA 切上/下一篇时本组件被复用，必须强制重建
               才能让评论组件重新挂载、加载对应文章的评论 -->
          <WalineComment :key="route.params.id" :path="'/post/' + route.params.id" accent="green" />

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
import { computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/app/TopBar.vue'
import MusicDock from '@/components/Player/MusicDock.vue'
import { posts } from '@/data/loadPosts'
import WalineComment from '@/components/app/WalineComment.vue'
import { randomStickers, stickerCountFor } from '@/data/stickers'

const route = useRoute()
const postIndex = computed(() => posts.findIndex(p => p.id === route.params.id))
const post = computed(() => posts[postIndex.value] || null)

/* 正文两侧的手帐贴纸：张数按正文字数定（封顶 4 张），随机挑不重复的，沿文章纵向均匀铺开。
   ★ 用 computed 是安全的：computed 有缓存，只在依赖（这里的 post）变化时才重算 ——
     所以「换文章才重掷、停留期间稳定」是它自带的，不需要 watch。
     （反过来，写在方法里、或让模板每次调用，就会每次重渲染都重掷 → 闪。） */
const stickerList = computed(() =>
  randomStickers(stickerCountFor(post.value?.wordCount ?? 0))
)

/** 第 i 张贴纸挂在文章的百分之几处（n 张贴纸就均分成 n+1 段） */
function stickerTop(i) {
  const n = stickerList.value.length
  return `${Math.round(((i + 1) / (n + 1)) * 100)}%`
}
const prevPost = computed(() => postIndex.value < posts.length - 1 ? posts[postIndex.value + 1] : null)
const nextPost = computed(() => postIndex.value > 0 ? posts[postIndex.value - 1] : null)

function setupReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  nextTick(() => {
    const body = document.querySelector('.post-body')
    if (!body) return
    const els = body.querySelectorAll('p, h1, h2, h3, h4, blockquote, pre, img')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.06 }
    )
    els.forEach((el) => {
      el.classList.add('reveal')
      io.observe(el)
    })
  })
}

watch(
  () => route.params.id,
  () => {
    const scroller = document.querySelector('.detail-scroller')
    if (scroller) scroller.scrollTop = 0
    setupReveal()
  },
  { immediate: true }
)
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
  max-width: 860px;
  width: min(860px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 90px 0 40px;
  position: relative;
}

/* ===== 两侧留白里的手帐贴纸 =====
   绝对定位挂在正文容器上 → 跟着文章滚（不用 fixed：fixed 会飘在屏幕边缘、
   还可能压到 TopBar 和音乐控件）。只有屏幕够宽、两侧真有留白时才显示。 */
.sticker {
  position: absolute;
  width: 120px;
  height: auto;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.25));
}

/* 左右交替、各带一点倾斜 —— 摆正了反而像没贴好。（纵向位置由模板算，按张数均分） */
.sticker-left { left: -152px; transform: rotate(-8deg); }
.sticker-right { right: -152px; transform: rotate(7deg); }

/* 窄屏（两侧留白不足 190px）直接不显示，硬塞会压到正文 */
@media (max-width: 1240px) {
  .sticker { display: none; }
}

/* CSS 关不掉动图的播放，只能不显示 —— 动图装饰正是这个偏好要治的东西 */
@media (prefers-reduced-motion: reduce) {
  .sticker { display: none; }
}

/* ===== 文末落款贴纸（只在小屏）=====
   正文留给以后要放的照片，所以贴纸不插在段落之间，统一排到文章末尾。
   和两侧那套天然互斥：桌面只显示两侧、小屏只显示这行，任何宽度下都只有一套。 */
.sticker-footer { display: none; }

@media (max-width: 1240px) {
  .sticker-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end; /* 偏右，沿用之前定的手帐感 */
    margin-top: 36px;
  }
  .sticker-footer img {
    width: 56px;
    /* 显式尺寸（贴纸是正方形）：配合 loading=lazy，加载前后不跳布局 */
    height: 56px;
    transform: rotate(-6deg);
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.22));
    pointer-events: none;
    user-select: none;
  }
  /* 交替倾斜，像随手贴上去的 */
  .sticker-footer img:nth-child(even) { transform: rotate(5deg); }
}

/* 动图装饰正是这个偏好要治的东西，不显示 */
@media (prefers-reduced-motion: reduce) {
  .sticker-footer { display: none; }
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
  animation: hero-in 0.7s ease both;
}
@keyframes hero-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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
  color: var(--text-muted);
}


/* ---- 正文 ---- */
.post-body {
  line-height: var(--lh-loose);
  color: var(--text-body);
}

.post-body :deep(.reveal) {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.post-body :deep(.reveal.reveal-in) {
  opacity: 1;
  transform: translateY(0);
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
  font-size: var(--fs-base);
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
  transition: transform 0.3s ease;
  cursor: zoom-in;
}

.post-body :deep(img:hover) {
  transform: scale(1.04);
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