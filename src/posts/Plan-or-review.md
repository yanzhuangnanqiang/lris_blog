---
date: 2026-05-28
category: 沉思
photo: "6"
---

明明给自己规定了今天的计划，但是还是因为某些原因没有完成（指的是今天我的博客又碰上Bug了）。

现在来浅聊一下 我今天碰上的Bug吧。

1. 文章目录（大活）
从零搭了 TableOfContents 组件，桌面端 sticky 右栏、移动端浮层滑动。中间反复调了不下十轮位置——top 从 96→80→110→60→40→70→10→5→2px，最后定在 2px。布局也从 flex→grid→absolute→fixed→sticky 绕了一圈，最后还是 sticky 在 reader-wrapper 里。虽然说最后我也没觉得改的有多好看能用就行了。

教训：我没问清楚AI"目录放哪"就动手改了几十次 CSS。以后必须让AI执行Plan mode, 先搞懂我的意思再说 。

2. 音乐切歌修复（最折腾）
createMediaElementSource 每个 audio 只能调一次。原代码每次切歌都断连重建，第二次就报错。修了又改崩了三四次——destroy/重建方案、精简方案都试了，最后发现两个函数各改一行就够了：initAnalyser 包裹 if (!audioCtx)，stopVisualizer 删掉 disconnect。

教训：问题很简单，是我把简单问题搞复杂了。

3. 首页返回滚动（最神奇）
keep-alive 没用，sessionStorage 存了也恢复不了，因为图片加载导致页面高度变化冲掉 scrollTop。最后用了多级延迟（nextTick → RAF → 80ms）等图片占位，再将其下移100px成功解决了。 我都不知道怎么解决的。

教训：Safari scroll restoration 和图片懒加载的坑一辈子都踩不完。

总结，有的问题必须经时间得磨练，才能见到真知。比如说今天，所以说 ，任务完不成真我都自愿得问题，也就去外面吹了个晚风 ，小憩了一会。



