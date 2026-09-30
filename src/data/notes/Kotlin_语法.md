---
title: Kotlin 特殊语法（对比 Java）
date: 2026-09-16
tags: [Kotlin, 语言, 学习]
summary: 从 Java 视角梳理 Kotlin 的可空类型、val/var、data class、扩展函数、when 与高阶函数等关键差异
cover: 24.webp
---

<!-- 记录 Kotlin 中与 Java 不同的特殊语法，方便从 Java 迁移时对照 -->

## Kotlin 与 Java 的定位差异

两者都跑在 JVM 上，可以互相调用，但设计取向不同：

| | Java | Kotlin |
|---|---|---|
| 空安全 | 靠注解和自觉，`NullPointerException` 运行时才炸 | 类型系统区分 `String` / `String?`，编译期就拦 |
| 变量 | 只有可变变量 | `val`（只读）/ `var`（可变），鼓励用 `val` |
| 方法位置 | 只能写在类里 | 支持顶层函数、扩展函数 |
| POJO | 手写 getter/setter/equals/hashCode | `data class` 一行搞定 |
| 分支 | `switch` 只能匹配常量 | `when` 可匹配类型、范围、任意表达式 |
| 函数式 | 需要 Stream + Lambda | 函数是一等公民，集合操作符开箱即用 |

一条经验：**能写 `val` 就别写 `var`**，和 Java 里能写 `final` 就写的道理一样，Kotlin 只是把它变成了默认习惯。

## 变量：val / var 与类型推断

```kotlin
val name = "Iris"        // 只读
var count = 0            // 可变
val age: Int = 20        // 需要时显式标类型
```

- `val` 是**引用不可变**，不是对象不可变：`val list = mutableListOf(1)` 之后仍然能 `list.add(2)`。
- 类型推断只保证"能推出来"，不保证"推得对"。函数返回值、对外公开的 API 建议写明类型，否则以后改动容易波及调用方。
- Kotlin 不分基本类型和包装类型（没有 `int` / `Integer` 之别），统一写 `Int`，由编译器决定要不要装箱。

## 可空类型与安全调用

| 符号 | 名称 | 代码示例 | 作用 |
|------|------|----------|------|
| `String?` | 可空类型声明 | `var s: String? = null` | 类型后加 `?`，变量允许为 null |
| `?.` | 安全调用 | `s?.length` | 为 null 时返回 null，不崩溃 |
| `?:` | Elvis 运算符 | `s ?: "默认值"` | 为 null 时返回右边的默认值 |
| `!!` | 非空断言 | `s!!.length` | 强制声明非空，实际为 null 则抛异常崩溃 |
| `!is` / `!=` | 否定判断 | `s !is Int`、`a != b` | 分别表示"不是该类型""不等于" |

记忆：单个 `?` 声明可空，`?.` 安全调用，`?:` 给默认值；`!!` 是"我确定非空，错了就崩"。

注意三处 `?` 和 `!` 别混：

- 类型后的 `?`（`String?`）是**类型的一部分**；
- `!=` / `!is` 里的 `!` 是**运算符**，和空安全无关；
- `!!` 是**两个感叹号**，不是"双重否定"。

`!!` 能把可空类型"抹平"成非空，代价是把编译期的保护换回运行时的崩溃——本质上和 Java 没区别：

```kotlin
val s: String? = null

val bad = s!!.length          // 抛 KotlinNullPointerException
val good = s?.length ?: 0     // 安全，得到 0
```

**能写 `?.` / `?:` 就别写 `!!`。**

## 字符串模板

```kotlin
val name = "鸢尾"
println("你好，$name")            // 简单变量：直接 $
println("长度是 ${name.length}")   // 表达式：用 ${}
```

对比 Java 的 `"..." + name + "..."`，省掉拼接，也不用操心漏加空格。

## when：比 switch 强在哪

```kotlin
// 按数值分支：支持范围
fun grade(score: Int): String = when (score) {
    in 90..100 -> "优秀"
    in 60..89 -> "及格"
    else -> "不及格"
}

// 按类型分支：支持智能转换
fun describe(x: Any): String = when (x) {
    is String -> "字符串，长度 ${x.length}"   // 这个分支里 x 已自动当作 String
    is Int -> "整数 $x"
    else -> "其它"
}
```

和 Java `switch` 的区别：

- 它是**表达式**，有返回值，可以直接赋值，不必每支都写 `return`；
- 分支条件可以是范围、类型、任意表达式，不必是常量；
- **不需要 `break`**，不会意外穿透；
- 穷尽了所有情况时可以省掉 `else`，编译器会帮你检查（对 `enum`、`sealed class` 很有用）。

`is` 判断之后不用再强转，编译器会**智能转换**（smart cast）——这就是上面 `x.length` 能直接写的原因。

## 函数：默认参数、命名参数、顶层函数

```kotlin
fun greet(name: String = "世界", greeting: String = "你好") = "$greeting，$name"

greet()                       // 你好，世界
greet(greeting = "早上好")     // 早上好，世界 —— 命名参数跳过了 name
```

- **默认参数**取代了 Java 里成堆的重载构造器。
- **命名参数**让调用处自解释，参数顺序不再要紧。
- **顶层函数**不用挂在类里；Java 侧调用会变成 `文件名Kt.greet(...)`（可用 `@JvmName` 改）。
- 单表达式函数能省掉花括号和 `return`，写成 `fun f() = ...`。

## data class：省掉样板代码

```kotlin
data class User(val id: Int, val name: String)
```

这一行自动生成 `equals()`、`hashCode()`、`toString()`、`copy()`，以及按声明顺序的 `componentN()`（解构用）：

```kotlin
val a = User(1, "鸢尾")
val b = a.copy(name = "百合")   // 只改一个字段，其余复制
val (id, name) = a              // 解构：靠 componentN
println(a)                      // User(id=1, name=鸢尾)
```

对比 Java 要手写或靠 Lombok / `record`。

一个坑：`equals` / `hashCode` **只算主构造器里声明的属性**，写在类体里的属性不参与——要参与就得放进主构造器。

## 扩展函数

给已有的类"加"方法，不用继承，也改不了它的源码：

```kotlin
fun String.withBrackets() = "[$this]"

println("abc".withBrackets())   // [abc]
```

底层是静态方法 `withBrackets(receiver)`，只是调用时长得像成员方法。三个坑：

1. 它**不真正修改类**；跨模块调用要导入才可见。
2. 若成员函数同名同签名，**永远优先成员函数**，扩展会被静默忽略，不报错。
3. 只能访问公开成员，拿不到私有成员。

## Lambda 与高阶函数

函数可以当参数、当返回值：

```kotlin
fun twice(n: Int, op: (Int) -> Int) = op(op(n))

twice(3) { it * it }   // 81，最后一个参数是 lambda 时可提到括号外
```

- 单参数 lambda 里 `it` 是隐式名。
- Kotlin 的 lambda **可以直接修改外部的 `var`**（Java 要求变量 effectively final），所以很多场景不需要 Stream 那套写法。

集合操作符是日常主力，和 Java Stream 一一对应：

| Kotlin | 作用 | Java 对应 |
|---|---|---|
| `map { }` | 逐元素变换 | `map()` |
| `filter { }` | 过滤 | `filter()` |
| `fold(初值) { acc, x -> }` | 带初值归约 | `reduce()`（无初值）|
| `groupBy { }` | 按 key 分组 | `Collectors.groupingBy` |
| `sumOf { }` / `count { }` | 求和 / 计数 | `summingInt` / `count` |

```kotlin
val nums = listOf(1, 2, 3, 4, 5)
val oddSum = nums.filter { it % 2 == 1 }.sumOf { it }   // 9
```

## companion object（对比 Java static）

Kotlin 没有 `static`，类级别的常量和工厂方法放进 `companion object`：

```kotlin
class Theme private constructor(val name: String) {
    companion object {
        const val DEFAULT = "iris"
        fun of(name: String) = Theme(name)   // 工厂方法
    }
}
```

- 它本质是一个**单例对象**，可以起名字、甚至实现接口。
- 只有 `const val` 是编译期常量；普通的 `val` 不是。

## 易错点小结

| 易错点 | 正解 |
|---|---|
| 以为 `val` 声明的集合不可变 | `val` 只锁引用，`mutableListOf` 照样能增删 |
| 到处写 `!!` | 等于放弃空安全，优先 `?.` + `?:` |
| 以为扩展函数能改类 | 它是静态方法，同名成员函数优先且不报错 |
| `data class` 类体里的属性没进 equals | 想参与比较就放进主构造器 |
| 拿 `switch` 的思维写 `when` | 不用 `break`，而且它有返回值 |
| 类型后的 `?` 和 `!=` 的 `!` 混为一谈 | 前者是类型的一部分，后者是运算符 |
