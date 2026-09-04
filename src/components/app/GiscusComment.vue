<template>
  <div class="giscus-wrap">
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
import { onMounted, watch, ref } from 'vue'

const props = defineProps({
  term: { type: String, required: true },
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
  s.setAttribute('data-theme', 'https://www.thineiris.top/giscus-theme.css')
  s.setAttribute('data-lang', 'zh-CN')
  s.crossOrigin = 'anonymous'
  s.async = true
  giscusRef.value.appendChild(s)
}

onMounted(loadGiscus)

watch(
  () => props.term,
  (t) => {
    if (window.giscus?.sendMessage) {
      window.giscus.sendMessage({ setConfig: { term: t } })
    }
  }
)
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
</style>
