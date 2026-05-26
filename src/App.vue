<script setup>
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <div id="app">
    <router-view />
    <Analytics />
  </div>
</template>

<style>
/* 全局重置，消除一切白边和默认滚动 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>