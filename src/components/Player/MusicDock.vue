<template>
  <div class="dock">
    <div class="disc-wrap">
      <p class="disc-hint" v-if="!store.playing && !currentMsg">听会歌放松一下吧</p>
      <p class="disc-msg" v-if="msgKey" :key="msgKey">{{ currentMsg }}</p>
      <button class="disc-btn" :class="{ spinning: store.playing }" @click="onDiscClick">
        <img class="disc-img" :src="discImg" alt="" />
      </button>
    </div>

    <MusicPanel
      v-show="open"
      @close="open = false"
      @play-state="store.playing = $event"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MusicPanel from './MusicPanel.vue'
import { useMusicStore } from '@/stores/music'
import discImg from '@/assets/liushenji.png'

const store = useMusicStore()
const open = ref(false)
const currentMsg = ref('')
const msgKey = ref(0)

const messages = [
  '晨光穿过枝叶，落进旋律里。',
  '风里藏着鸢尾的低语。',
  '把心事交给音符，让它飘远。',
  '像一场安静的梦。',
  '花束在怀里，音乐在耳边。',
  '难忘夏光。',
  '鸢尾在微光里舒展花瓣。',
  '黑胶转着，时光就慢了。',
  '她的歌声穿过森林，落在你耳边。',
  '闭上眼，听风与光的合奏。',
  '把烦恼揉碎，放进旋律里。',
  '这一刻，什么都不用想。',
  '音符是晨光里漂浮的尘埃。',
  '安静地听，安静地想。',
  '愿旋律陪你度过此刻。',
  '森林深处，有音乐和光。',
  '温柔的琴弦，像她的指尖。',
  '每首歌都是一次重逢。',
  '不必说太多，音乐都懂。',
  '藏在黑胶里的悄悄话。',
]

// 避免连续重复
let lastMsg = ''
function randomMsg() {
  const pool = messages.filter(m => m !== lastMsg)
  const pick = pool[Math.floor(Math.random() * pool.length)]
  lastMsg = pick
  return pick
}

let msgTimer = null
function onDiscClick() {
  currentMsg.value = randomMsg()
  msgKey.value++
  if (!open.value) {
    open.value = true
    if (!store.playing) store.toggle()
  }
  if (msgTimer) clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { currentMsg.value = '' }, 2200)
}
</script>

<style scoped>
.dock {
  position: fixed;
  top: 74px;
  right: 28px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.disc-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.disc-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  box-shadow: 0 3px 14px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s ease;
}

.disc-btn:hover {
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.disc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  animation: none;
}

.disc-btn.spinning .disc-img {
  animation: spin 4s linear infinite;
}

.disc-btn.bounce {
  animation: bump 0.4s ease;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes bump {
  0% { transform: scale(1); }
  50% { transform: scale(0.92); }
  100% { transform: scale(1); }
}

.disc-hint {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 2px;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  animation: hintFade 2s ease both;
}

@keyframes hintFade {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

.disc-msg {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.72);
  letter-spacing: 2px;
  white-space: nowrap;
  text-shadow: 0 1px 6px rgba(0,0,0,0.35);
  animation: msgFloat 2.2s ease-out both;
}

@keyframes msgFloat {
  0% { opacity: 0; transform: translateX(8px); }
  15% { opacity: 1; transform: translateX(0); }
  70% { opacity: 0.8; }
  100% { opacity: 0; transform: translateX(0) translateY(-6px); }
}
</style>
