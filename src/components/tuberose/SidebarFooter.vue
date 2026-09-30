<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-05-28 09:55:42
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-09-26 15:56:47
 * @FilePath     : /myweb-Hiddengoose/src/components/tuberose/SidebarFooter.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-05-28 09:55:42
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-09-26 11:54:50
 * @FilePath     : /myweb-Hiddengoose/src/components/tuberose/SidebarFooter.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<!--
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-05-28 09:55:42
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-09-25 22:30:48
 * @FilePath     : /myweb-Hiddengoose/src/components/tuberose/SidebarFooter.vue
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
-->
<template>
  <div class="footer">
    <button class="footer-trigger" @click="open = !open">
      <span>⚙️ 视觉调节</span>
      <span class="footer-arrow" :class="{ up: open }">▾</span>
    </button>

    <Transition name="slide">
      <div v-if="open" class="settings-panel">
        <div
          v-for="s in sliders"
          :key="s.key"
          class="slider-row"
        >
          <span class="slider-label">{{ s.label }}</span>
          <input
            type="range"
            :min="s.min"
            :max="s.max"
            :value="settings[s.key]"
            @input="settings[s.key] = +$event.target.value"
          />
          <span class="slider-val">{{ settings[s.key] }}{{ s.unit }}</span>
        </div>

        <div class="settings-footer">
          <button class="reset-btn" @click="resetSettings">重置默认</button>
          <span class="ver">v1.1.0</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBgSettings } from '@/composables/useBgSettings'

const { settings, resetSettings } = useBgSettings()

const open = ref(false)

const sliders = [
  { key: 'overlay',   label: '遮罩',   min: 0,  max: 100, unit: '%' },
  { key: 'scale',     label: '缩放',   min: 50, max: 200, unit: '%' },
  { key: 'posX',      label: '横向',   min: 0,  max: 100, unit: '%' },
  { key: 'posY',      label: '纵向',   min: 0,  max: 100, unit: '%' },
  { key: 'blur',      label: '模糊',   min: 0,  max: 20,  unit: 'px' },
  { key: 'panelBlur', label: '面板',   min: 0,  max: 30,  unit: 'px' },
]
</script>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--glass-border);
  padding-top: 8px;
}

.footer-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  padding: 6px 4px;
  font-size: 0.72rem;
  color: #7b8893;
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}
.footer-trigger:hover {
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.04);
}

.footer-arrow {
  font-size: 0.6rem;
  transition: transform 0.2s;
}
.footer-arrow.up {
  transform: rotate(180deg);
}

/* ---- 展开动画 ---- */
.slide-enter-active {
  animation: slideIn 0.25s ease;
}
.slide-leave-active {
  animation: slideIn 0.2s ease reverse;
}
@keyframes slideIn {
  from { opacity: 0; max-height: 0; }
  to   { opacity: 1; max-height: 280px; }
}

/* ---- 面板 ---- */
.settings-panel {
  padding: 10px 4px 4px;
  overflow: hidden;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.slider-label {
  flex-shrink: 0;
  width: 32px;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
}
.slider-val {
  flex-shrink: 0;
  width: 32px;
  text-align: right;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.35);
  font-variant-numeric: tabular-nums;
}

input[type='range'] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(160, 210, 185, 0.6);
  border: 1.5px solid rgba(160, 210, 185, 0.4);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
input[type='range']::-webkit-slider-thumb:hover {
  background: rgba(160, 210, 185, 0.85);
  transform: scale(1.15);
}
input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(160, 210, 185, 0.6);
  border: 1.5px solid rgba(160, 210, 185, 0.4);
  cursor: pointer;
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.04);
}

.reset-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.reset-btn:hover {
  color: rgba(255,255,255,0.6);
  border-color: rgba(255,255,255,0.2);
}

.ver {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.15);
}
</style>