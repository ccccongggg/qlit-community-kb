# campus-library · 校园资源库（私有）

> `QLU Campus Hub` 仓库中的**私有**子项目：不对公开的校内资源索引与资料沉淀。
> 迁自原独立仓库 `campus-library`（位于 `E:/School_knowledge/campus-library`）。

## 定位
- 内部使用：课件、办事指南、周边生活、选课与培养方案等校内资料。
- 与 `community-kb`（对外公开知识库）同仓但**不挂公网**。

## 技术栈
- **Astro 7**（`astro` ^7.3.4）+ **astro-pagefind**（构建期自动生成全文搜索索引）
- 内容即 Markdown：存放于 `src/content/docs/<模块>/`，构建时生成静态页。

## 目录结构
```
campus-library/
├── astro.config.mjs        # site / pagefind 集成配置
├── src/
│   ├── site.config.ts      # 模块清单 MODULES、导航与首页文案
│   ├── content.config.ts   # 内容集合定义
│   ├── content/docs/       # 各模块 Markdown 资料
│   │   ├── 校园办事指南/
│   │   ├── 校园周边生活/
│   │   └── 选课与培养方案/
│   ├── pages/
│   │   ├── index.astro     # 首页
│   │   ├── docs/[...slug].astro
│   │   ├── m/[module].astro # 移动端模块页
│   │   └── search.astro    # Pagefind 搜索
│   ├── layouts/BaseLayout.astro
│   └── components/ModuleCard.astro
└── public/                 # 静态资源（favicon 等）
```

## 本地开发
```bash
cd campus-library
npm install
npm run dev          # http://localhost:4321
npm run build        # 产出 dist/（含 Pagefind 索引）
# 生产预览（astro preview 在本机不稳，推荐 python 静态托底）：
python -m http.server 8000 --directory dist   # http://localhost:8000
```

## 内容维护
| 场景 | 操作 |
|---|---|
| 新增/修改一篇资料 | 在 `src/content/docs/<模块>/` 下增改 `.md`，填好 `title/source/updated/tags` 字段 |
| 新增一个模块 | 在 `src/site.config.ts` 的 `MODULES` 加一项（slug 与目录名一致），并建对应 `src/content/docs/<模块名>/` |
| 调整导航/首页文案 | 改 `src/site.config.ts` 或 `src/pages/index.astro` |
| 重新部署 | 推送到 `main` 即自动触发；也可在控制台手动「重新部署」 |

## 部署（EdgeOne Pages）
- 框架预设选 **Astro**；构建命令 `npm run build`；输出目录 `dist`；Node 选 20 或 22。
- 绑定自定义域名时，把 `astro.config.mjs` 的 `site` 改为正式域名（影响绝对链接与 Pagefind 资源路径），再推送部署。
- 详细流程见 [DEPLOY.md](DEPLOY.md)。

## ⚠️ 隐私与可见性（重要）
本目录与公开知识库同处一个仓库，请按根目录 `README.md §4` 选择隐私策略：
- **方式 A（推荐起步）**：整仓设为 Private，仅 `community-kb/` 对外部署。
- **方式 B**：本目录改为独立 Private 仓库的 git submodule，严格隔离。
- **方式 C**：真实敏感资料放 `private/`（根 `.gitignore` 已忽略），不入版本库。

## 注意
- 任何「对外可公开」的内容请改放 `community-kb/`，避免信息源分裂。
- 动态模块（二手/失物/活动日历等运行时读写）尚未实现，后续接飞书多维表格或微信云开发后在 `src/pages/m/` 加运行时 API 即可，不影响现有静态架构。
