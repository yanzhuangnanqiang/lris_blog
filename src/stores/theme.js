import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isSidebarCollapsed = ref(false)
  const currentNav = ref('latest')       // latest / archive / lab
  const isPetalEnabled = ref(true)

  // 每点一次页签就 +1，**即使点的就是当前那个**（此时 currentNav 没变）。
  // 页面靠它实现「重复点同一个页签 = 刷新状态」—— 光看 currentNav 是看不出来的。
  const navVersion = ref(0)

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const setNav = (tab) => {
    currentNav.value = tab
    navVersion.value++
  }

  return {
    isSidebarCollapsed,
    currentNav,
    navVersion,
    isPetalEnabled,
    toggleSidebar,
    setNav
  }
})