<template>
  <div class="petals-container">
    <div v-for="i in 15" :key="i" class="petal" :style="randomStyle()"></div>
  </div>
</template>

<script setup>
function randomStyle() {
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = 8 + Math.random() * 7
  const size = 10 + Math.random() * 15
  return {
    left: left + '%',
    animationDelay: delay + 's',
    animationDuration: duration + 's',
    width: size + 'px',
    height: size + 'px'
  }
}
</script>

<style scoped>
.petals-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}
.petal {
  position: absolute;
  top: -5%;
  background: rgba(214, 232, 214, 0.55);
  border-radius: 50% 0 50% 50%;
  transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(214, 232, 214, 0.4);
  animation: fall linear infinite;
}
@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.8;
  }
  80% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}
</style>