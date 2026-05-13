<template>
  <a class="icon-link" :href="url" target="_blank" rel="noreferrer">
    <div class="icon">{{ fallbackIcon }}</div>
    <div class="name">{{ name }}</div>
  </a>
</template>

<script setup>
const props = defineProps({
  name: { type: String, required: true },
  icon: { type: String, required: true }, // github / bilibili / mail / ...
  url: { type: String, required: true },
})

const fallbackMap = {
  github: '⌂',
  bilibili: '▶',
  mail: '✉',
  notebook: '📖',
}

const fallbackIcon = fallbackMap[props.icon] ?? '•'
</script>

<style scoped>
.icon-link {
  text-decoration: none;
  display: grid;
  place-items: center;
  gap: 6px;
  width: 70px;
  color: rgba(220, 230, 240, 0.9);
  user-select: none;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;

  background: rgba(220, 230, 240, 0.12);
  border: 1px solid rgba(220, 230, 240, 0.18);
  backdrop-filter: blur(12px);

  transition: 0.2s;
}

.name {
  font-size: 0.8rem;
  opacity: 0.85;
}

.icon-link:hover .icon {
  background: rgba(220, 230, 240, 0.18);
  transform: translateY(-1px);
}
</style>