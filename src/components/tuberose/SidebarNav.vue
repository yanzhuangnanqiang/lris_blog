<template>
  <div class="nav">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: theme.currentNav === tab.key, shake: tab.key === 'archive' && showShake }"
      @click="onTabClick(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/theme'
const theme = useAppStore()
const tabs = [
  { key: 'latest', label: '✦ 最新' },
  { key: 'archive', label: '☷ 归档' },
  { key: 'lab', label: '⚗ 实验室' }
]

const showShake = ref(false)
function onTabClick(key) {
  theme.setNav(key)
  if (key === 'archive') {
    showShake.value = false
    sessionStorage.setItem('archive-hinted', '1')
  }
}

onMounted(() => {
  if (!sessionStorage.getItem('archive-hinted')) {
    setTimeout(() => { showShake.value = true }, 3000)
  }
})
</script>

<style scoped>
.nav {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  background: rgba(255,255,255,0.04);
  border-radius: 14px;
}
button {
  flex: 1;
  background: transparent;
  border: none;
  color: #9eabb5;
  padding: 7px 0;
  border-radius: 11px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.25s ease;
  position: relative;
}
button.active {
  background: rgba(255,255,255,0.12);
  color: var(--cold-white);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: scale(1.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.12);
}
button:hover:not(.active) {
  color: rgba(255,255,255,0.6);
}
button.shake {
  animation: navShake 0.6s ease-in-out 3;
}
@keyframes navShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
</style>