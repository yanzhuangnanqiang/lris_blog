<!--
  「▌标题 + 内容」的卡片外壳。全站共用：
  音乐卡、内容统计卡、标签卡、站点统计卡、目录卡都套它。
  放 app/ 是因为音乐卡已经是全站共享组件了（不再只属于笔记页）。
-->
<template>
  <section class="wcard">
    <div v-if="title || $slots.action" class="wcard-head">
      <h3 v-if="title" class="wcard-title">{{ title }}</h3>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<style scoped>
.wcard {
  /* 结构借 XinghuisamaBlogs 的玻璃卡：大圆角 + 1px 浅边框 + 柔和阴影 + 毛玻璃。
     底色保持站内的深蓝，不跟它用浅色。
     只写标准 backdrop-filter —— 手写 -webkit- 会让构建把标准那条丢掉。 */
  border-radius: 24px;
  background: rgba(30, 42, 50, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.25),
    0 8px 10px -6px rgba(0, 0, 0, 0.2);
  padding: 16px 18px;
  color: rgba(255, 255, 255, 0.85);
}

.wcard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.wcard-title {
  position: relative;
  margin: 0;
  padding-left: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
/* 参考实现里那根「▌」竖条 */
.wcard-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 3px;
  background: #a0d2b9;
}
</style>
