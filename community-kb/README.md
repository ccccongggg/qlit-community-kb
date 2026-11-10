# 齐鲁理工 · WorkBuddy 社群知识库

> 📍 本目录是 **QLU Campus Hub** 仓库的公开子项目（原独立仓库 `qlit-community-kb`，源码位于 `E:/Workbuddy校园大使/workbuddy-kb`）。

面向同学的公共知识与协作空间：查经验、提问题、找伙伴、参加活动。

技术：Hexo 8 + Butterfly + Sveltia CMS。保持静态构建，可部署到现有 WorkBuddy 托管或 EdgeOne Pages。

## 本地运行

```sh
npm ci
npm run dev
```

开发预览在 http://localhost:4000 。新增或修改 scripts/ 后需要重启服务。浏览器交互不依赖后台服务，搜索使用本地生成的 JSON 索引。

发布前执行：

```sh
npm run clean
npm run build
npm run check
npm run preview
```

不要在以 public/ 为工作目录的进程运行时执行 clean，Windows 会锁住该目录。

## 页面

| 地址 | 用途 |
|---|---|
| / | 首页、精选内容、近期活动 |
| /start/ | 新人指南与加入路径 |
| /kb/ | 知识列表、类型筛选、关键词过滤 |
| /problems/ | 问题列表与状态筛选 |
| /activities/ | 当前活动与历史回顾 |
| /people/ | 已公开确认的伙伴资料 |
| /search/ | 标题、正文、摘要与标签全文搜索 |
| /participate/ | 提问、投稿、加入意向、咨询与纠错草稿 |
| /about/ | 内容、署名和隐私说明 |
| /admin/ | 维护者后台 |

## 维护入口

**现行维护说明以 [MAINTENANCE.md](MAINTENANCE.md) 为准。** 部署说明见 [DEPLOY.md](DEPLOY.md)。本轮改版与外部待核验项见 [CHANGELOG-2026-10-24.md](CHANGELOG-2026-10-24.md)。工作区早期方案仅作历史记录。

CSS、JS、模板图片使用文件内容哈希，修改资源后重新构建即可，无需手动增加版本号。新版样式位于 themes/butterfly/source/css/community.css，新版交互位于 themes/butterfly/source/js/community.js；原有品牌样式与物理互动仍保留。
