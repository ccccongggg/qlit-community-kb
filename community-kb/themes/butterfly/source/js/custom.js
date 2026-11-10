/* ============================================================
   齐鲁理工 × WorkBuddy 社群知识库 · 微交互脚本
   1. 昼夜主题切换（localStorage 持久化，默认跟随系统）
   2. 顶栏高度测量（驱动 hero 舞台高度变量）
   3. 四知标签自动着色
   4. 卡片滚动进场（IntersectionObserver，可降级）
   5. 首屏物理商标（重力/碰撞/拖拽，仅首页，已数值验证）
   纯 vanilla JS，无依赖；所有步骤均有存在性守卫
   ============================================================ */
(function () {
  "use strict";

  if (window.__qluKbInit) return;
  window.__qluKbInit = true;

  var body = document.body;
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 0. sharecode 透传 ----------
     静态托管（community-kb.app.workbuddy.host）按 URL 参数授权：
     直接访问 /kb/ 无 ?sharecode= 会返回 403「链接不完整」。
     首次带码进入后把码记进 sessionStorage，并给站内所有链接补上，
     保证点导航/卡片/分页都不会掉码。 */
  (function () {
    var m = location.search.match(/[?&]sharecode=([^&]+)/);
    var sc = m ? decodeURIComponent(m[1]) : null;
    if (!sc) { try { sc = sessionStorage.getItem("kb-sc"); } catch (e) {} }
    if (!sc) return;
    try { sessionStorage.setItem("kb-sc", sc); } catch (e) {}
    var links = document.querySelectorAll("a[href]");
    for (var li = 0; li < links.length; li++) {
      var a = links[li], href = a.getAttribute("href");
      if (!href) continue;
      if (/^(#|mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      if (/^https?:\/\//i.test(href) && href.indexOf(location.host) === -1) continue;
      if (href.indexOf("sharecode=") !== -1) continue;
      try {
        var target = new URL(href, location.href);
        if (target.origin !== location.origin) continue;
        target.searchParams.set("sharecode", sc);
        a.setAttribute("href", target.href);
      } catch (e) {}
    }
  })();

  /* ---------- 1. 昼夜主题（默认黑夜 = 定稿首屏；手动切换后以 localStorage 为准） ---------- */
  var themeLight = false;
  function applyTheme(t, save) {
    themeLight = (t === "light");
    body.classList.toggle("light", themeLight);
    if (save) {
      try { localStorage.setItem("kb-theme", t); } catch (e) {}
    }
  }
  var saved = null;
  try { saved = localStorage.getItem("kb-theme"); } catch (e) {}
  applyTheme(saved === "light" ? "light" : "dark", false);

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(themeLight ? "dark" : "light", true);
    });
  }

  /* ---------- 2. 顶栏高度（hero 舞台 = 视口 - 顶栏） ---------- */
  var nav = document.getElementById("nav");
  function syncTopbarH() {
    if (!nav) return;
    var h = nav.getBoundingClientRect().height || 58;
    document.documentElement.style.setProperty("--kb-topbar-h", h + "px");
  }
  syncTopbarH();
  window.addEventListener("resize", syncTopbarH);

  /* ---------- 3. 四知标签着色 ---------- */
  /* 只给小号内联场景（文章 meta / 侧栏 / 标签云）加 chip；
     大卡片、CTA 按钮、页脚、侧边菜单里的分类/标签链接必须保持原样式，
     否则 a.tagchip 的背景与颜色会覆盖 .kb-card 等导致文字不可见。
     标签云助手（tagcloud / cloudTags）会给每个 a 写行内 color（#999 或随机深色），
     仅靠 CSS 压不住，这里一并剥掉（保留行内字号，那是云图的层次效果） */
  var ZHI = { "知学": "zx", "知道": "zd", "知善": "zs", "知美": "zm" };
  var CHIP_SKIP = ".kb-card, .act-card, .people-card, .kb-cta, .prob-cta, .act-gallery, #footer, #sidebar-menus, .pd-head, .post-copyright, .pagination";
  var catLinks = document.querySelectorAll('a[href*="/categories/"], a[href*="/tags/"]');
  for (var i = 0; i < catLinks.length; i++) {
    var link = catLinks[i];
    if (link.closest && link.closest(CHIP_SKIP)) continue;
    if (link.classList.contains("kb-cta__btn") || link.classList.contains("prob-cta__btn") || link.classList.contains("act-btn")) continue;
    var text = (link.textContent || "").trim();
    link.classList.add("tagchip");
    if (ZHI[text]) link.classList.add("tagchip-" + ZHI[text]);
    if (link.style.color) link.style.removeProperty("color");
  }

  /* ---------- 4. 滚动进场（rAF 节流的手动检测，无头/真实浏览器一致） ---------- */
  var targets = document.querySelectorAll(
    ".recent-post-item, .card-widget, .kb-card, .act-card, .people-card, .pf-step, .kb-guide__card, .kb-onb"
  );
  if (targets.length) {
    if (reduceMotion) {
      for (var j0 = 0; j0 < targets.length; j0++) targets[j0].classList.add("in");
    } else {
      for (var j1 = 0; j1 < targets.length; j1++) targets[j1].classList.add("reveal");

      var revealed = {};
      var checkTick = false;
      function checkReveal() {
        checkTick = false;
        var vh = window.innerHeight || document.documentElement.clientHeight;
        for (var i = 0; i < targets.length; i++) {
          var el = targets[i];
          if (revealed[i]) continue;
          var b = el.getBoundingClientRect();
          if (b.top < vh * 0.92 && b.bottom > 0) {
            revealed[i] = true;
            var sibs = el.parentNode ? el.parentNode.children : [];
            var idx = 0;
            for (var m = 0; m < sibs.length; m++) {
              if (sibs[m] === el) break;
              if (sibs[m].classList && sibs[m].classList.contains("reveal")) idx++;
            }
            el.style.setProperty("--i", idx);
            el.classList.add("in");
          }
        }
      }
      function onScroll() {
        if (!checkTick) {
          checkTick = true;
          requestAnimationFrame(checkReveal);
        }
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      checkReveal();
      // 兜底：2s 后仍未进场的一律显示（防止监听失效导致内容不可见）
      setTimeout(checkReveal, 2000);
    }
  }

  /* ---------- 4.5 跑马灯补足（首屏底部流动带，防止循环时露出空档） ----------
     原理：CSS 用 translateX(-50%) 做无缝循环，前提是「一份」内容宽度 ≥ 视口宽。
     模板只输出 2 份，3 句话一份约 846px，在 1045px 视口里滚到后半段必然露空档。
     这里按视口宽把「一份」重复到够宽，再把整份复制一遍，保证 -50% 仍首尾相接。
     同时按实际宽度换算 animation-duration，让不同屏宽下的滚动线速度保持一致。
     位置注意：必须放在 §5 之前——§5 有 `return`（非首页 / 手机端都会提前退出整个
     IIFE），写在它后面的话手机端永远不会执行。 */
  var SPEED = 36; // px/s
  var mq = document.querySelector(".c-marquee");
  var mqTrack = mq ? mq.querySelector(".track") : null;
  if (mqTrack && mqTrack.children.length > 1) {
    var mqKids = [].slice.call(mqTrack.children);
    var oneLen = Math.floor(mqKids.length / 2) || mqKids.length; // 一份的 span 数
    var mqOne = mqKids.slice(0, oneLen);
    var mqBaseW = 0;

    var mqMeasure = function () {
      mqTrack.textContent = "";
      for (var a = 0; a < mqOne.length; a++) mqTrack.appendChild(mqOne[a]);
      mqBaseW = mqTrack.scrollWidth || 1;
    };

    var mqBuild = function () {
      var need = Math.max(window.innerWidth || 1024, 760);
      var copies = Math.ceil(need / mqBaseW);
      if (copies < 1) copies = 1;
      mqTrack.textContent = "";
      // 输出 copies × 2 份：前一半和后一半完全相同，-50% 位移才无缝
      for (var c = 0; c < copies * 2; c++) {
        for (var i = 0; i < mqOne.length; i++) mqTrack.appendChild(mqOne[i].cloneNode(true));
      }
      var halfW = mqTrack.scrollWidth / 2;
      mqTrack.style.animationDuration = Math.max(6, halfW / SPEED).toFixed(2) + "s";
    };

    mqMeasure();
    mqBuild();

    var mqTimer;
    window.addEventListener("resize", function () {
      clearTimeout(mqTimer);
      mqTimer = setTimeout(function () { mqMeasure(); mqBuild(); }, 180);
    });
  }

})();

/* ============================================================
   V2：顶栏导航（滑块指示器 + 移动端下拉抽屉）
   ============================================================ */
(function () {
  "use strict";

  var menus = document.getElementById("menus");
  var ind = document.getElementById("kb-nav-ind");
  var burger = document.getElementById("kb-burger");
  var mask = document.getElementById("kb-mask");
  if (!menus) return;

  var links = Array.prototype.slice.call(menus.querySelectorAll("a.kb-link"));

  /* ---------- 1. 当前页高亮 ---------- */
  var path = location.pathname.replace(/index\.html$/, "");
  if (path.charAt(path.length - 1) !== "/") path += "/";
  var activeLink = null;
  links.forEach(function (a) {
    var hp = (a.getAttribute("href") || "").split("?")[0].replace(/index\.html$/, "");
    if (hp.length > 1 && path.indexOf(hp) === 0) {
      a.classList.add("active");
      activeLink = a;
    }
  });

  /* ---------- 2. 滑块指示器（桌面） ---------- */
  function moveInd(el, hideIfNone) {
    if (!ind) return;
    if (!el) {
      ind.style.opacity = "0";
      return;
    }
    var mr = menus.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    if (!r.width) {
      ind.style.opacity = "0";
      return;
    }
    ind.style.width = Math.round(r.width) + "px";
    ind.style.transform = "translateX(" + Math.round(r.left - mr.left) + "px)";
    ind.style.opacity = "1";
  }

  function resetInd() {
    if (activeLink) moveInd(activeLink);
    else if (ind) ind.style.opacity = "0";
  }

  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () {
      moveInd(a);
    });
  });
  menus.addEventListener("mouseleave", resetInd);
  window.addEventListener("resize", function () {
    requestAnimationFrame(resetInd);
  });
  window.addEventListener("load", function () {
    requestAnimationFrame(resetInd);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(resetInd);
    });
  }
  requestAnimationFrame(function () {
    menus.classList.add("kb-ind-ready");
    resetInd();
  });

  /* ---------- 3. 移动端抽屉 ---------- */
  function setMenu(open) {
    document.body.classList.toggle("kb-menu-open", !!open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (burger) burger.setAttribute("aria-label", open ? "收起目录" : "展开目录");
  }

  if (burger) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenu(!document.body.classList.contains("kb-menu-open"));
    });
  }
  if (mask) {
    mask.addEventListener("click", function () {
      setMenu(false);
    });
  }
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      setMenu(false);
    });
  });
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      // 切主题后收起抽屉，避免挡住首屏
      setTimeout(function () {
        setMenu(false);
      }, 160);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("kb-menu-open")) setMenu(false);
  });
  var mq = window.matchMedia("(min-width: 761px)");
  function onMq() {
    if (mq.matches) setMenu(false);
  }
  if (mq.addEventListener) mq.addEventListener("change", onMq);
  else if (mq.addListener) mq.addListener(onMq);
})();
