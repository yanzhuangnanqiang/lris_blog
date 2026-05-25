<template>
  <div v-if="resolvedSrc" class="bg-wallpaper" :style="{ backgroundImage: `url(${resolvedSrc})` }"></div>
</template>

<script setup>
import { computed } from 'vue'
import yeguang from '@/assets/yeguang.jpg'
import xiaguang from '@/assets/xiaguang.jpg'

const props = defineProps({
  imageSrc: { type: String, required: true }
})

const map = {
  'yeguang.jpg': yeguang,
  'xiaguang.jpg': xiaguang,
}

const resolvedSrc = computed(() => map[props.imageSrc] || null)
</script>

<style scoped>
.bg-wallpaper {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
  -webkit-background-size: cover;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
</style>
