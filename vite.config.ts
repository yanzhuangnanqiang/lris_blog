import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/lris_blog/',
  plugins: [
    vue(),
    vueDevTools(),
    ViteImageOptimizer({
      png: {
        quality: 70,
        compressionLevel: 9,
      },
      jpeg: {
        quality: 65,
      },
      jpg: {
        quality: 65,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
