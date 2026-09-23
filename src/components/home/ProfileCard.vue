<template>
  <aside class="profile-card">
    <img class="pc-avatar" :src="avatar" alt="头像" />
    <div class="pc-body">
      <h2 class="pc-name">Hidden Goose</h2>
      <div class="pc-stats">
        <span class="pc-stat">随想 <b>{{ postCount }}</b></span>
        <span class="pc-dot">·</span>
        <span class="pc-stat">文章 <b>{{ noteCount }}</b></span>
        <span class="pc-dot">·</span>
        <span class="pc-stat">说说 <b>{{ sayCount }}</b></span>
      </div>
      <p class="pc-intro">此站用于记录学习时的随想、思考，以及分享特别的经历、知识和技术的整理。</p>
      <div class="pc-links">
        <a
          v-for="c in contacts"
          :key="c.name"
          class="pc-link"
          :href="c.url"
          target="_blank"
          rel="noreferrer"
          :title="c.name"
        >
          <img :src="iconMap[c.icon]" :alt="c.name" />
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { contacts } from '@/data/contacts'
import { posts } from '@/data/loadPosts'
import { notes } from '@/data/loadNotes'
import { lifeJournal } from '@/data/shares'
import avatar from '@/assets/optimized/avatar.webp'
import githubIcon from '@/assets/github.svg'
import bilibiliIcon from '@/assets/bilibili.svg'
import mailIcon from '@/assets/mail.svg'

const iconMap = { github: githubIcon, bilibili: bilibiliIcon, mail: mailIcon }

const postCount = computed(() => posts.length)
const noteCount = computed(() => notes.length)
const sayCount = computed(() => lifeJournal.reduce((sum, day) => sum + day.items.length, 0))
</script>

<style scoped>
.profile-card {
  width: 300px;
  padding: 20px;
  border-radius: 18px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--shadow-card);
  display: flex;
  gap: 16px;
  align-items: flex-start;
  animation: cardIn 0.6s ease 0.3s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

.pc-avatar {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 10px rgba(21, 39, 25, 0.15);
  flex-shrink: 0;
}

.pc-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pc-name {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text-dark);
  margin: 0 0 8px;
}

.pc-stats {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.pc-stat {
  font-size: 0.72rem;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.pc-stat b {
  color: var(--text-dark);
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: 3px;
}

.pc-dot {
  color: var(--text-muted);
  opacity: 0.5;
}

.pc-intro {
  margin: 0 0 12px;
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--text-body);
}

.pc-links {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.pc-link {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: 0.25s ease;
}

.pc-link:hover {
  background: var(--mint-green);
  transform: translateY(-2px);
}

.pc-link img {
  width: 16px;
  height: 16px;
  display: block;
}

@media (max-width: 860px) {
  .profile-card {
    display: none;
  }
}
</style>
