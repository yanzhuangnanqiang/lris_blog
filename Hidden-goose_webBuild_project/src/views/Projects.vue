<template>
  <DefaultLayout>
    <div class="page">
      <h1 class="title">项目</h1>
      <div class="sub">来自 GitHub：yanzhuangnanqiang</div>

      <div v-if="loading" class="tip">加载中…</div>
      <div v-else-if="error" class="tip">
        拉取失败：{{ error }}
        <div class="tip2">
          你可以直接打开：
          <a href="https://github.com/yanzhuangnanqiang" target="_blank" rel="noreferrer">
            https://github.com/yanzhuangnanqiang
          </a>
        </div>
      </div>

      <div v-else class="grid">
        <a v-for="repo in repos" :key="repo.id" class="card" :href="repo.html_url" target="_blank" rel="noreferrer">
          <div class="name">{{ repo.name }}</div>
          <div class="desc">{{ repo.description || '（暂无描述）' }}</div>
          <div class="meta">
            <span v-if="repo.language">{{ repo.language }}</span>
            <span>★ {{ repo.stargazers_count }}</span>
            <span>更新 {{ repo.updated_at.slice(0, 10) }}</span>
          </div>
        </a>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const repos = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/users/yanzhuangnanqiang/repos?sort=updated&per_page=100')
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    repos.value = data
      .filter(r => !r.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
  } catch (e) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  padding: 100px 18px 40px;
  overflow: auto;
  color: rgba(220, 230, 240, 0.92);
}

.title {
  font-weight: 300;
  letter-spacing: 6px;
  font-size: 2rem;
}

.sub {
  margin-top: 8px;
  opacity: 0.75;
}

.tip {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(20, 20, 20, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
}
.tip2 { margin-top: 8px; opacity: 0.8; }

.grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.card {
  text-decoration: none;
  color: rgba(220, 230, 240, 0.92);
  padding: 14px;
  border-radius: 18px;
  background: rgba(220, 230, 240, 0.10);
  border: 1px solid rgba(220, 230, 240, 0.15);
  backdrop-filter: blur(12px);
  transition: 0.2s;
}

.card:hover {
  background: rgba(220, 230, 240, 0.14);
  transform: translateY(-1px);
}

.name { color: #fff; font-size: 1.05rem; }
.desc { margin-top: 8px; opacity: 0.85; line-height: 1.6; min-height: 42px; }

.meta {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  opacity: 0.75;
  font-size: 0.82rem;
}

@media (max-width: 1060px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .grid { grid-template-columns: 1fr; }
}
</style>