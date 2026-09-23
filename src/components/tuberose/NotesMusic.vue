<!--
  笔记页【列表态】的音乐控件（没打开文章时用）。
  一条胶囊 + 点开向上展开的音乐卡。

  打开文章后的左列是另一套（NotesAside 三张卡），由 TuberoseNotes 用 v-if 切换。
  位置由父级决定，所以这里不写 position、也不写死 flex-direction。
-->
<template>
  <div class="nm-dock">
    <button
      class="nm-pill"
      :class="{ open }"
      :aria-expanded="open"
      aria-label="音乐播放器"
      @click="onPillClick"
    >
      <svg class="nm-pill-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
      </svg>
      <span class="nm-pill-title">{{ store.current.title }}</span>
      <svg class="nm-pill-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </button>

    <!-- 展开的卡片。grid-rows 0fr → 1fr，靠行高插值，不碰 height -->
    <div class="nm-wrap" :class="{ open }">
      <div class="nm-clip">
        <MusicCard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MusicCard from '@/components/Player/MusicPanel.vue'
import { useMusicStore } from '@/stores/music'

const store = useMusicStore()
const open = ref(false)

function onPillClick() {
  open.value = !open.value
  if (open.value && !store.playing) store.toggle()
}
</script>

<style scoped>
/* 只负责排列，不负责任位 */
.nm-dock {
  display: flex;
  gap: 10px;
  /* 容器不吃点击，只有胶囊和卡片吃，免得浮层挡住正文 */
  pointer-events: none;
}
.nm-dock > * { pointer-events: auto; }

.nm-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border-radius: 20px;
  background: rgba(28, 38, 46, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.86);
  cursor: pointer;
  max-width: 260px;
  transition: border-color 0.25s, background 0.25s;
}
.nm-pill:hover {
  background: rgba(34, 46, 56, 0.96);
  border-color: rgba(160, 210, 185, 0.4);
}
.nm-pill-icon { width: 16px; height: 16px; flex-shrink: 0; color: #a0d2b9; }
.nm-pill-title {
  font-size: 0.78rem;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nm-pill-chev {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nm-pill.open .nm-pill-chev { transform: rotate(180deg); }

.nm-wrap {
  width: 280px;
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  pointer-events: none;
  transition: grid-template-rows 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease;
}
.nm-wrap.open { grid-template-rows: 1fr; opacity: 1; pointer-events: auto; }
.nm-clip { overflow: hidden; min-height: 0; }
</style>
