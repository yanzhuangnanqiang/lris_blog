/*
 * @Author       : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @Date         : 2026-04-27 17:01:01
 * @LastEditors  : Hidden Goose yanzhuangqiang@email.ncu.edu.cn
 * @LastEditTime : 2026-04-29 22:28:41
 * @FilePath     : /Hidden-goose_webBuild_project/src/router/index.js
 * @Description  : 如果你喜欢的话， 请你一定要保持好的心情继续喜欢下去😘🥰
 */

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/DesktopHome.vue') },
  { path: '/share', name: 'Share', component: () => import('@/views/ShareTimeline.vue') },
  { path: '/projects', name: 'Projects', component: () => import('@/views/Projects.vue') },
  { path: '/notes', name: 'Notes', component: () => import('@/views/TuberoseNotes.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/gallery', name: 'Gallery', component: () => import('@/views/PhotoGallery.vue') },
  { path: '/post/:id', name: 'Post', component: () => import('@/views/PostDetail.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})