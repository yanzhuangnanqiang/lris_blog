import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueDevTools(),
    ViteImageOptimizer({
      // ⚠️ 故意不处理 webp：它内部是 sharp(buffer, { animated: extName === 'gif' })，
      //    只对 gif 传 animated —— 动图 webp 会被压成第一帧，而且因为"更小"而被保留，
      //    于是 dev 下会动、打包后不动（贴纸就踩过这个）。
      //    webp 的优化本来由 scripts/optimize-images.mjs 负责，这一道是重复的。
      test: /\.(jpe?g|png|gif|tiff|svg|avif)$/i,
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
