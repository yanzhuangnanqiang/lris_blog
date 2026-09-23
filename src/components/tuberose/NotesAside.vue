<!--
  笔记页【阅读态】的左列：音乐 + 内容统计 + 标签 三张卡。
  位置由 TuberoseNotes 的 .reader-aside 控制。
-->
<template>
  <div class="aside-stack">
    <MusicCard />

    <WidgetCard title="内容统计">
      <div class="rows">
        <div class="row">
          <span class="row-name">随笔 / 思考</span>
          <span class="row-count">{{ posts.length }}</span>
        </div>
        <div class="row">
          <span class="row-name">笔记</span>
          <span class="row-count">{{ notes.length }}</span>
        </div>
      </div>
    </WidgetCard>

    <WidgetCard title="标签">
      <div class="tags">
        <button
          v-for="t in tags"
          :key="t.name"
          class="tag"
          @click="emit('pick', { kind: 'tag', value: t.name })"
        >
          {{ t.name }}<span class="tag-count">{{ t.count }}</span>
        </button>
      </div>
      <p v-if="!tags.length" class="empty">—</p>
    </WidgetCard>

    <WidgetCard title="随机推荐">
      <template #action>
        <button class="rec-roll" aria-label="换一批" @click="roll">
          <img :src="shuffleIcon" alt="" />
        </button>
      </template>
      <div class="rows">
        <button
          v-for="n in picks"
          :key="n.id"
          class="rec"
          @click="emit('pick', { kind: 'note', value: n.id })"
        >
          <span class="rec-title" :title="n.title">{{ n.title }}</span>
          <span class="rec-date">{{ n.date }}</span>
        </button>
      </div>
      <p v-if="!picks.length" class="empty">—</p>
    </WidgetCard>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import MusicCard from '@/components/Player/MusicPanel.vue'
import WidgetCard from '@/components/app/WidgetCard.vue'
import { notes } from '@/data/loadNotes'
import { posts } from '@/data/loadPosts'
import shuffleIcon from '@/assets/refresh-cw.svg'

const emit = defineEmits(['pick'])

const tags = computed(() => {
  const m = new Map()
  for (const n of notes) for (const t of n.tags) m.set(t, (m.get(t) || 0) + 1)
  return [...m]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

// 随机推荐：从笔记里洗牌取前几篇。点「换一批」重新洗，
// 进页面也洗一次（组件在阅读态才挂载，所以每次打开文章都会换）。
const PICK_COUNT = 3
const picks = ref([])

function roll() {
  const pool = [...notes]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  picks.value = pool.slice(0, PICK_COUNT)
}

onMounted(roll)
</script>

<style scoped>
.aside-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 内容统计 ---- */
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 2px;
}
.row-name {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.7);
}
.row-count {
  flex-shrink: 0;
  min-width: 24px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(160, 210, 185, 0.2);
  color: #b8e0c9;
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ---- 标签 ---- */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid rgba(160, 210, 185, 0.32);
  border-radius: 10px;
  background: rgba(160, 210, 185, 0.1);
  color: #b8e0c9;
  font-size: 0.76rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.tag:hover {
  background: rgba(160, 210, 185, 0.24);
  border-color: rgba(160, 210, 185, 0.6);
}
.tag-count {
  opacity: 0.55;
  font-size: 0.7rem;
}

/* ---- 随机推荐 ---- */
.rec-roll {
  border: none;
  background: transparent;
  padding: 2px 4px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.rec-roll img { width: 15px; height: 15px; opacity: 0.45; }
.rec-roll:hover { transform: rotate(180deg); }
.rec-roll:hover img { opacity: 0.85; }

.rec {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 7px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}
.rec:hover { background: rgba(160, 210, 185, 0.14); }
.rec-title {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.82);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rec-date {
  flex-shrink: 0;
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
}

.empty {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>