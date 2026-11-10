import { defineConfig } from 'astro/config';
import pagefind from 'astro-pagefind';

// 校园资料库 · 前端层（静态站）
// 构建时从 src/content/docs 拉取 Markdown 内容生成静态页，
// astro-pagefind 在 build 后自动对 dist 建立全文搜索索引。
//
// EdgeOne Pages 部署：框架选 Astro，构建命令 `npm run build`，输出目录 `dist`。
// 若绑定自定义域名，把下面 site 改成你的正式域名（影响绝对链接与 Pagefind 资源路径）。
export default defineConfig({
  site: 'https://campus-library.edgeone.app',
  integrations: [pagefind()],
  trailingSlash: 'ignore',
});
