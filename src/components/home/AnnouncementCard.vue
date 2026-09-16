<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-09-04 22:12:51
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-09-05 08:00:49
 * @FilePath     : /myweb-Hiddengoose/src/components/home/AnnouncementCard.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<template>
  <aside class="announce-card">
    <h3 class="ac-title">公 告</h3>
    <ul class="ac-list">
      <li class="ac-item">欢迎来到「林间初见」～</li>
      <li class="ac-item">这是第一版测试~稍微增加一点互动性内容，不过网站主要还是静态网站。</li>
    </ul>
  </aside>
</template>

<style scoped>
.announce-card {
  width: 300px;
  padding: 18px 24px;
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--shadow-card);
  animation: cardIn 0.6s ease 0.45s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.announce-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.ac-title {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 3px;
  color: var(--text-dark);
  margin: 0 0 12px;
  text-align: center;
}

.ac-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ac-item {
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--text-body);
  padding-left: 10px;
  position: relative;
}

.ac-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--iris-purple);
}

@media (max-width: 860px) {
  .announce-card {
    display: none;
  }
}
</style>
