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
      a.setAttribute("href", href + (href.indexOf("?") === -1 ? "?" : "&") + "sharecode=" + encodeURIComponent(sc));
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

  /* ---------- 5. 首屏物理商标（仅首页存在 #kb-hero-stage 时启用） ---------- */
  var stage = document.getElementById("kb-hero-stage");
  if (!stage) return;
  /* 手机端同样跑物理（可玩性不能丢）。当年"手机滚不动页面"的根因是
     canvas / hero 上挂了 touch-action:none 把整块手势都吃了；
     现在改成 touchstart 里「命中球才 preventDefault」的精确拦截，
     按在球上 = 拖球，按在别处 = 正常滚动。见下方交互段。 */
  var isPhone = window.matchMedia("(max-width: 760px)").matches;

  var hero = stage;
  var cv = document.getElementById("phys");
  var marquee = stage.querySelector(".c-marquee");
  if (!cv || !marquee) return;
  var ctx = cv.getContext("2d");

  var QLIT_SRC = "/img/qlit-badge.png";
  var WB_SRC = "/img/wb-logo.svg";

  var IMG = { q: new Image(), w: new Image() };
  IMG.q.src = QLIT_SRC;
  IMG.w.src = WB_SRC;
  var SPR = { q: null, w: null };
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.closePath(); }

  function buildSprites() {
    // 校徽：宣纸白奖章（红徽收进章里，不突兀）
    var S = 256, c = document.createElement("canvas"); c.width = c.height = S;
    var x = c.getContext("2d");
    x.fillStyle = "#F7F2E8"; circle(x, S / 2, S / 2, S / 2); x.fill();
    x.lineWidth = S * 0.042; x.strokeStyle = "#24425F"; circle(x, S / 2, S / 2, S / 2 - S * 0.021); x.stroke();
    x.lineWidth = S * 0.015; x.strokeStyle = "rgba(214,0,15,.38)"; circle(x, S / 2, S / 2, S / 2 * 0.885); x.stroke();
    var pad = S * 0.125;
    x.drawImage(IMG.q, pad, pad, S - 2 * pad, S - 2 * pad);
    SPR.q = c;
    // WorkBuddy：白底圆
    var c2 = document.createElement("canvas"); c2.width = c2.height = S;
    var y = c2.getContext("2d");
    y.fillStyle = "#FFFFFF"; circle(y, S / 2, S / 2, S / 2); y.fill();
    y.lineWidth = S * 0.042; y.strokeStyle = "#24425F"; circle(y, S / 2, S / 2, S / 2 - S * 0.021); y.stroke();
    y.drawImage(IMG.w, S * 0.14, S * 0.14, S * 0.72, S * 0.72);
    SPR.w = c2;
  }
  var spriteReady = false;
  IMG.q.onload = IMG.w.onload = function () {
    if (IMG.q.complete && IMG.w.complete) { buildSprites(); spriteReady = true; }
  };

  var G = 1500, E = 0.68;
  var bodies = [], ripples = [], drag = null;
  var W = 0, H = 0, DPR = 1, floorY = 0;

  function sizes() {
    var w = hero.clientWidth;
    /* 手机屏窄，按百分比算出来的球会小到没有存在感，单独给一档。
       两档的上/下限刻意对齐（手机 52/43 ↔ 桌面 50/40），
       免得 760→761px 时球突然缩一圈。 */
    if (w <= 760) {
      return [Math.max(40, Math.min(w * 0.125, 52)), Math.max(33, Math.min(w * 0.105, 43))];
    }
    return [Math.max(50, Math.min(w * 0.046, 66)), Math.max(40, Math.min(w * 0.037, 53))];
  }
  function makeBodies() {
    var s = sizes();
    if (reduceMotion) {
      return [
        { key: "q", r: s[0], m: s[0] * s[0], x: W * 0.68, y: floorY - s[0], vx: 0, vy: 0 },
        { key: "w", r: s[1], m: s[1] * s[1], x: W * 0.86, y: floorY - s[1], vx: 0, vy: 0 }
      ];
    }
    /* 手机屏窄：桌面同款初速度（85px/s）在 390 宽上会一路漂到贴墙，
       所以初速收小、起点左右分开，落地后停在中间偏右两块空地 */
    var drop = isPhone ? 60 : 120;
    return [
      { key: "q", r: s[0], m: s[0] * s[0], x: W * (isPhone ? 0.32 : 0.64), y: -s[0] - drop, vx: isPhone ? 34 : 85, vy: 0 },
      { key: "w", r: s[1], m: s[1] * s[1], x: W * (isPhone ? 0.74 : 0.82), y: -s[1] - drop - 200, vx: isPhone ? -24 : -65, vy: 0 }
    ];
  }
  function reset() { bodies = makeBodies(); ripples.length = 0; }

  function measure() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    if (!W || !H) return;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var hr = hero.getBoundingClientRect(), mr = marquee.getBoundingClientRect();
    floorY = mr.top - hr.top; // 地面 = 跑马灯上沿
    if (!bodies.length) reset();
    else {
      var s = sizes();
      bodies[0].r = s[0]; bodies[0].m = s[0] * s[0];
      bodies[1].r = s[1]; bodies[1].m = s[1] * s[1];
      bodies.forEach(function (b) {
        b.x = Math.max(b.r, Math.min(W - b.r, b.x));
        b.y = Math.min(b.y, floorY - b.r);
      });
    }
  }
  window.addEventListener("resize", measure);
  window.addEventListener("orientationchange", measure);

  /* ---------- 交互：window 级指针事件，画布 pointer-events:none，不挡按钮 ---------- */
  function toLocal(e) {
    var r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function hit(p) {
    for (var i = bodies.length - 1; i >= 0; i--) {
      var b = bodies[i];
      if (p.y < floorY && Math.hypot(p.x - b.x, p.y - b.y) <= b.r * 1.06) return b;
    }
    return null;
  }
  var cur = "";
  function setCur(c) { if (c !== cur) { cur = c; body.style.cursor = c; } }
  window.addEventListener("pointerdown", function (e) {
    if (e.target && e.target.closest && e.target.closest("a,button")) return; // 不抢 CTA / 目录 / 主题按钮
    var b = hit(toLocal(e)); if (!b) return;
    drag = { b: b, tx: b.x, ty: b.y };
    b.vx = 0; b.vy = 0;
    setCur("grabbing");
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  window.addEventListener("pointermove", function (e) {
    if (!drag) { setCur(hit(toLocal(e)) ? "grab" : ""); return; }
    var p = toLocal(e), b = drag.b;
    drag.tx = Math.max(b.r, Math.min(W - b.r, p.x));
    drag.ty = Math.max(b.r, Math.min(floorY - b.r * 0.5, p.y));
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  function endDrag() { if (drag) { drag = null; setCur(""); } }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* 触屏专用：pointerdown 的 preventDefault 拦不住页面滚动，
     真正管用的是 touchstart（必须 passive:false）。只在这一下命中球时才拦，
     所以「按住球 = 拖球」「按住别处 = 正常上下滑」两者不打架。 */
  window.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    if (t.target && t.target.closest && t.target.closest("a,button")) return;
    if (!hit(toLocal(t))) return;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  /* ---------- 物理步进（冲量法弹性碰撞，质量 ∝ r²） ---------- */
  function ripple(x, y, r) {
    ripples.push({ x: x, y: y, r: r, t: 0 });
    if (ripples.length > 14) ripples.shift();
  }

  function step(dt) {
    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      if (drag && drag.b === b) {
        b.vx = Math.max(-3200, Math.min(3200, (drag.tx - b.x) * 15));
        b.vy = Math.max(-3200, Math.min(3200, (drag.ty - b.y) * 15));
        b.x += b.vx * dt; b.y += b.vy * dt;
      } else {
        b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      }
      if (b.x - b.r < 0) { b.x = b.r; if (b.vx < 0) { if (-b.vx > 240) ripple(b.x, b.y, b.r * 0.9); b.vx = -b.vx * E; } }
      if (b.x + b.r > W) { b.x = W - b.r; if (b.vx > 0) { if (b.vx > 240) ripple(b.x, b.y, b.r * 0.9); b.vx = -b.vx * E; } }
      if (b.y - b.r < 0) { b.y = b.r; if (b.vy < 0) b.vy = -b.vy * E; }
      if (b.y + b.r > floorY) {
        b.y = floorY - b.r;
        if (b.vy > 0) { if (b.vy > 260) ripple(b.x, floorY, b.r); b.vy = -b.vy * E; }
        /* 手机上加一点地面摩擦，否则初速在窄屏上会一路滑到贴墙 */
        b.vx *= isPhone ? 0.955 : 0.992;
        if (Math.abs(b.vy) < 42) b.vy = 0;
      }
    }
    var a = bodies[0], c = bodies[1];
    if (a && c) {
      var dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = a.r + c.r;
      if (d < min && d > 0.0001) {
        var nx = dx / d, ny = dy / d, ov = min - d, tm = a.m + c.m;
        a.x -= nx * ov * (c.m / tm); a.y -= ny * ov * (c.m / tm);
        c.x += nx * ov * (a.m / tm); c.y += ny * ov * (a.m / tm);
        var rvx = c.vx - a.vx, rvy = c.vy - a.vy, vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          var j = -(1 + E) * vn / (1 / a.m + 1 / c.m);
          a.vx -= j * nx / a.m; a.vy -= j * ny / a.m;
          c.vx += j * nx / c.m; c.vy += j * ny / c.m;
          if (-vn > 230) ripple((a.x + c.x) / 2, (a.y + c.y) / 2, Math.min(a.r, c.r) * 0.85);
        }
      }
    }
    for (var k = ripples.length - 1; k >= 0; k--) {
      ripples[k].t += dt * 2.1;
      if (ripples[k].t >= 1) ripples.splice(k, 1);
    }
  }

  var marksOff = false;
  function draw() {
    /* 物理精灵就绪就把手机端的静态兜底商标撤掉（无 JS / 图挂了才留它） */
    if (!marksOff && spriteReady) {
      document.body.classList.add("phys-on");
      marksOff = true;
    }
    ctx.clearRect(0, 0, W, H);
    // 地面线 + 投影（颜色随主题）
    ctx.strokeStyle = themeLight ? "rgba(14,42,35,.22)" : "rgba(95,227,192,.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, floorY - 0.75); ctx.lineTo(W, floorY - 0.75); ctx.stroke();
    bodies.forEach(function (b) {
      var hgt = Math.max(0, floorY - (b.y + b.r)), t = Math.max(0, 1 - hgt / 300);
      ctx.save();
      ctx.globalAlpha = (themeLight ? 0.06 : 0.05) + 0.3 * t;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(b.x, floorY - 3, b.r * (0.8 + 0.28 * (1 - t)), b.r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    // 碰撞涟漪
    var ripRGB = themeLight ? "18,168,127" : "95,227,192";
    ripples.forEach(function (r) {
      ctx.strokeStyle = "rgba(" + ripRGB + "," + (0.5 * (1 - r.t)).toFixed(3) + ")";
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (0.55 + r.t * 1.6), 0, Math.PI * 2); ctx.stroke();
    });
    // 两个商标
    bodies.forEach(function (b) {
      var sp = SPR[b.key];
      if (!sp) return;
      ctx.drawImage(sp, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      if (drag && drag.b === b) {
        ctx.strokeStyle = themeLight ? "rgba(18,168,127,.95)" : "rgba(95,227,192,.9)";
        ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 9, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      }
    });
  }

  var last = performance.now();
  function frame(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 1 / 24) dt = 1 / 24;
    step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  measure();
  window.addEventListener("load", measure);
  requestAnimationFrame(frame);

  /* 只读快照，供自动化验收定位球坐标（不参与任何逻辑） */
  window.__kbPhys = {
    bodies: function () {
      return bodies.map(function (b) { return { key: b.key, x: b.x, y: b.y, r: b.r }; });
    },
    floor: function () { return floorY; },
    dragging: function () { return !!drag; }
  };
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
