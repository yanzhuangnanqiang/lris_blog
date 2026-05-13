<template>
  <div class="filters">
    <span class="filter-tag">📄 12 篇</span>
    <span class="filter-tag">📅 2025</span>
    <span class="filter-tag">🔖 黛尾手记</span>
  </div>
</template>

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