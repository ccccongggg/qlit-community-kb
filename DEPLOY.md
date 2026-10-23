# 部署与内容维护手册

齐鲁理工学院 · WorkBuddy 社群知识库
架构：**GitHub 仓库（唯一内容源）→ EdgeOne Pages 自动构建 → 自定义域名**

```
GitHub: ccccongggg/qlit-community-kb
   │  每次 push（含后台编辑产生的提交）自动触发
   ▼
EdgeOne Pages 构建：npm install && npm run build  →  public/
   │
   ▼
线上站点  +  /admin/ 内容管理后台
```

> 为什么走这条链路：在后台改一篇文章 = 一次 Git 提交，站点自动重建。
> 内容永远是纯文本 Markdown，随时可以拉回本地用任何工具处理（这就是「路线 3」的退路）。

---

## 一、一次性部署（约 10 分钟，只需要做一次）

### 1. 在 EdgeOne Pages 新建项目

1. 打开 <https://console.cloud.tencent.com/edgeone/pages>，用你的腾讯云账号登录；
2. 点「创建项目」→ 选「**导入 Git 仓库**」→ 授权 GitHub，选择 `ccccongggg/qlit-community-kb`；
3. 构建配置按下表填（**这一步填错会导致构建失败**）：

| 配置项 | 填写内容 |
|---|---|
| 框架预设 | 无 / 其他（None） |
| 构建命令 | `npm run build` |
| 输出目录 | `public` |
| 安装命令 | `npm install`（默认即可） |
| Node 版本 | **20**（仓库里有 `.node-version`，控制台能选就选 20） |

4. 点「部署」，首次构建约 1–3 分钟。成功后会给一个 `xxx.edgeone.app` 的临时域名。

### 2. 绑自定义域名（可选但推荐）

1. 项目 → 「域名管理」→ 添加域名，例如 `kb.你的域名.com`；
2. 按提示到域名 DNS 加一条 CNAME，指向 EdgeOne 给的接入地址；
3. 等证书签发（免费，通常几分钟）。国内节点需要域名已完成 ICP 备案。

### 3. 打开内容管理后台

```
https://<你的域名>/admin/
```

首次进入会看到登录界面，按下面第二节拿 token 登录。

---

## 二、后台登录（Personal Access Token 方式）

单人 / 小团队用这个就够，**不需要任何服务器**。

1. 打开 <https://github.com/settings/tokens?type=beta>（Fine-grained token）；
2. 「Generate new token」：
   - Repository access → 选 **Only select repositories** → `qlit-community-kb`
   - Permissions → Repository permissions：
     - **Contents: Read and write**（必须）
     - **Pull requests: Read and write**（要用「草稿审核」流程时必填）
3. 生成后复制 token（`github_pat_...`），回到 `/admin/` 点 **Sign in with Token** 粘贴。

> token 存在你自己的浏览器 localStorage 里，不会上传到站点。
> 换电脑 / 清缓存后需要重新粘贴一次。
> 如果 token 泄露了，去 GitHub 撤销重建即可。

### 以后要给不带 GitHub 账号的同学用？

改成 OAuth 授权码登录（免费，Cloudflare Workers）：

1. GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App
   - Homepage URL：你的站点域名
   - Authorization callback URL：`https://<worker 地址>/callback`
   - 记下 Client ID / Client Secret
2. 部署官方组件：<https://github.com/sveltia/sveltia-cms-auth>（`wrangler deploy`，把 Client ID/Secret 填进环境变量）
3. 打开 `source/admin/config.yml`，把 `# base_url:` 那行取消注释并填 Worker 地址，push 一次。

---

## 三、日常维护

### 在后台改内容（推荐，不用碰代码）

打开 `/admin/`，左侧菜单：

| 菜单 | 管什么 | 存到哪 |
|---|---|---|
| **文章** | 知识库经验帖、问题库案例 | `source/_posts/*.md` |
| **社群大佬** | 成员名单、能力条、项目 | `source/_data/people.yml` |
| **活动库** | 即将举办 / 往期回顾卡片 | `source/_data/activities.yml` |
| **首页文案** | 首屏大标题、副标题、按钮、跑马灯 | `source/_data/home.yml` |
| **板块首页** | 知识库 / 问题库 / 社群大佬 三个页面正文 | `source/<板块>/index.md` |

改完点右上角 **Publish**（发布），会生成一次 Git 提交，EdgeOne 自动重新构建，约 1–2 分钟线上生效。

### 新增一个成员（不用写代码）

后台 →「社群大佬」→ 成员列表底部「Add 成员」→ 填 slug / 姓名 / 头像 / 头衔 / 标签 / 介绍 / 能力条 / 项目 → Publish。
列表页卡片和 `/people/<slug>/` 详情页都会自动生成。

### 新增一场活动

后台 →「活动库」→ 在「即将举办」里 Add → 活动结束后把这一项从 upcoming 挪到 past（或直接改字段）。

### 本地改（改样式、改模板时用）

```bash
npm install          # 首次
npm run dev          # 本地预览 http://localhost:4000
npm run build        # 生成 public/
git add -A && git commit -m "改了什么" && git push
```

---

## 四、退路：改回「本地构建 + WorkBuddy 发布」（路线 3）

需要把站点交给学校官方或断网环境时：

1. `git clone https://github.com/ccccongggg/qlit-community-kb`；
2. `npm install && npm run build`，产物在 `public/`；
3. 用 WorkBuddy 的发布能力指向 `public/` 目录即可。

内容和样式完全一致，因为仓库里存的就是全部源码（主题也一起在 `themes/butterfly`）。

---

## 五、常见问题

**后台打开是空白 / 控制台报 `Sveltia CMS only works with HTTPS or localhost URLs`**
→ CMS 的安全限制：**必须用 https 访问 `/admin/`**（`localhost` 例外）。
EdgeOne 默认就是 https，正常情况不会遇到；如果是用 http 的自定义域名或裸 IP 访问就会这样。

**构建失败 `ERR_PNPM_NO_LOCKFILE` / 依赖版本不一致**
→ 确认构建命令是 `npm install`（不是 pnpm），Node 版本 20。

**后台能登录但看不到文章**
→ 检查 `config.yml` 里 `repo` 是否写对，以及 token 是否勾了 Contents 读写权限。

**改了后台内容但线上没变**
→ EdgeOne 项目「部署记录」里看最新一次构建是否成功；失败点进去看日志。

**图片传上去不显示**
→ 后台图片默认存 `source/img/uploads/`，构建后路径是 `/img/uploads/xxx`，两者都在 `config.yml` 里定义，别只改一个。

**站点标题预览 / 分享卡片里的图片地址不对**
→ 换域名后要改两处：根目录 `_config.yml` 的 `url:`、`source/admin/config.yml` 的 `site_url:`，
改成新的正式域名后 push 一次（影响 og:image、sitemap 的绝对地址）。

**中文界面没生效**
→ `config.yml` 的 `locale: zh_Hans`，Sveltia 若某版本不认会回退英文，不影响使用。

---

## 改代码后必须知道的两个坑

**1. 改了 `scripts/` 里的东西，一定要全量重建**

`scripts/acts-tag.js`、`people-generator.js`、`icon-tag.js` 是 Hexo 的 tag / generator。
Hexo 会把**渲染后的正文**缓存在 `db.json` 里，判断依据是「源 md 有没有变」。
只改脚本、不改 md 时，`hexo generate` 会直接复用旧正文，你的改动**看起来完全没生效**。

正确姿势：
```bash
rm -f db.json            # 关键：清掉正文缓存
npx hexo generate
```
改主题 CSS / JS 不受影响（那是静态资源，每次都会复制）。

**2. 主题资源带版本号，改完要手动 +1**

`themes/butterfly/_config.yml` 的 `inject` 段里：
```yaml
- <link rel="stylesheet" href="/css/custom.css?v=20261023s">
- <script src="/js/custom.js?v=20261023d" defer></script>
```
静态托管会缓存旧文件，不加版本号访客可能继续用旧样式。改 CSS 就升 css 的号，改 JS 就升 js 的号。

**3. 图片也要版本号（第二条版本线，跟 CSS/JS 分开）**

根目录 `_config.yml` 的 `kb_asset_ver: '20261023c'`，配合 `scripts/kb-asset.js` 注册的 `kbimg()` helper：

```pug
img.post-bg(src=kbimg(postCover))
img.people-card__avatar(src=kbimg(p.avatar))
```

规则：
- **换了图片内容（同名覆盖）→ 必须升 `kb_asset_ver`**。否则浏览器按 URL 缓存，访客看到的还是旧图。
- 全新文件名（如新增 `thumb-xxx.svg`）严格来说不用升，但一起升最省心。
- 新加图片引用时，pug 里一律写 `kbimg(path)` 而不是 `url_for(path)`；`scripts/acts-tag.js` 那种拼字符串的地方按同样规则手拼 `?v=`。

反面教材：曾把活动封面的 emoji 换成 SVG，线上文件字节已更新，但用户截图里仍是旧 emoji —— 就是这条没做，浏览器一直给缓存。加了 helper 之后彻底解决。

## 首页结构（改版后）

`themes/butterfly/layout/index.pug` 的 `block content` 现在是四段：

1. **从这里开始** — 4 张导览卡，数据在 `source/_data/home.yml` 的 `sections:`
2. **新人三步** — 3 张步骤卡，数据在 `home.yml` 的 `onboard:`
3. **最新动态** — Butterfly 原生文章列表，被 CSS 改造成「58px 方形缩略图 + 右侧文字」的紧凑索引
4. 右侧 `#aside-content` 在首页被 `display:none` 隐藏

紧凑索引用的封面是 **400×400 纯图标方形图**（`source/img/thumb-*.svg`），在每篇文章的 front-matter 里用 `cover_thumb` 指定：

```yaml
cover: /img/cover-kb-member.svg        # 详情页/侧栏用的 16:9 大图
cover_thumb: /img/thumb-kb-member.svg  # 首页列表用的方图（可选，缺省回退 cover）
```

**别把 16:9 横图塞进 58px 方格**：`object-fit:cover` 会裁出中间一块，横图左侧的标题文字必然露半截残影。要么补一张方图，要么不给 `cover_thumb`（走 `no-cover` 无图分支）。

## 站徽 / favicon

四个地方是同一个视觉（深墨玉璧 + 青绿细环 + 衬线「知」+ 环上朱砂点）：

| 文件 | 用途 | 尺寸 |
|---|---|---|
| CSS `.kb-mark` | 顶栏左上角（div 画的，不是图片） | 28px |
| `source/img/favicon.svg` | 浏览器标签页 | 32×32 |
| `source/img/avatar.svg` | 侧栏头像 / og:image / twitter:image | 200×200 |
| `source/img/logo-mark.svg` | 备用方标 | 48×48 |

改站徽要**四处一起改**，否则顶栏和标签页会露出两代风格。

> 已知项：`og:image` 指向 SVG，微信 / Twitter 抓取时普遍不认 SVG，分享卡片可能无图。要修得另出一张 PNG 并改 `themes/butterfly/_config.yml` 的 `og_image` / `avatar.img`。

## 双主题说明

站点**没有用** Butterfly 原生的 `data-theme` 暗色模式（已在 `themes/butterfly/_config.yml` 里 `darkmode.enable: false` 关掉）。
现在的机制是自定义的：
- 深色（默认）：`:root` 里的 token
- 浅色：`body.light` 类覆盖 token
- 持久化：`localStorage['kb-theme']`，值为 `dark` / `light`
- 切换按钮：顶栏 `#themeToggle`

所以：**别再开 Butterfly 的暗色模式**，否则会出现两套状态互相打架、页面上多一个月亮按钮。
