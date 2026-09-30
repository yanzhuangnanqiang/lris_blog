---
title: Vue 3 组合式 API 实践指南
date: 2025-04-15
tags: [Vue, 前端,学习]
summary: 从 Options API 迁移到 Composition API 的实战总结
cover:3.jpeg
---

## 为什么用 Composition API

Options API 按选项分类（data、methods、computed、watch），同一个功能的代码分散在不同选项里。比如一个搜索功能，它的状态、计算属性、监听器散落在四处。

Composition API 让**同一件事的代码写在一起**：

```ts
// Options API —— 搜索相关代码分散
data() { return { keyword: '', results: [] } }
methods: { search() { /* ... */ } }
watch: { keyword() { /* ... */ } }
computed: { isEmpty() { /* ... */ } }

// Composition API —— 搜索相关代码聚拢
const keyword = ref('')
const results = ref([])
const isEmpty = computed(() => keyword.value.length === 0)
watch(keyword, search)
```

## 核心概念

### ref 与 reactive

`ref` 适合**单值**（字符串、数字），用 `.value` 读写：

```ts
const count = ref(0)
count.value++
```

`reactive` 适合**对象**，不需要 `.value`，但不能整体替换：

```ts
const user = reactive({ name: '张三', age: 20 })
user.name = '李四' // ✅ 正常

// user = { name: '王五', age: 22 } // ❌ 响应式丢失
```

实际项目里，绝大多数场景用 `ref` 就够了。`reactive` 的陷阱较多，除非你非常清楚它的限制。

### computed

```ts
const firstName = ref('张')
const lastName = ref('三')
const fullName = computed(() => `${firstName.value}${lastName.value}`)
```

computed 自动追踪依赖，只在依赖变化时重新计算，有缓存。

### watch 与 watchEffect

`watch` 明确指定监听目标：

```ts
watch(keyword, (newVal, oldVal) => {
  console.log(`从 "${oldVal}" 变成 "${newVal}"`)
})
```

`watchEffect` 自动追踪内部用到的响应式值：

```ts
watchEffect(() => {
  console.log(`当前关键词：${keyword.value}，长度：${keyword.value.length}`)
})
```

| | watch | watchEffect |
|------|-------|-------------|
| 指定来源 | 显式 | 自动 |
| 旧值 | 能拿到 | 拿不到 |
| 立即执行 | 默认不执行，可加 `immediate` | 默认立即执行 |
| 适用 | 需比较新旧值 | "副作用自动跟着数据跑" |

## 封装自己的 composable

把可复用的逻辑抽成函数，就是 composable。这和 React 的 Hook 是同一个思路。

### 示例：useMouse

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e: MouseEvent) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

使用：

```vue
<script setup>
import { useMouse } from '@/composables/useMouse'
const { x, y } = useMouse()
</script>

<template>
  <p>鼠标位置：{{ x }}, {{ y }}</p>
</template>
```

### 示例：useInfiniteScroll

```ts
// composables/useInfiniteScroll.ts
import { ref } from 'vue'

export function useInfiniteScroll(loadMore: () => Promise<void>) {
  const loading = ref(false)
  const done = ref(false)

  async function onScroll(el: HTMLElement) {
    if (loading.value || done.value) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loading.value = true
      await loadMore()
      loading.value = false
    }
  }

  return { loading, done, onScroll }
}
```

## 从 Options 迁移的常见坑

### 1. 忘了 `.value`

```ts
const name = ref('张三')
// ❌ console.log(name) → RefImpl 对象
console.log(name.value) // ✅ '张三'
```

模板里不需要 `.value`，Vue 自动解包。

### 2. 解构 reactive 会丢失响应式

```ts
const state = reactive({ count: 0, msg: 'hi' })
const { count } = state   // ❌ count 只是个数字，不再响应
const { count } = toRefs(state)  // ✅
```

### 3. ref 放 reactive 里会自动解包

```ts
const count = ref(0)
const state = reactive({ count })
state.count = 5         // ✅ count.value 也变成 5
```

### 4. provide / inject 的类型安全

```ts
// 父组件
provide('theme', ref('dark'))

// 子组件
const theme = inject<Ref<string>>('theme')
```

## `<script setup>` 等价写法

```vue
<!-- 这两段等价 →
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- 等价于 →
<script>
import { ref } from 'vue'
export default {
  setup() {
    const count = ref(0)
    return { count }
  }
}
</script>
```

`<script setup>` 更简洁，但没有 `setup()` 那么直观地看到"返回了什么"——不过实践中极少需要这种透明度。

## 总结

| 场景 | 用什么 |
|------|--------|
| 单值状态 | `ref` |
| 对象、数组 | `ref`（比 reactive 更安全） |
| 派生值 | `computed` |
| 副作用的监听 | `watch` / `watchEffect` |
| 生命周期 | `onMounted` / `onUnmounted` 等 |
| 可复用逻辑 | 抽成 composable 函数 |
| 跨组件共享 | composable 或 provide/inject |