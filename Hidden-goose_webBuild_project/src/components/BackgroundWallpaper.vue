<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 15:23:45
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-27 17:21:49
 * @FilePath: \Hidden-goose_webBuild_project\src\components\BackgroundWallpaper.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="bg-wallpaper" :style="{ backgroundImage: `url(${imageSrc})` }"></div>
</template>

<script setup>
const props = defineProps({
  imageSrc: {
    type: String,
    default: 'xiaguang.jpg'
  }
})
const imageSrc = new URL(`../assets/${props.imageSrc}`, import.meta.url).href
</script>

<style scoped>
.bg-wallpaper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>