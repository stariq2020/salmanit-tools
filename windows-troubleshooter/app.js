/* What's Wrong With My PC? — user interface.
 * All dynamic text is inserted with textContent / createTextNode, never as HTML, so user input cannot inject markup. */
(function () {
  'use strict';
  var WT = window.WT, KB = window.WT_KB;
  if (!WT || !KB) return;

  var STORE_KEY = 'wt.session.v1';
  var session = WT.createSession('easy');
  var userAction = false;
  var ai = { enabled: false };

  /* ---------- tiny DOM helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { append(el, x); });
    else if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else el.appendChild(c);
  }
  function md(str) {   // **bold**, `code`, {{kbd}} -> DOM nodes
    var frag = document.createDocumentFragment();
    WT.parseMarkup(str).forEach(function (t) {
      if (t.t === 'text') frag.appendChild(document.createTextNode(t.v));
      else frag.appendChild(h(t.t === 'b' ? 'strong' : t.t, { text: t.v }));
    });
    return frag;
  }
  var ICONS = {
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 11v2"/>',
    usb: '<path d="M12 3v14"/><circle cx="12" cy="19" r="2"/><path d="m12 9-4 3v3"/><rect x="6.5" y="15" width="3" height="3"/><path d="m12 7 4 3v2"/><rect x="14.5" y="12" width="3" height="3"/>',
    snow: '<path d="M12 2v20"/><path d="m4.9 7 14.2 10"/><path d="M4.9 17 19.1 7"/>',
    bluetooth: '<path d="m7 7 10 10-5 5V2l5 5L7 17"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    up: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
  };
  var NS = 'http://www.w3.org/2000/svg';
  function icon(name, size) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size || 18); s.setAttribute('height', size || 18);
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || ICONS.info;   // static, trusted icon markup only
    return s;
  }
  var CAT_ICON = { performance: 'gauge', network: 'wifi', windows: 'monitor', av: 'volume', devices: 'usb', m365: 'mail', hardware: 'battery' };

  /* ---------- storage (always optional) ---------- */
  function save() { try { if (session.phase === 'home') sessionStorage.removeItem(STORE_KEY); else sessionStorage.setItem(STORE_KEY, JSON.stringify(session)); } catch (e) { /* storage blocked: tool still works */ } }
  function loadSaved() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY); if (!raw) return null;
      var s = JSON.parse(raw);
      if (s && s.phase && s.phase !== 'home' && (!s.flowId || WT.getFlow(s.flowId))) return s;
    } catch (e) { /* ignore */ }
    return null;
  }
  function deleteSession() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } }

  /* ---------- helpers ---------- */
  function live(msg) { var l = $('live'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = msg; }, 30); } }
  function update(next, opts) {
    session = next; userAction = true; save(); render();
    if (!opts || opts.scroll !== false) { var a = $('app'); if (a && a.getBoundingClientRect().top < 0) a.scrollIntoView({ block: 'start' }); }
  }
  function copyText(text, btn, done) {
    function ok() { if (btn) { var old = (btn.getAttribute('data-label') || btn.textContent).trim(); btn.setAttribute('data-label', old); btn.lastChild.textContent = ' ' + (done || 'Copied!'); setTimeout(function () { btn.lastChild.textContent = ' ' + old; }, 1800); } live('Copied to clipboard'); }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, fallback); } else fallback();
    function fallback() {
      var ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;left:-9999px;top:0' }); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { live('Copy failed. Select the text and copy it manually.'); } document.body.removeChild(ta);
    }
  }
  function btn(label, cls, onclick, ic, extra) {
    var b = h('button', Object.assign({ type: 'button', class: 'btn ' + (cls || ''), onclick: onclick }, extra || {}));
    if (ic) b.appendChild(icon(ic, 16));
    b.appendChild(document.createTextNode(' ' + label));
    // keep text in last child for copy feedback
    return b;
  }
  function note(kind, ic, content, role) { return h('div', { class: 'note ' + kind, role: role || null }, icon(ic, 20), h('div', null, content)); }

  /* ---------- entry points ---------- */
  function startFromText(text) {
    var s = WT.begin(WT.createSession(session.mode), text);
    if ((s.phase === 'unknown' || s.phase === 'pickFlow') && ai.enabled && $('ai-consent') && $('ai-consent').checked) {
      askAI(s); return;
    }
    update(s);
  }
  function startFlow(id) { update(WT.chooseFlow(WT.createSession(session.mode), id)); }

  function askAI(s) {
    var b = $('find-btn'); if (b) { b.disabled = true; b.lastChild.textContent = ' Thinking…'; }
    var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 9000);
    fetch(ai.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal, body: JSON.stringify({ text: s.text, flowIds: KB.flows.map(function (f) { return f.id; }), consent: true }) })
      .then(function (r) { if (!r.ok) throw new Error('ai'); return r.json(); })
      .then(function (r) { var ids = (r && Array.isArray(r.flowIds) ? r.flowIds : []).filter(function (x) { return typeof x === 'string' && WT.getFlow(x); }); update(ids.length ? WT.suggest(s, ids) : s); })
      .catch(function () { update(s); })
      .then(function () { clearTimeout(timer); if (b) { b.disabled = false; b.lastChild.textContent = ' Find My Fix'; } });
  }

  /* ---------- rendering ---------- */
  function render() {
    var inSession = session.phase !== 'home';
    document.body.classList.toggle('in-session', inSession);
    var view = WT.getView(session), root = $('view');
    root.textContent = '';
    if (!inSession) { updateResumeBanner(); renderToolbar(null); $('progress').textContent = ''; return; }
    renderToolbar(view);
    renderProgress(view);
    var node;
    switch (view.phase) {
      case 'question': node = questionView(view); break;
      case 'pickFlow': node = pickView(view); break;
      case 'unknown': node = unknownView(); break;
      case 'steps': node = stepView(view); break;
      case 'skipHelp': node = skipView(view); break;
      case 'safety': node = safetyView(view); break;
      default: node = finishView(view);
    }
    root.appendChild(node);
    var hd = root.querySelector('h2');
    if (userAction && hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
    live((view.progress && view.progress.label ? view.progress.label + '. ' : '') + (hd ? hd.textContent : ''));
  }

  function renderToolbar(view) {
    var t = $('toolbar'); t.textContent = '';
    if (!view) return;
    t.appendChild(btn('Back', 'small', function () { update(WT.back(session)); }, 'back', { disabled: !view.canBack, 'aria-label': 'Go back to the previous question or step' }));
    t.appendChild(btn('Start over', 'small', function () { update(WT.restart(session)); window.scrollTo({ top: 0 }); }, 'reset'));
    t.appendChild(h('span', { class: 'spacer' }));
    var sel = h('select', { class: 'sel', id: 'ver-sel', 'aria-label': 'Windows version', onchange: function (e) { update(WT.setVersion(session, e.target.value === '' ? null : e.target.value), { scroll: false }); } },
      h('option', { value: '', text: 'Windows version: not set' }), h('option', { value: '11', text: 'Windows 11' }), h('option', { value: '10', text: 'Windows 10' }), h('option', { value: 'unsure', text: 'Not sure' }));
    sel.value = session.version === null ? '' : session.version;
    t.appendChild(sel);
    t.appendChild(h('div', { class: 'seg', role: 'group', 'aria-label': 'Instruction detail' },
      h('button', { type: 'button', 'aria-pressed': String(session.mode === 'easy'), onclick: function () { update(WT.setMode(session, 'easy'), { scroll: false }); }, text: 'Easy' }),
      h('button', { type: 'button', 'aria-pressed': String(session.mode === 'advanced'), onclick: function () { update(WT.setMode(session, 'advanced'), { scroll: false }); }, text: 'Advanced' })));
    t.appendChild(btn('Delete session', 'small danger', function () { deleteSession(); update(WT.restart(session)); window.scrollTo({ top: 0 }); live('Session deleted'); }, 'trash'));
  }
  function renderProgress(view) {
    var p = $('progress'); p.textContent = '';
    if (!view.progress.label && view.phase !== 'unknown' && view.phase !== 'pickFlow') return;
    var pct = view.progress.pct;
    p.appendChild(h('div', { class: 'meta' }, h('span', { text: view.flow ? view.flow.title : 'Finding your problem' }), h('span', { text: view.progress.label })));
    p.appendChild(h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Troubleshooting progress' }, h('i', { style: 'width:' + pct + '%' })));
  }

  function questionView(v) {
    var q = v.question, kids = [h('div', { class: 'crumb-flow', text: v.flow.title }), h('h2', { text: q.text })];
    if (q.help) kids.push(h('p', { class: 'lead', text: q.help }));
    if (q.id === 'version') kids.push(note('info', 'info', 'Windows 10 reached its standard end of support on 14 October 2025. Some devices still receive Extended Security Updates or other support arrangements. These guides cover both versions.'));
    if (v.prefilled && v.prefilled.length) kids.push(note('ok', 'check', ['I picked up from your description: ', v.prefilled.map(function (p) { return p.q + ' → ' + p.a; }).join('; '), '. I won’t ask again.']));
    kids.push(h('div', { class: 'opts', role: 'group', 'aria-label': q.text }, q.options.map(function (o) {
      return h('button', { type: 'button', class: 'opt', onclick: function () { update(WT.answer(session, q.id, o.v)); } }, h('span', { class: 'dot' }), h('span', { text: o.label }));
    })));
    if (q.id === 'version') kids.push(h('p', { class: 'expect' }, 'Check quickly: press ', h('kbd', { text: 'Windows key + R' }), ', type ', h('code', { text: 'winver' }), ' and press Enter.'));
    return h('div', { class: 'panel' }, kids);
  }

  function pickView(v) {
    return h('div', { class: 'panel' }, h('h2', { text: 'Which of these sounds closest?' }),
      h('p', { class: 'lead', text: 'Your description could match more than one problem. Pick the best fit, or add more detail and search again.' }),
      h('div', { class: 'cand' }, v.candidates.map(function (c) {
        return h('button', { type: 'button', class: 'opt', onclick: function () { update(WT.chooseFlow(session, c.id)); } }, icon(CAT_ICON[c.cat] || 'info', 20), h('span', null, c.title, h('small', { text: c.blurb })));
      })),
      h('div', { class: 'actions' }, btn('None of these - describe it again', '', function () { update(WT.restart(session)); focusInput(); }, 'search')));
  }

  function unknownView() {
    var codes = session.codes || [];
    var kids = [h('h2', { text: 'I couldn’t match that to a known problem yet' }),
      h('p', { class: 'lead', text: 'Rather than guess, let’s narrow it down. Try adding what you see on screen, any error message or code, and what you were doing when it started. Or pick a category below.' })];
    if (codes.length) kids.push(note('info', 'info', ['Codes I noticed: ', codes.join(', '), '. They aren’t in my library yet, so search the code in the error-code library further down this page or on Microsoft Support.']));
    kids.push(h('div', { class: 'actions' }, btn('Describe it again', 'primary', function () { update(WT.restart(session)); focusInput(); }, 'search')));
    kids.push(browseGrid());
    return h('div', { class: 'panel' }, kids);
  }

  function safetyView(v) {
    var s = v.safety;
    return h('div', { class: 'panel' }, h('h2', { text: s.title }), h('div', { class: 'note danger', role: 'alert' }, icon('alert', 22), h('div', null, s.text.map(function (t) { return h('p', { text: t, style: 'margin:0 0 8px' }); }))),
      h('p', { class: 'lead', text: 'The troubleshooting steps have been stopped because continuing could be unsafe.' }),
      h('div', { class: 'actions' }, btn('Start a new diagnosis', 'primary', function () { update(WT.restart(session)); window.scrollTo({ top: 0 }); }, 'reset'), btn('Copy summary', '', function (e) { copyText(WT.reportToText(WT.buildReport(session)), e.currentTarget); }, 'copy')));
  }

  function metaRow(v) {
    var s = v.step;
    return h('div', { class: 'meta-row' }, h('span', { class: 'pill', text: '⏱ ' + s.time }), h('span', { class: 'pill', text: 'Difficulty: ' + s.diff }),
      s.admin ? h('span', { class: 'pill w', text: 'Administrator rights needed' }) : h('span', { class: 'pill g', text: 'No admin rights needed' }),
      v.flow.risk ? h('span', { class: 'pill', text: 'Risk: ' + v.flow.risk }) : null);
  }

  function commandCard(c) {
    var cmdText = c.cmd;
    return h('div', { class: 'cmd' },
      h('div', { class: 'cmd-top' }, h('pre', null, h('code', { text: cmdText })), btn('Copy', 'small', function (e) { copyText(cmdText, e.currentTarget); }, 'copy', { 'aria-label': 'Copy command ' + cmdText.split('\n')[0] })),
      h('dl', null,
        h('dt', { text: 'Run it in' }), h('dd', null, md(c.shell)),
        h('dt', { text: 'Administrator' }), h('dd', { text: c.admin ? 'Yes - required' : 'No' }),
        h('dt', { text: 'What it does' }), h('dd', { text: c.what }),
        h('dt', { text: 'When to use it' }), h('dd', { text: c.when }),
        h('dt', { text: 'Before you start' }), h('dd', { text: c.prereq }),
        h('dt', { text: 'Expected output' }), h('dd', { text: c.output }),
        h('dt', { text: 'How to read it' }), h('dd', { text: c.interpret }),
        h('dt', { text: 'Caution' }), h('dd', { text: c.caution }),
        c.placeholder ? h('dt', { text: 'Note' }) : null, c.placeholder ? h('dd', { text: 'Replace the text in <angle brackets> yourself before running. Never paste addresses from sources you do not trust.' }) : null));
  }

  function stepView(v) {
    var s = v.step, kids = [h('div', { class: 'crumb-flow', text: v.flow.title }), h('h2', { text: s.title }), metaRow(v), h('p', { class: 'lead' }, md(s.why))];
    if (s.index === 0 && session.version === '10') kids.push(note('info', 'info', 'You’re on Windows 10. Its standard support ended on 14 October 2025; check whether your device has Extended Security Updates, or plan an upgrade to Windows 11 where supported.'));
    if (s.index === 0 && v.causes && v.causes.length) kids.push(h('details', { class: 'more' }, h('summary', { text: 'Possible causes (hypotheses, not confirmed)' }), h('div', null, h('ul', { style: 'margin-left:18px' }, v.causes.map(function (c) { return h('li', { text: c }); })), h('p', { style: 'margin-top:8px', text: 'I can’t see your PC, so these are likely causes based on your answers, not a diagnosis.' }))));
    s.sets.forEach(function (set) {
      if (set.label) kids.push(h('div', { class: 'setlabel', text: set.label }));
      kids.push(h('ol', { class: 'how' }, set.lines.map(function (l) { return h('li', null, md(l)); })));
    });
    if (s.warn) kids.push(note('warn', 'alert', md(s.warn)));
    if (s.safety) kids.push(note('warn', 'shield', [h('strong', { text: s.safety.title + '. ' }), md(s.safety.text[0])]));
    if (s.admin) kids.push(note('info', 'info', 'This step needs administrator rights. On a work or school device, ask your IT team if it is blocked.'));
    if (s.result) kids.push(h('p', { class: 'expect' }, h('b', { text: 'What you should see: ' }), md(s.result)));
    if (session.mode === 'advanced') {
      s.advanced.forEach(function (a) { kids.push(note('info', 'info', md(a))); });
      s.commands.forEach(function (c) { kids.push(commandCard(c)); });
    } else if (s.commandsAvailable) {
      kids.push(note('info', 'info', ['There is a command-line option for this step. Switch to ', h('strong', { text: 'Advanced' }), ' at the top to see it.']));
    }
    if (s.fail) kids.push(h('details', { class: 'more' }, h('summary', { text: 'If this doesn’t work' }), h('div', null, md(s.fail))));
    if (s.link) kids.push(h('p', { class: 'expect' }, h('a', { href: s.link.url, target: '_blank', rel: 'noopener noreferrer', text: s.link.label + ' ↗' })));
    if (v.flow.ms && s.index === 0) kids.push(h('p', { class: 'expect' }, h('a', { href: v.flow.ms.url, target: '_blank', rel: 'noopener noreferrer', text: v.flow.ms.label + ' ↗' })));
    kids.push(h('div', { class: 'ask-solved', role: 'group', 'aria-labelledby': 'solved-q' }, h('h3', { id: 'solved-q', text: 'Did this solve your problem?' }),
      h('div', { class: 'row' },
        btn('Yes, it’s fixed!', 'primary', function () { update(WT.stepResult(session, 'fixed')); }, 'check'),
        btn('No, still having trouble', '', function () { update(WT.stepResult(session, 'notfixed')); }, 'arrow'),
        btn('I couldn’t complete this step', '', function () { update(WT.stepResult(session, 'skipped')); }, 'info'))));
    return h('div', { class: 'panel' }, kids);
  }

  function skipView(v) {
    return h('div', { class: 'panel' }, h('div', { class: 'crumb-flow', text: v.flow.title }), h('h2', { text: 'That’s okay - some steps aren’t possible on every PC' }),
      note('info', 'info', md(v.skipHelp)),
      h('p', { class: 'lead', text: 'You can move on to the next step, or stop here and ask IT or a technician for help. I’ll record that you couldn’t complete this one.' }),
      h('div', { class: 'actions' }, btn('Try the next step', 'primary', function () { update(WT.afterSkip(session, 'continue')); }, 'arrow'), btn('Get help from IT or a technician', '', function () { update(WT.afterSkip(session, 'escalate')); }, 'info')));
  }

  function reportNode(report) {
    var box = h('div', { class: 'report', id: 'report-box' });
    report.blocks.forEach(function (b) {
      if (b.t === 'title') box.appendChild(h('p', { class: 'rt', text: b.text }));
      else if (b.t === 'h') box.appendChild(h('h3', { text: b.text }));
      else if (b.t === 'li') { var last = box.lastChild; if (!last || last.tagName !== 'UL') { last = h('ul'); box.appendChild(last); } last.appendChild(h('li', { text: b.text })); }
      else box.appendChild(h('p', { text: b.text }));
    });
    return box;
  }
  function download(report) {
    var bytes = WT.buildPdfBytes(report), blob = new Blob([bytes], { type: 'application/pdf' }), url = URL.createObjectURL(blob);
    var a = h('a', { href: url, download: 'pc-troubleshooting-summary-' + new Date().toISOString().slice(0, 10) + '.pdf' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    live('PDF downloaded');
  }
  function printReport(report) {
    var pa = $('print-area'); pa.textContent = '';
    pa.appendChild(h('h1', { text: report.title }));
    report.blocks.forEach(function (b) {
      if (b.t === 'h') pa.appendChild(h('h2', { text: b.text }));
      else if (b.t === 'li') { var last = pa.lastChild; if (!last || last.tagName !== 'UL') { last = h('ul'); pa.appendChild(last); } last.appendChild(h('li', { text: b.text })); }
      else if (b.t === 'p') pa.appendChild(h('p', { text: b.text }));
    });
    window.print();
  }

  function finishView(v) {
    var ok = v.phase === 'resolved', report = v.report, box;
    var kids = [h('div', { class: 'crumb-flow', text: v.flow ? v.flow.title : '' })];
    if (ok) {
      kids.push(h('h2', { text: 'Great - glad that’s sorted' }), note('ok', 'check', 'You reported the problem as fixed. If it comes back, start a new diagnosis and note when it happens. Keep important files backed up.', 'status'));
    } else {
      kids.push(h('h2', { text: 'Time to hand this to a person' }), note('warn', 'alert', ['I’ve run out of safe steps for this problem. ', v.escalation], 'status'));
      kids.push(note('info', 'info', 'If this is a work or school device, contact your IT administrator before trying anything further. Never share passwords, BitLocker recovery keys or verification codes.'));
    }
    kids.push(h('h3', { text: 'Your troubleshooting summary', style: 'margin-top:18px' }));
    box = h('div', { id: 'report-wrap' }, reportNode(report));
    kids.push(box);
    kids.push(h('label', { for: 'it-notes', class: 'expect', text: 'Optional notes for an IT technician (do not include passwords or keys):' }));
    var ta = h('textarea', { id: 'it-notes', class: 'notes', maxlength: '500', oninput: function (e) { session = WT.setNotes(session, e.target.value); save(); }, onchange: function () { $('report-wrap').textContent = ''; $('report-wrap').appendChild(reportNode(WT.buildReport(session))); } });
    ta.value = session.notes || ''; kids.push(ta);
    kids.push(h('div', { class: 'actions' },
      btn('Copy summary', 'primary', function (e) { copyText(WT.reportToText(WT.buildReport(session)), e.currentTarget); }, 'copy'),
      btn('Print', '', function () { printReport(WT.buildReport(session)); }, 'printer'),
      btn('Download PDF', '', function () { download(WT.buildReport(session)); }, 'download'),
      btn('Start a new diagnosis', '', function () { update(WT.restart(session)); window.scrollTo({ top: 0 }); }, 'reset')));
    kids.push(feedbackNode());
    return h('div', { class: 'panel' }, kids);
  }

  function feedbackNode() {
    var wrap = h('div', { class: 'fb', role: 'group', 'aria-label': 'Feedback' }, h('span', { text: 'Was this helpful?' }));
    function vote(kind) {
      try { var d = JSON.parse(localStorage.getItem('wt.fb') || '{}'); d[kind] = (d[kind] || 0) + 1; localStorage.setItem('wt.fb', JSON.stringify(d)); } catch (e) { /* ignore */ }
      wrap.textContent = ''; wrap.appendChild(h('span', null, 'Thanks for the feedback. It stays in your browser. To suggest a fix or a missing problem, use the ', h('a', { href: 'index.html#contact', text: 'contact form' }), '.')); live('Thanks for the feedback');
    }
    var down = btn('No', 'small', function () { vote('down'); }, 'up'); down.firstChild.style.transform = 'rotate(180deg)';
    wrap.appendChild(btn('Yes', 'small', function () { vote('up'); }, 'up')); wrap.appendChild(down);
    return wrap;
  }

  /* ---------- browse + libraries ---------- */
  function browseGrid() {
    var g = h('div', { class: 'catgrid' });
    Object.keys(KB.categories).forEach(function (cat) {
      var ul = h('ul');
      KB.flows.filter(function (f) { return f.cat === cat; }).forEach(function (f) {
        ul.appendChild(h('li', null, h('a', { href: '?issue=' + f.id, onclick: function (e) { e.preventDefault(); startFlow(f.id); }, text: f.title })));
      });
      g.appendChild(h('div', { class: 'cat' }, h('h3', null, icon(CAT_ICON[cat], 18), KB.categories[cat].label), ul));
    });
    return g;
  }

  function errorCard(e) {
    var row = h('div', { class: 'row' });
    (e.flows || []).slice(0, 3).forEach(function (id) { var f = WT.getFlow(id); if (f) row.appendChild(btn('Troubleshoot: ' + f.title, 'small', function () { startFlow(id); window.scrollTo({ top: 0 }); }, 'arrow')); });
    row.appendChild(h('a', { class: 'btn small', target: '_blank', rel: 'noopener noreferrer', href: 'https://support.microsoft.com/search?query=' + encodeURIComponent(e.code), text: 'Search Microsoft Support ↗' }));
    return h('article', { class: 'ecard' }, h('h3', null, h('code', { text: e.code }), h('span', { text: e.name })), h('p', { text: e.meaning }), row);
  }
  function renderErrors(q) {
    var list = $('err-list'); if (!list) return;
    list.textContent = '';
    var res = WT.searchErrors(q);
    $('err-count').textContent = q ? (res.length + ' result' + (res.length === 1 ? '' : 's')) : (res.length + ' codes in the library');
    if (!res.length) { list.appendChild(note('info', 'info', ['No match for “', q, '”. This is a curated library, so it only includes codes whose meaning is well documented. Try the code without leading zeros, or describe the problem in the box at the top of the page.'])); return; }
    res.forEach(function (e) { list.appendChild(errorCard(e)); });
  }
  function renderCommands() {
    var c = $('cmd-list'); if (!c || c.childNodes.length) return;
    Object.keys(KB.commands).forEach(function (k) { c.appendChild(commandCard(KB.commands[k])); });
  }

  function focusInput() { var i = $('problem'); if (i) { i.focus(); window.scrollTo({ top: 0 }); } }

  function updateResumeBanner() {
    var slot = $('resume'); if (!slot) return; slot.textContent = '';
    var saved = loadSaved();
    if (!saved) return;
    var f = saved.flowId ? WT.getFlow(saved.flowId) : null;
    slot.appendChild(h('div', { class: 'banner', role: 'region', 'aria-label': 'Saved session' }, h('p', { text: 'You have a troubleshooting session in progress' + (f ? ': ' + f.title : '') + '. It is stored only in this browser tab.' }),
      btn('Resume', 'small primary', function () { update(saved); }), btn('Delete it', 'small danger', function () { deleteSession(); slot.textContent = ''; live('Saved session deleted'); }, 'trash')));
  }

  /* ---------- optional AI helper (hidden unless the server reports it is configured) ---------- */
  function detectAI() {
    ai.endpoint = '/.netlify/functions/wt-ai';
    if (location.protocol === 'file:') return;
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 3000);
    fetch(ai.endpoint + '?status=1', { signal: ctl.signal }).then(function (r) { return r.ok ? r.json() : null; }).then(function (r) {
      clearTimeout(t);
      if (r && r.enabled === true) {
        ai.enabled = true;
        $('ai-slot').appendChild(h('label', { class: 'ai-opt' }, h('input', { type: 'checkbox', id: 'ai-consent' }),
          h('span', null, h('strong', { text: 'Optional: ' }), 'let an AI helper read my description to suggest the closest guide. If ticked, the text above (never your files or system details) is sent to an AI provider. The fixes themselves always come from the reviewed guides. Leave unticked to stay fully local.')));
      }
    }).catch(function () { /* AI is optional; stay hidden */ });
  }

  /* ---------- init ---------- */
  function init() {
    // quick cards
    var qc = $('quick-cards');
    KB.quickCards.forEach(function (c) {
      qc.appendChild(h('button', { type: 'button', class: 'qcard', onclick: function () { startFlow(c.flow); } }, h('span', { class: 'ico' }, icon(c.icon, 20)), h('span', { text: c.label })));
    });
    $('browse').appendChild(browseGrid());
    // ask form
    var input = $('problem'), counter = $('counter'), err = $('ask-err');
    input.addEventListener('input', function () { counter.textContent = input.value.length + ' / ' + WT.MAX_INPUT; err.textContent = ''; });
    $('ask-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = WT.sanitizeInput(input.value);
      if (!v) { err.textContent = 'Please describe your problem or pick a common issue below.'; input.focus(); return; }
      if (v.length < 4) { err.textContent = 'Add a few more words so I can understand the problem.'; input.focus(); return; }
      startFromText(v);
    });
    // error library
    var es = $('err-search'), tm;
    es.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { renderErrors(es.value); }, 120); });
    renderErrors('');
    $('cmd-details').addEventListener('toggle', function () { if (this.open) renderCommands(); });
    // deep link: ?issue=id
    var issue = new URLSearchParams(location.search).get('issue');
    if (issue && WT.getFlow(issue)) { session = WT.chooseFlow(WT.createSession('easy'), issue); save(); }
    render();
    userAction = true;
    detectAI();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
