<template>
  <div class="note-card">
    <h3 class="note-title">{{ note.title }}</h3>
    <div class="note-meta">
      <span>{{ note.date }}</span>
      <span>· {{ note.likes }} 赞</span>
    </div>
    <span class="note-path">{{ note.path }}</span>
  </div>
</template>

<script setup>
defineProps({
  note: Object
})
</script>

<style scoped>
.note-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  transition: 0.2s;
  cursor: pointer;
}
.note-card:hover {
  background: rgba(220, 230, 240, 0.2);
}
.note-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--cold-white);
  margin-bottom: 6px;
}
.note-meta {
  font-size: 0.7rem;
  color: #9eabb5;
  margin-bottom: 4px;
}
.note-path {
  font-size: 0.65rem;
  color: #7b8893;
}
</style>