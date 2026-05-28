<template>
  <div class="intro">
    <h3>{{ intro.title }}</h3>
    <p>{{ intro.content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { intros } from '@/data/sidebarIntro.js'

const props = defineProps({ tab: String })
const intro = computed(() => intros[props.tab] || { title: '', content: '' })
</script>

<style scoped>
.intro {
  padding: 16px 4px;
  text-align: center;
}
.intro h3 {
  font-size: 1rem;
  font-weight: 400;
  color: var(--cold-white);
  letter-spacing: 2px;
  margin-bottom: 10px;
}
.intro p {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.35);
  line-height: 1.8;
}
</style>
