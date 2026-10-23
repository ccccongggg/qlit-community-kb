/*!
 * people-generator.js
 * 从 source/_data/people.yml 单一数据源生成 /people/<slug>/ 详情页。
 * 这样 CMS 后台只需要维护 people.yml 一处，列表栅格与详情页自动同步。
 */
hexo.extend.generator.register("people-detail", function (locals) {
  const data = (hexo.locals.get("data") || {}).people;
  const list = Array.isArray(data && data.list) ? data.list : [];

  return list
    .filter(function (p) {
      return p && p.slug;
    })
    .map(function (p) {
      return {
        path: "people/" + p.slug + "/index.html",
        layout: "people-detail",
        data: Object.assign({}, p, {
          title: p.name || p.slug,
          name: p.name || p.slug,
          /* page.layout 同时写进 page 数据：Butterfly 的 getPageType() 靠它判定
             页面类型，缺了会被当成 home（标题栏丢失、正文宽度错乱） */
          layout: "people-detail",
          top_img: false,
          aside: false
        })
      };
    });
});
