<template>
  <div v-if="resolvedSrc" class="bg-wallpaper" :style="{ backgroundImage: `url(${resolvedSrc})` }"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  imageSrc: { type: String, required: true }
})

// 静态导入 wallpapers，确保构建时加上 hash
const wallpapers = import.meta.glob('@/assets/*.{jpg,jpeg,png}', { eager: true, import: 'default' })

const resolvedSrc = computed(() => {
  const key = Object.keys(wallpapers).find(k => k.endsWith('/' + props.imageSrc))
  return key ? wallpapers[key] : null
})
</script>

<style scoped>
.bg-wallpaper {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
