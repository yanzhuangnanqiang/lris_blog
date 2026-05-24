<template>
  <div class="note-card" :class="{ active }" @click="$emit('select')">
    <h3 class="note-title">{{ note.title }}</h3>
    <div class="note-meta">
      <span>{{ note.date }}</span>
    </div>
    <div class="note-tags">
      <span v-for="t in note.tags" :key="t" class="ntag">{{ t }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ note: Object, active: Boolean })
defineEmits(['select'])
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
.note-card.active {
  background: rgba(111,66,193,0.25);
  border-color: rgba(111,66,193,0.4);
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
  margin-bottom: 6px;
}
.note-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.ntag {
  font-size: 0.62rem;
  padding: 2px 7px;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.45);
}
</style>
