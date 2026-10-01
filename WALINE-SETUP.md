# Waline + Supabase 评论区搭建指南

> 把博客评论区从 giscus(GitHub Discussions)换成 **Waline**(评论系统)+ **Supabase**(PostgreSQL 数据库)。
> 目的:支持**自定义表情包面板**和**图片/GIF 上传**,这是 giscus 做不到的。

---

## 当前进度

- [x] 客户端代码:新增 `src/components/app/WalineComment.vue`
- [x] 客户端代码:文章页 `PostDetail.vue` 已换用 Waline
- [x] 建表脚本已就位:`scripts/waline.pgsql`
- [x] ① 在 Supabase 执行建表 SQL
- [x] ② 把 Waline 部署到 Vercel
- [x] ③ 填 Vercel 环境变量(踩过 `EAUTHQUERY`,是 `PG_USER` 没带 `.项目ref`)
- [x] ④ 绑自定义域名 `comment.thineiris.top`
- [x] ⑤ 注册管理员
- [x] ⑥ 本地测试跑通(踩过 Vite `Outdated Optimize Dep`,删 `node_modules/.vite` 重启即可)
- [x] ⑦ 笔记页两处也换成 Waline
- [x] ⑧ 图片上传(Supabase Storage 直传,见下)
- [ ] ⑨ 表情包 / 反应图国内可用性(可选,见文末)

---

## 名词速查(不用记,卡住回来看)

| 名词 | 是什么 |
|------|--------|
| **giscus** | 现在的评论区,借用 GitHub 的讨论串。**不能发表情包、不能传图** |
| **Waline** | 要换上的评论系统。**有表情包面板、能传图/GIF、支持匿名评论** |
| **Supabase** | 一个免费的 PostgreSQL 数据库托管服务,给 Waline 存评论用 |
| **Vercel** | 部署平台。博客本身就在这上面;Waline 服务端也要单独部署一份 |
| **PostgreSQL / MySQL** | 数据库的两种"牌子",语法不通用(像安卓线插不进苹果口)。**Supabase 是 PostgreSQL** |
| **连接串** | 一串 `postgresql://...`,Waline 靠它连上数据库 |

> ⚠️ 网上教程很多给的是 **MySQL 版** SQL(带反引号 `` ` ``、`AUTO_INCREMENT`、`ENGINE=InnoDB`)。
> **那份在 Supabase 上跑不了**,必须用本项目 `scripts/waline.pgsql` 里的 PostgreSQL 版。

---

## 阶段一:建 Supabase 数据库

### 1. 建项目
supabase.com 建项目(Free Plan),**记下数据库密码**。

### 2. 建表(⚠️ 最容易漏的一步)
1. 打开本项目文件 [`scripts/waline.pgsql`](scripts/waline.pgsql)
2. `Ctrl + A` 全选 → `Ctrl + C`
3. Supabase → **SQL Editor → New query** → `Ctrl + V` → 点 **Run**
4. 成功标志:左侧 **Table Editor** 出现三张表 `wl_Users` / `wl_Comment` / `wl_Counter`

> 判据:这份 SQL 里**没有**反引号、**没有** `AUTO_INCREMENT`、**没有** `ENGINE=InnoDB`。

### 3. 拿连接串
项目首页右上角 **`Connect`** 按钮 → **Connection String** → 选 **`Session pooler`**。
> 必须 Session pooler:Direct connection 是 IPv6,Vercel 免费环境只支持 IPv4,用了必失败。

**本项目已经拿到的值(密码不在此处记录,自行保管):**

| 项 | 值 |
|----|-----|
| host | `aws-0-ap-northeast-2.pooler.supabase.com` |
| port | `5432` |
| user | `postgres.mwetakljakqlmhteaqdk` |
| db | `postgres` |
| 区域 | `ap-northeast-2`(首尔) |

---

## 阶段二:把 Waline 部署到 Vercel

1. 打开官方部署页 <https://waline.js.org/guide/deploy/vercel.html> → 点页面上的 **Deploy** 按钮 → 用 GitHub 登录授权
2. 填个项目名(如 `iris-waline`)→ **Create**,等 1–2 分钟
3. ⚠️ **不要用它引导的 Neon 数据库** —— 那步**跳过**,我们用 Supabase
4. 进项目 → **Settings → Environment Variables**,填下表:

| 变量名 | 值 |
|--------|-----|
| `PG_HOST` | `aws-0-ap-northeast-2.pooler.supabase.com` |
| `PG_PORT` | `5432` |
| `PG_USER` | `postgres.mwetakljakqlmhteaqdk` |
| `PG_PASSWORD` | 你的数据库密码(建项目时那个) |
| `PG_DB` | `postgres` |
| `PG_SSL` | `true` |
| `JWT_SECRET` | `openssl rand -base64 32` 的输出 |

5. 回 **Deployments** → 最新一条 → **⋯ → Redeploy**,让变量生效
6. Ready 后点 **Visit**,拿到形如 `https://iris-waline.vercel.app` 的地址(**先别用**,国内打不开,下一步绑域名)

---

## 阶段三:绑自定义域名(必须)

> 原因:`vercel.app` 域名在大陆访问不了。

1. Vercel 项目 → **Settings → Domains** → 加 `comment.thineiris.top`
2. **Cloudflare** → thineiris.top → **DNS → Add record**:
   - Type:`CNAME`
   - Name:`comment`
   - Target:`cname.vercel-dns.com`
   - **Proxy status:选灰色云「DNS only」** ⚠️ 不能开橙色小黄云(会导致评论里 IP 全乱)
3. 回 Vercel 等状态变 **Valid** → 服务地址就是 `https://comment.thineiris.top`

---

## 阶段四:注册管理员 + 配表情包

1. 打开 `https://comment.thineiris.top/ui/register`,**第一个注册的账号自动成为管理员**
2. 后台 `/ui` 里可挂 emoji pack(表情包面板)—— 具体包到跑通后再配

---

## 阶段五:本地测试

1. 如果服务域名**不是** `comment.thineiris.top`,需改 [`src/components/app/WalineComment.vue`](src/components/app/WalineComment.vue) 里的 `SERVER_URL` 常量
2. 本地跑:
   ```bash
   npm run dev
   ```
3. 打开任意文章页 → 应出现评论框 → 发一条
4. 去 Supabase **Table Editor → `wl_comment`** 看有没有写进去

---

## 阶段六:笔记页切换(已完成)

[`src/views/TuberoseNotes.vue`](src/views/TuberoseNotes.vue) 里的两处 `<GiscusComment>` 已换成 `<WalineComment :path dark>`(深色阅读面板)。

---

## 图片上传(Supabase Storage 直传)

**为什么需要:** Waline 服务端**不提供图床**;客户端默认把图片转成 base64 塞进评论,硬限 **128KB**,GIF 必被挡。所以用 Supabase Storage 当图床。

**做法:** 前端 `WalineComment.vue` 里自定义 `imageUploader`,让浏览器直接把文件 POST 到 Supabase Storage,拿回公开链接插进评论。**不需要自建服务端。**

### Supabase 端配置(已完成,记录备查)

1. Storage → 新建 **public** bucket,名 `waline`
2. bucket 限制:File size limit `5 MB`,Allowed MIME types `image/*`
3. SQL Editor 跑:
   ```sql
   create policy "waline anon upload"
   on storage.objects for insert to anon
   with check (bucket_id = 'waline');
   ```
4. Settings → API Keys 拿 **publishable key**(公开,写在前端不敏感)

### 已知取舍

- bucket 对所有人可写 → 有被灌文件的风险,靠「5MB + 仅图片」兜底;若被滥用,再改成「Vercel 函数 + secret key」模式。
- Supabase 图片域名 `*.supabase.co` 国内可访问性一般,可能偏慢;太慢的话换 Cloudflare R2 + 自定义域名。
- 客户端自带的 **GIF 搜索走 Giphy(境外)**,国内访客用不了 —— 访客请走上传这条路。

---

## 常见报错对照

| 报错 / 现象 | 原因 |
|-------------|------|
| `relation "wl_Comment" does not exist` | 阶段一第 2 步建表 SQL 没执行 |
| `invalid input syntax for type integer` | 用了 MySQL 版 SQL / 导入脚本字段类型不对 |
| `Not IPv4 compatible` / `Not initialized` | 用了 Direct 连接,要换 **Session pooler** |
| 改昵称报 `500 invalid input syntax for integer` | `JWT_SECRET` 没设 |
| 评论区一直转圈 / 加载失败 | 域名没绑好(`vercel.app` 国内打不开) |
| `504 (Outdated Optimize Dep)` / `Failed to fetch dynamically imported module` | 新装了依赖(`@waline/client`)但 dev server 没重启 → Vite 预构建缓存过期。删 `node_modules/.vite` 后重启 `npm run dev`,浏览器 `Ctrl+Shift+R` 硬刷 |
| 评论里 IP 显示很怪 | Cloudflare 开了小黄云,要改回「仅 DNS」 |

---

## 注意事项

- **Supabase 免费项目 7 天无访问会自动暂停** → 低流量博客易踩,暂停后评论挂掉,需去控制台手动唤醒。缓解:以后可加个每周定时 ping。
- **老评论已迁到 `Comment.0.json`**,导入脚本待确认字段结构后再定(见后续)。
- **还原成本低**:3 个调用点(文章页 1 + 笔记页 2)已全换成 Waline;`GiscusComment.vue` 保留不删,想退回把调用点换回去即可。

---

## 客户端代码改动记录

| 文件 | 改动 |
|------|------|
| `src/components/app/WalineComment.vue` | 新增。props:`path`(评论归属,如 `/post/xxx`)、`dark`(深色容器);内含 `imageUploader` 直传 Supabase Storage |
| `src/views/PostDetail.vue` | `<GiscusComment :term>` → `<WalineComment :path>`,保留 `:key` |
| `src/views/TuberoseNotes.vue` | 两处同上(`dark`) |
| `src/components/app/GiscusComment.vue` | 保留不删(还原用) |
| `scripts/waline.pgsql` | 新增。Supabase 建表 SQL |
| `package.json` | 新增依赖 `@waline/client` |

> `:key` 必须保留:SPA 切文章/切笔记时组件会被复用,靠 `key` 强制重建,否则评论区停在上一篇。
