import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const tracks = [
  { title: '赛琳娜 希声_缘纺祈糸', file: '赛琳娜 希声_缘纺祈糸.mp3', artist: '赛琳娜' },
  { title: '流离叠奏', file: '流离叠奏.mp3', artist: '赛琳娜' },
  { title: 'Dreaming to the Glowing Place', file: 'EP - Dreaming to the Glowing Place_.mp3', artist: '赛琳娜' },
  { title: 'Dear You 致你', file: '赛琳娜·希声 《Dear You 致你》.mp3', artist: '赛琳娜' },
]

function makeUrl(file) { return `/music/${file}` }

export const useMusicStore = defineStore('music', () => {
  // ---- 状态 ----
  const idx = ref(0)
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const seek = ref(0)
  const volume = ref(0.6)
  const muted = ref(false)
  const volBefore = ref(0.6)
  const loop = ref(false)

  const current = computed(() => tracks[idx.value])

  // ---- audio（全局唯一，永不销毁）----
  let audio = null
  let audioCtx = null
  let analyser = null
  let source = null
  let rafId = null
  let onTimeupdate = null
  let onLoadedmetadata = null
  let onEnded = null

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

  function stopVisualizer() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    if (source) { source.disconnect(); source = null }
    if (analyser) { analyser.disconnect(); analyser = null }
  }

  function onTrackEnd() {
    if (loop.value) {
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
    } else {
      next()
    }
  }

  function loadTrack() {
    if (!audio) {
      audio = new Audio()
      onTimeupdate = () => { currentTime.value = audio.currentTime || 0; seek.value = currentTime.value }
      onLoadedmetadata = () => { duration.value = audio.duration || 0 }
      onEnded = onTrackEnd
      audio.addEventListener('timeupdate', onTimeupdate)
      audio.addEventListener('loadedmetadata', onLoadedmetadata)
      audio.addEventListener('ended', onEnded)
    }
    stopVisualizer()
    const src = makeUrl(current.value.file)
    audio.src = src
    audio.volume = volume.value
    if (playing.value) {
      audio.play().catch(() => {})
      initAnalyser()
    }
  }

  function toggle() {
    if (!audio) { loadTrack(); return }
    if (playing.value) {
      audio.pause()
      playing.value = false
      stopVisualizer()
    } else {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
      if (!analyser) initAnalyser()
      audio.play().catch(() => {})
      playing.value = true
    }
  }

  function next() { idx.value = (idx.value + 1) % tracks.length }
  function prev() { idx.value = (idx.value - 1 + tracks.length) % tracks.length }

  function onSeek(val) {
    if (!audio) return
    audio.currentTime = val
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

  function fmt(s) {
    if (!s && s !== 0) return '00:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // 切换到新曲目时自动加载
  watch(idx, () => { loadTrack() })

  // 音量变化时同步
  watch(volume, (v) => { if (audio) audio.volume = v; if (v > 0) muted.value = false })

  return {
    idx, playing, currentTime, duration, seek, volume, muted, volBefore, loop,
    current, bars, tracks,
    toggle, next, prev, onSeek, toggleMute, fmt, loadTrack, initAnalyser,
  }
})
