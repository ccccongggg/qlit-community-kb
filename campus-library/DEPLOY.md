# 校园资料库 · EdgeOne Pages 部署清单

> 当前状态：项目已在本地初始化为 Git 仓库（分支 `main`），**仅本地提交，尚未推送**。
> 本清单覆盖「GitHub 当内容/代码仓库 + EdgeOne Pages 当前端托管」的完整流程。

---

## 一、前置准备

- [ ] Node 环境（本项目用受管 Node 22，CI 上 EdgeOne 会自动装）
- [ ] 一个 GitHub 账号（本机已配置 `ccccongggg` 身份）
- [ ] 一个 EdgeOne Pages 账号（腾讯云，国内访问快、默认子域免备案）
- [ ] 本地已 `npm install` 且 `npm run build` 通过（已验证 ✅）

## 二、把代码推到 GitHub（内容层 = 这个仓库）

> ⚠️ 推送涉及你的 GitHub 远程仓库，需你本轮明确许可后我再来执行（`git push`）。
> 下面步骤供你自己在本地执行，或授权后由我代做。

1. 在 GitHub 新建一个**私有或公开**仓库，例如 `campus-library`（**不要**勾选自动生成 README/.gitignore，避免冲突）。
2. 本地添加远程并推送：
   ```bash
   git -C "E:/School_knowledge/campus-library" remote add origin https://github.com/ccccongggg/campus-library.git
   git -C "E:/School_knowledge/campus-library" push -u origin main
   ```
3. 之后每次改完内容，正常 `git add -A && git commit && git push`，EdgeOne 会自动重新部署。

## 三、EdgeOne Pages 接入（前端托管）

1. 打开 EdgeOne Pages 控制台 → **创建项目** → 选择 **「导入 Git 仓库」** → 授权并选中 `campus-library`。
2. 框架预设选 **Astro**（若未自动识别，手动填下面的构建配置）。
3. 构建配置：
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 安装命令：留空（默认 `npm install` 即可）
   - 节点版本：选 20 或 22（本项目在 22 验证通过）
4. 点击 **部署**，等待构建完成（首次约 1–3 分钟）。
5. 部署成功后获得默认子域，形如 `https://campus-library-xxxx.edgeone.app`，直接可访问。

## 四、绑定自定义域名（可选，需备案）

- 起步阶段用默认 `*.edgeone.app` 子域即可，**免备案**，最快。
- 想用自有域名（如 `campus.example.com`）时：
  1. 在国内服务商完成 **ICP 备案**（个人备案约 1–2 周）。
  2. 在 EdgeOne Pages 项目设置里「绑定自定义域名」，按提示添加 CNAME 解析。
- 绑定后，把 `astro.config.mjs` 里的 `site` 改为正式域名（影响绝对链接与 Pagefind 搜索资源路径），然后重新推送部署：
  ```js
  export default defineConfig({
    site: 'https://campus-library.example.com',
    integrations: [pagefind()],
  });
  ```

## 五、日常更新流程

| 场景 | 操作 |
|---|---|
| 新增/修改一篇资料 | 在 `src/content/docs/<模块>/` 下增改 `.md`，填好 `title/source/updated/tags` 字段，然后 `git push` |
| 新增一个模块 | 在 `src/site.config.ts` 的 `MODULES` 里加一项（slug 与目录名一致），建对应 `src/content/docs/<模块名>/` 目录 |
| 调整导航/首页文案 | 改 `src/site.config.ts` 或 `src/pages/index.astro` |
| 重新部署 | 推送到 `main` 即自动触发；也可在控制台手动「重新部署」 |

## 六、本地预览（不涉及部署）

```bash
cd E:/School_knowledge/campus-library
npm run dev      # 开发模式 http://localhost:4321
npm run build    # 产出 dist/
# 用静态服务器托管 dist 看生产效果（本环境 astro preview 不稳，推荐 python）：
python -m http.server 8000 --directory dist   # http://localhost:8000
```

## 七、动态层（暂未做）

二手 / 失物 / 活动日历等需要运行时读写的模块，后续接 **飞书多维表格** 或 **微信云开发**（免费 BaaS）后，再在 `src/pages/m/二手与失物` 等页面加运行时 API 调用即可，不影响现有静态架构。
