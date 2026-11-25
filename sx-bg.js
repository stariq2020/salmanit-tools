/* Site-wide animated network background (fixed, behind all content). Pauses when the tab is hidden;
 * shows a still frame for users who prefer reduced motion. Safe to include on any page. */
(function () {
  'use strict';
  if (document.querySelector('canvas.sx-bg-fixed')) return;
  var root = document.documentElement;
  var cv = document.createElement('canvas'); cv.className = 'sx-bg-fixed'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
  document.body.insertBefore(cv, document.body.firstChild);
  var ctx = cv.getContext('2d'), W = 0, H = 0, nodes = [], packets = [], raf = 0, last = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function rgb() { return root.getAttribute('data-theme') === 'light' ? '0,87,216' : '56,189,248'; }
  function size() {
    W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(22, Math.min(60, Math.round(W * H / 22000))); nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2, r: 1.3 + Math.random() * 1.5, hub: Math.random() < .13 });
    packets = [];
  }
  function frame(t) {
    var dt = Math.min(48, t - last); last = t; var c = rgb(), D = 160;
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(function (a) { a.x += a.vx * dt / 16; a.y += a.vy * dt / 16; if (a.x < -10) a.x = W + 10; if (a.x > W + 10) a.x = -10; if (a.y < -10) a.y = H + 10; if (a.y > H + 10) a.y = -10; });
    for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
      var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < D) {
        ctx.strokeStyle = 'rgba(' + c + ',' + ((1 - d / D) * .17).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (packets.length < 12 && Math.random() < .0014) packets.push({ a: a, b: b, p: 0, s: .004 + Math.random() * .006 });
      }
    }
    nodes.forEach(function (n) {
      ctx.fillStyle = 'rgba(' + c + ',' + (n.hub ? .6 : .35) + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, n.hub ? n.r + 1.3 : n.r, 0, 6.283); ctx.fill();
      if (n.hub) { ctx.strokeStyle = 'rgba(' + c + ',.2)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 5, 0, 6.283); ctx.stroke(); }
    });
    packets = packets.filter(function (k) {
      k.p += k.s * dt / 16; if (k.p >= 1) return false;
      var x = k.a.x + (k.b.x - k.a.x) * k.p, y = k.a.y + (k.b.y - k.a.y) * k.p;
      var g = ctx.createRadialGradient(x, y, 0, x, y, 8); g.addColorStop(0, 'rgba(0,200,255,.85)'); g.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill(); return true;
    });
    if (!mq.matches) raf = requestAnimationFrame(frame);
  }
  function start() { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); }
  size(); if (mq.matches) frame(performance.now()); else start();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (mq.matches) frame(performance.now()); }, 150); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else if (!mq.matches) start(); });
})();
