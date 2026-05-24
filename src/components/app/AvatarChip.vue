<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-28 14:20:46
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-28 14:47:02
 * @FilePath: \Hidden-goose_webBuild_project\src\components\app\AvatarChip.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <button class="chip" type="button">
    <img class="img" :src="avatar" alt="avatar" />
  </button>
</template>

<script setup>
const avatar = new URL('../../assets/avatar.jpg', import.meta.url).href
</script>

<style scoped>
.chip {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(220, 230, 240, 0.25);
  background: rgba(220, 230, 240, 0.10);
  backdrop-filter: blur(10px);
  padding: 0;
  cursor: pointer;
  overflow: hidden;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>