/* Salman IT Tools - shared site header for tool/guide/legal pages (matches the homepage header).
 * Hides the page's old <nav> (kept in the DOM so existing scripts keep working) and inserts this one.
 * Categories come from tools-registry.js. */
(function () {
  'use strict';
  if (document.querySelector('.sxh')) return;
  var old = null;
  Array.prototype.some.call(document.querySelectorAll('nav'), function (n) { if (n.querySelector('.nav-logo, .logo')) { old = n; return true; } });
  var oldMob = document.querySelector('.mobile-menu');
  var cats = (window.SX_CATEGORIES || []).filter(function (c) { return (window.SX_TOOLS || []).some(function (t) { return t.category === c.id; }); });
  var count = function (id) { return (window.SX_TOOLS || []).filter(function (t) { return t.category === id; }).length; };

  var css = '.sxh{position:sticky;top:0;z-index:600;background:linear-gradient(180deg,rgba(60,100,160,.28),rgba(20,35,60,.55));backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4);border-bottom:1px solid rgba(140,190,255,.28);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 10px 30px rgba(0,0,0,.35);font-family:Inter,"Segoe UI",system-ui,sans-serif}' +
    '.sxh *{box-sizing:border-box}.sxh-in{max-width:1240px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;gap:24px}' +
    '.sxh-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:#F8FAFC;font-weight:800;font-size:1.2rem;letter-spacing:-.02em;white-space:nowrap}.sxh-logo svg{width:28px;height:28px;filter:drop-shadow(0 0 8px rgba(0,160,255,.45))}.sxh-logo span{color:#38BDF8}' +
    '.sxh-links{display:flex;align-items:center;gap:4px;margin:0 auto}.sxh-links>a,.sxh-dd>button{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:999px;text-decoration:none;color:#CBD5E1;font:500 .93rem Inter,system-ui,sans-serif;background:none;border:1px solid transparent;cursor:pointer;white-space:nowrap;transition:background .18s,color .18s}' +
    '.sxh-links>a:hover,.sxh-dd>button:hover{color:#fff;background:rgba(255,255,255,.08)}.sxh-links>a.on{color:#fff;background:linear-gradient(180deg,#0a72ff,#0052d6);border-color:rgba(120,190,255,.35)}' +
    '.sxh-dd{position:relative}.sxh-dd svg{width:12px;height:12px;transition:transform .2s}.sxh-dd button[aria-expanded=true] svg{transform:rotate(180deg)}' +
    '.sxh-menu{position:absolute;top:calc(100% + 8px);left:50%;translate:-50% 0;min-width:230px;background:#142033;border:1px solid #26364D;border-radius:14px;padding:6px;box-shadow:0 14px 34px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .15s,transform .15s,visibility .15s}.sxh-menu.open{opacity:1;visibility:visible;transform:none}' +
    '.sxh-menu a{display:flex;align-items:center;padding:9px 12px;border-radius:9px;text-decoration:none;color:#CBD5E1;font-size:.92rem}.sxh-menu a:hover{background:#19283D;color:#fff}.sxh-menu a b{margin-left:auto;font-weight:600;font-size:.78rem;color:#94A3B8}' +
    '.sxh-act{display:flex;gap:8px;align-items:center}.sxh-btn{display:inline-flex;align-items:center;padding:7px 15px;border-radius:10px;font:600 .85rem Inter,system-ui,sans-serif;text-decoration:none;color:#fff;background:linear-gradient(180deg,#0a72ff,#0052d6);border:1px solid rgba(120,190,255,.3);box-shadow:0 6px 16px rgba(0,82,214,.3)}.sxh-btn:hover{filter:brightness(1.1)}' +
    '.sxh-ib{width:40px;height:38px;display:inline-grid;place-items:center;border-radius:11px;border:1px solid #26364D;background:#142033;color:#CBD5E1;cursor:pointer;text-decoration:none}.sxh-ib:hover{color:#fff;border-color:#00C8FF}.sxh-ib svg{width:19px;height:19px}.sxh-burger{display:none}' +
    '.sxh-mob{display:none;position:absolute;left:0;right:0;top:100%;background:#142033;border-bottom:1px solid #26364D;padding:10px 16px 16px;box-shadow:0 14px 34px rgba(0,0,0,.5);max-height:calc(100vh - 60px);overflow:auto}.sxh-mob.open{display:block}' +
    '.sxh-mob a{display:flex;align-items:center;padding:13px 10px;border-radius:10px;text-decoration:none;color:#CBD5E1;font:500 1rem Inter,system-ui,sans-serif}.sxh-mob a:hover{background:#19283D;color:#fff}.sxh-mob a b{margin-left:auto;font-size:.78rem;color:#94A3B8}.sxh-mob h5{margin:12px 10px 4px;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8}' +
    '@media(max-width:1060px){.sxh-btn{display:none}}@media(max-width:900px){.sxh-links{display:none}.sxh-burger{display:inline-grid}.sxh-act{margin-left:auto}.sxh-in{padding:0 16px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var I = { search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', close: '<path d="M18 6 6 18M6 6l12 12"/>', chev: '<path d="m6 9 6 6 6-6"/>' };
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>'; };
  var catLinks = cats.map(function (c) { return '<a href="index.html#tools/cat-' + c.id + '">' + c.label + '<b>' + count(c.id) + '</b></a>'; }).join('');

  var h = document.createElement('header'); h.className = 'sxh';
  h.innerHTML = '<div class="sxh-in"><a class="sxh-logo" href="index.html" aria-label="Salman IT Tools home"><svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="sxhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00C8FF"/><stop offset="1" stop-color="#0066FF"/></linearGradient></defs><path fill="url(#sxhg)" d="M19.6 2 5.4 18.2a1 1 0 0 0 .75 1.65H13l-1.7 9.2a.8.8 0 0 0 1.4.65l14-16.7a1 1 0 0 0-.76-1.64H19l1.6-8.4A.8.8 0 0 0 19.6 2z"/></svg><b>Salman IT <span>Tools</span></b></a>' +
    '<div class="sxh-links" role="navigation" aria-label="Main"><a href="index.html">Home</a><a href="index.html#tools/all">All Tools</a>' +
    '<div class="sxh-dd"><button type="button" aria-haspopup="true" aria-expanded="false">Categories' + svg('chev') + '</button><div class="sxh-menu">' + catLinks + '</div></div>' +
    '<a href="guides.html">Guides</a><a href="index.html#about">About</a></div>' +
    '<div class="sxh-act"><a class="sxh-btn" href="index.html#contact">Contact</a><a class="sxh-ib" href="index.html#search" aria-label="Search tools">' + svg('search') + '</a><button type="button" class="sxh-ib sxh-burger" aria-label="Open menu" aria-expanded="false">' + svg('menu') + '</button></div></div>' +
    '<div class="sxh-mob"><a href="index.html">Home</a><a href="index.html#tools/all">All Tools</a><a href="guides.html">Guides</a><h5>Categories</h5>' + catLinks + '<h5>More</h5><a href="index.html#about">About</a><a href="index.html#faq">FAQ</a><a href="index.html#contact">Contact</a></div>';
  document.body.insertBefore(h, document.body.firstChild);

  // mark current section
  var path = location.pathname.split('/').pop();
  if (path === 'guides.html' || /^guide-/.test(path)) Array.prototype.forEach.call(h.querySelectorAll('.sxh-links>a'), function (a) { if (a.getAttribute('href') === 'guides.html') a.classList.add('on'); });

  if (old) old.style.display = 'none';
  if (oldMob) oldMob.style.display = 'none';

  var dd = h.querySelector('.sxh-dd button'), menu = h.querySelector('.sxh-menu'), bg = h.querySelector('.sxh-burger'), mob = h.querySelector('.sxh-mob');
  dd.addEventListener('click', function (e) { e.stopPropagation(); var o = menu.classList.toggle('open'); dd.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { menu.classList.remove('open'); dd.setAttribute('aria-expanded', 'false'); } });
  bg.addEventListener('click', function () { var o = mob.classList.toggle('open'); bg.setAttribute('aria-expanded', o); bg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); bg.innerHTML = svg(o ? 'close' : 'menu'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { menu.classList.remove('open'); mob.classList.remove('open'); } });
})();
