/* Salman IT Tools - homepage UI: icons, hero art, search, filters, grid, theme.
 * Data comes from tools-registry.js. Glyph shapes are from Lucide (ISC licence). */
(function () {
  'use strict';
  var TOOLS = window.SX_TOOLS || [], CATS = window.SX_CATEGORIES || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- Accent palette (icon gradients + card themes) ---------- */
  var ACCENTS = {
    blue:    { a: '#3DA5FF', b: '#0057E8', rgb: '0,102,255' },
    cyan:    { a: '#3DDCFF', b: '#0092D8', rgb: '0,200,255' },
    emerald: { a: '#34EBA0', b: '#00A560', rgb: '0,200,120' },
    teal:    { a: '#35D9C6', b: '#0E8F84', rgb: '20,184,166' },
    green:   { a: '#4BE08E', b: '#12965B', rgb: '34,197,94' },
    amber:   { a: '#FFBE55', b: '#E07B00', rgb: '255,159,28' },
    gold:    { a: '#FFE066', b: '#DB9C00', rgb: '250,204,21' },
    orange:  { a: '#FFA457', b: '#E5500F', rgb: '249,115,22' },
    red:     { a: '#FF7373', b: '#D42B2B', rgb: '239,68,68' }
  };

  /* ---------- Glyphs (24 x 24 grid, stroke style) ---------- */
  var SH = 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z';
  var DOC = 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z M14 2v4a2 2 0 0 0 2 2h4';
  var MAIL = '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>';
  var GLYPHS = {
    bolt: '<path fill="#fff" stroke="none" d="M13.4 2 3.6 13.6a.6.6 0 0 0 .46 1H10l-1 7.4a.5.5 0 0 0 .88.4l9.6-11.6a.6.6 0 0 0-.46-1H14l1-6.8A.5.5 0 0 0 13.4 2z"/>',
    folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    profiles: '<circle cx="12" cy="8" r="4"/><path d="M20 21v-1a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v1"/><path d="m17 5 4 4m0-4-4 4" stroke-width="1.6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    drive: '<path d="M22 12H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01M10 16h.01" stroke-width="2.6"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.2"/>',
    shield: '<path d="' + SH + '"/>',
    'shield-check': '<path d="' + SH + '"/><path d="m9 12 2 2 4-4"/>',
    'office-shield': '<path d="' + SH + '"/><path d="M9 9.5v5l5 1.5V8z" fill="#fff" stroke="none"/>',
    'shield-key': '<path d="' + SH + '"/><circle cx="12" cy="10.5" r="2"/><path d="M12 12.5V16"/>',
    'sp-report': '<path d="' + DOC + '"/><path d="M9 18v-3M12 18v-5M15 18v-2"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
    mail: MAIL,
    'mail-shield': '<path d="M22 11V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path fill="#fff" stroke="none" d="M18 13.2c-1.2.2-2.2-.1-3-.8v3.1c0 2 1.4 3.4 3 4 1.6-.6 3-2 3-4v-3.1c-.8.7-1.8 1-3 .8z"/>',
    'mail-search': '<path d="M22 11V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><circle cx="18" cy="17" r="3"/><path d="m22 21-2-2"/>',
    'pin-globe': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>',
    dns: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01" stroke-width="2.6"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21h3M21 17v4"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    letter: '<path d="' + DOC + '"/><path d="M10 9H8M16 13H8M16 17H8"/>',
    invoice: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    pdf: '<path d="' + DOC + '"/><path d="M8 13h8M8 17h5"/>',
    'pdf-sum': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
    convert: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke-width="2.4"/>',
    seo: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    win: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    office: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    star: '<path fill="currentColor" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5l1.4 2.6a7.5 7.5 0 0 1 2.2.9l2.8-.9 1.6 2.8-2 2.1a7.5 7.5 0 0 1 0 2.4l2 2.1-1.6 2.8-2.8-.9a7.5 7.5 0 0 1-2.2.9L12 21.5l-1.4-2.6a7.5 7.5 0 0 1-2.2-.9l-2.8.9-1.6-2.8 2-2.1a7.5 7.5 0 0 1 0-2.4l-2-2.1 1.6-2.8 2.8.9a7.5 7.5 0 0 1 2.2-.9z"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-4 3 3 6-7"/><path d="M16 7h4v4"/>'
  };

  /* ---------- Icon renderer ---------- */
  function defs() {
    var g = Object.keys(ACCENTS).map(function (k) {
      var c = ACCENTS[k];
      return '<linearGradient id="sxg-' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c.a + '"/><stop offset="1" stop-color="' + c.b + '"/></linearGradient>';
    }).join('');
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' + g +
      '<linearGradient id="sxhl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="sxsd" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>' +
      '<filter id="sxsh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.1" flood-color="#000" flood-opacity=".28"/></filter>' +
      '</defs></svg>';
  }
  function icon(key, accent, cls) {
    var gl = GLYPHS[key] || GLYPHS.layers;
    return '<svg class="sx-ico ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<rect width="64" height="64" rx="16" fill="url(#sxg-' + accent + ')"/>' +
      '<rect width="64" height="64" rx="16" fill="url(#sxsd)"/>' +
      '<rect width="64" height="64" rx="16" fill="url(#sxhl)"/>' +
      '<rect x=".75" y=".75" width="62.5" height="62.5" rx="15.3" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>' +
      '<g transform="translate(15 15) scale(1.4167)" filter="url(#sxsh)" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + gl + '</g></svg>';
  }
  function plain(key) { // small UI glyph, inherits colour
    return '<svg class="sx-g" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (GLYPHS[key] || '') + '</svg>';
  }
  var UI = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    dl: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'
  };
  function ui(k) { return '<svg class="sx-g" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + UI[k] + '</svg>'; }

  /* ---------- Helpers over the registry ---------- */
  var catById = {}; CATS.forEach(function (c) { catById[c.id] = c; });
  var TYPE_LABEL = { 'online': 'Online tool', 'windows-app': 'Windows app', 'android-app': 'Android app' };
  var byId = {}; TOOLS.forEach(function (t) { byId[t.id] = t; });
  function catLabel(t) { return (catById[t.category] || {}).label || ''; }
  function newest(a, b) { return (b.added || '').localeCompare(a.added || ''); }

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function setTheme(t, save) {
    root.setAttribute('data-theme', t);
    if (save) { try { localStorage.setItem('sx-theme', t); } catch (e) {} }
    var b = $('#themeBtn'); if (b) {
      b.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      b.innerHTML = ui(t === 'light' ? 'moon' : 'sun');
    }
    var m = $('meta[name="theme-color"]'); if (m) m.content = t === 'light' ? '#F5F8FC' : '#080F1C';
  }

  /* ---------- Hero artwork ---------- */
  function floatIcon(key, acc, x, y, size, rot, delay, dur) {
    return '<g class="sx-float" style="animation-delay:' + delay + 's;animation-duration:' + dur + 's"><g transform="rotate(' + rot + ' ' + (x + size / 2) + ' ' + (y + size / 2) + ')">' +
      '<ellipse cx="' + (x + size / 2) + '" cy="' + (y + size + 8) + '" rx="' + size * .38 + '" ry="5" fill="#000" opacity=".28"/>' +
      '<svg x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" viewBox="0 0 64 64">' + icon(key, acc).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') + '</svg></g></g>';
  }
  function heroArt() {
    var bloom = '<path d="M120 188c40-60 110-70 170-40 40 20 70 15 100-25" fill="none" stroke="url(#hb)" stroke-width="26" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M130 215c50-35 100-30 150 0s100 10 125-30" fill="none" stroke="url(#hc)" stroke-width="18" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M150 150c30-30 80-34 118-8" fill="none" stroke="#7fe4ff" stroke-width="7" stroke-linecap="round" opacity=".7"/>';
    return '<svg class="sx-hero-svg" viewBox="0 0 640 420" role="img" aria-label="Illustration of a laptop surrounded by tool icons for security, storage, networking, settings and performance">' +
      '<defs>' +
      '<radialGradient id="hg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a84ff" stop-opacity=".55"/><stop offset="1" stop-color="#0a84ff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2a66"/><stop offset=".5" stop-color="#0b4fd0"/><stop offset="1" stop-color="#06b6f5"/></linearGradient>' +
      '<linearGradient id="hb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1d5bff"/><stop offset="1" stop-color="#32d2ff"/></linearGradient>' +
      '<linearGradient id="hc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0b3fd0"/><stop offset="1" stop-color="#18a8ff"/></linearGradient>' +
      '<linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a55"/><stop offset="1" stop-color="#101a2c"/></linearGradient>' +
      '<linearGradient id="hbase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4b66"/><stop offset="1" stop-color="#1a2437"/></linearGradient>' +
      '<linearGradient id="ht" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#00c8ff" stop-opacity="0"/><stop offset=".5" stop-color="#2aa9ff"/><stop offset="1" stop-color="#00c8ff" stop-opacity="0"/></linearGradient>' +
      '<clipPath id="hscr"><rect x="186" y="52" width="268" height="172" rx="6"/></clipPath>' +
      '</defs>' +
      '<ellipse cx="320" cy="250" rx="300" ry="150" fill="url(#hg)"/>' +
      '<path d="M10 330C120 240 200 372 330 330S560 250 632 290" fill="none" stroke="url(#ht)" stroke-width="3"/>' +
      '<path d="M0 300C110 220 200 350 330 312S540 240 640 268" fill="none" stroke="url(#ht)" stroke-width="1.5" opacity=".7"/>' +
      '<path d="M40 370C170 300 260 392 380 356S560 320 620 340" fill="none" stroke="url(#ht)" stroke-width="2" opacity=".6"/>' +
      '<g class="sx-laptop">' +
      '<rect x="176" y="42" width="288" height="192" rx="14" fill="url(#hf)" stroke="#4a5d7c" stroke-opacity=".6"/>' +
      '<rect x="186" y="52" width="268" height="172" rx="6" fill="url(#hs)"/>' +
      '<g clip-path="url(#hscr)">' + bloom +
      '<rect x="186" y="52" width="268" height="172" fill="url(#hg)" opacity=".5"/>' +
      '<g transform="translate(278 98)"><rect x="0" y="0" width="38" height="38" rx="5" fill="#fff" opacity=".92"/><rect x="42" y="0" width="38" height="38" rx="5" fill="#fff" opacity=".78"/><rect x="0" y="42" width="38" height="38" rx="5" fill="#fff" opacity=".78"/><rect x="42" y="42" width="38" height="38" rx="5" fill="#fff" opacity=".6"/></g>' +
      '<rect x="186" y="52" width="268" height="60" fill="#fff" opacity=".05"/></g>' +
      '<path d="M120 258h400l-26-24H146z" fill="url(#hbase)"/><path d="M120 258h400v8a6 6 0 0 1-6 6H126a6 6 0 0 1-6-6z" fill="#0d1626"/>' +
      '<rect x="288" y="260" width="64" height="5" rx="2.5" fill="#05080f" opacity=".7"/></g>' +
      floatIcon('gear', 'blue', 70, 62, 84, -10, 0, 6) +
      floatIcon('shield-check', 'emerald', 478, 18, 88, 8, .8, 7) +
      floatIcon('chart', 'cyan', 548, 150, 82, 8, 1.4, 6.5) +
      floatIcon('drive', 'amber', 112, 176, 82, -8, .4, 7.5) +
      floatIcon('wrench', 'orange', 452, 232, 84, 10, 1.1, 6) +
      floatIcon('network', 'blue', 548, 270, 66, 6, 1.8, 7) +
      '</svg>';
  }
  /* Featured-card artwork (220 x 160) */
  function featArt(id) {
    var a = {
      oneclickfix: '<defs><linearGradient id="fa1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d7bff"/><stop offset="1" stop-color="#0a2f8f"/></linearGradient><linearGradient id="fa2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4d6e"/><stop offset="1" stop-color="#16213a"/></linearGradient></defs>' +
        '<path d="M30 124h150l-12-12H42z" fill="#2a3a58"/><rect x="26" y="124" width="158" height="6" rx="3" fill="#121b30"/>' +
        '<rect x="48" y="30" width="112" height="82" rx="8" fill="url(#fa2)"/><rect x="54" y="36" width="100" height="70" rx="3" fill="url(#fa1)"/>' +
        '<g transform="translate(76 48)" fill="#fff"><rect width="24" height="22" rx="2" opacity=".95"/><rect x="27" width="24" height="22" rx="2" opacity=".8"/><rect y="25" width="24" height="22" rx="2" opacity=".8"/><rect x="27" y="25" width="24" height="22" rx="2" opacity=".62"/></g>' +
        '<g transform="translate(138 76) scale(2.6)">' + '<circle cx="12" cy="12" r="11" fill="#0b3aa8" opacity=".9"/><g fill="none" stroke="#7fd0ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + GLYPHS.gear + '</g></g>',
      filethermal: '<defs><linearGradient id="fb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63738c"/><stop offset="1" stop-color="#2a3650"/></linearGradient><linearGradient id="fb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a74"/><stop offset="1" stop-color="#1a2338"/></linearGradient><linearGradient id="fb3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2cf09c"/><stop offset="1" stop-color="#039a5b"/></linearGradient></defs>' +
        '<path d="M42 62 64 34h96l22 28z" fill="url(#fb1)"/><path d="M42 62h140v52a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8z" fill="url(#fb2)"/><path d="M42 62h140" stroke="#8fa1bd" stroke-opacity=".5"/>' +
        '<ellipse cx="112" cy="52" rx="38" ry="13" fill="#1a2338"/><ellipse cx="112" cy="50" rx="28" ry="9" fill="#313f5a"/><ellipse cx="112" cy="50" rx="7" ry="2.5" fill="#8fa1bd"/>' +
        '<circle cx="58" cy="104" r="3.5" fill="#2cf09c"/><rect x="70" y="102" width="40" height="4" rx="2" fill="#0f1828"/>' +
        '<g transform="translate(128 78)"><circle cx="24" cy="24" r="22" fill="#052a1d" fill-opacity=".55" stroke="url(#fb3)" stroke-width="5"/><circle cx="24" cy="24" r="17" fill="#2cf09c" fill-opacity=".1"/><path d="m40 40 14 14" stroke="url(#fb3)" stroke-width="7" stroke-linecap="round"/></g>',
      'm365-scan': '<defs><linearGradient id="fc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb066"/><stop offset="1" stop-color="#e85d10"/></linearGradient><linearGradient id="fc2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a63c9"/><stop offset="1" stop-color="#1a2a78"/></linearGradient><linearGradient id="fc3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7ff"/><stop offset="1" stop-color="#b9c8ee"/></linearGradient></defs>' +
        '<rect x="62" y="20" width="96" height="86" rx="9" fill="url(#fc2)" transform="rotate(8 110 63)"/><rect x="72" y="30" width="76" height="9" rx="3" fill="#fff" opacity=".35" transform="rotate(8 110 63)"/><rect x="72" y="46" width="60" height="6" rx="3" fill="#fff" opacity=".22" transform="rotate(8 110 63)"/>' +
        '<g transform="translate(88 64)"><path d="M18 78h92a26 26 0 0 0 4-51 34 34 0 0 0-65-8A30 30 0 0 0 18 78z" fill="url(#fc3)"/></g>' +
        '<g transform="translate(112 84) scale(3.2)"><path d="' + SH + '" fill="url(#fc1)" stroke="#fff" stroke-width=".9"/><path d="m9 12 2 2 4-4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>'
    };
    return '<svg class="sx-fart" viewBox="0 0 220 160" aria-hidden="true" focusable="false">' + (a[id] || '') + '</svg>';
  }

  /* ---------- Search ---------- */
  var CAT_ALIASES = { m365: 'm365 o365 office 365 microsoft cloud', windows: 'windows pc computer', security: 'secure safety privacy', network: 'networking internet dns ip', files: 'file files storage disk', developer: 'dev developer code web', productivity: 'documents office', life: 'everyday calculator' };
  function haystack(t) {
    return {
      name: t.name.toLowerCase(),
      kw: (t.keywords || []).join(' ').toLowerCase(),
      desc: t.description.toLowerCase(),
      meta: (catLabel(t) + ' ' + (CAT_ALIASES[t.category] || '') + ' ' + (TYPE_LABEL[t.type] || '') + ' ' + (t.type === 'online' ? 'browser web' : t.type === 'android-app' ? 'phone mobile' : 'download exe pc')).toLowerCase()
    };
  }
  TOOLS.forEach(function (t) { t._h = haystack(t); });
  function search(q) {
    var tokens = q.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
    if (!tokens.length) return [];
    var out = [];
    TOOLS.forEach(function (t) {
      var s = 0, ok = true;
      tokens.forEach(function (tk) {
        var h = t._h, ts = 0;
        if (h.name.indexOf(tk) === 0) ts = 14; else if (h.name.indexOf(tk) > -1) ts = 10;
        if (h.kw.indexOf(tk) > -1) ts = Math.max(ts, 7);
        if (h.meta.indexOf(tk) > -1) ts = Math.max(ts, 4);
        if (h.desc.indexOf(tk) > -1) ts = Math.max(ts, 3);
        if (!ts) ok = false; s += ts;
      });
      if (ok && q.trim().length > 1 && t._h.kw.indexOf(q.toLowerCase().trim()) > -1) s += 6; // whole phrase bonus
      if (ok) out.push({ t: t, s: s });
    });
    out.sort(function (a, b) { return b.s - a.s || a.t.name.localeCompare(b.t.name); });
    return out.map(function (x) { return x.t; });
  }
  function initSearch() {
    var input = $('#sxSearch'), list = $('#sxResults'), clear = $('#sxClear'), box = $('.sx-search');
    if (!input) return;
    var active = -1, items = [];
    function render() {
      var q = input.value.trim();
      clear.hidden = !q;
      if (!q) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); items = []; return; }
      items = search(q).slice(0, 7);
      active = items.length ? 0 : -1;
      if (!items.length) {
        list.innerHTML = '<li class="sx-empty" role="presentation"><strong>No tools match &ldquo;' + esc(q) + '&rdquo;</strong><span>Try a broader word like <em>pdf</em>, <em>network</em>, <em>email</em> or <em>disk space</em>, or <a href="#tools/all">browse all tools</a>.</span></li>';
      } else {
        list.innerHTML = items.map(function (t, i) {
          return '<li role="option" id="sxr' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '"><a href="' + esc(t.download && t.type !== 'online' ? t.url : t.url) + '" tabindex="-1">' + icon(t.icon, t.accent) +
            '<span class="sx-r-txt"><b>' + esc(t.name) + '</b><small>' + esc(t.description) + '</small></span><span class="sx-r-cat">' + esc(catLabel(t)) + '</span></a></li>';
        }).join('');
      }
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
      if (items.length) input.setAttribute('aria-activedescendant', 'sxr0'); else input.removeAttribute('aria-activedescendant');
    }
    function mark(i) {
      var els = $$('[role=option]', list); if (!els.length) return;
      active = (i + els.length) % els.length;
      els.forEach(function (e, n) { e.setAttribute('aria-selected', n === active); });
      input.setAttribute('aria-activedescendant', 'sxr' + active);
      els[active].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', function () { if (input.value.trim()) render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); else mark(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(active - 1); }
      else if (e.key === 'Enter') { if (items[active]) { e.preventDefault(); location.href = items[active].url; } }
      else if (e.key === 'Escape') { if (input.value) { input.value = ''; render(); } else input.blur(); }
    });
    clear.addEventListener('click', function () { input.value = ''; render(); input.focus(); });
    list.addEventListener('mousemove', function (e) { var li = e.target.closest('[role=option]'); if (li) mark(+li.dataset.i); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) { list.hidden = true; input.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); input.select(); }
    });
    var hb = $('#headSearch'); if (hb) hb.addEventListener('click', function () {
      var top = $('.sx-hero'); if (top) top.scrollIntoView({ behavior: 'smooth' }); setTimeout(function () { input.focus(); }, 250);
    });
  }

  /* ---------- Cards ---------- */
  function cardHtml(t) {
    var isDl = !!t.download;
    var cta = isDl ? '<a class="sx-btn sx-btn-sm" href="' + esc(t.download) + '" rel="noopener">' + ui('dl') + 'Download</a>'
      : '<span class="sx-open">' + (t.type === 'android-app' ? 'View App' : 'Open Tool') + ui('arrow') + '</span>';
    return '<article class="sx-card" data-id="' + t.id + '" style="--ac:' + ACCENTS[t.accent].rgb + '">' +
      '<a class="sx-card-link" href="' + esc(t.url) + '">' + icon(t.icon, t.accent, 'sx-ico-lg') +
      '<span class="sx-card-body"><span class="sx-card-name">' + esc(t.name) + (t.status ? ' <em class="sx-tag">' + esc(t.status) + '</em>' : '') + '</span>' +
      '<span class="sx-card-desc">' + esc(t.description) + '</span></span></a>' +
      '<div class="sx-card-foot"><span class="sx-kind sx-kind-' + t.type + '">' + (TYPE_LABEL[t.type] || '') + '<i></i>' + esc(catLabel(t)) + '</span>' + cta + '</div></article>';
  }
  function featHtml(t) {
    var c = ACCENTS[t.accent];
    var cta = t.download ? '<a class="sx-btn sx-btn-ac" href="' + esc(t.url) + '">Explore Tool' + ui('arrow') + '</a>' : '<a class="sx-btn sx-btn-ac" href="' + esc(t.url) + '">Explore Tool' + ui('arrow') + '</a>';
    return '<article class="sx-feat" data-id="' + t.id + '" style="--ac:' + c.rgb + ';--ac1:' + c.a + ';--ac2:' + c.b + '">' +
      '<a class="sx-feat-link" href="' + esc(t.url) + '" aria-label="' + esc(t.name) + '"></a>' +
      '<div class="sx-feat-txt">' + icon(t.icon, t.accent, 'sx-ico-xl') +
      '<div><h3>' + esc(t.name) + '</h3><p>' + esc(t.description) + '</p>' + cta + '</div></div>' +
      '<div class="sx-feat-art">' + featArt(t.id) + '</div></article>';
  }

  /* ---------- Filters / sort / grid ---------- */
  var state = { cat: 'all', kind: 'all', sort: 'featured' };
  var KINDS = [['all', 'All'], ['windows-app', 'Windows apps'], ['online', 'Online tools'], ['android-app', 'Android']];
  function visible() {
    return TOOLS.filter(function (t) { return (state.cat === 'all' || t.category === state.cat) && (state.kind === 'all' || t.type === state.kind); });
  }
  function sorted(list) {
    var l = list.slice();
    var f = function (t) { return t.featured || 99; };
    if (state.sort === 'recent') l.sort(newest);
    else if (state.sort === 'az') l.sort(function (a, b) { return a.name.localeCompare(b.name); });
    else if (state.sort === 'windows') l.sort(function (a, b) { return (a.type === 'windows-app' ? 0 : 1) - (b.type === 'windows-app' ? 0 : 1) || a.name.localeCompare(b.name); });
    else if (state.sort === 'online') l.sort(function (a, b) { return (a.type === 'online' ? 0 : 1) - (b.type === 'online' ? 0 : 1) || a.name.localeCompare(b.name); });
    else l.sort(function (a, b) { return f(a) - f(b) || newest(a, b); });
    return l;
  }
  function renderChips() {
    var cnt = function (id) { return TOOLS.filter(function (t) { return (id === 'all' || t.category === id) && (state.kind === 'all' || t.type === state.kind); }).length; };
    var all = [{ id: 'all', label: 'All Tools', icon: 'layers' }].concat(CATS.filter(function (c) { return TOOLS.some(function (t) { return t.category === c.id; }); }));
    $('#sxChips').innerHTML = all.map(function (c) {
      return '<button type="button" class="sx-chip' + (state.cat === c.id ? ' on' : '') + '" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' + plain(c.icon) + '<span>' + esc(c.label) + '</span><b>' + cnt(c.id) + '</b></button>';
    }).join('');
    $('#sxKinds').innerHTML = KINDS.map(function (k) {
      return '<button type="button" class="sx-seg' + (state.kind === k[0] ? ' on' : '') + '" data-kind="' + k[0] + '" aria-pressed="' + (state.kind === k[0]) + '">' + k[1] + '</button>';
    }).join('');
  }
  function renderGrid() {
    var list = sorted(visible());
    var catName = state.cat === 'all' ? 'All Tools' : (catById[state.cat] || {}).label;
    $('#sxGridTitle').textContent = catName;
    $('#sxCount').textContent = list.length + (list.length === 1 ? ' tool' : ' tools');
    $('#sxGrid').innerHTML = list.length ? list.map(cardHtml).join('') :
      '<p class="sx-none">No tools in this combination yet. <button type="button" class="sx-link" id="sxReset">Show all tools</button></p>';
    var r = $('#sxReset'); if (r) r.onclick = function () { state.cat = 'all'; state.kind = 'all'; sync(); };
  }
  function sync(push) { renderChips(); renderGrid(); if (push) writeHash(); }
  function writeHash() {
    var h = state.cat !== 'all' ? 'cat-' + state.cat : state.kind !== 'all' ? 'kind-' + state.kind : 'all';
    if (history.replaceState) history.replaceState(null, '', '#tools/' + h);
  }
  function readHash() {
    var m = /^#tools\/(all|cat-([\w-]+)|kind-([\w-]+))$/.exec(location.hash);
    if (!m) return false;
    state.cat = 'all'; state.kind = 'all';
    if (m[2] && catById[m[2]]) state.cat = m[2];
    if (m[3]) state.kind = m[3];
    return true;
  }
  function initGrid() {
    $('#sxFeatured').innerHTML = TOOLS.filter(function (t) { return t.featured; }).sort(function (a, b) { return a.featured - b.featured; }).slice(0, 3).map(featHtml).join('');
    $('#sxChips').addEventListener('click', function (e) { var b = e.target.closest('.sx-chip'); if (b) { state.cat = b.dataset.cat; sync(true); } });
    $('#sxKinds').addEventListener('click', function (e) { var b = e.target.closest('.sx-seg'); if (b) { state.kind = b.dataset.kind; sync(true); } });
    $('#sxSort').addEventListener('change', function (e) { state.sort = e.target.value; renderGrid(); });
    // Categories dropdown + footer category links
    var dd = $('#catMenu'); dd.innerHTML = CATS.filter(function (c) { return TOOLS.some(function (t) { return t.category === c.id; }); }).map(function (c) {
      return '<a role="menuitem" href="#tools/cat-' + c.id + '">' + plain(c.icon) + esc(c.label) + '<b>' + TOOLS.filter(function (t) { return t.category === c.id; }).length + '</b></a>';
    }).join('');
    var mm = $('#mobCats'); if (mm) mm.innerHTML = $('#catMenu').innerHTML.replace(/role="menuitem"/g, '');
    $('#footCats').innerHTML = CATS.filter(function (c) { return TOOLS.some(function (t) { return t.category === c.id; }); }).map(function (c) { return '<li><a href="#tools/cat-' + c.id + '">' + esc(c.label) + '</a></li>'; }).join('');
    $('#footTools').innerHTML = TOOLS.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (t) { return '<li><a href="' + esc(t.url) + '">' + esc(t.name) + '</a></li>'; }).join('');
    readHash(); sync();
    window.addEventListener('hashchange', function () { if (readHash()) { sync(); var s = $('#tools'); if (s) s.scrollIntoView({ behavior: 'smooth' }); } });
    if (/^#tools\//.test(location.hash)) setTimeout(function () { $('#tools').scrollIntoView(); }, 60);
  }
  function initWinApps() {
    var host = $('#sxWinApps'); if (!host) return;
    host.innerHTML = TOOLS.filter(function (t) { return t.download; }).map(function (t) {
      return '<article class="sx-wapp" style="--ac:' + ACCENTS[t.accent].rgb + '"><div class="sx-wapp-h">' + icon(t.icon, t.accent, 'sx-ico-lg') +
        '<div><h3>' + esc(t.name) + (t.version ? ' <em class="sx-tag">' + esc(t.version) + '</em>' : '') + '</h3><p>' + esc(t.description) + '</p></div></div>' +
        '<ul class="sx-feats">' + (t.features || []).map(function (f) { return '<li>' + ui('check') + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
        '<div class="sx-wapp-f"><div class="sx-metas">' + (t.meta || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div>' +
        '<a class="sx-btn" href="' + esc(t.download) + '" rel="noopener">' + ui('dl') + 'Download .exe</a></div></article>';
    }).join('');
  }

  /* ---------- Header behaviour ---------- */
  function initHeader() {
    var cb = $('#catBtn'), cm = $('#catMenu');
    function closeCat() { cm.classList.remove('open'); cb.setAttribute('aria-expanded', 'false'); }
    cb.addEventListener('click', function (e) { e.stopPropagation(); var o = cm.classList.toggle('open'); cb.setAttribute('aria-expanded', o); });
    cm.addEventListener('click', closeCat);
    document.addEventListener('click', function (e) { if (!cb.contains(e.target)) closeCat(); });
    var mb = $('#menuBtn'), mp = $('#mobPanel');
    function setMob(o) { mp.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); mb.innerHTML = ui(o ? 'close' : 'menu'); mb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
    mb.addEventListener('click', function () { setMob(!mp.classList.contains('open')); });
    mp.addEventListener('click', function (e) { if (e.target.closest('a,button')) setMob(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeCat(); setMob(false); } });
    mb.innerHTML = ui('menu');
    $('#headSearch').innerHTML = ui('search'); $('#catBtn').insertAdjacentHTML('beforeend', ui('chev'));
    $('#themeBtn').addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light', true); });
    setTheme(root.getAttribute('data-theme') || 'dark');
    // active-section highlight
    var links = $$('.sx-nav-links a[data-sec]');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('on', l.dataset.sec === e.target.id); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
      ['top', 'tools', 'windows-apps'].forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
    }
  }


  function boot() {
    document.body.insertAdjacentHTML('afterbegin', defs());
    $('#sxHeroArt').innerHTML = heroArt();
    $$('[data-gl]').forEach(function (el) { el.innerHTML = plain(el.dataset.gl); });
    initHeader(); initSearch(); initGrid(); initWinApps();
  }
  window.SX = { icon: icon, ACCENTS: ACCENTS, GLYPHS: GLYPHS, tools: TOOLS, search: search };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
