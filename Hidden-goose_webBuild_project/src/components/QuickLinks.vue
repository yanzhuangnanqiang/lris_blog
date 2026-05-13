<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:04:06
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-27 17:11:36
 * @FilePath: \Hidden-goose_webBuild_project\src\components\QuickLink.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="quick-links">
    <a v-for="link in links" :key="link.title" :href="link.url" class="link-card">
      {{ link.title }}
    </a>
  </div>
</template>

<script setup>
const links = [
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'Bilibili', url: 'https://bilibili.com' },
  { title: '邮箱', url: 'mailto:your@email.com' },
]
</script>

<style scoped>
.quick-links {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.link-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  color: var(--cold-white);
  padding: 8px 18px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: 0.3s;
}
.link-card:hover {
  background: rgba(220, 230, 240, 0.25);
}
</style>