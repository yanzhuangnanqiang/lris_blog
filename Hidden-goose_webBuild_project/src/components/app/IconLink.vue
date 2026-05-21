<template>
  <a class="icon-link" :href="url" target="_blank" rel="noreferrer">
    <div class="icon">
      <img :src="iconSrc" :alt="name" />
    </div>
    <div class="name">{{ name }}</div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

import githubIcon from '@/assets/github.svg'
import bilibiliIcon from '@/assets/bilibili.svg'
import mailIcon from '@/assets/mail.svg'
import notebookIcon from '@/assets/notebook.svg'

const props = defineProps({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  url: { type: String, required: true },
})

const iconMap = {
  github: githubIcon,
  bilibili: bilibiliIcon,
  mail: mailIcon,
  notebook: notebookIcon,
}

const iconSrc = computed(() => iconMap[props.icon] ?? iconMap.github)
</script>

<style scoped>
.icon-link {
  text-decoration: none;
  display: grid;
  place-items: center;
  gap: 6px;
  width: 70px;
  color: rgba(255,255,255,0.8);
  user-select: none;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  transition: 0.3s ease;
}

.name {
  font-size: 0.8rem;
  opacity: 0.8;
  transition: 0.3s ease;
}

.icon-link:hover .icon {
  background: rgba(180, 220, 180, 0.35);
  border-color: rgba(180, 220, 180, 0.5);
  transform: scale(1.12);
  box-shadow: 0 0 16px rgba(180, 220, 180, 0.25);
}

.icon-link:hover .name {
  opacity: 1;
  color: rgba(180, 220, 180, 0.9);
}

.icon img {
  width: 22px;
  height: 22px;
  display: block;
}
</style>