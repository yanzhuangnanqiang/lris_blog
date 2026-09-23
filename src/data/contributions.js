// GitHub 贡献数据。
//
// 这个接口原先在 github-contributions-api.deno.dev，Deno Deploy Classic 停服后
// 上游把它重建到了新平台，只换了 host，路径没变。
const API = 'https://github-contributions-api.kawarimidoll.deno.net/yanzhuangnanqiang.json'
const CACHE_KEY = 'ghContributions'

// 接口自带的四档分级，正好对应四档花
const LEVEL_BY_NAME = {
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

// 鸢尾色板。颜色是装饰性的（真花田不会只有一个色），
// 「开了多大」才表示当天提交了多少次。
const IRIS_PALETTE = ['#8B6FE8', '#B79BF0', '#E39BC8', '#9DC3E8']

/**
 * FNV-1a。必须是确定性的 —— 真随机会让每次刷新颜色都变，花田会闪。
 * 之前用的 (h * 31 + char) 低位太弱，日期只差最后一个字符，
 * 取模之后相邻日期就是连续色号，等于按顺序循环。
 */
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 按日期确定性取色 —— 同一天永远同一个颜色 */
export function irisColorOf(date) {
  return IRIS_PALETTE[hash(date) % IRIS_PALETTE.length]
}

/**
 * 拉取并整理贡献数据。实测请求约 2 秒，所以结果缓存在 sessionStorage。
 * 失败时 throw，由调用方决定怎么提示用户。
 */
export async function loadContributions() {
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* 缓存坏了就重新拉 */ }
  }

  const res = await fetch(API)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const json = await res.json()
  let raw = json.contributions || []
  if (Array.isArray(raw[0])) raw = raw.flat() // 按周分组的二维数组

  const days = raw
    .map(c => ({
      date: c.date,
      count: c.contributionCount || 0,
      level: LEVEL_BY_NAME[c.contributionLevel] || 0,
    }))
    .filter(d => d.level > 0)

  const result = {
    days,
    total: typeof json.totalContributions === 'number'
      ? json.totalContributions
      : days.reduce((sum, d) => sum + d.count, 0),
    activeDays: days.length,
  }

  sessionStorage.setItem(CACHE_KEY, JSON.stringify(result))
  return result
}