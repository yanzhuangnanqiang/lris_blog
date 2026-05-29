<template>
  <aside class="toc-wrapper" :class="{ open: mobileOpen }">
    <div v-if="mobileOpen" class="toc-backdrop" @click="close"></div>
    <nav class="toc-panel">
      <ul v-if="headings.length" class="toc-list">
        <li v-for="h in headings" :key="h.id"
            :class="{ active: activeId === h.id, indent: h.level === 3 }">
          <a :href="'#' + h.id" @click.prevent="onClick(h.id)">{{ h.text }}</a>
        </li>
      </ul>
      <p v-else class="toc-empty">—</p>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({ headings: { type: Array, default: () => [] } })

const activeId = ref(null)
const mobileOpen = ref(false)

let observer = null

function ensureIds() {
  const els = document.querySelectorAll('.rp-body h2, .rp-body h3')
  props.headings.forEach(h => {
    for (const el of els) {
      if (el.textContent.trim() === h.text && el.id !== h.id) {
        el.id = h.id
        break
      }
    }
  })
}

function setupObserver() {
  if (observer) observer.disconnect()
  ensureIds()
  const els = document.querySelectorAll('.rp-body h2[id], .rp-body h3[id]')
  if (!els.length) return

  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting)
    if (visible.length) {
      activeId.value = visible[0].target.id
      const panel = document.querySelector('.toc-panel')
      const link = panel?.querySelector('li.active')
      if (link) {
        const pRect = panel.getBoundingClientRect()
        const lRect = link.getBoundingClientRect()
        const margin = pRect.height * 0.1
        if (lRect.top < pRect.top + margin || lRect.bottom > pRect.bottom - margin) {
          panel.scrollBy({ top: lRect.top - pRect.top - margin, behavior: 'smooth' })
        }
      }
    }
  }, { root: document.querySelector('.main-content'), rootMargin: '-14% 0px -42% 0px', threshold: 0 })

  els.forEach(el => observer.observe(el))
}

watch(() => props.headings, () => {
  setTimeout(setupObserver, 100)
}, { immediate: false })

onMounted(() => { if (props.headings.length) setTimeout(setupObserver, 100) })
onUnmounted(() => { if (observer) observer.disconnect() })

function scrollToHeading(id) {
  const el = document.getElementById(id)
  const container = document.querySelector('.main-content')
  if (!el || !container) return
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const target = elRect.top - containerRect.top + container.scrollTop - 70
  container.scrollTo({ top: target, behavior: 'smooth' })
}

function onClick(id) {
  mobileOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    scrollToHeading(id)
  } else {
    ensureIds()
    setTimeout(() => scrollToHeading(id), 50)
  }
}

function close() { mobileOpen.value = false }
function open() { mobileOpen.value = true }

defineExpose({ open, close })
</script>

<style scoped>
.toc-wrapper {
  flex-shrink: 0;
}

/* ===== 桌面 ===== */
@media (min-width: 1350px) {
  .toc-wrapper {
    position: sticky;
    top: 2px;
    width: 200px;
    flex-shrink: 0;
  }
  .toc-panel {
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 24px 20px;
    background: rgba(30, 42, 50, 0.22);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    scrollbar-width: none;
  }
  .toc-panel::-webkit-scrollbar { display: none; }
  .toc-backdrop { display: none; }
}

/* ===== 移动 ===== */
@media (max-width: 1349px) {
  .toc-wrapper {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 100;
    height: 100%;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  .toc-wrapper.open {
    transform: translateX(0);
  }
  .toc-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: -1;
  }
  .toc-panel {
    width: 260px;
    height: 100%;
    background: rgba(25,35,45,0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255,255,255,0.1);
    padding: 24px 20px;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .toc-panel::-webkit-scrollbar { display: none; }
}

/* ===== 通用样式 ===== */
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 2px;
  scroll-margin: 3vh 0;
}

.toc-list li.indent {
  padding-left: 22px;
}

.toc-list a {
  display: block;
  position: relative;
  padding: 7px 10px 7px 16px;
  font-size: 0.8rem;
  font-weight: 400;
  color: rgba(255,255,255,0.48);
  text-decoration: none;
  border-radius: 0 6px 6px 0;
  border-left: 2px solid transparent;
  transition: color 0.2s, font-weight 0.2s, border-left-color 0.2s, background 0.2s;
  line-height: 1.55;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-list a::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  transition: background 0.2s;
}

.indent a {
  font-size: 0.76rem;
}

.indent a::before {
  width: 3px;
  height: 3px;
  background: rgba(255,255,255,0.1);
}

.toc-list a:hover {
  color: rgba(255,255,255,0.75);
}

.toc-list a:hover::before {
  background: rgba(255,255,255,0.28);
}

.toc-list li.active a {
  color: #e0d0f8;
  font-weight: 600;
  border-left-color: rgba(180,150,220,0.55);
  background: rgba(111,66,193,0.08);
}

.toc-list li.active a::before {
  background: rgba(180,150,220,0.5);
}

.toc-empty {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.18);
  margin: 0;
}
</style>
