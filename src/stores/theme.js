import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isSidebarCollapsed = ref(false)
  const currentNav = ref('latest')       // latest / archive / lab
  const filterYear = ref('all')
  const isPetalEnabled = ref(true)

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const setNav = (tab) => {
    currentNav.value = tab
  }

  return {
    isSidebarCollapsed,
    currentNav,
    filterYear,
    isPetalEnabled,
    toggleSidebar,
    setNav
  }
})