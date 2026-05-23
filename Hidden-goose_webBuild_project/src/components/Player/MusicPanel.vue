<template>
  <div class="panel" :class="{ playing: playing }">
    <div class="head">
      <div class="meta">
        <div class="title">{{ current.title }}</div>
        <div class="artist">
          <span class="artist-name" :style="{ color: artistColor }">{{ current.artist }}</span>
          <span class="sep">·</span>
          <span class="tag">纯音乐</span>
        </div>
      </div>
      <button class="x" @click="$emit('close')">✕</button>
    </div>

    <div class="spectrum" :class="{ active: playing }">
      <span v-for="n in 46" :key="n" class="bar" :style="{ height: bars[n-1] + 'px' }"></span>
    </div>

    <div class="progress" @mouseenter="showTotal = true" @mouseleave="showTotal = false">
      <span class="t">{{ fmt(currentTime) }}</span>
      <input type="range" min="0" :max="duration || 100" step="0.1" v-model.number="seek" @input="onSeek" class="seek-bar" />
      <span class="t total" :class="{ on: showTotal }">{{ fmt(duration) }}</span>
    </div>

    <div class="controls">
      <button class="ctrl" @click="like">
        <img :src="heartIcon" alt="" />
      </button>
      <button class="ctrl" @click="prev">
        <img :src="skipBack" alt="" />
      </button>
      <button class="ctrl play" @click="toggle">
        <img :src="playing ? pauseIcon : playIcon" alt="" />
      </button>
      <button class="ctrl" @click="next">
        <img :src="skipForward" alt="" />
      </button>
      <button class="ctrl" :class="{ on: loop }" @click="loop = !loop">
        <img :src="loop ? loopOnIcon : loopOffIcon" alt="" />
      </button>
    </div>

    <div class="float-hearts">
      <span v-for="h in hearts" :key="h.id" class="fh" :style="h.style">{{ h.emoji }}</span>
    </div>

    <div class="volume">
      <button class="vol-btn" @click="toggleMute">
        <img :src="volIcon" alt="" />
      </button>
      <input type="range" min="0" max="1" step="0.05" v-model.number="volume" class="vol-bar" />
      <span class="vol-spacer"></span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import skipBack from '@/assets/skip-back.svg'
import skipForward from '@/assets/skip-forward.svg'
import loopOnIcon from '@/assets/refresh-cw.svg'
import loopOffIcon from '@/assets/refresh-cw-off.svg'
import playIcon from '@/assets/play.svg'
import pauseIcon from '@/assets/pause.svg'
import heartIcon from '@/assets/heart.svg'
import volHigh from '@/assets/volume-2.svg'
import volLow from '@/assets/volume-1.svg'
import volMuted from '@/assets/volume-off.svg'

const props = defineProps({
  tracks: { type: Array, required: true },
})

const emit = defineEmits(['play-state', 'close'])

const idx = ref(0)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seek = ref(0)
const volume = ref(0.6)
const muted = ref(false)
const volBefore = ref(0.6)
const showTotal = ref(false)
const loop = ref(false)

const current = computed(() => props.tracks[idx.value])

const artistPalette = {
  'EP': '#9a8bb8',
  '赛琳娜': '#a08dba',
}
const artistColor = computed(() => artistPalette[current.value.artist] || '#9a8bb8')

const volIcon = computed(() => {
  if (muted.value || volume.value === 0) return volMuted
  if (volume.value < 0.5) return volLow
  return volHigh
})

let heartId = 0
const hearts = ref([])
const heartEmojis = ['💚', '💛', '🌸', '✨', '💕', '🌿']

function spawnHeart() {
  const id = ++heartId
  const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
  const x = (Math.random() - 0.5) * 60
  hearts.value.push({ id, emoji, style: { left: `calc(50% + ${x}px)` } })
  setTimeout(() => { hearts.value = hearts.value.filter(h => h.id !== id) }, 1200)
}

function like() {
  for (let i = 0; i < 5; i++) setTimeout(spawnHeart, i * 80)
}

function toggleMute() {
  if (volume.value > 0 && !muted.value) {
    volBefore.value = volume.value
    volume.value = 0
    muted.value = true
  } else {
    muted.value = false
    volume.value = volBefore.value > 0 ? volBefore.value : 0.7
  }
}

let audio = null
let audioCtx = null
let analyser = null
let source = null
let rafId = null

const bars = ref(Array.from({ length: 46 }, () => 3))

function initAnalyser() {
  if (!audio) return
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    if (source) source.disconnect()
    if (analyser) analyser.disconnect()
    source = audioCtx.createMediaElementSource(audio)
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 128
    source.connect(analyser)
    analyser.connect(audioCtx.destination)
    runLoop()
  } catch (e) { analyser = null; source = null }
}

function runLoop() {
  if (!analyser) return
  const data = new Uint8Array(analyser.frequencyBinCount)
  function tick() {
    if (!analyser) return
    analyser.getByteFrequencyData(data)
    const v = []
    for (let i = 0; i < 46; i++) v.push(Math.max(3, ((data[i] || 0) / 255) * 24))
    bars.value = v
    rafId = requestAnimationFrame(tick)
  }
  tick()
}

let onTimeupdate = null
let onLoadedmetadata = null
let onEnded = null

function makeUrl(file) {
  return `/music/${file}`
}

function cleanupAudio() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  if (source) { source.disconnect(); source = null }
  if (analyser) { analyser.disconnect(); analyser = null }
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
  audio.volume = volume.value

  onTimeupdate = () => { currentTime.value = audio.currentTime || 0; seek.value = currentTime.value }
  onLoadedmetadata = () => { duration.value = audio.duration || 0 }
  onEnded = onTrackEnd

  audio.addEventListener('timeupdate', onTimeupdate)
  audio.addEventListener('loadedmetadata', onLoadedmetadata)
  audio.addEventListener('ended', onEnded)

  if (playing.value) {
    audio.play().catch(() => {})
    if (!analyser) initAnalyser()
  }
}

function onTrackEnd() {
  if (loop.value) {
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
  } else {
    next()
  }
}

function toggle() {
  if (!audio) { loadTrack(); if (!audio) return }
  if (playing.value) {
    audio.pause()
    playing.value = false
    if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  } else {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
    if (!analyser) initAnalyser()
    audio.play().catch(() => {})
    playing.value = true
  }
  emit('play-state', playing.value)
}

function next() { idx.value = (idx.value + 1) % props.tracks.length }
function prev() { idx.value = (idx.value - 1 + props.tracks.length) % props.tracks.length }

function onSeek() {
  if (!audio) return
  audio.currentTime = seek.value
}

watch(volume, (v) => { if (audio) audio.volume = v; if (v > 0) muted.value = false })

function fmt(s) {
  if (!s && s !== 0) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

watch(idx, () => { emit('play-state', playing.value); loadTrack() })

onMounted(() => { loadTrack() })
onUnmounted(() => { cleanupAudio() })
</script>

<style scoped>
.panel {
  width: 260px;
  padding: 14px 14px 6px;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 16px;
  color: var(--text-body);
  box-shadow: 0 8px 28px rgba(0,0,0,0.05);
  position: relative;
  overflow: visible;
}

.head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.title { font-size: 0.9rem; color: #5a7a62; font-weight: 500; line-height: 1.3; }
.artist { font-size: 0.7rem; color: #a098b0; }
.artist-name { font-weight: 400; }
.sep { opacity: 0.3; margin: 0 4px; }
.tag { font-size: 0.65rem; opacity: 0.4; letter-spacing: 1px; color: #b0aab8; }

.x {
  border: none; background: transparent;
  color: rgba(0,0,0,0.18); cursor: pointer;
  font-size: 0.8rem; transition: 0.2s; flex-shrink: 0;
}
.x:hover { color: var(--light-pink); }

/* ---- 频谱 ---- */
.spectrum {
  display: flex;
  justify-content: space-evenly;
  align-items: flex-end;
  gap: 1px;
  height: 24px;
}

.bar {
  flex: 1;
  height: 6px;
  border-radius: 2px;
  background: rgba(160,130,200,0.5);
  transition: height 0.3s ease;
}

.spectrum.active .bar {
  transition: height 0.1s ease;
}

/* ---- 控制 ---- */
.controls {
  display: grid;
  grid-template-columns: 1fr 34px 44px 34px 1fr;
  align-items: center;
  justify-items: center;
  gap: 4px;
  position: relative;
  margin-top: 2px;
}

.controls .ctrl:first-child { justify-self: start; }
.controls .ctrl:last-child { justify-self: end; }

.ctrl {
  width: 34px; height: 34px;
  border-radius: 50%; border: none;
  background: transparent;
  cursor: pointer;
  display: grid; place-items: center;
  transition: 0.2s;
}

.ctrl img { width: 17px; height: 17px; opacity: 0.35; transition: opacity 0.2s; }
.ctrl:hover { background: rgba(160,210,185,0.22); }
.ctrl:hover img { opacity: 0.65; }
.ctrl.on { background: rgba(160,210,185,0.18); }
.ctrl.on img { opacity: 0.5; }

.play { width: 44px; height: 44px; margin: 0 6px; }
.play img { width: 22px; height: 22px; opacity: 0.5; }
.play:hover { background: rgba(160,210,185,0.25); }
.play:hover img { opacity: 0.75; }

/* ---- 爱心 ---- */
.float-hearts {
  position: absolute;
  top: 80px; left: 0; right: 0;
  height: 40px;
  pointer-events: none; z-index: 5;
}

.fh {
  position: absolute; bottom: 0;
  font-size: 1rem;
  animation: floatUp 1s ease-out both;
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(0.6); opacity: 1; }
  60% { transform: translateY(-24px) scale(1); opacity: 0.7; }
  100% { transform: translateY(-36px) scale(0.3); opacity: 0; }
}

/* ---- 进度 + 音量 ---- */
.progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 4px; align-items: center;
  margin-top: 6px;
  cursor: pointer;
  user-select: none;
}

.t { font-size: 0.65rem; opacity: 0.5; color: #a0a8b0; min-width: 30px; }
.t.total { min-width: 30px; text-align: right; opacity: 0; transition: opacity 0.25s; }
.t.total.on { opacity: 0.4; }

.seek-bar {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 4px; border-radius: 2px;
  background: rgba(160,210,185,0.45); outline: none;
  cursor: pointer;
}

.seek-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(10,10)'%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='2.2' fill='%2380b098' opacity='.7'/%3E%3C/g%3E%3C/svg%3E") no-repeat center;
  background-size: 100%; cursor: pointer !important;
}

.seek-bar::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(10,10)'%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='2.2' fill='%2380b098' opacity='.7'/%3E%3C/g%3E%3C/svg%3E") no-repeat center;
  background-size: 100%; cursor: pointer; border: none;
}

.volume {
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  gap: 4px; align-items: center;
  margin-top: 0;
}

.vol-btn {
  width: 26px; height: 26px;
  border: none; background: transparent;
  cursor: pointer;
  display: grid; place-items: center; padding: 0;
}

.vol-btn img { width: 16px; height: 16px; opacity: 0.3; transition: opacity 0.2s; }
.vol-btn:hover img { opacity: 0.55; }

.vol-spacer { width: 30px; }

.vol-bar {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 3px; border-radius: 2px;
  background: rgba(160,210,185,0.4); outline: none;
}

.vol-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(10,10)'%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='2.2' fill='%2380b098' opacity='.7'/%3E%3C/g%3E%3C/svg%3E") no-repeat center;
  background-size: 100%; cursor: pointer;
}

.vol-bar::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(10,10)'%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-4.5' rx='1.8' ry='3.5' fill='%23a0d2b9' opacity='.7' transform='rotate(288)'/%3E%3Ccircle cx='0' cy='0' r='2.2' fill='%2380b098' opacity='.7'/%3E%3C/g%3E%3C/svg%3E") no-repeat center;
  background-size: 100%; cursor: pointer; border: none;
}
</style>
