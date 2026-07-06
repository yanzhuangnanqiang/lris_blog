<script setup>
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <div id="app">
    <router-view />
    <Analytics />
  </div>
</template>

