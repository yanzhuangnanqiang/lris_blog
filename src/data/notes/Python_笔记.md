---
title: Python的 语法仓库
date: 2025-5-27
tags: [Python,语言,学习]
summary: 将我在书中ss
---


> **说明**：涵盖基础内置函数、切片语法、序列操作、断言、生成器、itertools、random模块、字典操作、经典算法及竞赛常用技巧。

---
## lambda 表达式
### lambda 表达式 可以作为 函数参数
`list(map(lambda x:x+10,L))  #L 指代任意可迭代对象`


## 一、基础内置函数（必背）

### 1. `len()`
**概念**：获取字符串、列表、元组、字典、集合等容器长度
```python
s = "abc"
print(len(s))           # 3
print(len([1, 2, 3]))   # 3
print(len({"a": 1}))    # 1（键值对数量）
```

### 2. `sum()`
**概念**：求和，可配合生成器表达式统计符合条件数量
```python
print(sum([1, 2, 3]))           # 6
# 统计两个字符串相同位置相同字符的数量
print(sum(1 for o, u in zip("123", "133") if o == u))  # 2
# 带初始值求和
print(sum([1, 2, 3], 10))       # 16
```

### 3. `round()`
**概念**：四舍五入保留指定小数位数（注意：Python采用"银行家舍入"）
```python
print(round(3.1415, 2))    # 3.14
print(round(2.5))          # 2（偶数舍入）
print(round(3.5))          # 4
```

### 4. `abs()`
**概念**：求数字绝对值，支持整数、浮点数、复数
```python
print(abs(-10))        # 10
print(abs(-3.14))      # 3.14
print(abs(3 + 4j))     # 5.0（复数模长）
```

### 5. `next()`
**概念**：取出迭代器/生成器下一个元素，可设默认值防报错
```python
from itertools import cycle
c = cycle([1, 2, 3])
print(next(c))         # 1
print(next(c))         # 2
print(next(c))         # 3
print(next(c))         # 1（循环）

# 带默认值
it = iter([1])
print(next(it, "没了"))  # 1
print(next(it, "没了"))  # "没了"
```

### 6. `enumerate()` ⭐
**概念**：为可迭代对象添加索引，返回`(索引, 值)`
```python
for i, ch in enumerate("abc", start=1):
    print(i, ch)
# 1 a
# 2 b
# 3 c
```

### 7. `map()` ⭐
**概念**：对每个元素执行函数，返回迭代器
```python
print(list(map(int, ["1", "2", "3"])))         # [1, 2, 3]
print(list(map(lambda x: x**2, [1, 2, 3])))    # [1, 4, 9]
```

### 8. `filter()` ⭐
**概念**：按条件过滤元素
```python
print(list(filter(lambda x: x > 0, [-1, 0, 1, 2])))  # [1, 2]
```

### 9. `sorted()` / `reversed()` ⭐
```python
print(sorted([3, 1, 2]))                              # [1, 2, 3]
print(sorted([3, 1, 2], reverse=True))                # [3, 2, 1]
print(sorted(["banana", "pie"], key=len))             # ['pie', 'banana']
print(list(reversed([1, 2, 3])))                      # [3, 2, 1]
```

### 10. `max()` / `min()` ⭐
```python
print(max([1, 5, 3]))                                 # 5
print(max("apple", "banana", key=len))                # "banana"
print(min([{"v": 3}, {"v": 1}], key=lambda x: x["v"])) # {'v': 1}
```

---

## 二、切片语法（核心技巧）

### 1. `lst[:]`
**概念**：列表完整切片，实现浅拷贝
```python
a = [1, 2, 3]
b = a[:]
b[0] = 99
print(a)   # [1, 2, 3]（a不变）
```

### 2. `s[:-1]`
**概念**：删除序列最后一位元素
```python
print("12345"[:-1])       # "1234"
print("hello\n"[:-1])     # "hello"（去掉换行符）
```

### 3. `s[::-1]`
**概念**：反转整个序列
```python
print("hello"[::-1])      # "olleh"
print([1, 2, 3][::-1])    # [3, 2, 1]
# 判断回文
s = "abcba"
print(s == s[::-1])       # True
```

### 4. `s[::2]` ⭐
**概念**：步长切片，隔一个取一个
```python
print("abcdef"[::2])      # "ace"（偶数位）
print("abcdef"[1::2])     # "bdf"（奇数位）
```

---

## 三、序列常用函数

### `zip()`
**概念**：两个或多个序列按位置两两配对，以最短序列为准
```python
print(list(zip([1, 2], [3, 4])))           # [(1, 3), (2, 4)]
print(list(zip([1, 2, 3], [4, 5])))        # [(1, 4), (2, 5)]

# 同时遍历多个序列
names = ["Alice", "Bob"]
ages = [20, 25]
for name, age in zip(names, ages):
    print(f"{name}: {age}")

# 解压（unzip）
pairs = [(1, 'a'), (2, 'b')]
a, b = zip(*pairs)
print(a)   # (1, 2)
print(b)   # ('a', 'b')
```

### `zip_longest()` ⭐
```python
from itertools import zip_longest
print(list(zip_longest([1, 2, 3], [4, 5], fillvalue=0)))  # [(1, 4), (2, 5), (3, 0)]
```

---

## 四、断言语法

### `assert`
**概念**：条件成立正常运行，不成立直接抛出AssertionError终止程序
```python
assert 10 > 5, "错误提示"    # 正常通过

# 函数参数校验
def divide(a, b):
    assert b != 0, "除数不能为0"
    return a / b

# 关闭断言：python -O script.py
```

---

## 五、生成器与推导式

### `yield` 生成器函数
**概念**：使用yield返回数据，惰性执行节省内存
```python
def func():
    yield 1
    yield 2

g = func()
print(next(g))   # 1
print(next(g))   # 2

# 斐波那契生成器
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fib(5)))   # [0, 1, 1, 2, 3]
```

### `yield from` ⭐
**概念**：委托子生成器
```python
def sub():
    yield 1
    yield 2

def main():
    yield 0
    yield from sub()
    yield 3

print(list(main()))   # [0, 1, 2, 3]
```

### 字典推导式
```python
result = {i: 'goat' for i in range(3)}
print(result)   # {0: 'goat', 1: 'goat', 2: 'goat'}

# 带条件
squares = {x: x**2 for x in range(5) if x % 2 == 0}
print(squares)  # {0: 0, 2: 4, 4: 16}
```

### 列表推导式 ⭐
```python
print([x**2 for x in range(5)])              # [0, 1, 4, 9, 16]
print([x for x in range(10) if x % 2 == 0])  # [0, 2, 4, 6, 8]
```

### 集合推导式 ⭐
```python
print({x % 3 for x in range(10)})   # {0, 1, 2}
```

---

## 六、itertools模块

### `cycle()`
**概念**：生成无限循环迭代器
```python
from itertools import cycle
data = cycle([1, 2, 3])
print(next(data))   # 1
print(next(data))   # 2
print(next(data))   # 3
print(next(data))   # 1（循环）
```

### `permutations()` ⭐
**概念**：返回所有排列
```python
from itertools import permutations
print(list(permutations([1, 2, 3], 2)))
# [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]
```

### `combinations()` ⭐
**概念**：返回所有组合
```python
from itertools import combinations
print(list(combinations([1, 2, 3], 2)))  # [(1, 2), (1, 3), (2, 3)]
```

### `accumulate()` ⭐
```python
from itertools import accumulate
print(list(accumulate([1, 2, 3, 4])))           # [1, 3, 6, 10]
print(list(accumulate([1, 2, 3, 4], lambda x, y: x * y)))  # [1, 2, 6, 24]
```

### `count()` / `repeat()` / `chain()` ⭐
```python
from itertools import count, repeat, chain

for i in count(10, 2):
    if i > 20: break
    print(i)   # 10, 12, 14, 16, 18, 20

print(list(repeat(5, 3)))                 # [5, 5, 5]
print(list(chain([1, 2], [3, 4], [5])))   # [1, 2, 3, 4, 5]
```

---

## 七、随机模块 random

### 导入方式
```python
import random
from random import randrange
```

### 1. `random.random()`
**概念**：生成[0, 1)区间随机浮点数
```python
print(random.random())   # 0.37444887175646646
```

### 2. `random.randint(a, b)`
**概念**：生成a到b闭区间随机整数
```python
print(random.randint(1, 10))   # 包含1和10
```

### 3. `random.sample(序列, 数量)`
**概念**：无重复随机取样，返回新列表
```python
print(random.sample(range(1, 5), 2))    # 如 [1, 3]
print(random.sample("abcdef", 3))        # 如 ['b', 'e', 'a']
```

### 4. `random.shuffle(列表)`
**概念**：原地打乱列表，无返回值
```python
lst = [1, 2, 3]
random.shuffle(lst)
print(lst)   # 如 [2, 3, 1]
```

### 5. `randrange(n)`
**概念**：生成0到n-1随机整数
```python
print(randrange(5))   # 0~4
```

### 6. `randrange(a, b)`
**概念**：生成a到b-1随机整数
```python
print(randrange(1, 5))   # 1~4
```

### 7. `random.choice()` / `choices()` ⭐
```python
print(random.choice([1, 2, 3, 4]))                     # 单选
print(random.choices([1, 2, 3], weights=[1, 2, 3], k=2))  # 按权重多选（可重复）
```

### 8. 设置随机种子 ⭐
```python
random.seed(42)
print(random.random())   # 固定输出，保证可复现
```

---

## 八、字典操作

### 基础遍历
```python
d = {"a": 1, "b": 2, "c": 3}

for k in d:                 # 遍历键
    print(k)

for k, v in d.items():      # 遍历键值对
    print(k, v)

for v in d.values():        # 遍历值
    print(v)
```

### 集合运算剔除指定键 ⭐
**概念**：利用集合差集运算，遍历字典时剔除指定键
```python
doors = {1: "goat", 2: "car", 3: "goat"}
firstDoorNum = 1

# 遍历除firstDoorNum外的所有键
for door in doors.keys() - {firstDoorNum}:
    print(door)   # 输出 2, 3（顺序不定）

# 同理可剔除多个键
exclude = {1, 3}
for door in doors.keys() - exclude:
    print(door)   # 输出 2
```

### `dict.get()` / `setdefault()` ⭐
```python
d = {"a": 1}
print(d.get("b", 0))         # 0（键不存在返回默认值）
print(d.setdefault("c", 2))  # 2（不存在则设置并返回）
print(d)                     # {'a': 1, 'c': 2}
```

### `collections.Counter` ⭐
```python
from collections import Counter
c = Counter("abracadabra")
print(c)                    # Counter({'a': 5, 'b': 2, 'r': 2, ...})
print(c.most_common(2))     # [('a', 5), ('b', 2)]
```

### `collections.defaultdict` ⭐
```python
from collections import defaultdict
d = defaultdict(list)
d["a"].append(1)
d["a"].append(2)
print(d)   # defaultdict(<class 'list'>, {'a': [1, 2]})
```

---

## 九、字符串高频方法 ⭐

### `join()`
```python
print("-".join(["2026", "05", "18"]))   # "2026-05-18"
print("".join(map(str, [1, 2, 3])))      # "123"
```

### `split()`
```python
print("a,b,c".split(","))        # ['a', 'b', 'c']
print("a,b,c".split(",", 1))     # ['a', 'b,c']
print("a  b  c".split())         # ['a', 'b', 'c']（默认按空白分割）
```

### `strip()` / `startswith()` / `endswith()`
```python
print("  hello  ".strip())                    # "hello"
print("abc.txt".endswith((".txt", ".md")))    # True
print("http://...".startswith(("http://", "https://")))  # True
```

---

## 十、列表高频方法 ⭐

### 增删改查
```python
lst = [1, 2]
lst.append(3)          # [1, 2, 3]（加单个元素）
lst.extend([4, 5])     # [1, 2, 3, 4, 5]（加可迭代对象）
lst.insert(0, 0)       # [0, 1, 2, 3, 4, 5]

lst = [1, 2, 3, 2]
print(lst.pop())       # 3（弹出末尾）
print(lst.pop(0))      # 1（弹出索引0）
lst.remove(2)          # 删除首个值为2的元素
print(lst.index(2))    # 0（首个值为2的索引）
```

---

## 十一、经典算法

### 1. 约瑟夫环
**概念**：利用cycle无限循环 + next报数，依次淘汰元素
```python
from itertools import cycle

def josephus(n, k):
    """n个人围成圈，报数到k的淘汰，求最后幸存者"""
    alive = list(range(1, n + 1))
    it = cycle(alive)
    while len(alive) > 1:
        for _ in range(k - 1):
            next(it)
        dead = next(it)
        alive.remove(dead)
        it = cycle(alive)
    return alive[0]

print(josephus(7, 3))   # 4
```

### 2. 蒙特卡罗算法
**概念**：大量随机撒点，用概率近似计算数值
```python
import random

def estimate_pi(n):
    inside = 0
    for _ in range(n):
        x, y = random.random(), random.random()
        if x**2 + y**2 <= 1:
            inside += 1
    return 4 * inside / n

print(estimate_pi(1000000))   # 约 3.14x
```

### 3. 蒙蒂霍尔三门悖论
**规则**：三扇门后有一辆车和两只羊，参赛者先选一扇门，主持人（知道答案）会打开一扇有羊的门，然后问是否要换门。

**结论**：**换门胜率 2/3，不换 1/3**

```python
import random

def monty_hall(trials=10000):
    switch_wins = 0
    stay_wins = 0
    
    for _ in range(trials):
        # 随机放置奖品
        prize = random.randint(1, 3)
        # 玩家随机选择
        choice = random.randint(1, 3)
        
        # 主持人打开一扇有羊的门（不是玩家选的，也不是奖品）
        remaining = {1, 2, 3} - {choice, prize}
        if len(remaining) == 2:
            opened = random.choice(list(remaining))
        else:
            opened = remaining.pop()
        
        # 换门：从剩下的门中选择
        switch_choice = ({1, 2, 3} - {choice, opened}).pop()
        
        if switch_choice == prize:
            switch_wins += 1
        if choice == prize:
            stay_wins += 1
    
    print(f"换门胜率: {switch_wins / trials:.4f}")   # 约 0.6667
    print(f"不换胜率: {stay_wins / trials:.4f}")     # 约 0.3333

monty_hall()
```

---

## 十二、常用判断/统计写法

### 统计两个字符串相同位置相同字符数量
```python
# 核心写法
sum(1 for o, u in zip(原字符串, 对比字符串) if o == u)

# 示例
print(sum(1 for o, u in zip("12345", "13399") if o == u))  # 2（1和3匹配）
```

### 列表去重并保持顺序 ⭐
```python
lst = [1, 2, 2, 3, 3, 3]
print(list(dict.fromkeys(lst)))   # [1, 2, 3]
```

### 快速统计元素频次 ⭐
```python
from collections import Counter
c = Counter([1, 2, 2, 3, 3, 3])
print(c[3])        # 3
print(c.most_common(1))  # [(3, 3)]
```

---

## 十三、文件与输入输出 ⭐

### 文件读写
```python
# 读取全部
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
    lines = f.readlines()

# 逐行读取（省内存）
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())

# 写入
with open("out.txt", "w") as f:
    f.write("hello\n")
```

### 竞赛快速输入
```python
import sys

# 快速读取所有数据
data = sys.stdin.read().split()

# 逐行处理
for line in sys.stdin:
    a, b = map(int, line.split())
    print(a + b)
```


## 十四、NumPy库

### 一、NumPy 是什么？
- **NumPy** = Numerical Python（数值Python）
- 是 Python **最基础、最核心**的科学计算库
- 主要用来处理**数组、矩阵、数学运算、数据分析**
- 比普通列表**运算更快、更方便、更适合数学计算**

---

### 二、NumPy 最核心的数据结构：ndarray（数组）
#### 1. 创建数组
```python
import numpy as np

# 从列表创建
arr = np.array([1,2,3])

# 全0数组
np.zeros(5)

# 全1数组
np.ones(5)

# 等差数列
np.arange(1,10,2)

# 随机数组
np.random.rand(3)
```

#### 2. 数组特点
- 可以是 **1维、2维（矩阵）、3维**
- **所有元素类型必须相同**（int/float）
- 运算速度远快于列表
- 支持**向量化运算**（直接整体加减乘除）

---

### 三、NumPy 最强大功能：向量化运算
#### 1. 数组 + 数字（广播机制）
```python
arr = np.array([1,2,3])
arr + 10   # [11,12,13]
arr * 2    # [2,4,6]
```

#### 2. 数组 + 数组（对应位置运算）
```python
a = np.array([1,2,3])
b = np.array([4,5,6])

a + b  # [5,7,9]
a - b
a * b
a / b
```

#### 3. 重要规则
- **长度相同 → 正常计算**
- **长度不同 → 报错（无法广播）**
- **列表只能拼接，NumPy 数组才能数学计算**

---

### 四、数组的常用属性
```python
arr = np.array([[1,2],[3,4]])

arr.ndim    # 维度
arr.shape   # 形状（几行几列）
arr.size    # 总元素个数
arr.dtype   # 元素类型
```

---

### 五、索引与切片（和列表相似）
```python
arr = np.array([10,20,30,40])

arr[0]       # 取第一个
arr[1:3]     # 切片
arr[arr>20]  # 条件筛选
```

---

### 六、常用数学函数
```python
np.sum(arr)    # 求和
np.mean(arr)   # 平均值
np.max(arr)    # 最大值
np.min(arr)    # 最小值
np.std(arr)    # 标准差
np.sqrt(arr)   # 开平方
```

---

### 七、矩阵（二维数组）操作
```python
a = np.array([[1,2],[3,4]])
b = np.array([[5,6],[7,8]])

a + b          # 对应相加
a.dot(b)       # 矩阵乘法
a.T            # 矩阵转置
```

---

### 八、NumPy 与 Python 列表的区别（必考！）
| 功能 | Python 列表 | NumPy 数组 |
|------|------------|------------|
| 数据类型 | 可混合 | 必须统一 |
| 运算速度 | 慢 | 极快 |
| `a + b` | 拼接 | 对应相加 |
| 数学计算 | 麻烦 | 简单强大 |

---

### 九、最常见坑点
1. **长度不同的数组不能直接运算**
2. **数组一旦创建，数据类型固定**
3. **切片是引用，不是副本（修改会影响原数组）**

---

### 十、一句话总结
NumPy 是 Python 中用于**数值计算**的核心库，提供了高性能的 **ndarray 数组结构**，支持**向量化运算、矩阵操作、数学统计函数**，相比普通列表运算更简洁高效，广泛应用于数据分析、机器学习、科学计算等领域，是 Python 数据科学生态的基础工具。



## 附录：速查表

| 场景 | 推荐写法 |
|------|---------|
| 复制列表 | `b = a[:]` |
| 反转序列 | `s[::-1]` |
| 去重并保持顺序 | `list(dict.fromkeys(lst))` |
| 统计频次 | `Counter(lst)` |
| 排序自定义 | `sorted(lst, key=func)` |
| 无限循环 | `cycle(iterable)` |
| 排列组合 | `permutations/combinations` |
| 默认值字典 | `defaultdict(list/int)` |
| 剔除字典键遍历 | `dict.keys() - {key}` |
| 快速读入 | `sys.stdin.read().split()` |
| 生成随机整数 | `randrange(a, b)` |
| 设置随机种子 | `random.seed(n)` |
