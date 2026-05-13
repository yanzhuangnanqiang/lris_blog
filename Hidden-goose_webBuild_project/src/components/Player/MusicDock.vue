<template>
  <div class="dock">
    <button class="fab" @click="open = !open" :title="open ? '收起播放器' : '打开播放器'">
      {{ isPlaying ? '⏸' : '▶' }}
    </button>

    <MusicPanel
      v-if="open"
      :tracks="tracks"
      @close="open = false"
      @play-state="isPlaying = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MusicPanel from './MusicPanel.vue'

const open = ref(false)
const isPlaying = ref(false)

// 你 assets 里已有这些 mp3：我先写成可运行的列表（路径按你的文件名）
const tracks = [
  { title: 'Dreaming to the Glowing Place', file: 'EP - Dreaming to the Glowing Place_.mp3', artist: 'EP' },
  { title: '流离叠奏', file: '流离叠奏.mp3', artist: '—' },
  { title: '赛琳娜 希声_缘纺祈糸', file: '赛琳娜 希声_缘纺祈糸.mp3', artist: '赛琳娜' },
  { title: 'Dear You 致你', file: '赛琳娜·希声 《Dear You 致你》.mp3', artist: '赛琳娜' },
]
</script>

<style scoped>
.dock {
  position: fixed;
  top: 78px;  /* 顶栏下方 */
  right: 18px;
  z-index: 60;
}

.fab {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(220, 230, 240, 0.22);
  background: rgba(220, 230, 240, 0.12);
  backdrop-filter: blur(12px);
  color: var(--cold-white);
  cursor: pointer;
  transition: 0.2s;
}

.fab:hover {
  background: rgba(220, 230, 240, 0.18);
}
</style>