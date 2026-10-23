/*!
 * icon-tag.js
 * {% icon book %} 或 {% icon book 18 %}
 * 输出引用 sprite 的线性图标，替代到处散落的 emoji。
 * sprite 定义在 themes/butterfly/layout/includes/kb-icons.pug
 */
hexo.extend.tag.register("icon", function (args) {
  var name = (args[0] || "spark").trim();
  var size = args[1] ? parseInt(args[1], 10) : 0;
  var style = size ? ' style="width:' + size + "px;height:" + size + 'px"' : "";
  return (
    '<svg class="kb-i" aria-hidden="true" focusable="false"' +
    style +
    '><use href="#i-' +
    name +
    '"></use></svg>'
  );
});
