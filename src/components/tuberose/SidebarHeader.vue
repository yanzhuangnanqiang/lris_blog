<template>
  <div class="header">
    <img class="avatar" src="@/assets/avatar.jpg" alt="avatar" />
    <h2 class="site-name">技术笔记</h2>
    <p class="site-desc">踩坑 · 总结 · 沉淀</p>
  </div>
</template>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 30px;
}
.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  margin-bottom: 10px;
  object-fit: cover;
}
.site-name {
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--cold-white);
}
.site-desc {
  font-size: 0.8rem;
  color: #9eabb5;
  margin-top: 4px;
}
</style>