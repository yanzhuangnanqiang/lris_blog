<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <keep-alive include="DesktopHome">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

