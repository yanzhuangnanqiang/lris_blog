<template>
  <div class="panel">
    <div class="head">
      <div class="meta">
        <div class="title">{{ current.title }}</div>
        <div class="artist">{{ current.artist }}</div>
      </div>
      <button class="x" @click="$emit('close')">✕</button>
    </div>

    <div class="controls">
      <button @click="prev">⟨⟨</button>
      <button @click="toggle">{{ playing ? '暂停' : '播放' }}</button>
      <button @click="next">⟩⟩</button>
    </div>

    <div class="progress">
      <span class="t">{{ fmt(currentTime) }}</span>
      <input type="range" min="0" :max="duration || 0" step="0.1" v-model.number="seek" @change="onSeek" />
      <span class="t">{{ fmt(duration) }}</span>
    </div>
<!-- 
    <div class="lyrics">
      <div class="line dim">歌词功能：你给我 .lrc 或文本，我就能接成滚动歌词。</div>
      <div class="line">现在先做“可播放 + 可切歌 + 可展开收起”。</div>
    </div> -->
    
    <div class="lyrics">
       <div class="line music-only">纯音乐</div>
    </div>
    
  </div>
</template>1

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  tracks: { type: Array, required: true },
})

const emit = defineEmits(['play-state', 'close'])

const idx = ref(0)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seek = ref(0)

const current = computed(() => props.tracks[idx.value])

let audio = null
let onTimeupdate = null
let onLoadedmetadata = null
let onEnded = null

function makeUrl(file) {
  return new URL(`../../assets/${file}`, import.meta.url).href
}

function cleanupAudio() {
  if (!audio) return
  audio.pause()
  audio.removeEventListener('timeupdate', onTimeupdate)
  audio.removeEventListener('loadedmetadata', onLoadedmetadata)
  audio.removeEventListener('ended', onEnded)
  audio = null
}

function loadTrack() {
  cleanupAudio()

  const src = makeUrl(current.value.file)
  audio = new Audio(src)

  onTimeupdate = () => {
    currentTime.value = audio.currentTime || 0
    seek.value = currentTime.value
  }
  onLoadedmetadata = () => {
    duration.value = audio.duration || 0
  }
  onEnded = next

  audio.addEventListener('timeupdate', onTimeupdate)
  audio.addEventListener('loadedmetadata', onLoadedmetadata)
  audio.addEventListener('ended', onEnded)

  if (playing.value) {
    audio.play().catch(() => {})
  }
}

function toggle() {
  if (!audio) return
  if (playing.value) {
    audio.pause()
    playing.value = false
  } else {
    audio.play().catch(() => {})
    playing.value = true
  }
  emit('play-state', playing.value)
}

function next() {
  idx.value = (idx.value + 1) % props.tracks.length
}

function prev() {
  idx.value = (idx.value - 1 + props.tracks.length) % props.tracks.length
}

function onSeek() {
  if (!audio) return
  audio.currentTime = seek.value
}

function fmt(s) {
  if (!s && s !== 0) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

watch(idx, () => {
  emit('play-state', playing.value)
  loadTrack()
})

onMounted(() => {
  playing.value = true
  emit('play-state', true)
  loadTrack()
})

onUnmounted(() => {
  cleanupAudio()
})
</script>

<style scoped>
.panel {
  width: 320px;
  margin-top: 10px;
  padding: 14px;

  background: rgba(20, 20, 20, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  color: rgba(220, 230, 240, 0.92);
}

.head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
}

.title {
  font-size: 0.98rem;
  color: #fff;
}
.artist {
  font-size: 0.78rem;
  opacity: 0.75;
  margin-top: 4px;
}

.x {
  border: none;
  background: transparent;
  color: rgba(220, 230, 240, 0.85);
  cursor: pointer;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.controls button {
  flex: 1;
  border-radius: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(220, 230, 240, 0.16);
  background: rgba(220, 230, 240, 0.10);
  color: rgba(220, 230, 240, 0.95);
  cursor: pointer;
}

.progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

.t {
  font-size: 0.75rem;
  opacity: 0.75;
}

input[type="range"] {
  width: 100%;
}

.lyrics {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
  min-height: 64px;

  display: grid;
  place-items: center;
}

.music-only {
  font-size: 1rem;
  letter-spacing: 6px;
  opacity: 0.8;
}

.dim {
  opacity: 0.7;
}
</style>