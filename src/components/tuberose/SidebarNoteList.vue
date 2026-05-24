<template>
  <div class="note-list">
    <SidebarNoteCard
      v-for="note in notes"
      :key="note.id"
      :note="note"
      :active="selectedId === note.id"
      @select="$emit('select', note.id)"
    />
  </div>
</template>

<script setup>
import SidebarNoteCard from './SidebarNoteCard.vue'
import { notes } from '@/data/loadNotes'

defineProps({ selectedId: { type: String, default: null } })
defineEmits(['select'])
</script>

<style scoped>
.note-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.note-list::-webkit-scrollbar { display: none; }
</style>
