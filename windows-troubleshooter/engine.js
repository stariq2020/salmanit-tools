/* What's Wrong With My PC? — engine
 * Deterministic classifier + decision-tree state machine + report builder + PDF writer.
 * Pure functions over plain objects: no DOM, no network. Works in browsers (window.WT) and Node (module.exports).
 * Every transition returns a NEW session object, so back-navigation and tests are trivial.
 */
(function (root) {
  'use strict';
  var KB = root.WT_KB;
  var MAX_INPUT = 500;

  /* ================= small utilities ================= */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }

  /* Remove anything that looks like a secret before text is stored, shown or exported. */
  function redact(text) {
    return String(text || '')
      .replace(/\b\d{6}(?:-\d{6}){7}\b/g, '[recovery key removed]')
      .replace(/\b(pass(?:word|wd|code)?|pwd|pin|token|secret|api[\s_-]?key|recovery[\s_-]?key|key)\b\s*(?:is|=|:)\s*\S+/gi, '$1: [removed]')
      .replace(/\b[A-Za-z0-9+\/_=-]{32,}\b/g, '[removed]');
  }

  function sanitizeInput(text) {
    var t = String(text == null ? '' : text).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length > MAX_INPUT) t = t.slice(0, MAX_INPUT);
    return redact(t);
  }

  /* ================= text normalisation ================= */
  function normalize(text) {
    var t = String(text == null ? '' : text).toLowerCase()
      .replace(/[‘’‛`´]/g, "'")
      .replace(/'/g, '')                       // won't -> wont, can't -> cant
      .replace(/[^a-z0-9_ ]+/g, ' ')           // keep 0x codes and STOP_CODES
      .replace(/\s+/g, ' ').trim();
    return t
      .replace(/\bwi fi\b/g, 'wifi')
      .replace(/\be mail\b/g, 'email')
      .replace(/\bblue ?screen ?of ?death\b/g, 'bsod')
      .replace(/\bcant\b/g, 'cant').replace(/\bdoesnt\b/g, 'doesnt');
  }

  var GENERIC = {};
  ('a an the and or of to in on at is are was were be been it its my me i we you your our this that these those with without for from by as not no cant cannot wont dont doesnt didnt isnt arent keeps keep stopped stops stop working work works problem issue error fix help please windows window pc laptop computer device machine screen has have had very really so just still again now when what why how do does did can will would should get gets getting got going goes gone take takes taking using use used open opening opened start starting started wrong something nothing anything everything all some one any only also but if then than too much many more most less').split(' ').forEach(function (w) { GENERIC[w] = 1; });

  var _vocab = null, _flowTokens = null, _kwCache = null;
  function buildIndex() {
    if (_vocab && _kwCache === KB.flows.length) return;
    _vocab = {}; _flowTokens = {};
    KB.flows.forEach(function (f) {
      var toks = {};
      f._kw = (f.keywords || []).concat([f.title]).map(normalize);
      f._kw.forEach(function (k) {
        k.split(' ').forEach(function (w) { if (w && !GENERIC[w]) { _vocab[w] = (_vocab[w] || 0) + 1; toks[w] = 1; } });
      });
      (f.symptoms || []).forEach(function (s) { normalize(s).split(' ').forEach(function (w) { if (w && !GENERIC[w] && w.length > 3) toks[w] = 1; }); });
      _flowTokens[f.id] = toks;
    });
    _kwCache = KB.flows.length;
  }

  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (c && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev[j - 2] + 1);
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  /* Correct likely typos by snapping unknown words to the nearest known keyword word. */
  function correctTypos(norm) {
    buildIndex();
    return norm.split(' ').map(function (w) {
      if (!w || w.length < 4 || /\d/.test(w) || GENERIC[w] || _vocab[w] || w.indexOf('_') >= 0) return w;
      var max = w.length <= 8 ? 1 : 2, best = null, bd = max + 1;
      for (var v in _vocab) {
        if (v.length < 4) continue;
        var d = editDistance(w, v, max);
        if (d < bd || (d === bd && best !== null && _vocab[v] > _vocab[best])) { bd = d; best = v; }
      }
      return best && bd <= max ? best : w;
    }).join(' ');
  }

  function hasPhrase(hay, phrase) { return phrase && (' ' + hay + ' ').indexOf(' ' + phrase + ' ') >= 0; }

  /* ================= error codes ================= */
  function extractCodes(norm) {
    var found = [];
    (norm.match(/\b0x[0-9a-f]{3,8}\b/g) || []).forEach(function (c) { found.push(c.length < 10 && /^0x[0-9a-f]+$/.test(c) ? c : c); });
    (norm.match(/\b[a-z]{3,}(?:_[a-z0-9]+)+\b/g) || []).forEach(function (c) { found.push(c); });
    (norm.match(/\bcode (?:10|28|43)\b/g) || []).forEach(function (c) { found.push(c); });
    return uniq(found);
  }
  function errorEntry(code) {
    var c = normalize(code);
    for (var i = 0; i < KB.errors.length; i++) {
      var e = KB.errors[i];
      if (e.match.some(function (m) { return m === c || m === c.replace(/^0x0+/, '0x') || normalize(m) === c; })) return e;
    }
    return null;
  }

  /* ================= version detection ================= */
  function detectVersion(norm) {
    var w11 = /\b(windows|win|w) ?11\b/.test(norm), w10 = /\b(windows|win|w) ?10\b/.test(norm);
    if (w11 && !w10) return '11';
    if (w10 && !w11) return '10';
    return null;
  }

  /* ================= classification ================= */
  function classify(rawText) {
    buildIndex();
    var norm = normalize(sanitizeInput(rawText));
    var out = { norm: norm, matches: [], confidence: 'none', codes: [], version: detectVersion(norm), candidates: [], flowId: null };
    if (!norm) return out;
    var fixed = correctTypos(norm);
    var scores = {}, reasons = {};
    function add(id, pts, why) { scores[id] = (scores[id] || 0) + pts; (reasons[id] = reasons[id] || []).push(why); }

    // error codes
    var codes = extractCodes(fixed);
    out.codes = codes;
    codes.forEach(function (c) {
      var e = errorEntry(c);
      if (e) (e.flows || []).forEach(function (id, i) { add(id, i === 0 ? 8 : 5, 'error code ' + e.code); });
    });

    var userTokens = uniq(fixed.split(' ').filter(function (w) { return w && !GENERIC[w] && w.length > 2; }));

    KB.flows.forEach(function (f) {
      var hits = f._kw.filter(function (k) { return hasPhrase(fixed, k); });
      // drop keywords contained in a longer matched keyword
      hits = hits.filter(function (k) { return !hits.some(function (o) { return o !== k && o.length > k.length && hasPhrase(o, k); }); });
      hits.forEach(function (k) { var n = k.split(' ').length; add(f.id, n === 1 ? 2.5 : 1 + n * 1.5, 'phrase "' + k + '"'); });
      var tokHits = userTokens.filter(function (t) { return _flowTokens[f.id][t]; }).length;
      if (tokHits) add(f.id, Math.min(tokHits, 4) * 0.7, tokHits + ' related word(s)');
    });

    var ranked = Object.keys(scores).map(function (id) { return { flowId: id, score: Math.round(scores[id] * 100) / 100, reasons: reasons[id] }; })
      .sort(function (a, b) { return b.score - a.score; });
    out.matches = ranked.slice(0, 5);
    if (!ranked.length) return out;
    var s1 = ranked[0].score, s2 = ranked[1] ? ranked[1].score : 0;
    if ((s1 >= 2.5 && s1 >= s2 * 1.5) || (s1 >= 0.7 && ranked.length === 1)) { out.confidence = 'high'; out.flowId = ranked[0].flowId; return out; }
    if (s1 >= 2.5) {
      // a general flow wins over its own more specific child so we can ask the diagnostic question
      var f1 = getFlow(ranked[0].flowId), f2 = getFlow(ranked[1].flowId);
      if (f1.parent === f2.id) { out.confidence = 'high'; out.flowId = f2.id; return out; }
      if (f2.parent === f1.id) { out.confidence = 'high'; out.flowId = f1.id; return out; }
      out.confidence = 'ambiguous';
      out.candidates = ranked.filter(function (r) { return r.score >= s1 * 0.6; }).slice(0, 4).map(function (r) { return r.flowId; });
      return out;
    }
    if (s1 >= 0.7) { out.confidence = 'weak'; out.candidates = ranked.slice(0, 3).map(function (r) { return r.flowId; }); }
    return out;
  }

  /* ================= knowledge-base access ================= */
  var _flowIdx = null, _stepIdx = null;
  function getFlow(id) {
    if (!_flowIdx || _flowIdx.n !== KB.flows.length) { _flowIdx = { n: KB.flows.length }; KB.flows.forEach(function (f) { _flowIdx[f.id] = f; }); }
    return _flowIdx[id] || null;
  }
  function getStepDef(flow, id) {
    if (flow && flow.steps && flow.steps[id]) return flow.steps[id];
    if (KB.shared[id]) return KB.shared[id];
    if (!_stepIdx || _stepIdx.n !== KB.flows.length) {
      _stepIdx = { n: KB.flows.length };
      KB.flows.forEach(function (f) { Object.keys(f.steps || {}).forEach(function (k) { if (!_stepIdx[k]) _stepIdx[k] = f.steps[k]; }); });
    }
    return _stepIdx[id] || null;
  }

  var VERSION_Q = {
    id: 'version', text: 'Are you using Windows 11 or Windows 10?',
    help: 'Not sure? Press the Windows key + R, type winver and press Enter. The window that opens tells you which version you have.',
    options: [{ v: '11', label: 'Windows 11' }, { v: '10', label: 'Windows 10' }, { v: 'unsure', label: 'I\'m not sure' }]
  };

  function questionVisible(q, answers) {
    if (!q.showIf) return true;
    return Object.keys(q.showIf).every(function (k) { var want = [].concat(q.showIf[k]); return want.indexOf(answers[k]) >= 0; });
  }
  function nextQuestion(s) {
    var f = getFlow(s.flowId);
    if (s.version === null) return VERSION_Q;
    for (var i = 0; i < f.questions.length; i++) {
      var q = f.questions[i];
      if (s.answers[q.id] === undefined && questionVisible(q, s.answers)) return q;
    }
    return null;
  }
  function remainingQuestions(s) {
    var f = getFlow(s.flowId), n = s.version === null ? 1 : 0;
    f.questions.forEach(function (q) { if (s.answers[q.id] === undefined && questionVisible(q, s.answers)) n++; });
    return n;
  }

  function pickBranch(flow, answers) {
    for (var i = 0; i < flow.branches.length; i++) {
      var b = flow.branches[i];
      if (!b.when) return b;
      var ok = Object.keys(b.when).every(function (k) { return [].concat(b.when[k]).indexOf(answers[k]) >= 0; });
      if (ok) return b;
    }
    return flow.branches[flow.branches.length - 1];
  }

  /* ================= session state machine ================= */
  function createSession(mode) {
    return { phase: 'home', text: '', version: null, flowId: null, answers: {}, sources: {}, steps: [], stepIdx: 0, results: [],
      causes: [], mode: mode || 'easy', startedAt: new Date().toISOString(), candidates: [], codes: [], safetyKey: null, notes: '', history: [] };
  }
  function snap(s) { var h = s.history; s.history = []; var c = clone(s); s.history = h; return c; }
  function next(s) { var n = clone(s); n.history = (s.history || []).concat([snap(s)]).slice(-60); return n; }

  function begin(session, rawText) {
    var n = next(session);
    var text = sanitizeInput(rawText);
    n.text = text; n.results = []; n.answers = {}; n.sources = {}; n.flowId = null;
    var c = classify(text);
    n.codes = c.codes;
    if (c.version) n.version = c.version;
    if (c.confidence === 'high') return chooseInto(n, c.flowId, true);
    n.candidates = c.candidates;
    n.phase = c.confidence === 'ambiguous' || c.confidence === 'weak' ? 'pickFlow' : 'unknown';
    return n;
  }

  /* Pre-fill answers the user already gave in their description. */
  function prefill(flow, norm) {
    var out = {};
    flow.questions.forEach(function (q) {
      var hit = [];
      q.options.forEach(function (o) { if ((o.m || []).some(function (m) { return hasPhrase(norm, normalize(m)); })) hit.push(o.v); });
      if (hit.length === 1) out[q.id] = hit[0];
    });
    return out;
  }

  function chooseInto(n, flowId, fromText) {
    var f = getFlow(flowId);
    if (!f) { n.phase = 'unknown'; return n; }
    n.flowId = flowId; n.answers = {}; n.sources = {}; n.results = [];
    if (fromText || n.text) {
      var pre = prefill(f, normalize(n.text));
      Object.keys(pre).forEach(function (k) { n.answers[k] = pre[k]; n.sources[k] = 'text'; });
    }
    return advance(n);
  }
  /* Offer a shortlist (used by the optional AI helper); ids not in the knowledge base are dropped. */
  function suggest(session, ids) {
    var n = next(session), ok = uniq(ids || []).filter(function (id) { return getFlow(id); }).slice(0, 4);
    if (!ok.length) return session;
    if (ok.length === 1) return chooseInto(n, ok[0], !!n.text);
    n.candidates = ok; n.phase = 'pickFlow'; return n;
  }
  function chooseFlow(session, flowId) { return chooseInto(next(session), flowId, !!session.text); }

  /* Move to the next question, a safety stop, or the plan. Mutates n (already a copy). */
  function advance(n) {
    var f = getFlow(n.flowId);
    // any pre-filled answer that carries a safety flag stops everything
    for (var i = 0; i < f.questions.length; i++) {
      var q = f.questions[i], a = n.answers[q.id];
      if (a !== undefined) {
        var o = q.options.filter(function (x) { return x.v === a; })[0];
        if (o && o.safety) { n.phase = 'safety'; n.safetyKey = o.safety; return n; }
      }
    }
    var q2 = nextQuestion(n);
    if (q2) { n.phase = 'question'; return n; }
    var b = pickBranch(f, n.answers);
    n.causes = b.causes.slice();
    n.steps = uniq(b.steps).filter(function (id) { return getStepDef(f, id); });
    n.stepIdx = 0; n.phase = n.steps.length ? 'steps' : 'escalate';
    return n;
  }

  function answer(session, qid, value) {
    var n = next(session);
    if (qid === 'version') { n.version = value === 'unsure' ? 'unsure' : value; return advance(n); }
    var f = getFlow(n.flowId);
    var q = f.questions.filter(function (x) { return x.id === qid; })[0];
    if (!q || !q.options.some(function (o) { return o.v === value; })) return session;
    n.answers[qid] = value; n.sources[qid] = 'user';
    var o = q.options.filter(function (x) { return x.v === value; })[0];
    if (o.safety) { n.phase = 'safety'; n.safetyKey = o.safety; return n; }
    return advance(n);
  }

  function setVersion(session, v) { var n = clone(session); n.version = v; return n; }
  function setMode(session, m) { var n = clone(session); n.mode = m === 'advanced' ? 'advanced' : 'easy'; return n; }
  function setNotes(session, t) { var n = clone(session); n.notes = sanitizeInput(t); return n; }

  function stepResult(session, outcome) {
    if (session.phase !== 'steps') return session;
    var n = next(session), f = getFlow(n.flowId), id = n.steps[n.stepIdx], def = getStepDef(f, id);
    n.results = n.results.filter(function (r) { return r.id !== id; }).concat([{ id: id, title: def.title, outcome: outcome }]);
    if (outcome === 'fixed') { n.phase = 'resolved'; return n; }
    if (outcome === 'skipped') { n.phase = 'skipHelp'; return n; }
    return moveOn(n);
  }
  function moveOn(n) {
    if (n.stepIdx + 1 < n.steps.length) { n.stepIdx++; n.phase = 'steps'; } else n.phase = 'escalate';
    return n;
  }
  function afterSkip(session, choice) {
    if (session.phase !== 'skipHelp') return session;
    var n = next(session);
    if (choice === 'escalate') { n.phase = 'escalate'; return n; }
    return moveOn(n);
  }
  function back(session) {
    var h = session.history || [];
    if (!h.length) return session;
    var prev = clone(h[h.length - 1]);
    prev.history = h.slice(0, -1);
    prev.mode = session.mode;           // preferences survive back navigation
    if (session.version !== prev.version && session.version !== null && prev.version === null && prev.phase === 'question') prev.version = null;
    return prev;
  }
  function restart(session) { var s = createSession(session ? session.mode : 'easy'); return s; }
  function canBack(session) { return (session.history || []).length > 0; }

  /* ================= views ================= */
  function pickInstr(i, version) {
    if (Array.isArray(i)) return [{ label: null, lines: i }];
    if (version === '11' && i['11']) return [{ label: null, lines: i['11'] }];
    if (version === '10' && i['10']) return [{ label: null, lines: i['10'] }];
    var sets = [];
    if (i['11']) sets.push({ label: 'Windows 11', lines: i['11'] });
    if (i['10'] && JSON.stringify(i['10']) !== JSON.stringify(i['11'])) sets.push({ label: 'Windows 10', lines: i['10'] });
    else if (i['10'] && sets.length) sets[0].label = 'Windows 11 and 10';
    return sets;
  }

  function progressOf(s) {
    var f = s.flowId ? getFlow(s.flowId) : null;
    if (s.phase === 'steps' || s.phase === 'skipHelp') {
      var tot = s.steps.length, at = s.stepIdx + (s.phase === 'skipHelp' ? 1 : 0);
      return { pct: Math.round(30 + 70 * at / Math.max(tot, 1)), label: 'Step ' + Math.min(s.stepIdx + 1, tot) + ' of ' + tot };
    }
    if (s.phase === 'question' && f) {
      var done = Object.keys(s.answers).length + (s.version !== null ? 1 : 0), rem = remainingQuestions(s);
      return { pct: Math.round(30 * done / Math.max(done + rem, 1)), label: 'Question ' + (done + 1) + ' of ' + (done + rem) };
    }
    if (s.phase === 'resolved' || s.phase === 'escalate' || s.phase === 'safety') return { pct: 100, label: 'Finished' };
    return { pct: 0, label: '' };
  }

  function stepView(s) {
    var f = getFlow(s.flowId), id = s.steps[s.stepIdx], d = getStepDef(f, id);
    var cmds = (d.cmd || []).map(function (cid) { var c = KB.commands[cid]; return c ? Object.assign({ id: cid }, c) : null; }).filter(Boolean);
    return {
      id: id, title: d.title, why: d.why, sets: pickInstr(d.i, s.version), advanced: d.adv || [],
      time: d.time, diff: d.diff, result: d.result, warn: d.warn || '', fail: d.fail || '', admin: !!d.admin,
      commands: s.mode === 'advanced' ? cmds : [], commandsAvailable: cmds.length, link: d.link || null,
      safety: d.safety ? KB.safety[d.safety] : null,
      index: s.stepIdx, total: s.steps.length
    };
  }

  function getView(s) {
    var f = s.flowId ? getFlow(s.flowId) : null;
    var base = { phase: s.phase, canBack: canBack(s), progress: progressOf(s), flow: f ? { id: f.id, title: f.title, cat: f.cat, difficulty: f.difficulty, time: f.time, risk: f.risk, admin: f.admin, prereq: f.prereq, expected: f.expected, ms: f.ms || null } : null, version: s.version, mode: s.mode };
    switch (s.phase) {
      case 'question': {
        var q = nextQuestion(s);
        var shown = Object.keys(s.sources).filter(function (k) { return s.sources[k] === 'text'; });
        base.question = { id: q.id, text: q.text, help: q.help || '', options: q.options.map(function (o) { return { v: o.v, label: o.label }; }) };
        base.prefilled = shown.map(function (k) { var fq = f.questions.filter(function (x) { return x.id === k; })[0]; var o = fq.options.filter(function (x) { return x.v === s.answers[k]; })[0]; return { q: fq.text, a: o.label }; });
        return base;
      }
      case 'steps': base.step = stepView(s); base.causes = s.causes; return base;
      case 'skipHelp': { var sv = stepView(s); base.step = sv; base.skipHelp = sv.fail || 'No problem. Some steps are not possible on every PC or account.'; return base; }
      case 'pickFlow': base.candidates = s.candidates.map(function (id) { var c = getFlow(id); return { id: id, title: c.title, blurb: c.blurb, cat: c.cat }; }); return base;
      case 'safety': base.safety = KB.safety[s.safetyKey]; return base;
      case 'resolved': case 'escalate': base.escalation = f ? f.escalation : ''; base.report = buildReport(s); return base;
      default: return base;
    }
  }

  /* ================= report ================= */
  function labelOf(f, qid, value) {
    var q = f.questions.filter(function (x) { return x.id === qid; })[0];
    if (!q) return null;
    var o = q.options.filter(function (x) { return x.v === value; })[0];
    return o ? { q: q.text, a: o.label } : null;
  }
  var OUTCOME = { fixed: 'Fixed the problem', notfixed: 'Tried, problem remained', skipped: 'Could not complete' };
  function statusOf(s) {
    if (s.phase === 'resolved') return 'Resolved';
    if (s.phase === 'escalate') return 'Not resolved - escalation recommended';
    if (s.phase === 'safety') return 'Stopped for safety reasons';
    return 'In progress';
  }
  function versionLabel(v) { return v === '11' ? 'Windows 11' : v === '10' ? 'Windows 10' : 'Not confirmed by the user'; }

  function buildReport(s, now) {
    var f = s.flowId ? getFlow(s.flowId) : null, d = now || new Date(), B = [];
    function h(t) { B.push({ t: 'h', text: t }); }
    function p(t) { B.push({ t: 'p', text: t }); }
    function li(t) { B.push({ t: 'li', text: t }); }
    B.push({ t: 'title', text: "What's Wrong With My PC? - Troubleshooting summary" });
    p('Generated ' + d.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }) + ' by Salman IT Tools. This summary records guidance followed by the user. It was not produced by scanning the computer.');
    h('Reported problem');
    p(s.text ? redact(s.text) : (f ? f.title : 'Not described'));
    if (f) p('Matched guide: ' + f.title);
    h('Windows version');
    p(versionLabel(s.version));
    if (f) {
      var qa = Object.keys(s.answers).map(function (k) { var l = labelOf(f, k, s.answers[k]); return l ? { q: l.q, a: l.a + (s.sources[k] === 'text' ? ' (taken from the description)' : '') } : null; }).filter(Boolean);
      if (qa.length) { h('Diagnostic answers'); qa.forEach(function (x) { li(x.q + ' ' + x.a); }); }
    }
    if (s.causes && s.causes.length) {
      h('Possible causes (hypotheses, not confirmed)');
      s.causes.forEach(function (c) { li(c); });
    }
    h('Steps attempted');
    if (s.results.length) s.results.forEach(function (r, i) { li((i + 1) + '. ' + r.title + ' - ' + (OUTCOME[r.outcome] || r.outcome)); });
    else p('No steps recorded yet.');
    h('Current status');
    p(statusOf(s));
    h('Recommended next steps');
    if (s.phase === 'resolved') {
      p('The user reported the problem as fixed. If it returns, note when it happens and start a new diagnosis. Keep important files backed up.');
    } else if (s.phase === 'safety' && s.safetyKey && KB.safety[s.safetyKey]) {
      KB.safety[s.safetyKey].text.forEach(function (t) { li(t); });
    } else {
      p(f ? f.escalation : 'Try describing the problem in more detail or choose a common issue.');
      p('If this is a work or school device, contact your IT administrator before changing settings or trying further fixes.');
    }
    if (s.codes && s.codes.length) { h('Error codes mentioned'); s.codes.forEach(function (c) { var e = errorEntry(c); li(c + (e ? ' - ' + e.name : '')); }); }
    h('Notes for an IT technician');
    p(s.notes ? redact(s.notes) : 'None added. Tip: add the exact wording of any error message and when the problem started.');
    p('Do not include passwords, recovery keys or access tokens in notes or when sharing this summary.');
    return { title: B[0].text, blocks: B, flowId: s.flowId, status: statusOf(s) };
  }

  function reportToText(r) {
    var out = [];
    r.blocks.forEach(function (b) {
      if (b.t === 'title') out.push(b.text.toUpperCase(), '');
      else if (b.t === 'h') out.push('', b.text.toUpperCase());
      else if (b.t === 'li') out.push('- ' + b.text);
      else out.push(b.text);
    });
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  /* ================= safe inline markup (never HTML) ================= */
  function parseMarkup(str) {
    var toks = [], re = /\*\*(.+?)\*\*|`([^`]+)`|\{\{(.+?)\}\}/g, last = 0, m, s = String(str == null ? '' : str);
    while ((m = re.exec(s))) {
      if (m.index > last) toks.push({ t: 'text', v: s.slice(last, m.index) });
      if (m[1] !== undefined) toks.push({ t: 'b', v: m[1] }); else if (m[2] !== undefined) toks.push({ t: 'code', v: m[2] }); else toks.push({ t: 'kbd', v: m[3] });
      last = re.lastIndex;
    }
    if (last < s.length) toks.push({ t: 'text', v: s.slice(last) });
    return toks;
  }

  /* ================= error-code library search ================= */
  function searchErrors(query) {
    var q = normalize(String(query || '').slice(0, 80));
    if (!q) return KB.errors.slice();
    var qc = q.replace(/^0x0+(?=[0-9a-f])/, '0x');
    return KB.errors.filter(function (e) {
      var hay = normalize(e.code + ' ' + e.name + ' ' + e.meaning + ' ' + e.match.join(' '));
      return qc.split(' ').every(function (w) { return hay.indexOf(w) >= 0 || normalize(e.match.join(' ')).replace(/0x0+/g, '0x').indexOf(w) >= 0; });
    });
  }

  /* ================= KB validation (used by tests) ================= */
  function validateKB() {
    var problems = [], ids = {}, stepOwners = {};
    KB.flows.forEach(function (f) {
      if (ids[f.id]) problems.push('duplicate flow id ' + f.id); ids[f.id] = 1;
      ['title', 'cat', 'blurb', 'difficulty', 'time', 'risk', 'prereq', 'expected', 'escalation'].forEach(function (k) { if (!f[k]) problems.push(f.id + ': missing ' + k); });
      if (!KB.categories[f.cat]) problems.push(f.id + ': unknown category ' + f.cat);
      if (!f.keywords || f.keywords.length < 8) problems.push(f.id + ': too few keywords');
      if (!f.symptoms || !f.symptoms.length) problems.push(f.id + ': no symptoms');
      if (!f.versions || f.versions.length < 2) problems.push(f.id + ': versions');
      if (!f.questions || !f.questions.length) problems.push(f.id + ': no questions');
      if (!f.branches || !f.branches.length) problems.push(f.id + ': no branches');
      if (f.ms && !/^https:\/\/(support|learn)\.microsoft\.com\//.test(f.ms.url)) problems.push(f.id + ': ms link not microsoft.com');
      if (f.parent && !getFlow(f.parent)) problems.push(f.id + ': unknown parent');
      var qids = {};
      (f.questions || []).forEach(function (q) {
        qids[q.id] = q;
        if (!q.options || q.options.length < 2) problems.push(f.id + '/' + q.id + ': fewer than 2 options');
        var vals = {}; (q.options || []).forEach(function (o) { if (vals[o.v]) problems.push(f.id + '/' + q.id + ': duplicate option ' + o.v); vals[o.v] = 1; if (o.safety && !KB.safety[o.safety]) problems.push(f.id + ': unknown safety ' + o.safety); });
      });
      var last = f.branches && f.branches[f.branches.length - 1];
      if (last && last.when) problems.push(f.id + ': last branch must be a default (no when)');
      (f.branches || []).forEach(function (b, bi) {
        if (!b.steps || !b.steps.length) problems.push(f.id + ' branch ' + bi + ': no steps');
        if (!b.causes || !b.causes.length) problems.push(f.id + ' branch ' + bi + ': no causes');
        Object.keys(b.when || {}).forEach(function (k) {
          var q = qids[k]; if (!q) { problems.push(f.id + ' branch ' + bi + ': unknown question ' + k); return; }
          [].concat(b.when[k]).forEach(function (v) { if (!q.options.some(function (o) { return o.v === v; })) problems.push(f.id + ' branch ' + bi + ': ' + k + '=' + v + ' is not an option'); });
        });
        (b.steps || []).forEach(function (sid) { if (!getStepDef(f, sid)) problems.push(f.id + ': unknown step ' + sid); });
      });
      Object.keys(f.steps || {}).forEach(function (k) {
        if (stepOwners[k] || KB.shared[k]) problems.push('duplicate step id ' + k); stepOwners[k] = f.id;
        var st = f.steps[k];
        ['title', 'why', 'time', 'diff', 'result', 'fail'].forEach(function (x) { if (!st[x]) problems.push(f.id + '/' + k + ': missing ' + x); });
        if (!st.i || (Array.isArray(st.i) ? !st.i.length : !(st.i['11'] && st.i['10']))) problems.push(f.id + '/' + k + ': missing instructions');
        (st.cmd || []).forEach(function (c) { if (!KB.commands[c]) problems.push(f.id + '/' + k + ': unknown command ' + c); });
        if (st.safety && !KB.safety[st.safety]) problems.push(f.id + '/' + k + ': unknown safety');
      });
    });
    Object.keys(KB.shared).forEach(function (k) {
      var st = KB.shared[k];
      ['title', 'why', 'time', 'diff', 'result', 'fail'].forEach(function (x) { if (!st[x]) problems.push(k + ': missing ' + x); });
      (st.cmd || []).forEach(function (c) { if (!KB.commands[c]) problems.push(k + ': unknown command ' + c); });
    });
    KB.errors.forEach(function (e) { (e.flows || []).forEach(function (id) { if (!ids[id]) problems.push('error ' + e.code + ': unknown flow ' + id); }); });
    Object.keys(KB.commands).forEach(function (k) {
      var c = KB.commands[k];
      ['cmd', 'what', 'when', 'prereq', 'output', 'interpret', 'caution'].forEach(function (x) { if (!c[x]) problems.push('command ' + k + ': missing ' + x); });
      if (/[`$|&;]\s*(rm|del|format|reg|bcdedit|diskpart)\b/i.test(c.cmd) || /\b(format|diskpart|bcdedit|reg (add|delete)|del \/)/i.test(c.cmd)) problems.push('command ' + k + ': dangerous command text');
    });
    return problems;
  }

  /* ================= minimal client-side PDF writer ================= */
  var HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  function asciiSafe(s) {
    return String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[•·]/g, '-').replace(/ /g, ' ').replace(/[^\x20-\x7e]/g, '?');
  }
  function textWidth(s, size, bold) {
    var w = 0; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i) - 32; w += HW[c] || 556; }
    return w * size / 1000 * (bold ? 1.06 : 1);
  }
  function wrapLine(text, size, maxW, bold) {
    var words = asciiSafe(text).split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      while (textWidth(w, size, bold) > maxW) { // very long unbroken token
        var cut = w.length; while (cut > 1 && textWidth(w.slice(0, cut), size, bold) > maxW) cut--;
        if (cur) { lines.push(cur); cur = ''; }
        lines.push(w.slice(0, cut)); w = w.slice(cut);
      }
      var t = cur ? cur + ' ' + w : w;
      if (textWidth(t, size, bold) <= maxW) cur = t; else { if (cur) lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  function pdfEsc(s) { return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }

  function buildPdfBytes(report) {
    var W = 595, H = 842, M = 54, maxW = W - 2 * M, pages = [], ops = [], y = H - M;
    function newPage() { if (ops.length) pages.push(ops.join('\n')); ops = []; y = H - M; }
    function line(txt, size, bold, indent, gap) {
      var lead = size * 1.35;
      wrapLine(txt, size, maxW - indent, bold).forEach(function (ln) {
        if (y - lead < M) newPage();
        y -= lead;
        ops.push('BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + (M + indent) + ' ' + y.toFixed(1) + ' Td (' + pdfEsc(ln) + ') Tj ET');
      });
      y -= gap || 0;
    }
    report.blocks.forEach(function (b) {
      if (b.t === 'title') line(b.text, 16, true, 0, 8);
      else if (b.t === 'h') { if (y < M + 60) newPage(); y -= 8; line(b.text, 12, true, 0, 2); }
      else if (b.t === 'li') line('- ' + b.text, 10, false, 10, 1);
      else line(b.text, 10, false, 0, 3);
    });
    if (ops.length) pages.push(ops.join('\n'));
    // objects: 1 catalog, 2 pages, 3 F1, 4 F2, then (content, page) pairs
    var objs = [], n = pages.length, kids = [];
    for (var i = 0; i < n; i++) kids.push((5 + i * 2 + 1) + ' 0 R');
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[2] = '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>';
    objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach(function (content, k) {
      var c = 5 + k * 2, p = c + 1;
      objs[c] = '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream';
      objs[p] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Contents ' + c + ' 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>';
    });
    var out = '%PDF-1.4\n', offs = [];
    for (var o = 1; o < objs.length; o++) { offs[o] = out.length; out += o + ' 0 obj\n' + objs[o] + '\nendobj\n'; }
    var xref = out.length;
    out += 'xref\n0 ' + objs.length + '\n0000000000 65535 f \n';
    for (var q = 1; q < objs.length; q++) out += ('0000000000' + offs[q]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + objs.length + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    var bytes = new Uint8Array(out.length);
    for (var z = 0; z < out.length; z++) bytes[z] = out.charCodeAt(z) & 255;
    return bytes;
  }

  var API = {
    MAX_INPUT: MAX_INPUT, VERSION_Q: VERSION_Q,
    normalize: normalize, sanitizeInput: sanitizeInput, redact: redact, classify: classify, correctTypos: correctTypos,
    extractCodes: extractCodes, errorEntry: errorEntry, searchErrors: searchErrors, detectVersion: detectVersion,
    getFlow: getFlow, getStepDef: getStepDef,
    createSession: createSession, begin: begin, suggest: suggest, chooseFlow: chooseFlow, answer: answer, stepResult: stepResult, afterSkip: afterSkip,
    back: back, restart: restart, canBack: canBack, setVersion: setVersion, setMode: setMode, setNotes: setNotes,
    getView: getView, buildReport: buildReport, reportToText: reportToText, parseMarkup: parseMarkup, buildPdfBytes: buildPdfBytes,
    validateKB: validateKB, pickBranch: pickBranch
  };
  root.WT = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
