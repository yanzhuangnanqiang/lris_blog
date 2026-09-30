---
title: WSL2 开发环境搭建笔记
date: 2025-04-01
tags: [工具, 环境, Linux,学习]
summary: 在 Windows 上配置 WSL2 + Ubuntu 开发环境的完整流程
cover:4.jpeg
---

## 安装 WSL2

以管理员身份打开 PowerShell 或 Windows Terminal：

```bash
wsl --install -d Ubuntu
```

重启电脑后，Ubuntu 会自动启动，设置用户名和密码即可。

验证安装版本：

```bash
wsl -l -v
```

确保 VERSION 列显示 `2`。如果是 1，升级：

```bash
wsl --set-version Ubuntu 2
```

## 换源

Ubuntu 默认源在国外，下载慢。换成国内镜像：

```bash
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
sudo apt update && sudo apt upgrade -y
```

## 安装 Node.js

推荐用 nvm 管理版本，不要直接 apt install：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

重启终端后：

```bash
nvm install --lts
nvm use --lts
node -v
```

## 安装 Git

```bash
sudo apt install git -y
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

建议同时配置 Windows 侧的 Git 凭据管理器，避免每次输入密码：

```bash
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
```

## VSCode 远程开发

安装 VSCode 插件 **WSL**（ms-vscode-remote.remote-wsl）。

在 WSL 终端中进入项目目录，输入：

```bash
code .
```

VSCode 会自动在 WSL 环境中打开，终端也直接连到 Linux。

## 文件互访

- Windows 访问 Linux 文件：`\\wsl$\Ubuntu\home\用户名`
- Linux 访问 Windows 文件：`/mnt/c/`

> 注意：项目文件建议放在 Linux 文件系统中（`~/project`），不要放 `/mnt/c/` 下，否则 `npm install` 和文件监听会很慢，因为要跨文件系统翻译。

## WSL2 内存限制

WSL2 默认会吞掉一半物理内存。创建 `%UserProfile%\.wslconfig`：

```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

重启 WSL：

```bash
wsl --shutdown
```

## 常用命令速查

| 场景 | 命令 |
|------|------|
| 进入 WSL | `wsl` |
| 关机 | `wsl --shutdown` |
| 列出发行版 | `wsl -l -v` |
| 删除发行版 | `wsl --unregister Ubuntu` |
| 导出备份 | `wsl --export Ubuntu backup.tar` |
| 导入恢复 | `wsl --import Ubuntu .\Ubuntu backup.tar` |

## SSH 密钥与免密登录

```bash
# 生成密钥（一路回车即可，passphrase 可留空）
ssh-keygen -t ed25519 -C "你的邮箱"

# 查看公钥，粘到 GitHub → Settings → SSH and GPG keys → New SSH key
cat ~/.ssh/id_ed25519.pub

# 起 agent 并把私钥加进去，避免每次输密码
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 验证
ssh -T git@github.com
```

> 注意：`~/.ssh` 的权限必须收紧，否则 ssh 会直接拒绝使用这个密钥：
>
> ```bash
> chmod 700 ~/.ssh
> chmod 600 ~/.ssh/id_ed25519
> ```
>
> 另外，WSL 的 `~/.ssh` 和 Windows 的 `C:\Users\你\.ssh` 是**互不相干的两套**。在 WSL 里执行 `git push` 用的是 WSL 这套，第一次用会发现"明明 Windows 上配过了却还要密码"，就是这里。

## 安装 Docker（含 systemd 那个坑）

WSL2 里可以装原生 Docker，比跑 Docker Desktop 轻得多：

```bash
curl -fsSL https://get.docker.com | sudo sh

# 把自己加进 docker 组，否则每条命令都要 sudo
sudo usermod -aG docker $USER
```

**重新登录后才生效。** 另外必须先打开 systemd，否则 `systemctl` 不可用、容器行为也会异常：

```ini
# /etc/wsl.conf
[boot]
systemd=true
```

```bash
wsl --shutdown        # 在 Windows 侧执行，然后重新进入 WSL
systemctl status docker
```

> 注意：开了 systemd 之后 WSL 启动会慢一点，属正常。也别和 Docker Desktop 同时开——两者会争同一个 `docker` 命令和同一个端口。

## 时区与中文环境

```bash
# 时区错了，git 提交时间、日志时间会全是偏的
sudo timedatectl set-timezone Asia/Shanghai
date

# 中文 locale（程序报 "Cannot set locale" 就是这里没配）
sudo apt install -y locales
sudo locale-gen zh_CN.UTF-8 en_US.UTF-8
sudo update-locale LANG=zh_CN.UTF-8
```

> 终端里中文显示成方块时，是字体缺中文字形——装个 Nerd Font（如 `JetBrainsMono Nerd Font`）并在终端设置里指定即可。

## 常见报错速查

| 现象 | 原因 | 处理 |
|------|------|------|
| `wsl --install` 卡住或失败 | Windows 相关功能没启用 | 管理员 PowerShell 里启用"适用于 Linux 的 Windows 子系统"和"虚拟机平台"，然后重启 |
| `WslRegisterDistribution failed with error: 0x80370102` | BIOS 里虚拟化没开 | 进 BIOS 打开 Intel VT-x / AMD-V |
| Linux 里 `/mnt/c` 极慢，`npm install` 卡死 | 跨文件系统读写 | 项目放 `~/` 下，别放 `/mnt/c/` |
| `System has not been booted with systemd` | 没配 `/etc/wsl.conf` | 加 `[boot] systemd=true`，再 `wsl --shutdown` 重进 |
| 内存被 WSL 吃掉一大半 | 默认占一半物理内存 | 配 `%UserProfile%\.wslconfig`（见上文）|
| 休眠后时间变慢 | WSL2 虚拟机时钟不同步 | `sudo hwclock -s`，或 `wsl --shutdown` 重进 |
| Windows 上访问不到 Linux 里的端口 | 服务只监听了 `127.0.0.1` | 让服务监听 `0.0.0.0` |
| `chmod` 改了权限但没生效 | 文件在 `/mnt/c/` 下（DrvFs 不认 Linux 权限）| 用 `metadata` 挂载选项，或把文件移到 Linux 文件系统 |