<template>
  <div class="giscus-wrap" :class="{ dark }">
    <div class="giscus-head">
      <h3 class="giscus-title">评 论</h3>
      <a
        class="giscus-github"
        href="https://github.com/yanzhuangnanqiang/lris_blog/discussions"
        target="_blank"
        rel="noreferrer"
      >去 GitHub 评论 ↗</a>
    </div>
    <div class="giscus" ref="giscusRef"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  term: { type: String, required: true },
  // 放进深色容器时打开：标题区（这个 div 不在 iframe 里）要翻成浅色。
  dark: { type: Boolean, default: false },
  // iframe 内部的主题。data-theme 是**每个实例单独**设的，
  // 所以浅色页（PostDetail）和深色页（笔记阅读面板）可以各用各的。
  theme: { type: String, default: 'light' },   // 'light' | 'dark'
})

const giscusRef = ref(null)

function loadGiscus() {
  const s = document.createElement('script')
  s.src = 'https://giscus.app/client.js'
  s.setAttribute('data-repo', 'yanzhuangnanqiang/lris_blog')
  s.setAttribute('data-repo-id', 'R_kgDOSmi1yw')
  s.setAttribute('data-category', 'Announcements')
  s.setAttribute('data-category-id', 'DIC_kwDOSmi1y84DE33A')
  s.setAttribute('data-mapping', 'specific')
  s.setAttribute('data-term', props.term)
  s.setAttribute('data-strict', '0')
  s.setAttribute('data-reactions-enabled', '1')
  s.setAttribute('data-emit-metadata', '0')
  s.setAttribute('data-input-position', 'bottom')
  // giscus 的 iframe 跑在 giscus.app 上，相对路径会被解析到那边去，必须给绝对地址。
  // 用 location.origin 而不是写死域名 —— 这样本地 dev 也能看到主题效果
  // （写死的话 localhost 会去拉线上那份，改动看不到）。
  const themeFile = props.theme === 'dark' ? 'giscus-theme-dark.css' : 'giscus-theme.css'
  s.setAttribute('data-theme', `${location.origin}/${themeFile}`)
  s.setAttribute('data-lang', 'zh-CN')
  s.crossOrigin = 'anonymous'
  s.async = true
  giscusRef.value.appendChild(s)
}

onMounted(loadGiscus)
</script>

<style scoped>
.giscus-wrap {
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.giscus-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.giscus-title {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 4px;
  color: var(--text-dark);
  margin: 0;
  border-left: 3px solid var(--iris-purple);
  padding-left: 12px;
}

.giscus-github {
  font-size: 0.76rem;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 1px;
  padding: 5px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  transition: 0.25s ease;
}

.giscus-github:hover {
  color: var(--text-dark);
  background: var(--mint-green);
  border-color: var(--mint-green);
}

/* ---- 深色容器里（笔记页的阅读面板）----
   上面那套颜色是给浅色页面设计的：--text-dark 是近黑，放深底上等于看不见。 */
.giscus-wrap.dark { border-top-color: rgba(255, 255, 255, 0.1); }
.giscus-wrap.dark .giscus-title { color: rgba(255, 255, 255, 0.92); }
.giscus-wrap.dark .giscus-github {
  color: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.14);
}
.giscus-wrap.dark .giscus-github:hover {
  color: var(--text-dark);
  background: var(--mint-green);
  border-color: var(--mint-green);
}
</style>
