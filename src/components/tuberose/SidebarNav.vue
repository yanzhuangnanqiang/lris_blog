<template>
  <div class="nav">
    <button 
      v-for="tab in tabs" 
      :key="tab.key" 
      :class="{ active: theme.currentNav === tab.key }"
      @click="theme.setNav(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/theme'
const theme = useAppStore()
const tabs = [
  { key: 'latest', label: '最新' },
  { key: 'archive', label: '归档' },
  { key: 'lab', label: '实验室' }
]
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}
button {
  background: transparent;
  border: none;
  color: #9eabb5;
  padding: 6px 12px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s;
}
button.active {
  background: var(--iris-purple);
  color: white;
}
button:hover:not(.active) {
  color: var(--cold-white);
}
</style>