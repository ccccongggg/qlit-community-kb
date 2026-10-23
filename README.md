# 齐鲁理工 · WorkBuddy 社群知识库

齐鲁理工学院 WorkBuddy 校园社群的知识库站点。校训「知学 · 知道 · 知善 · 知美」做内容骨架，
四大板块：知识库 / 问题库 / 活动库 / 社群大佬。

- 站点框架：Hexo 8 + Butterfly 主题（`themes/butterfly`，已按校徽红深度定制）
- 内容后台：Sveltia CMS（`source/admin/`，访问 `/admin/`）
- 部署：GitHub → EdgeOne Pages 自动构建 → 自定义域名

**部署与日常维护看 [DEPLOY.md](./DEPLOY.md)。**

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4000
npm run build    # 产物在 public/
```

## 目录说明

```
source/
  _posts/            文章（知识库经验帖、问题库案例）
  _data/
    home.yml         首页首屏文案
    people.yml       社群大佬名单（列表页 + 详情页唯一数据源）
    activities.yml   活动库卡片数据
  kb/ problems/ activities/ people/   四大板块首页
  img/               站点图片（uploads/ 为后台后台上传目录）
  admin/             内容管理后台（index.html + config.yml + CMS 脚本）
scripts/
  people-generator.js  从 people.yml 生成 /people/<slug>/ 详情页
  acts-tag.js          {% acts %} 标签，渲染活动库卡片
themes/butterfly/   主题（含视觉定制：custom.css / custom.js）
```

## 内容与代码的分工

- **改文字、加文章、加成员、加活动** → 打开 `/admin/`，不用碰代码。
- **改颜色、改版式、加新板块** → 改 `themes/butterfly/source/css/custom.css`（或对应 pug），push。

> 注意：`custom.css` / `custom.js` 在 `themes/butterfly/_config.yml` 的 `inject` 里带 `?v=` 版本号，
> **每次改这两个文件都要把版本号 +1**，否则访客浏览器会用缓存看不到变化。
