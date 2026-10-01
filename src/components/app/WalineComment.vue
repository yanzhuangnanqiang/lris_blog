<template>
  <div class="waline-wrap" :class="[`accent-${accent}`, { dark }]">
    <div ref="walineRef"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  // 稳定标识「本文的评论归属」，取值和 giscus 的 term 一致：/post/<id>、/notes/<id>。
  // ⚠️ 一经上线就不能再改：Waline 靠 path 归属评论，改了旧评论会「消失」。
  path: { type: String, required: true },
  // 评论区强调色，跟着页面主题走：随想/首页一侧是浅绿，笔记页是鸢尾紫。
  accent: { type: String, default: 'green' },   // 'green' | 'purple'
  // 放进深色容器时打开（笔记页的深色阅读面板）。直接透传给 Waline 的 dark 选项。
  dark: { type: Boolean, default: false },
})

// 部署好 Waline 服务端后，换成你自己的自定义子域名。
// ⚠️ 别写 xxx.vercel.app —— 那个域名在大陆访问不了。
const SERVER_URL = 'https://comment.thineiris.top'

// 图片存放：Supabase Storage（bucket 必须是 public，并放行匿名上传）。
// publishable key 是设计上就公开的，可以放在前端；别把 secret key 写进来。
const SUPABASE_URL = 'https://mwetakljakqlmhteaqdk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_BhBLNEAHxD4h9uIdxbtgGg_AhB9Fvkm'
const BUCKET = 'waline'
const MAX_MB = 5

/* Waline 的 imageUploader：返回图片最终 URL，客户端会把 ![](URL) 插进评论。
   换掉它默认那套逻辑 —— 默认是把图片转 base64 塞进评论，硬限 128KB，GIF 必被挡。 */
async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('只能上传图片文件')
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`图片不能超过 ${MAX_MB}MB`)

  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const resp = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      // 用文件自身的 MIME（GIF 要保住 image/gif，不能写死）
      'content-type': file.type,
    },
    body: file,
  })
  if (!resp.ok) throw new Error(`图片上传失败（${resp.status}）`)

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`
}

/* 评论框里的 QQ 头像实时预览：邮箱填 xxxxx@qq.com 时，当场显示那个 QQ 的头像。 */
function setupQQAvatarPreview(rootEl) {
  let observer

  const qqAvatar = (value) => {
    const m = value.trim().match(/^([1-9]\d{4,11})@qq\.com$/i)
    return m ? `https://q1.qlogo.cn/headimg_dl?dst_uin=${m[1]}&spec=100` : ''
  }

  const update = () => {
    const box = rootEl.querySelector('.wl-comment')
    const mail = rootEl.querySelector('input[name="mail"]')
    if (!box || !mail) return

    let preview = box.querySelector('[data-qq-preview]')
    if (!preview) {
      preview = document.createElement('img')
      preview.className = 'qq-avatar-preview'
      preview.dataset.qqPreview = 'true'
      preview.alt = ''
      preview.referrerPolicy = 'no-referrer'
      box.prepend(preview)
    }

    const url = qqAvatar(mail.value || '')
    if (!url) {
      preview.removeAttribute('src')
      preview.hidden = true
      return
    }
    if (preview.dataset.src !== url) {
      preview.dataset.src = url
      preview.src = url
    }
    preview.hidden = false
  }

  rootEl.addEventListener('input', update)
  // Waline 重新渲染评论框时插入的节点会被冲掉，观察一下补回来
  observer = new MutationObserver(update)
  observer.observe(rootEl, { childList: true, subtree: true })
  update()

  return () => {
    observer?.disconnect()
    rootEl.removeEventListener('input', update)
    rootEl.querySelector('[data-qq-preview]')?.remove()
  }
}

const walineRef = ref(null)
let instance = null
let cleanupPreview = null

onMounted(async () => {
  // 动态引入：Waline 是完整 Vue 应用 + 一份不小的 CSS，别打进首屏包
  const [{ init }] = await Promise.all([
    import('@waline/client'),
    import('@waline/client/waline.css'),
    // 系统/浏览器小图标：Waline 自带这份 CSS（按 .wl-os / .wl-browser 的 data-value 选图），
    // 客户端本来就渲染了这些类名，只是默认不引入这份样式，加上就有。
    import('@waline/client/waline-meta.css'),
  ])
  if (!walineRef.value) return
  instance = init({
    el: walineRef.value,
    serverURL: SERVER_URL,
    path: props.path,
    dark: props.dark,
    lang: 'zh-CN',
    imageUploader: uploadImage,
    // 表情包：跑通后可在管理后台挂 emoji pack（如 B 站/微博表情包）
  })
  cleanupPreview = setupQQAvatarPreview(walineRef.value)
})

onBeforeUnmount(() => {
  cleanupPreview?.()
  cleanupPreview = null
  // Waline 是 Vue 应用，不销毁会在 SPA 切换时重复挂载
  instance?.destroy?.()
  instance = null
})
</script>

<style scoped>
.waline-wrap {
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.waline-wrap.dark {
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* ---- 强调色跟着站点主题 ----
   变量的继承按「最近的祖先」生效，所以设在这层，Waline 内部元素都会跟着变。
   绿色没用 --mint-green(#b8d4b8)：它太浅，当按钮底色时白字看不清，这里加深一档。 */
.waline-wrap.accent-green {
  --waline-theme-color: #5f8f63;
  --waline-active-color: #6fa373;
}

.waline-wrap.accent-purple {
  --waline-theme-color: var(--iris-purple);
  --waline-active-color: #5d37a8;
}

/* ---------- 评论卡片：圆角 + 半透明，贴合站点卡片风 ----------
   ⚠️ Waline 内部 DOM 没有本组件的 scoped 属性，选 .wl-xxx 必须套 :deep()。
   ⚠️ 变量要用 v3 的名字；网上 / Aemeath 写的 --waline-bgcolor 是 v2 的，抄了不生效。
   ⚠️ 别写 -webkit-backdrop-filter：本站构建会让标准属性被丢掉（老坑）。 */
.waline-wrap {
  --waline-border: 1px solid var(--glass-border);
  --waline-box-shadow: none;
  --waline-avatar-radius: 50%;
  --waline-badge-color: var(--waline-theme-color);
}

.waline-wrap :deep(.wl-panel) {
  border-radius: 1rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
}

.waline-wrap.dark :deep(.wl-panel) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

/* ---------- 聊天式：站长的评论整行反转，排到右边 ----------
   "是不是站长"不用自己判断 —— Waline 会给管理员评论渲染 .administrator-icon
   （由评论的 user_id 关联出的 administrator 类型决定，读取时现算）。
   正文 .wl-content 保持左对齐，只翻昵称/时间那一行，观感才像聊天软件。 */
.waline-wrap :deep(.wl-card-item:has(.administrator-icon)) {
  flex-direction: row-reverse;
}

.waline-wrap :deep(.wl-card-item:has(.administrator-icon) > .wl-user) {
  margin-inline-start: 0.75em;
  margin-inline-end: 0;
}

.waline-wrap :deep(.wl-card-item:has(.administrator-icon) > .wl-card > .wl-head) {
  text-align: right;
}

/* ---------- 正文轻微染色：跟主题同色系的深色，而不是纯黑 ---------- */
/* 浅色面板（随想/文章页）→ 深绿调 */
.waline-wrap.accent-green {
  --waline-color: #2f3a31;
}

/* 深色面板（笔记页）→ 带紫调的浅色。
   Waline 的 dark 模式会把变量**内联注入**到根元素，普通规则压不过内联样式，
   所以这组要用 !important；三个选择器分别盖住「外层 / 挂载点 / Waline 面板」。 */
.waline-wrap.dark,
.waline-wrap.dark > div,
.waline-wrap.dark :deep(.wl-panel) {
  --waline-color: #b9aed2 !important;
}

/* ---------- 评论框里的 QQ 头像实时预览 ----------
   这个 <img> 是 JS 直接插进 Waline DOM 的，没有本组件的 scoped 属性，
   所以必须通过 :deep 选它。 */
.waline-wrap :deep(.qq-avatar-preview) {
  display: block;
  width: 2.5em;
  height: 2.5em;
  margin-bottom: 0.6em;
  border-radius: 50%;
  object-fit: cover;
}

/* display:block 会盖掉 [hidden] 默认的 display:none，这里补回来 */
.waline-wrap :deep(.qq-avatar-preview[hidden]) {
  display: none;
}
</style>
