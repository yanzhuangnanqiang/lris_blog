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
import jinye from '@/assets/saiset/gallery/jinye.png'

// 照片注册表 — 加了新照片在这里加一行
const photoMap = {
  '1': p1, '2': p2, '3': p3, '4': p4, '5': p5,
  '6': p6, '7': p7, '8': p8, '9': p9, '10': p10, '11': p11,
  '12': p12, '13': p13, '14': p14, '15': p15, '16': p16,
  jinye,
}

/**
 * 场景卡池
 * 每行 = 一张照片名 + 一句文字 + 文字在哪一侧
 *
 * 加新卡：复制一行，改 photo / text / side 即可
 * 加新照片：放到 saiset/gallery 文件夹，在 photoMap 里加一行
 */
export const sceneCards = [
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
  { photo: 'jinye', text: '金野之上，余晖如纱。',                       from: '',       side: 'right' },
]

/** 把 photo 名转成真实图片路径 */
export function resolvePhotoSrc(name) {
  return photoMap[name] ?? photoMap['1']
}

/** 从卡池随机抽取 N 张，顺序随机 */
export function pickSceneCards(n = 5) {
  const shuffled = [...sceneCards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, shuffled.length))
}
