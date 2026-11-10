# 部署与预览

## 当前可确认的状态

- 本地是可独立构建的 Hexo 8 项目，源码仓库配置为 ccccongggg/qlit-community-kb，main 分支。
- 根配置仍使用 https://community-kb.app.workbuddy.host ，访问原托管需完整分享参数，站内导航会保留参数。
- GitHub Issues 已通过只读 API 确认开放，作为公开投稿接收渠道。
- 这次改版先在本地完成。不能根据配置文件推断 EdgeOne 已连接、后台令牌有效或改版已上线。

## EdgeOne Pages 部署参数

| 项目 | 值 |
|---|---|
| 仓库 | ccccongggg/qlit-community-kb |
| 分支 | main |
| 根目录 | 仓库根目录 |
| 安装命令 | npm ci |
| 构建命令 | npm run build && npm run check |
| 输出目录 | public |
| Node | 20 |

连接仓库、域名、证书与构建结果需要在对应账号控制台验证。首次连接成功后，验证一次真实内容提交是否触发构建，并比对线上文字。

绑定正式域名后修改 _config.yml 的 url、source/admin/config.yml 的 site_url 和 display_url。WorkBuddy 分享参数不是其他托管平台的认证方式。

## 后台登录

后台路径 /admin/，只配置 GitHub token 登录。账号需要所选仓库的 Contents 读写权限；不要把 token 放进仓库、Issue 或站内公开表单。HTTPS 或 localhost 环境访问后台。

当前没有部署 OAuth 服务。多人协作需要先确定 GitHub 仓库权限与审核责任，再配置登录方案。不要把 OAuth 解释为免 GitHub 账号登录。

## 本地实际页面预览

```sh
npm ci
npm run clean
npm run build
npm run check
npm run preview
```

打开 http://localhost:4000 。改 Hexo 生成脚本后应重启开发服务。不要同时运行 watch 服务和 clean/build，以免缓存互相覆盖。

## 自动检查与预览产物

仓库新增 .github/workflows/validate.yml，在 push、PR 或手动运行时执行安装、构建与检查，并上传 static-site-preview 产物。这份工作流尚需提交到远端才会生效；它不替代 EdgeOne 部署。

## 发布验收

检查首页文案、新人指南、知识筛选、搜索、参与草稿、活动详情和手机导航。GitHub 投稿要由作者在目标页确认提交；验收不要创建无意义公开投稿。

如果沿用 WorkBuddy 发布，把本地 public/ 作为静态产物更新原应用，并在完整分享链接下复验。检查结果记录在改版日志中。
