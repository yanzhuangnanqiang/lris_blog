<template>
  <aside class="announce-card">
    <h3 class="ac-title">公 告</h3>
    <ul class="ac-list">
      <li class="ac-item">欢迎来到「林间初见」～</li>
      <li class="ac-item">这里记录学习随想与思考。</li>
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
