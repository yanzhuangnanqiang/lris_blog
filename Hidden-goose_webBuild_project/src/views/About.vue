<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-28 14:26:01
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 15:00:11
 * @FilePath: \Hidden-goose_webBuild_project\src\views\About.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <DefaultLayout>
    <div class="page">
      <div class="card">
        <img class="avatar" :src="avatar" alt="avatar" />
        <div class="name">你的名字（可改）</div>
        <div class="desc">
          这里是关于页。你可以写：自我介绍 / 技术栈 / 兴趣 / 想做的事。
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
const avatar = new URL('../assets/avatar.jpg', import.meta.url).href
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  padding: 110px 18px 40px;
  overflow: auto;
  display: grid;
  place-items: start center;
}

.card {
  width: min(720px, 100%);
  padding: 18px;
  border-radius: 18px;
  background: rgba(20, 20, 20, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
  color: rgba(220, 230, 240, 0.92);
  text-align: center;
}

.avatar {
  width: 84px;
  height: 84px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgba(220, 230, 240, 0.18);
}

.name {
  margin-top: 10px;
  font-size: 1.3rem;
  letter-spacing: 3px;
  color: #fff;
}

.desc {
  margin-top: 12px;
  line-height: 1.8;
  opacity: 0.85;
}
</style>