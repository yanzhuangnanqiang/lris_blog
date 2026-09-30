import { computed, reactive, watch } from 'vue'

const STORAGE_KEY = 'bg-settings'

// —— 每项的范围约束 ——
// 导出给滑块模板复用，两端统一
export const limits = {
  overlay:   { min: 0,  max: 85,  default: 0 },
  scale:     { min: 50, max: 150, default: 100 },
  posX:      { min: 0,  max: 100, default: 50 },
  posY:      { min: 0,  max: 100, default: 50 },
  blur:      { min: 0,  max: 10,  default: 0 },
  panelBlur: { min: 0,  max: 30,  default: 20 },
}

/** 把值钳在 [min, max] 之间 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function buildDefaults() {
  const d = {}
  for (const [k, v] of Object.entries(limits)) d[k] = v.default
  return d
}
const defaults = buildDefaults()

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // 钳位 —— 防止手动改 localStorage 跑出边界
      for (const [k, v] of Object.entries(parsed)) {
        const lim = limits[k]
        if (lim) parsed[k] = clamp(v, lim.min, lim.max)
      }
      return parsed
    }
  } catch { /* 无视 */ }
  return {}
}

const settings = reactive({ ...defaults, ...load() })

// 自动保存（并再次钳位）
watch(
  () => ({ ...settings }),
  (val) => {
    for (const [k, v] of Object.entries(val)) {
      const lim = limits[k]
      if (lim) val[k] = clamp(v, lim.min, lim.max)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

/** 遮罩样式 —— 覆盖在背景图上的一层半透明黑 */
const overlayStyle = computed(() => ({
  opacity: settings.overlay / 100,
}))

/** 背景样式 —— 给 BackgroundWallpaper 用
 *  - scale === 100 → cover（填满屏幕）
 *  - 否则 → 百分比缩放 */
const bgStyle = computed(() => {
  const s = settings.scale
  if (s === 100) {
    return {
      backgroundSize: 'cover',
      backgroundPosition: `${settings.posX}% ${settings.posY}%`,
    }
  }
  return {
    backgroundSize: `${s}%`,
    backgroundPosition: `${settings.posX}% ${settings.posY}%`,
  }
})

/** 重置为默认值 */
function resetSettings() {
  Object.assign(settings, defaults)
}

export function useBgSettings() {
  return { settings, overlayStyle, bgStyle, resetSettings }
}