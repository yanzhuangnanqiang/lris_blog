<template>
  <div class="filters">
    <span class="filter-tag">📄 {{ notes.length }} 篇</span>
    <span class="filter-tag">📅 {{ currentYear }}</span>
    <span class="filter-tag">🔖 技术笔记</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { notes } from '@/data/loadNotes'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.filter-tag {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 3px 10px;
  font-size: 0.75rem;
  color: var(--cold-white);
}
</style>