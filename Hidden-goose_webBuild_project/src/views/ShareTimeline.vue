<template>
  <DefaultLayout>
    <div class="page">
      <h1 class="title">分享</h1>

      <section class="block">
        <h2 class="h2">时间轴</h2>
        <div class="timeline">
          <div
            v-for="(item, i) in timeline"
            :key="i"
            class="item"
            :class="{ left: i % 2 === 0, right: i % 2 === 1 }"
          >
            <div class="card">
              <div class="d">{{ item.date }}</div>
              <div class="t">{{ item.title }}</div>
              <div class="c">{{ item.content }}</div>
            </div>
          </div>
          <div class="line"></div>
        </div>
      </section>

      <section class="block">
        <h2 class="h2">计划</h2>

        <div class="plans">
          <div class="plan">
            <h3>每日计划</h3>
            <ul>
              <li v-for="(p, i) in plans.daily" :key="i">{{ p }}</li>
            </ul>
          </div>

          <div class="plan">
            <h3>每周计划</h3>
            <ul>
              <li v-for="(p, i) in plans.weekly" :key="i">{{ p }}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { timeline } from '@/data/timeline'
import { plans } from '@/data/plans'
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  padding: 100px 18px 40px;
  overflow: auto;
  color: rgba(220, 230, 240, 0.92);
}

.title {
  font-weight: 300;
  letter-spacing: 6px;
  font-size: 2rem;
}

.block {
  margin-top: 20px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(20, 20, 20, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(14px);
}

.h2 {
  font-weight: 300;
  letter-spacing: 4px;
  margin-bottom: 14px;
}

.timeline {
  position: relative;
  padding: 12px 0;
}

.line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(220, 230, 240, 0.18);
}

.item {
  position: relative;
  width: 50%;
  padding: 8px 16px;
}

.item.left { left: 0; text-align: right; }
.item.right { left: 50%; text-align: left; }

.card {
  display: inline-block;
  text-align: left;
  min-width: min(360px, 100%);
  padding: 12px;
  border-radius: 16px;
  background: rgba(220, 230, 240, 0.10);
  border: 1px solid rgba(220, 230, 240, 0.15);
}

.d { font-size: 0.78rem; opacity: 0.75; }
.t { font-size: 1.05rem; color: #fff; margin-top: 6px; }
.c { margin-top: 8px; opacity: 0.9; line-height: 1.65; }

.plans {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.plan {
  padding: 12px;
  border-radius: 16px;
  background: rgba(220, 230, 240, 0.08);
  border: 1px solid rgba(220, 230, 240, 0.12);
}

.plan h3 {
  font-weight: 400;
  margin-bottom: 8px;
}

ul {
  padding-left: 16px;
  line-height: 1.8;
}

@media (max-width: 860px) {
  .line { left: 12px; transform: none; }
  .item { width: 100%; left: 0 !important; text-align: left; padding-left: 26px; }
}
</style>