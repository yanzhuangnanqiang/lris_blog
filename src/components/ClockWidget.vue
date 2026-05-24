<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-04-27 17:03:17
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-04-29 22:33:52
 * @FilePath     : /Hidden-goose_webBuild_project/src/components/ClockWidget.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<template>
  <div class="clock-container">
    <div class="time">{{ currentTime }}</div>
    <div class="date">{{ currentDate }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const currentDate = ref('')

function updateTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[now.getDay()]
  currentDate.value = `${year}年${month}月${day}日 ${weekday}`
}

let timer
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.clock-container {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--cold-white);
  text-shadow: var(--text-shadow);
  user-select: none;
}
.time {
  font-size: 5rem;
  font-weight: 300;
  letter-spacing: 6px;
}
.date {
  font-size: 1.4rem;
  font-weight: 300;
  letter-spacing: 3px;
  margin-top: 10px;
  opacity: 0.9;
}
</style>