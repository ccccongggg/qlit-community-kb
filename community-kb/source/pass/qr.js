/* KBQR - 零依赖 QR Code 生成器 (Model 2, Byte mode, ECC-L, mask 0, version 1-10)
   纯经典脚本，file:// 可用，无网络、无第三方依赖。
   输出布尔矩阵，供 Canvas / DOM 渲染。算法按 ISO/IEC 18004 标准实现。 */
(function (root) {
  'use strict';
  var RAW = [0,26,44,70,100,134,172,196,242,292,346];      // 总码字
  var ECC = [0,7,10,15,20,26,18,20,24,30,18];              // 每块纠错码字 (L)
  var BLK = [0,1,1,1,1,1,2,2,2,2,4];                       // 块数 (L)
  var ALIGN = [[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];

  function mul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z & 0xFF;
  }
  function genPoly(deg) {
    var res = new Array(deg).fill(0); res[deg - 1] = 1; var r = 1;
    for (var i = 0; i < deg; i++) {
      for (var j = 0; j < deg; j++) { res[j] = mul(res[j], r); if (j + 1 < deg) res[j] ^= res[j + 1]; }
      r = mul(r, 2);
    }
    return res;
  }
  function rsRemainder(data, div) {
    var res = new Array(div.length).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ res.shift(); res.push(0);
      for (var j = 0; j < div.length; j++) res[j] ^= mul(div[j], factor);
    }
    return res;
  }
  function utf8(str) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(str));
    var s = unescape(encodeURIComponent(str)), a = [];
    for (var i = 0; i < s.length; i++) a.push(s.charCodeAt(i));
    return a;
  }
  function bit(v, i) { return ((v >>> i) & 1) !== 0; }

  function encode(text) {
    var data = utf8(String(text));
    var ver = 0;
    for (var v = 1; v <= 10; v++) {
      var capBits = (RAW[v] - ECC[v] * BLK[v]) * 8;
      var need = 4 + (v <= 9 ? 8 : 16) + data.length * 8;
      if (need + 4 <= capBits) { ver = v; break; }
    }
    if (!ver) throw new Error('KBQR: 内容过长（最多约 270 字节）');
    var cwCount = RAW[ver] - ECC[ver] * BLK[ver];
    var cap = cwCount * 8, b = [];
    function app(val, len) { for (var i = len - 1; i >= 0; i--) b.push((val >>> i) & 1); }
    app(4, 4); app(data.length, ver <= 9 ? 8 : 16);
    for (var d = 0; d < data.length; d++) app(data[d], 8);
    app(0, Math.min(4, cap - b.length));
    app(0, (8 - b.length % 8) % 8);
    for (var pad = 0xEC; b.length < cap; pad ^= 0xEC ^ 0x11) app(pad, 8);
    var cw = [];
    for (var i = 0; i < b.length; i += 8) { var by = 0; for (var j = 0; j < 8; j++) by = (by << 1) | b[i + j]; cw.push(by); }

    var nb = BLK[ver], ecl = ECC[ver], raw = RAW[ver];
    var shortLen = Math.floor(raw / nb), numShort = nb - (raw % nb), div = genPoly(ecl);
    var blocks = [], k = 0;
    for (var ii = 0; ii < nb; ii++) {
      var dl = shortLen - ecl + (ii < numShort ? 0 : 1);
      var chunk = cw.slice(k, k + dl); k += dl;
      blocks.push({ dat: chunk, ec: rsRemainder(chunk, div) });
    }
    var out = [];
    for (var q = 0; q < shortLen - ecl + 1; q++) for (var t = 0; t < nb; t++) if (q < blocks[t].dat.length) out.push(blocks[t].dat[q]);
    for (var e = 0; e < ecl; e++) for (var t2 = 0; t2 < nb; t2++) out.push(blocks[t2].ec[e]);

    var size = ver * 4 + 17, m = [], fn = [];
    for (var y = 0; y < size; y++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function set(x, y, black, isFn) { if (x < 0 || x >= size || y < 0 || y >= size) return; m[y][x] = !!black; if (isFn) fn[y][x] = true; }
    // timing
    for (var a = 0; a < size; a++) { set(6, a, a % 2 === 0, true); set(a, 6, a % 2 === 0, true); }
    // finder + separator
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, dist !== 2 && dist !== 4, true);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    // alignment
    var cen = ALIGN[ver - 1], cl = cen.length;
    function align(cx, cy) {
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++)
        set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1, true);
    }
    for (var ci = 0; ci < cl; ci++) for (var cj = 0; cj < cl; cj++) {
      if ((ci === 0 && cj === 0) || (ci === 0 && cj === cl - 1) || (ci === cl - 1 && cj === 0)) continue;
      align(cen[cj], cen[ci]);
    }
    // version info (v >= 7)
    if (ver >= 7) {
      var rem = ver;
      for (var vi = 0; vi < 12; vi++) rem = (rem << 1) ^ (((rem >>> 11) & 1) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (var bi = 0; bi < 18; bi++) {
        var bb = bit(vb, bi), ax = size - 11 + bi % 3, ay = Math.floor(bi / 3);
        set(ax, ay, bb, true); set(ay, ax, bb, true);
      }
    }
    // format info: ECC-L(formatBits=1), mask 0
    var fd = (1 << 3) | 0, frem = fd;
    for (var fi = 0; fi < 10; fi++) frem = (frem << 1) ^ (((frem >>> 9) & 1) * 0x537);
    var fb = ((fd << 10) | frem) ^ 0x5412;
    for (var f1 = 0; f1 <= 5; f1++) set(8, f1, bit(fb, f1), true);
    set(8, 7, bit(fb, 6), true); set(8, 8, bit(fb, 7), true); set(7, 8, bit(fb, 8), true);
    for (var f2 = 9; f2 < 15; f2++) set(14 - f2, 8, bit(fb, f2), true);
    for (var f3 = 0; f3 < 8; f3++) set(size - 1 - f3, 8, bit(fb, f3), true);
    for (var f4 = 8; f4 < 15; f4++) set(8, size - 15 + f4, bit(fb, f4), true);
    set(8, size - 8, true, true); // dark module
    // data zigzag + mask 0
    var idx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j2 = 0; j2 < 2; j2++) {
        var x = right - j2, upward = ((right + 1) & 2) === 0, y2 = upward ? size - 1 - vert : vert;
        if (!fn[y2][x]) {
          var hasData = idx < out.length * 8;
          var black = hasData ? ((out[idx >>> 3] >>> (7 - (idx & 7))) & 1) !== 0 : false;
          if ((x + y2) % 2 === 0) black = !black;   // 剩余位同样参与掩码
          m[y2][x] = black;
          if (hasData) idx++;
        }
      }
    }
    return { size: size, version: ver, modules: m };
  }

  /* 画到 canvas：quiet=4 模块，dark/light 可指定，返回实际像素尺寸 */
  function draw(canvas, text, opt) {
    opt = opt || {};
    var q = opt.quiet == null ? 4 : opt.quiet;
    var dark = opt.dark || '#07120F', light = opt.light || '#FFFFFF';
    var qr = encode(text), n = qr.size + q * 2;
    var scale = Math.max(1, Math.floor((opt.size || 240) / n));
    var px = n * scale;
    canvas.width = px; canvas.height = px;
    var c = canvas.getContext('2d');
    c.fillStyle = light; c.fillRect(0, 0, px, px);
    c.fillStyle = dark;
    for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++)
      if (qr.modules[y][x]) c.fillRect((x + q) * scale, (y + q) * scale, scale, scale);
    return { px: px, version: qr.version, size: qr.size };
  }
  function svg(text, opt) {
    opt = opt || {}; var q = opt.quiet == null ? 4 : opt.quiet;
    var qr = encode(text), n = qr.size + q * 2, parts = [], d = [];
    for (var y = 0; y < qr.size; y++) for (var x = 0; x < qr.size; x++)
      if (qr.modules[y][x]) d.push('M' + (x + q) + ' ' + (y + q) + 'h1v1h-1z');
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" width="' + (opt.size || 320) + '" height="' + (opt.size || 320) + '">');
    parts.push('<rect width="' + n + '" height="' + n + '" fill="' + (opt.light || '#FFFFFF') + '"/>');
    parts.push('<path d="' + d.join('') + '" fill="' + (opt.dark || '#07120F') + '"/>');
    parts.push('</svg>');
    return parts.join('');
  }
  var API = { encode: encode, draw: draw, svg: svg };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.KBQR = API;
})(typeof window !== 'undefined' ? window : globalThis);
