import { resolvePhotoSrc } from './sceneCards.js'

// 说说专用：图片放 src/assets/share/，自动加载
const shareImgs = import.meta.glob('@/assets/share/*.{jpg,jpeg,png,JPG,JPEG,PNG,webp}', { eager: true, import: 'default' })
const shareMap = Object.fromEntries(Object.entries(shareImgs).map(([p, u]) => [p.replace(/.*\//, ''), u]))
function sharePhoto(name) { return shareMap[name] || name }

// ===== 图片画廊 =====
export const gallery = [
  { photo: '16',    tag: '动漫', text: '金色的原野，余晖洒满整个下午。' },
  { photo: '15',    tag: '动漫', text: '傍晚的云朵，像打翻的橘子汽水。' },
  { photo: '12',    tag: '动漫', text: '路过花店，买了三枝洋甘菊。' },
  { photo: '7',     tag: '动漫', text: '街角遇见一只晒太阳的猫。' },
  { photo: '1',     tag: '动漫', text: '晨光穿过枝叶，洒在她的发梢。' },
  { photo: '2',     tag: '动漫', text: '风里藏着鸢尾的低语。' },
  { photo: '3',     tag: '动漫', text: '那天下午的光，温柔得像一句诗。' },
  { photo: '4',     tag: '动漫', text: '鸢尾在微光里悄然绽放。' },
  { photo: '8',     tag: '动漫', text: '风很大，天空很蓝。' },
  { photo: '10',    tag: '动漫', text: '收藏一片叶子，像收藏这个秋天。' },
].map(s => ({ ...s, src: resolvePhotoSrc(s.photo) }))

// ===== 计划 =====
export const plans = {
  daily: [
    '写一段随想，哪怕只有三行字',
    '傍晚散步或慢跑 20 分钟，看看天边的云',
    '睡前关掉手机，给自己十分钟安静时间',
    '喝足够的水，记得吃水果',
    '整理桌面，扔掉一件不需要的东西',
  ],
  weekly: [
    '更新博客至少一篇，记录这周的想法',
    '整理 GitHub 仓库文档和 README',
    '学习一个 Vue3 新知识点并写笔记',
    '给房间做一次大扫除',
    '联系一个很久没聊的朋友',
    '回顾这周做了什么，写一句话总结',
  ],
}

// ===== 生活记录 — 按日期分组 =====
// 每天一组，一组里多条，时间倒序
export const lifeJournal = [
  // 模板：按日期分组，每天可多条
  // {
  //   date: '2026-05-22',
  //   items: [
  //     { text: '在这里写你的说说...', photos: [], tag: '标签' },
  //   ],
  // },
  {
    date: '2026-05-24',
    items: [
      { text: '这是第一篇说说，值得纪念！', photos: ['jinye.png'], tag: '新生' },
    ],
  },
].map(day => ({
  ...day,
  items: day.items.map(item => ({
    ...item,
    photoSrcs: (item.photos || []).map(p => sharePhoto(p)),
  })),
}))

// 收集所有月份
export const months = [...new Set(lifeJournal.map(d => d.date.slice(0, 7)))]
