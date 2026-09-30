<template>
  <div v-if="resolvedSrc" class="bg-wrap">
    <div class="bg-wallpaper" :style="[bgImgStyle, bgStyle, { filter: `blur(${settings.blur}px)` }]"></div>
    <div class="bg-overlay" :style="overlayStyle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBgSettings } from '@/composables/useBgSettings'
import yeguang from '@/assets/optimized/yeguang.webp'
import xiaguang from '@/assets/optimized/xiaguang.webp'

const props = defineProps({
  imageSrc: { type: String, required: true }
})

const { bgStyle, overlayStyle, settings } = useBgSettings()

const map = {
  'yeguang.jpg': yeguang,
  'xiaguang.jpg': xiaguang,
}

const resolvedSrc = computed(() => map[props.imageSrc] || null)

const bgImgStyle = computed(() => resolvedSrc.value
  ? { backgroundImage: `url(${resolvedSrc.value})` }
  : {}
)
</script>

<style scoped>
.bg-wrap {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 0;
}

.bg-wallpaper {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-size 0.2s, background-position 0.2s, filter 0.2s;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  transition: opacity 0.2s;
}
</style>