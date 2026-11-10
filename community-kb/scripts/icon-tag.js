/*!
 * icon-tag.js
 * {% icon book %} 或 {% icon book 18 %}
 * 输出引用 sprite 的线性图标，替代到处散落的 emoji。
 * sprite 定义在 themes/butterfly/layout/includes/kb-icons.pug
 *
 * 同时注册同名 helper kbicon(name, size)，供 pug 模板直接调用：
 *   != kbicon('book', 22)
 * （pug 里不能用 {% %} 标签语法，所以必须有 helper 版本）
 */
function renderIcon(name, size) {
  var n = (name || "spark").toString().trim();
  var s = size ? parseInt(size, 10) : 0;
  var style = s ? ' style="width:' + s + "px;height:" + s + 'px"' : "";
  return '<svg class="kb-i" aria-hidden="true" focusable="false"' + style + '><use href="#i-' + n + '"></use></svg>';
}

hexo.extend.tag.register("icon", function (args) {
  return renderIcon(args[0], args[1]);
});

hexo.extend.helper.register("kbicon", function (name, size) {
  return renderIcon(name, size);
});
