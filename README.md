# QLU Campus Hub · 齐鲁理工学院校园社群一体化仓库

> 将面向同一所学校的两类校园内容——**公开社群知识库**与**内部资源库**——统一收纳进同一个 Git 仓库，便于协同维护、统一部署与品牌一致。

## 0. 当前状态（已归并 ✅）

两个子项目的真实源码**已经归并进本仓库**，无需再手动搬运：

| 子项目 | 原仓库 | 原本地路径 | 现位置 |
|---|---|---|---|
| `community-kb`（公开） | `qlit-community-kb` | `E:/Workbuddy校园大使/workbuddy-kb` | `community-kb/` |
| `campus-library`（私有） | `campus-library` | `E:/School_knowledge/campus-library` | `campus-library/` |

归并时已排除 `node_modules`、`.git`、`public`/`dist` 构建产物与 Hexo `db.json`，保持仓库轻量、单一 git 历史。

## 1. 这个仓库解决什么问题

原本分散在两个独立仓库：

| 原仓库 | 可见性 | 技术栈 | 定位 |
|---|---|---|---|
| `qlit-community-kb` | Public | Hexo 8 + Butterfly + Sveltia CMS | 对外校园社群知识库 |
| `campus-library` | Private | Astro 7 + astro-pagefind | 对内校园资源库 |

两者**面向同一所学校（齐鲁理工学院 / QLU）**、**同一类目标（校园知识/资源沉淀）**、**同一技术家族（静态站点 + Sveltia/Pagefind 搜索）**，但分散维护会导致：内容重复、信息源分裂、品牌与导航不一致、部署与更新各自为政。

本仓库将二者合并为**单一 monorepo**：保留各自技术栈与可见性边界，同时统一文档、协作与发布流程。

## 2. 仓库结构

```
qlit-campus-hub/
├── README.md                 # 本文件：总览与协作规范
├── .gitignore
├── community-kb/             # 【公开】校园社群知识库 (Hexo 8 + Butterfly + Sveltia CMS)
│   ├── README.md             # 子项目文档（上游原版，含页面/维护入口）
│   ├── _config.yml           # Hexo 配置
│   ├── source/               # 文章/页面/资源（含 /admin/ Sveltia CMS 后台）
│   ├── themes/butterfly/     # Butterfly 主题（含社区样式 community.css / community.js）
│   ├── scaffolds/ scripts/ tooling/ docs/
│   └── DEPLOY.md MAINTENANCE.md CHANGELOG-*.md QA-*.md
├── campus-library/           # 【私有】校园资源库 (Astro 7 + astro-pagefind)
│   ├── README.md             # 子项目文档（结构/内容维护/部署）
│   ├── astro.config.mjs
│   ├── src/
│   │   ├── site.config.ts    # 模块清单与导航
│   │   ├── content/docs/     # 各模块 Markdown 资料
│   │   └── pages/            # index / docs / m(移动端) / search
│   └── DEPLOY.md
└── docs/                     # 跨项目资料（规范、设计稿、会议纪要）
```

## 3. 子项目

### 3.1 community-kb（公开）
- **用途**：面向全校师生与 WorkBuddy 校园社群的公开知识库（教程、活动、FAQ、招募等）。
- **技术栈**：Hexo 8 + Butterfly 主题 + Sveltia CMS（在线后台编辑）。
- **本地运行**：
  ```bash
  cd community-kb
  npm ci
  npm run dev        # http://localhost:4000
  ```
- **发布前校验**：`npm run clean && npm run build && npm run check && npm run preview`。
- **内容管理**：通过 Sveltia CMS 后台（部署后访问 `/admin/`）或直接在 `source/` 写 Markdown。
- 详细页面与维护入口见 [`community-kb/README.md`](community-kb/README.md) 及 [`MAINTENANCE.md`](community-kb/MAINTENANCE.md)。

### 3.2 campus-library（私有）
- **用途**：内部校园资源索引（办事指南、周边生活、选课与培养方案等），不对外公开。
- **技术栈**：Astro 7 + astro-pagefind（构建期生成全文搜索）。
- **本地运行**：
  ```bash
  cd campus-library
  npm install
  npm run dev        # http://localhost:4321
  npm run build      # 产出 dist/
  ```
- **内容维护**：在 `src/content/docs/<模块>/` 增改 `.md`；新增模块改 `src/site.config.ts` 的 `MODULES`。
- 详见 [`campus-library/README.md`](campus-library/README.md) 与 [`DEPLOY.md`](campus-library/DEPLOY.md)。

## 4. 公开 / 私有的处理策略（重要）

`community-kb` 要公开、`campus-library` 要私有，但二者在同一仓库。三种处理方式：

| 方式 | 做法 | 适用 |
|---|---|---|
| **A. 整仓私有 + 仅部署 KB** | 仓库设为 Private；CI 只构建并部署 `community-kb/` 到公开域名 | 最省事，推荐起步 |
| **B. 私有内容子模块** | `campus-library/` 改为独立 Private 仓库的 git submodule | 需严格隔离敏感内容 |
| **C. 敏感内容 gitignore** | `campus-library/` 内放占位，真实资料本地/加密管理，不入版本库 | 资料极度敏感 |

**推荐起步用 A**：先把整仓设为 Private，公开站点只部署 `community-kb/`。待流程跑顺，再按需升级到 B/C。

## 5. 部署

- **community-kb（公开）**：`npm run build` 输出 `public/`，部署到 EdgeOne Pages（或任意静态托管）。Sveltia CMS 后台需配置 GitHub 仓库读写权限。
- **campus-library（内部）**：`npm run build` 输出 `dist/`，按 [`campus-library/DEPLOY.md`](campus-library/DEPLOY.md) 接入 EdgeOne Pages（Astro 预设，输出 `dist`）；仅内部访问，不挂公网。
- 两项目可共用同一 CI（如 GitHub Actions），按路径触发各自构建。

## 6. 协作规范

- 所有内容改动走 PR；CMS 后台编辑后也建议同步 commit。
- 文档与结构以本 README 为准；子项目细节写在各自 `README.md`。
- 新增校园内容前先判断归属：**对外可公开 → community-kb；内部/未定稿 → campus-library**。

## 7. 如何推送到 GitHub（内容层 = 本仓库）

源码已在本仓库，下一步是初始化 git 并推送（推送需你授权，以下命令在本地执行）：

```bash
cd qlit-campus-hub
git init
git add .
git commit -m "chore: 合并 qlit-community-kb 与 campus-library 为单仓 monorepo"
# 在 GitHub 新建仓库（建议名 qlit-campus-hub，私有起步）后：
git remote add origin <你的仓库URL>
git push -u origin main
```

> 注：`community-kb` 与 `campus-library` 原本各自有 git 历史，本仓库采用**单一全新历史**整合（未保留各自历史）。若需保留双历史，请改用 git subtree / submodule 方案。

---
© 齐鲁理工学院 · WorkBuddy 校园社群
