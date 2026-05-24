<!--
 * @Author: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date: 2026-04-27 17:07:19
 * @LastEditors: Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime: 2026-04-27 19:54:13
 * @FilePath: \Hidden-goose_webBuild_project\src\components\tuberose\WelcomePanel.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="welcome">
    <img class="brand-icon" src="@/assets/tubarose.png" alt="黛尾花" />
    <h1 class="main-title">技术笔记</h1>
    <p class="sub-title">记录踩过的坑与闪过的光</p>
    <p class="desc">前端、算法、工程化… 把碎片化的理解整理成可复用的知识。</p>
  </div>
</template>

<style scoped>
.welcome {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--cold-white);
  text-shadow: var(--text-shadow);
  z-index: 5;
}
.brand-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 15px rgba(125, 138, 158, 0.6));
}
.main-title {
  font-size: 3rem;
  font-weight: 300;
  letter-spacing: 8px;
  margin-bottom: 8px;
}
.sub-title {
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.8;
  margin-bottom: 20px;
}
.desc {
  font-size: 0.95rem;
  opacity: 0.7;
  max-width: 400px;
  line-height: 1.6;
}
</style>