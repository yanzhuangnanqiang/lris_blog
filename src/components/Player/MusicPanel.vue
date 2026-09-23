<!--
  音乐播放器面板（全站共用）。
  排版：▌音乐 + 圆形旋转封面 + 歌名歌手 + 细进度条 + 控制键 + 可折叠歌单。

  MusicDock 用 v-show 挂着它，点圆盘展开；closable 给出 ✕ 关掉面板。
  笔记页也复用这一个组件（阅读态左列 / 列表态胶囊），全站只有一份实现。
-->
<template>
  <WidgetCard class="mp-card" title="音乐">
    <template v-if="closable" #action>
      <button class="mp-x" aria-label="收起播放器" @click="emit('close')">✕</button>
    </template>

    <div class="now">
      <div class="cover">
        <svg class="cover-note" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        <img
          class="cover-img"
          :class="{ on: coverOk, spinning: store.playing }"
          :src="coverSrc"
          alt=""
          @load="coverOk = true"
          @error="coverOk = false"
        />
      </div>

      <div class="info">
        <h4 class="name" :title="store.current.title">{{ store.current.title }}</h4>
        <p class="artist">{{ store.current.artist }}</p>
        <div class="meta">
          <span class="times">{{ store.fmt(store.currentTime) }} / {{ store.fmt(store.duration) }}</span>
          <div class="vol">
            <button class="vol-btn" :aria-label="store.muted ? '取消静音' : '静音'" @click="store.toggleMute">
              <img :src="volIcon" alt="" />
            </button>
            <input
              class="vol-bar"
              type="range" min="0" max="1" step="0.05"
              :value="store.volume"
              aria-label="音量"
              @input="store.volume = $event.target.value"
            />
          </div>
        </div>
      </div>
    </div>

    <input
      class="seek"
      type="range" min="0" :max="store.duration || 100" step="0.1"
      :value="store.seek"
      aria-label="播放进度"
      @input="store.onSeek($event.target.value)"
    />

    <div class="controls">
      <button
        class="ctrl" :class="{ on: store.loop }"
        :aria-label="store.loop ? '单曲循环' : '列表循环'" :aria-pressed="store.loop"
        @click="store.loop = !store.loop"
      >
        <img :src="store.loop ? loopOnIcon : loopOffIcon" alt="" />
      </button>
      <button class="ctrl" aria-label="上一首" @click="store.prev">
        <img :src="skipBack" alt="" />
      </button>
      <button class="ctrl play" :aria-label="store.playing ? '暂停' : '播放'" @click="toggle">
        <img :src="store.playing ? pauseIcon : playIcon" alt="" />
      </button>
      <button class="ctrl" aria-label="下一首" @click="store.next">
        <img :src="skipForward" alt="" />
      </button>
      <button
        class="ctrl" :class="{ on: listOpen }"
        aria-label="播放列表" :aria-expanded="listOpen"
        @click="listOpen = !listOpen"
      >
        <img :src="listIcon" alt="" />
      </button>
    </div>

    <!-- 歌单抽屉：grid-rows 0fr → 1fr，靠行高插值展开，不碰 height -->
    <div class="drawer" :class="{ open: listOpen }">
      <div class="drawer-clip">
        <div class="playlist">
          <button
            v-for="(t, i) in store.tracks"
            :key="t.file"
            class="pl-item"
            :class="{ active: i === store.idx }"
            @click="store.select(i)"
          >
            <span class="pl-idx">{{ i + 1 }}</span>
            <span class="pl-title">{{ t.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import WidgetCard from '@/components/app/WidgetCard.vue'
import { useMusicStore } from '@/stores/music'

import skipBack from '@/assets/skip-back.svg'
import skipForward from '@/assets/skip-forward.svg'
import loopOnIcon from '@/assets/refresh-cw.svg'
import loopOffIcon from '@/assets/refresh-cw-off.svg'
import playIcon from '@/assets/play.svg'
import pauseIcon from '@/assets/pause.svg'
import listIcon from '@/assets/list.svg'
import volHigh from '@/assets/volume-2.svg'
import volLow from '@/assets/volume-1.svg'
import volMuted from '@/assets/volume-off.svg'
// 4 首歌还没配封面，先用这张黑胶图兜底
import coverDefault from '@/assets/optimized/liushenji.webp'

const props = defineProps({
  // 面板形态（MusicDock 里）需要能关掉；笔记页左列常开，不要 ✕
  closable: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'play-state'])

const store = useMusicStore()
const listOpen = ref(false)
const coverOk = ref(false)

const coverSrc = computed(() => store.current.cover || coverDefault)

const volIcon = computed(() => {
  if (store.muted || Number(store.volume) === 0) return volMuted
  if (Number(store.volume) < 0.5) return volLow
  return volHigh
})

function toggle() {
  store.toggle()
  emit('play-state', store.playing)
}

onMounted(() => { if (!store.playing) store.loadTrack() })
</script>

<style scoped>
/* 写死宽度，不跟着容器变 —— 否则在笔记页左列（260/300）和圆盘浮层里
   会是两个尺寸，一大一小地跳。
   max-width: 100% 只是兜底，防止将来放进比 260 更窄的容器里溢出。 */
.mp-card {
  width: 280px;
  max-width: 100%;
}

.mp-x {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  padding: 2px 4px;
  transition: color 0.2s;
}
.mp-x:hover { color: var(--light-pink); }

/* ---- 封面 + 信息 ---- */
.now { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }

.cover {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(160, 210, 185, 0.16);
  display: grid;
  place-items: center;
}
.cover-note { width: 24px; height: 24px; color: rgba(160, 210, 185, 0.4); }
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
  /* 动画常驻，只切 play-state —— 暂停会停在当前角度，而不是弹回 0° */
  animation: mpSpin 4s linear infinite;
  animation-play-state: paused;
}
.cover-img.on { opacity: 1; }
.cover-img.spinning { animation-play-state: running; }
@keyframes mpSpin { to { transform: rotate(360deg); } }

.info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.name {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.92);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.artist {
  margin: 0;
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta { display: flex; align-items: center; gap: 8px; margin-top: 1px; }
.times {
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.45);
  flex-shrink: 0;
}
.vol { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.vol-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.vol-btn img { width: 14px; height: 14px; opacity: 0.4; transition: opacity 0.2s; }
.vol-btn:hover img { opacity: 0.75; }

/* ---- 进度 + 音量 ---- */
.seek {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(160, 210, 185, 0.45);
  outline: none;
  cursor: pointer;
  margin: 0 0 4px;
}
.seek::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a0d2b9;
  cursor: pointer;
}
.seek::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: #a0d2b9;
  cursor: pointer;
}

.vol-bar {
  -webkit-appearance: none;
  appearance: none;
  width: 46px;
  height: 3px;
  border-radius: 2px;
  background: rgba(160, 210, 185, 0.4);
  outline: none;
  cursor: pointer;
}
.vol-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #a0d2b9;
  cursor: pointer;
}
.vol-bar::-moz-range-thumb {
  width: 9px;
  height: 9px;
  border: none;
  border-radius: 50%;
  background: #a0d2b9;
  cursor: pointer;
}

/* ---- 控制键 ---- */
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.ctrl {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}
.ctrl img { width: 18px; height: 18px; opacity: 0.5; transition: opacity 0.2s; }
.ctrl:hover { background: rgba(160, 210, 185, 0.22); }
.ctrl:hover img { opacity: 0.85; }
.ctrl.on { background: rgba(160, 210, 185, 0.2); }
.ctrl.on img { opacity: 0.8; }
.play { width: 48px; height: 48px; }
.play img { width: 24px; height: 24px; opacity: 0.7; }
.play:hover { background: rgba(160, 210, 185, 0.25); }
.play:hover img { opacity: 0.95; }

/* ---- 歌单抽屉 ---- */
.drawer {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.drawer.open { grid-template-rows: 1fr; opacity: 1; }
.drawer-clip { overflow: hidden; min-height: 0; }

.playlist {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 120px;
  overflow-y: auto;
  /* 跟全站一致：不用滚动条。
     src/style.css 里已经有 `::-webkit-scrollbar{display:none}` 和
     `*{scrollbar-width:none}`，但这里原先写了 scrollbar-width:thin
     把它覆盖掉了（旧 MusicPanel 就这么写的），所以歌单是唯一露出滚动条的地方。 */
  scrollbar-width: none;
}
.playlist::-webkit-scrollbar { display: none; }
.pl-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  text-align: left;
  transition: background 0.2s;
}
.pl-item:hover { background: rgba(160, 210, 185, 0.15); }
.pl-item.active { background: rgba(160, 210, 185, 0.25); }
.pl-idx { font-size: 0.7rem; color: rgba(255, 255, 255, 0.35); min-width: 16px; }
.pl-title {
  font-size: 0.81rem;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
