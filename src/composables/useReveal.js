import { onBeforeUnmount } from 'vue'

/**
 * 滚动进视口时逐条浮现。
 *
 * 只动 transform 和 opacity（GPU 合成，不触发重排）；每个元素只演一次，
 * 演完就把类名和内联变量删掉，元素回到干净的原始状态。
 *
 * 用 animation 而不是 transition —— transition 的 delay 会残留在元素上，
 * 之后 hover 之类也会被它拖慢。
 *
 * 用法：
 *   const scrollerRef = ref(null)
 *   const { reveal } = useReveal(scrollerRef)
 *   await nextTick()
 *   reveal('.jcard', { stagger: 0.06 })
 */
export function useReveal(scrollerRef) {
  const observers = []

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * @param {string} selector 要观察的元素选择器
   * @param {object} [opts]
   * @param {number}  [opts.stagger=0]  同一批一起进视口时的间隔（秒）
   * @param {Element} [opts.scope]     在哪个范围内查找，默认 document
   */
  function reveal(selector, { stagger = 0, scope = document } = {}) {
    // 跳过已经演过的 —— 所以重复调用是安全的（筛选、翻页后可以再调一次）
    const els = [...scope.querySelectorAll(selector)].filter(el => !el.dataset.revealed)
    if (!els.length) return

    // 用户关了动效 → 什么都不加，内容保持默认可见
    if (reducedMotion()) return

    const order = new Map(els.map((el, i) => [el, i]))
    els.forEach(el => el.classList.add('reveal'))

    const io = new IntersectionObserver(
      entries => {
        // 一次回调里可能有多个元素同时进视口，按 DOM 顺序级联
        const hit = entries.filter(e => e.isIntersecting)
        hit.sort((a, b) => order.get(a.target) - order.get(b.target))

        hit.forEach((entry, i) => {
          const el = entry.target
          if (stagger && i > 0) el.style.setProperty('--rd', `${(i * stagger).toFixed(2)}s`)

          el.addEventListener(
            'animationend',
            () => {
              el.classList.remove('reveal', 'reveal-in')
              el.style.removeProperty('--rd')
              el.dataset.revealed = '1'
            },
            { once: true }
          )

          el.classList.add('reveal-in')
          io.unobserve(el)
        })
      },
      {
        // 本项目的页面滚动发生在自定义 .scroller 里，不能让 root 留空
        root: scrollerRef?.value ?? null,
        threshold: 0,
        rootMargin: '0px 0px -10% 0px',
      }
    )

    els.forEach(el => io.observe(el))
    observers.push(io)
  }

  function disconnect() {
    observers.forEach(io => io.disconnect())
    observers.length = 0
  }

  onBeforeUnmount(disconnect)

  return { reveal, disconnect }
}
