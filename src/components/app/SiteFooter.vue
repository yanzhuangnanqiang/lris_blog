<template>
  <footer class="site-footer">
    <nav class="sf-nav">
      <router-link v-for="l in navLinks" :key="l.to" :to="l.to">{{ l.label }}</router-link>
    </nav>

    <p class="sf-row">
      <a v-for="c in contacts" :key="c.name" :href="c.url" target="_blank" rel="noopener">
        {{ c.name }}
      </a>
    </p>

    <p class="sf-row sf-thanks">
      <span class="sf-label">特别鸣谢</span>
      <a v-for="t in thanks" :key="t.name" :href="t.url" target="_blank" rel="noopener">
        {{ t.name }}
      </a>
      <span class="sf-note">本站页面与评论区的设计参考 · 感谢所有开源作者与贡献者</span>
    </p>

    <p class="sf-row sf-copy">
      © 2026 林间初见 · All Rights Reserved
      <span class="sf-dot">|</span>
      Powered by Vue 3 &amp; Vite
    </p>
  </footer>
</template>

<script setup>
import { contacts } from '@/data/contacts'

/* 站内导航 —— 直接用路由路径，不另造数据 */
const navLinks = [
  { to: '/', label: '随想' },
  { to: '/notes', label: '笔记' },
  { to: '/projects', label: '项目' },
  { to: '/share', label: '分享' },
  { to: '/gallery', label: '画廊' },
  { to: '/about', label: '关于' },
]

/* 特别鸣谢 —— 只列**参考过的仓库**（不是技术栈；技术栈在"Powered by"那行）。
   还有别的参考仓库就往这里加一行。 */
const thanks = [
  { name: 'Aemeath', url: 'https://github.com/Jarvis0227/Aemeath' },
  { name: 'XinghuisamaBlogs', url: 'https://github.com/heiehiehi/XinghuisamaBlogs' },
  { name: 'AyeezBlog', url: 'https://github.com/Ayeez757/AyeezBlog' },
  { name: 'SakuraBlog', url: 'https://github.com/soft-zihan/SakuraBlog' },
]
</script>

<style scoped>
/* 全站页脚：纯静态，不引任何额外请求。
   各页面背景都是浅色（笔记页是深色，但那边不加页脚），所以统一用灰字。 */
.site-footer {
  margin: 56px auto 0;
  /* 左右留内边距：窄屏贴边时文字不会顶到屏幕边 */
  padding: 26px 16px 34px;
  max-width: 720px;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  text-align: center;
  font-size: 0.78rem;
  line-height: 2;
  letter-spacing: 1px;
  color: var(--text-muted);
}

/* 链接行一律 flex + 允许换行 ——
   ★ 之前是行内元素，窄屏排不下时把容器撑宽、右边被截断（"写不到了"就是这个）。
   gap 代替 margin，换行后行距也整齐。 */
.sf-nav,
.sf-row:not(.sf-copy) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: baseline;
  gap: 2px 14px;
}

.sf-nav {
  margin-bottom: 2px;
}

.sf-row:not(.sf-copy) {
  margin: 6px 0 0;
}

.sf-nav a,
.sf-row a {
  color: var(--text-body);
  text-decoration: none;
  transition: color 0.25s;
}

.sf-nav a:hover,
.sf-row a:hover {
  color: var(--iris-purple);
}

.sf-thanks {
  color: var(--text-muted);
}

.sf-label {
  letter-spacing: 2px;
}

/* 「感谢…」那句单独占一行（flex-basis: 100% 强制换行） */
.sf-note {
  flex-basis: 100%;
  font-size: 0.72rem;
  opacity: 0.75;
}

.sf-dot {
  opacity: 0.45;
}

/* 版权这行保持普通块级：里面的文字需要能自己折行（flex 项不会内部换行） */
.sf-copy {
  margin: 12px 0 0;
  opacity: 0.85;
}

/* 窄屏：字号收一点，避免换行太碎 */
@media (max-width: 780px) {
  .site-footer {
    margin-top: 40px;
    padding: 22px 16px 30px;
    font-size: 0.74rem;
    line-height: 1.9;
  }

  /* 窄屏把行内间距收紧一点（间距走 flex 的 gap，不再是 margin） */
  .sf-nav,
  .sf-row:not(.sf-copy) {
    gap: 2px 10px;
  }
}
</style>
