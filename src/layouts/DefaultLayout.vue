<template>
  <div class="layout">
    <TopBar />

    <main class="page">
      <slot />
    </main>
  </div>
</template>

<script setup>
import TopBar from '@/components/app/TopBar.vue'
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100%;
  position: relative;
}

.page {
  width: 100%;
  height: 100%;
}
</style>