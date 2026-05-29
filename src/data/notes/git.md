---
title: Git / GitHub 协作终极小抄（一次到位版）
date: 2025-04-02
tags: [git,学习]
summary: 可以帮你巩固知识的git 学习清单
cover:1.jpeg
---


## 内容总结
---
> 默认约定：主分支叫 `main`，远端叫 `origin`。如果你仓库是 `master`，把命令里的 `main` 替换成 `master` 即可。  
> 总原则：**先 `git status`，再操作；不确定时先 `git fetch`。**

---

## 0）Git 的三层结构（必须理解）

- **Working Tree（工作区）**：你正在编辑的文件
- **Staging Area（暂存区 / index）**：准备提交的内容快照
- **Local Repository（本地仓库）**：commit 历史图

直觉对应：

- 改文件 → 工作区
- `git add` → 暂存区
- `git commit` → 本地仓库
- `git push` → 远端仓库（GitHub）
- `git fetch/pull` → 从远端拿历史到本地

---

## 2）第一次使用（初始化/克隆/基础配置）

### 2.1 初始化仓库（新项目）

bash

```
git init
```

### 2.2 克隆仓库

bash

```
git clone <repo-url>
```

### 2.3 基础身份配置（建议先配）

bash

```
git config --global user.name "YourName"
git config --global user.email "you@example.com"
```

查看配置：

bash

```
git config --global --list
```

---

## 3）状态与历史（高频）

### 3.1 当前状态（第一句必敲）

bash

```
git status
```

看分支与同步情况（非常有用）：

bash

```
git branch -vv
```

### 3.2 提交历史（推荐固定用）

bash

```
git log --oneline --decorate --graph -n 20
```

### 3.3 看某次提交改了啥

bash

```
git show <commit>
```

### 3.4 查某行是谁改的（定位问题）

bash

```
git blame <file>
```

---

## 4）日常提交：改 → add → commit

查看未暂存改动：

bash

```
git diff
```

暂存：

bash

```
git add <file>
git add .
```

查看将要提交的内容：

bash

```
git diff --staged
```

提交：

bash

```
git commit -m "docs: update notes"
```

---

## 5）提交信息规范（建议你长期用）

推荐（Conventional Commits 风格）：

- `feat:` 新功能
- `fix:` 修 bug
- `docs:` 文档/笔记
- `refactor:` 重构（不改变功能）
- `test:` 测试
- `chore:` 杂项（依赖/构建/格式化/脚本）

例子：

- `docs: add git push rejected troubleshooting`
- `fix: handle empty input in parser`
- `chore: format code`

---

## 6）暂存区高级（写笔记/写代码都很香）

### 6.1 交互式暂存（只 add 部分修改）

bash

```
git add -p
```

### 6.2 取消暂存（已 add 未 commit）

bash

```
git restore --staged <file>
```

### 6.3 撤销工作区改动（危险：会丢）

bash

```
git restore <file>
```

---

## 7）远端与 remote（你问过的 `git remote`）

查看远端：

bash

```
git remote
git remote -v
```

添加远端：

bash

```
git remote add <name> <url>
```

修改远端 URL（HTTPS ↔ SSH 常用）：

bash

```
git remote set-url origin <new-url>
```

删除/重命名：

bash

```
git remote remove <name>
git remote rename <old> <new>
```

查看 remote 详细信息：

bash

```
git remote show origin
```

---

## 8）fetch / pull / push（协作三件套）

### 8.1 fetch（安全：不改你文件，只更新远端指针）

bash

```
git fetch origin
```

### 8.2 pull（fetch + 合并）

默认可能是 merge，也可能配置为 rebase。

推荐你用（保持历史直）：

bash

```
git pull --rebase
```

### 8.3 push（推送）

bash

```
git push
```

首次推新分支：

bash

```
git push -u origin <branch>
```

---

## 9）分支（branch/switch）

创建并切换：

bash

```
git switch -c feature/my-change
```

切回主分支：

bash

```
git switch main
```

删除分支：

bash

```
git branch -d feature/my-change
git branch -D feature/my-change
```

---

## 10）push 被拒（non-fast-forward）怎么处理（最常见）

报错关键词：

- `rejected (fetch first)`
- `remote contains work that you do not have locally`

推荐一把梭（最常用）：

bash

```
git pull --rebase
git push
```

拆开更清楚：

bash

```
git fetch origin
git rebase origin/main
git push
```

---

## 11）merge vs rebase（你应该怎么选）

- **merge**：不改历史，可能多一个 merge commit，直观
- **rebase**：历史更直，但会改写提交 ID（适合个人分支整理后再推）

常用 rebase：

bash

```
git fetch origin
git rebase origin/main
```

---

## 12）冲突解决模板（merge/rebase 通用）

1. 看冲突文件列表：

bash

```
git status
```

2. 打开文件，清掉以下标记并整里成最终内容：

- `<<<<<<<`
- `=======`
- `>>>>>>>`

3. 标记已解决：

bash

```
git add <file>
```

4. 继续：

- rebase：

bash

```
git rebase --continue
```

- merge：

bash

```
git commit
```

放弃这次操作（回到开始前）：

bash

```
git rebase --abort
git merge --abort
```

---

## 13）stash（临时收起“未提交改动”）

保存（建议写说明）：

bash

```
git stash push -m "WIP: ..."
```

查看：

bash

```
git stash list
git stash show -p stash@{0}
```

恢复并删除：

bash

```
git stash pop
```

仅恢复不删除（更安全）：

bash

```
git stash apply
```

包含未跟踪文件：

bash

```
git stash push -u -m "WIP: include untracked"
```

---

## 14）撤销与回退：revert vs reset（超级重要）

### 14.1 已 push 的提交要撤销（团队最安全）

bash

```
git revert <commit>
git push
```

### 14.2 reset（谨慎：可能改历史）

bash

```
git reset --soft <hash>   # 退回提交，保留在暂存区
git reset --mixed <hash>  # 退回提交，保留在工作区（默认）
git reset --hard <hash>   # 退回提交，丢弃改动（危险）
```

---

## 15）reflog（误操作救命）

当你“东西突然没了”，先：

bash

```
git reflog
```

然后回到某个状态：

bash

```
git reset --hard <hash-from-reflog>
```

---

## 16）整理提交历史：交互式 rebase（让 PR 更漂亮）

在你自己的分支上：

bash

```
git fetch origin
git rebase -i origin/main
```

改写历史后推送通常需要：

bash

```
git push --force-with-lease
```

> `--force-with-lease` 比 `--force` 安全：如果远端被别人更新过，它会拒绝你覆盖。

---

## 17）.gitignore 的真实规则（新手常错）

- `.gitignore` 只能忽略 **未被跟踪** 的文件
- 已提交过的文件写进 `.gitignore` 不会自动停止跟踪

停止跟踪但保留本地文件：

bash

```
git rm --cached <file>
git commit -m "chore: stop tracking <file>"
```

---

## 18）tag / release（打版本点）

创建 tag：

bash

```
git tag v1.0.0
git push origin v1.0.0
```

列出 tag：

bash

```
git tag
```

---

## 19）大文件与 Git LFS（常见坑：push 失败）

当你 push 时提示文件过大（比如 >100MB），用 Git LFS：

安装 Git LFS 后：

bash

```
git lfs install
git lfs track "*.zip"
git add .gitattributes
git add <big-file>
git commit -m "chore: track large files via LFS"
git push
```

---

## 20）submodule（子模块：遇到再用）

添加：

bash

```
git submodule add <url> path/to/submodule
```

克隆后初始化：

bash

```
git submodule update --init --recursive
```

---

## 21）二分定位回归 bug：git bisect（很强）

bash

```
git bisect start
git bisect bad
git bisect good <hash>
# 之后每次测试后标记 good/bad
git bisect reset
```

---

## 22）SSH（强烈推荐：绕开 HTTPS 证书/代理问题）

如果你遇到过类似：

- `unable to get local issuer certificate`
- `Failed to connect to github.com:443`

建议用 SSH：

生成 key：

bash

```
ssh-keygen -t ed25519 -C "you@example.com"
```

复制公钥（Windows PowerShell）：

PowerShell

```
notepad $env:USERPROFILE\.ssh\id_ed25519.pub
```

GitHub：Settings → SSH and GPG keys → New SSH key  
然后把 remote 改成 SSH：

bash

```
git remote set-url origin git@github.com:<user>/<repo>.git
```

测试：

bash

```
ssh -T git@github.com
```

---

## 23）网络/证书/代理常见问题速查（你之前就遇到过）

### 23.1 Windows Git HTTPS 证书校验失败（OpenSSL）

推荐让 Git 用 Windows 证书库：

bash

```
git config --global http.sslBackend schannel
```

### 23.2 检查是否有代理配置

bash

```
git config --global --get http.proxy
git config --global --get https.proxy
```

---

## 24）常用“保命命令清单”

- 我现在到底在干嘛？
    
    bash
    
    ```
    git status
    ```
    
- 我刚才做了什么导致不对？
    
    bash
    
    ```
    git reflog
    ```
    
- 我只想安全看看远端变了什么，不想动文件：
    
    bash
    
    ```
    git fetch origin
    git log --oneline --decorate --graph -n 20 main origin/main
    ```
    
- 我想放弃 rebase/merge 回到开始：
    
    bash
    
    ```
    git rebase --abort
    git merge --abort
    ```
    

---

## 25）推荐全局配置（减少踩坑）

pull 默认用 rebase：

bash

```
git config --global pull.rebase true
```

rebase 自动暂存未提交改动：

bash

```
git config --global rebase.autoStash true
```

---

## 26）最小安全工作流（背下来就够用）

日常：

bash

```
git add .
git commit -m "msg"
git push
```

push 被拒（远端更新了）：

bash

```
git pull --rebase
git push
```

冲突：

bash

```
git status
# 修文件，清冲突标记
git add <file>
git rebase --continue
```

---

# 1）GitHub Web（网页端）操作（按你要求：放最下面）

## 1.1 仓库浏览/定位/快捷键

- `t`：按文件名快速搜索并打开
- `y`：生成永久链接（固定到某次 commit，引用代码很重要）
- `b`：blame（逐行谁改的）
- `.`：github.dev 在线编辑器
- `/`：聚焦搜索框（视页面而定）

## 1.2 提建议的三种方式（从轻到重）

1. **Issue**：提 bug / 建议 / 讨论（最常用）
2. **Discussion**：偏想法交流（仓库开了才有）
3. **PR**：你直接改代码提交给维护者

## 1.3 网页端直接改文件并提 PR（无需本地 Git）

适合：改文档、改错字、小修复

1. 打开文件 → 点 **Edit（铅笔）**
2. 没权限会提示你 **Fork**
3. 改完滚到底部：
    - 选 **Create a new branch for this commit**
    - 分支名例：`docs/fix-typo`
4. 点 **Propose changes**
5. 点 **Open pull request**
6. 填 PR（推荐结构见 1.7）
7. **Create pull request**

## 1.4 标准贡献：Fork → 本地改 → PR（最常用协作方式）

1. 对方仓库右上角 **Fork** 到你账号
2. 克隆你 fork：
    
    bash
    
    ```
    git clone <fork-url>
    ```
    
3. 添加 upstream（原仓库）：
    
    bash
    
    ```
    git remote add upstream <upstream-url>
    ```
    
4. 同步主分支到最新：
    
    bash
    
    ```
    git switch main
    git pull --rebase
    ```
    
5. 从 main 开分支：
    
    bash
    
    ```
    git switch -c fix/xxx
    ```
    
6. 改、提交、推送：
    
    bash
    
    ```
    git add .
    git commit -m "fix: xxx"
    git push -u origin fix/xxx
    ```
    
7. 回 GitHub：会出现 **Compare & pull request** → 创建 PR

## 1.5 PR 里你会看到的关键区域

- **Conversation**：讨论、review 意见
- **Commits**：提交列表
- **Files changed**：最终 diff
- **Checks**：CI/Actions 结果（失败点进去看日志）

## 1.6 Review 后如何更新 PR

- 维护者让你改：继续在同一分支修改 → `commit` → `push`  
    PR 会自动更新，不用重新开。
- PR 有冲突：按项目规则处理（可能需要你 rebase 到最新 main）

## 1.7 PR 描述推荐模板（非常加分）

你可以复制这段到 PR 描述：

- **Problem / Motivation**
    - 这个 PR 解决什么问题？为什么要改？
- **What changed**
    - 改了哪些点（列 2~5 条）
- **How to test**
    - 怎么验证（命令/步骤/截图）
- **Screenshots (optional)**
- **Related issues**
    - Fixes #123 / Ref #456

## 1.8 PR 合并方式（维护者决定）

- **Merge commit**
- **Squash and merge**
- **Rebase and merge**

## 1.9 同步 upstream（Fork 很常用）

当原仓库更新了，你的 fork 也要跟上：

本地同步：

bash

```
git fetch upstream
git switch main
git rebase upstream/main
git push origin main
```