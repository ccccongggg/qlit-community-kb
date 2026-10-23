/*!
 * acts-tag.js
 * {% acts %} —— 从 source/_data/activities.yml 渲染活动库页面卡片。
 * 好处：页面 markdown 里只剩一行 {% acts %}，非技术成员在 CMS 里
 * 不会误改 HTML；活动数据由 CMS 的「活动库」集合单独维护。
 */
function esc(s) {
  /* YAML 里不加引号的 2026-09-20 会被解析成 Date 对象，
     直接 String() 会变成 "Sun Sep 20 2026 20:00:00 GMT+0800"，这里统一转回 YYYY-MM-DD */
  if (s instanceof Date) {
    var p = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    s = s.getFullYear() + "-" + p(s.getMonth() + 1) + "-" + p(s.getDate());
  }
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function card(item, isSoon) {
  const cover = esc(item.cover || "");
  const img = cover
    ? '<div class="act-card__media" style="background-image:url(' + cover + ')"></div>'
    : "";
  const badge = item.badge
    ? '<span class="act-badge' +
      (isSoon ? " act-badge--soon" : "") +
      '">' +
      esc(item.badge) +
      "</span>"
    : "";

  // 元信息：时间 / 地点，用线性图标替代原来的 🗓 📍 表情
  const ico = function (name) {
    return '<svg class="kb-i act-meta__ico" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  };
  const metaBits = [];
  if (item.date) metaBits.push('<span class="act-meta__i">' + ico("clock") + esc(item.date) + "</span>");
  if (item.place) metaBits.push('<span class="act-meta__i">' + ico("pin") + esc(item.place) + "</span>");
  const meta = metaBits.length
    ? '<p class="act-meta">' + metaBits.join('<i class="act-meta__sep"></i>') + "</p>"
    : "";

  const desc = item.desc ? '<p class="act-desc">' + esc(item.desc) + "</p>" : "";

  const btn =
    item.action_text && item.action_link
      ? '<a class="act-btn" href="' +
        esc(item.action_link) +
        '">' +
        esc(item.action_text) +
        "</a>"
      : item.action_text
      ? '<span class="act-btn">' + esc(item.action_text) + "</span>"
      : "";

  let gallery = "";
  if (Array.isArray(item.gallery) && item.gallery.length) {
    gallery =
      '<div class="act-gallery">' +
      item.gallery
        .map(function (g) {
          const src = esc(typeof g === "string" ? g : g.src || "");
          const alt = esc(typeof g === "string" ? "" : g.alt || "");
          return src ? '<img src="' + src + '" alt="' + alt + '">' : "";
        })
        .join("") +
      "</div>";
  }

  const video = item.video
    ? '<iframe class="act-video" src="' +
      esc(item.video) +
      '" allowfullscreen loading="lazy"></iframe>'
    : "";

  return (
    '<article class="act-card' +
    (isSoon ? " act-card--soon" : "") +
    '">' +
    img +
    '<div class="act-card__body">' +
    badge +
    "<h3>" +
    esc(item.title) +
    "</h3>" +
    meta +
    desc +
    btn +
    gallery +
    video +
    "</div></article>"
  );
}

hexo.extend.tag.register("acts", function () {
  const A = (hexo.locals.get("data") || {}).activities || {};
  const hero = A.hero || {};
  const upcoming = Array.isArray(A.upcoming) ? A.upcoming : [];
  const past = Array.isArray(A.past) ? A.past : [];

  let html = "";

  if (hero.title || hero.sub) {
    html +=
      '<div class="kb-hero">' +
      (hero.title ? '<h2 class="kb-hero__title">' + esc(hero.title) + "</h2>" : "") +
      (hero.sub ? '<p class="kb-hero__sub">' + esc(hero.sub) + "</p>" : "") +
      "</div>";
  }

  html += '<h3 class="kb-sub">即将举办</h3>';
  html +=
    '<div class="act-grid">' +
    (upcoming.length
      ? upcoming.map(function (i) {
          return card(i, true);
        }).join("")
      : "") +
    "</div>";

  if (!upcoming.length) {
    html += '<p class="kb-empty">暂时没有排期，关注群里通知，或者找大使提议一场。</p>';
  }

  html += '<h3 class="kb-sub">往期回顾</h3>';
  html +=
    '<div class="act-grid">' +
    (past.length
      ? past.map(function (i) {
          return card(i, false);
        }).join("")
      : "") +
    "</div>";

  if (!past.length) {
    html += '<p class="kb-empty">还没有往期记录，第一场活动留档就交给你了。</p>';
  }

  if (A.footer_html) {
    html += '<div class="kb-cta"><span>' + A.footer_html + "</span></div>";
  }

  return html;
});
