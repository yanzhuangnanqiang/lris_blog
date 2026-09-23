// 原图 —— 只在灯箱看大图时用
import p1 from '@/assets/saiset/gallery/1.png'
import p2 from '@/assets/saiset/gallery/2.png'
import p3 from '@/assets/saiset/gallery/3.png'
import p4 from '@/assets/saiset/gallery/4.png'
import p5 from '@/assets/saiset/gallery/5.png'
import p6 from '@/assets/saiset/gallery/6.png'
import p7 from '@/assets/saiset/gallery/7.png'
import p8 from '@/assets/saiset/gallery/8.png'
import p9 from '@/assets/saiset/gallery/9.png'
import p10 from '@/assets/saiset/gallery/10.png'
import p11 from '@/assets/saiset/gallery/11.png'
import p12 from '@/assets/saiset/gallery/12.png'
import p13 from '@/assets/saiset/gallery/13.jpg'
import p14 from '@/assets/saiset/gallery/14.jpeg'
import p15 from '@/assets/saiset/gallery/15.jpg'
import p16 from '@/assets/saiset/gallery/16.jpg'

// 缩略图 —— 网格和封面用（由 scripts/optimize-images.mjs 生成）
import t1 from '@/assets/optimized/saiset/gallery/1.webp'
import t2 from '@/assets/optimized/saiset/gallery/2.webp'
import t3 from '@/assets/optimized/saiset/gallery/3.webp'
import t4 from '@/assets/optimized/saiset/gallery/4.webp'
import t5 from '@/assets/optimized/saiset/gallery/5.webp'
import t6 from '@/assets/optimized/saiset/gallery/6.webp'
import t7 from '@/assets/optimized/saiset/gallery/7.webp'
import t8 from '@/assets/optimized/saiset/gallery/8.webp'
import t9 from '@/assets/optimized/saiset/gallery/9.webp'
import t10 from '@/assets/optimized/saiset/gallery/10.webp'
import t11 from '@/assets/optimized/saiset/gallery/11.webp'
import t12 from '@/assets/optimized/saiset/gallery/12.webp'
import t13 from '@/assets/optimized/saiset/gallery/13.webp'
import t14 from '@/assets/optimized/saiset/gallery/14.webp'
import t15 from '@/assets/optimized/saiset/gallery/15.webp'
import t16 from '@/assets/optimized/saiset/gallery/16.webp'


// 照片注册表 — 加了新照片在这里加一行（原图 + 缩略图）
const photoMap = {
  '1': { full: p1, thumb: t1 },   '2': { full: p2, thumb: t2 },   '3': { full: p3, thumb: t3 },
  '4': { full: p4, thumb: t4 },   '5': { full: p5, thumb: t5 },   '6': { full: p6, thumb: t6 },
  '7': { full: p7, thumb: t7 },   '8': { full: p8, thumb: t8 },   '9': { full: p9, thumb: t9 },
  '10': { full: p10, thumb: t10 }, '11': { full: p11, thumb: t11 },
  '12': { full: p12, thumb: t12 }, '13': { full: p13, thumb: t13 },
  '14': { full: p14, thumb: t14 }, '15': { full: p15, thumb: t15 },
  '16': { full: p16, thumb: t16 },
}

/**
 * 场景卡池
 * 每行 = 一张照片名 + 一句文字 + 文字在哪一侧
 *
 * 加新卡：复制一行，改 photo / text / side 即可
 * 加新照片：放到 saiset/gallery 文件夹，在 photoMap 里加一行
 */
const sceneCards = [
  { photo: '1',  text: '风穿过林间，像是把旧日的影子翻页。',           from: '— 随想', side: 'left' },
  { photo: '2',  text: '你来时，刚好是我把夜色擦亮的时刻。',             from: '',       side: 'right' },
  { photo: '3',  text: '把想说的话写下来，哪怕没有人立刻读到。',         from: '',       side: 'left' },
  { photo: '4',  text: '愿每一次迟到，都是因为路上在收集星光。',         from: '',       side: 'right' },
  { photo: '5',  text: '夜色像一张慢慢展开的纸。',                      from: '— 随想', side: 'left' },
  { photo: '6',  text: '林间初见，难忘夏光。',                          from: '',       side: 'right' },
  { photo: '8',  text: '当暮色浸染，鸢尾轻垂。',                        from: '',       side: 'left' },
  { photo: '9',  text: '藏在笔记本里的句子，等着被夏天翻开。',          from: '',       side: 'right' },
  { photo: '10', text: '我把心事叠成一艘纸船，任它漂流。',              from: '',       side: 'left' },
  { photo: '11', text: '深夜是最安静的画布，思绪是唯一的颜料。',        from: '',       side: 'right' },
  { photo: '12', text: '风声翻过窗棂，像是一首没有歌词的旧歌。',        from: '',       side: 'left' },
  { photo: '13', text: '南雁低飞，隐入暮光。',                          from: '',       side: 'right' },
  { photo: '14', text: '有些话不必说完，像雨停在云边。',                from: '',       side: 'left' },
  { photo: '15', text: '你听见了吗？风里藏着信件的回音。',              from: '',       side: 'right' },
  { photo: '16', text: '远方很远，但抬头就能望见。',                    from: '',       side: 'left' },
]

/** 原图路径 —— 只在灯箱看大图时用 */
export function resolvePhotoSrc(name) {
  return (photoMap[name] ?? photoMap['1']).full
}

/** 缩略图路径 —— 网格、封面用 */
export function resolvePhotoThumb(name) {
  return (photoMap[name] ?? photoMap['1']).thumb
}

