<template>
  <aside class="latest-card">
    <h3 class="lc-title">最新笔记</h3>
    <ul class="lc-list">
      <li v-for="n in latestNotes" :key="n.id" class="lc-item">
        <router-link :to="'/notes'" class="lc-link">
          <span class="lc-name">{{ n.title }}</span>
          <span class="lc-date">{{ n.date }}</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { notes } from '@/data/loadNotes'

const latestNotes = notes.slice(0, 3)
</script>

<style scoped>
.latest-card {
  width: 300px;
  padding: 18px 24px;
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--shadow-card);
  animation: cardIn 0.6s ease 0.6s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.latest-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.lc-title {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 3px;
  color: var(--text-dark);
  margin: 0 0 12px;
  text-align: center;
}

.lc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lc-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
}

.lc-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.lc-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  gap: 8px;
}

.lc-name {
  font-size: 0.82rem;
  color: var(--text-body);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.lc-link:hover .lc-name {
  color: var(--iris-purple);
}

.lc-date {
  font-size: 0.7rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

@media (max-width: 860px) {
  .latest-card {
    display: none;
  }
}
</style>
