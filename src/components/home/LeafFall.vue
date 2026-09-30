<template>
  <div class="falling-leaves">
    <div
      v-for="leaf in leaves"
      :key="leaf.id"
      class="falling-leaf"
      :style="leaf.style"
    ></div>
  </div>
</template>

<script setup>
const leafColors = [
  'rgba(130, 185, 90, 0.35)',
  'rgba(145, 200, 105, 0.25)',
  'rgba(110, 170, 75, 0.3)',
  'rgba(155, 210, 115, 0.2)',
  'rgba(120, 180, 85, 0.28)',
]

// 参数带随机，只在挂载时生成一次，所以用普通数组而不是 computed
const COUNT = 4

const leaves = Array.from({ length: COUNT }, (_, i) => {
  const lifetime = 14 + Math.random() * 10
  const swayDuration = 4 + Math.random() * 4
  const maxOpacity = 0.12 + Math.random() * 0.2

  return {
    id: i,
    style: {
      left: Math.random() * 100 + '%',
      top: '-5%',
      '--delay': Math.random() * lifetime + 's',
      '--lifetime': lifetime + 's',
      '--size': 4 + Math.random() * 6 + 'px',
      '--sway-dist': 8 + Math.random() * 15 + 'px',
      '--rot-amt': 8 + Math.random() * 15 + 'deg',
      '--sway-duration': swayDuration + 's',
      '--max-opacity': maxOpacity,
      '--blur': Math.random() > 0.5 ? '1.5px' : '0.5px',
      '--leaf-color': leafColors[Math.floor(Math.random() * leafColors.length)],
    },
  }
})
</script>

<style scoped>
.falling-leaves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.falling-leaf {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--leaf-color);
  border-radius: 0 50% 50% 50%;
  transform: rotate(45deg);
  opacity: 0;
  animation:
    leafFall var(--lifetime) linear infinite,
    leafSway var(--sway-duration) ease-in-out infinite;
  animation-delay: var(--delay), 0s;
  will-change: transform, top, opacity;
  /* 模糊 + 透明度就是景深来源：清晰的看着近、虚的看着远 */
  filter: blur(var(--blur));
}

@keyframes leafFall {
  0% {
    top: -5%;
    opacity: 0;
  }
  10% {
    opacity: var(--max-opacity);
  }
  80% {
    opacity: var(--max-opacity);
  }
  100% {
    top: 105%;
    opacity: 0;
  }
}

@keyframes leafSway {
  0%, 100% {
    transform: rotate(45deg) translateX(0);
  }
  25% {
    transform: rotate(calc(45deg + var(--rot-amt))) translateX(var(--sway-dist));
  }
  50% {
    transform: rotate(calc(45deg - var(--rot-amt) * 0.5)) translateX(calc(var(--sway-dist) * -0.6));
  }
  75% {
    transform: rotate(calc(45deg + var(--rot-amt) * 0.3)) translateX(calc(var(--sway-dist) * 0.3));
  }
}
</style>
