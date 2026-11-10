/*!
 * kb-asset.js
 * 图片资源带版本号，避免访客继续看到浏览器里缓存的旧图。
 * 用法：pug 里 kbimg('/img/cover-kb-member.svg')
 *      输出 /img/cover-kb-member.svg?v=<config.kb_asset_ver>
 * 换图后只需改根目录 _config.yml 的 kb_asset_ver，全站引用一起失效重取。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
hexo.extend.helper.register("kbimg", function (p) {
  if (!p) return "";
  const url = this.url_for(p);
  if (/^https?:\/\//.test(url)) return url;
  const file = path.join(hexo.source_dir, String(p).replace(/^\//, '').split(/[?#]/)[0]);
  const ver = fs.existsSync(file) ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12) : String(this.config.kb_asset_ver || '1');
  return url + (url.indexOf("?") > -1 ? "&" : "?") + "v=" + ver;
});
