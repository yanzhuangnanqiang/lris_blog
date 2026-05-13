<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-04-27 17:05:50
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-05-13 14:39:03
 * @FilePath     : /Hidden-goose_webBuild_project/src/components/tuberose/SidebarNotelist.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<template>
  <div class="note-list">
    <SidebarNoteCard v-for="note in notes" :key="note.id" :note="note" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarNoteCard from './SidebarNoteCard.vue'

const notes = ref([
  {
    id: 1,
    title: '黛尾花开的夜晚',
    date: '2025-04-15',
    likes: 21,
    path: '生活/随笔'
  },
  {
    id: 2,
    title: '深海与星空之间',
    date: '2025-04-10',
    likes: 15,
    path: '技术/前端'
  },
  {
    id: 3,
    title: '给赛琳娜的信',
    date: '2025-04-01',
    likes: 39,
    path: '秘密'
  }
])
</script>

<style scoped>
.note-list {
  flex: 1;
  overflow-y: auto;
}
</style>2
