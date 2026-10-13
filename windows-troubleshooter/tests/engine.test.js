'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('./load.js');
const KB = W.KB;

const view = s => W.getView(s);
function answerAll(s, map) {
  while (s.phase === 'question') { const q = view(s).question; s = W.answer(s, q.id, map[q.id] || q.options[0].v); }
  return s;
}

test('questions adapt to the flow and previous answers', () => {
  let s = W.chooseFlow(W.createSession(), 'slow-computer');
  assert.equal(view(s).question.id, 'version');
  s = W.answer(s, 'version', '11');
  assert.equal(view(s).question.id, 'when');
  s = W.answer(s, 'when', 'browsing');
  assert.equal(view(s).question.id, 'recent');
  s = W.answer(s, 'recent', 'today');
  assert.equal(s.phase, 'steps');
  assert.equal(s.steps[0], 'browser-tidy');
  const t = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), { version: '10', when: 'startup' });
  assert.ok(t.steps.includes('startup-apps') && !t.steps.includes('browser-tidy'));
});

test('different flows ask different questions', () => {
  const a = view(W.answer(W.chooseFlow(W.createSession(), 'printer-offline'), 'version', '11')).question.id;
  const b = view(W.answer(W.chooseFlow(W.createSession(), 'wifi-no-internet'), 'version', '11')).question.id;
  assert.notEqual(a, b);
});

test('answers already given in the description are not asked again', () => {
  const s = W.begin(W.createSession(), 'Windows 11 laptop is really slow when starting up');
  assert.equal(s.flowId, 'slow-computer'); assert.equal(s.version, '11'); assert.equal(s.answers.when, 'startup');
  const v = view(s);
  assert.equal(v.question.id, 'recent');
  assert.equal(v.prefilled.length, 1);
  assert.equal(W.begin(W.createSession(), 'my laptop is slow').phase, 'question');
});

test('back navigation restores the previous state at every point', () => {
  let s = W.chooseFlow(W.createSession(), 'slow-computer');
  s = W.answer(s, 'version', '11');
  s = W.answer(s, 'when', 'apps');
  assert.equal(view(s).question.id, 'recent');
  s = W.back(s); assert.equal(view(s).question.id, 'when'); assert.equal(s.answers.when, undefined);
  s = W.back(s); assert.equal(view(s).question.id, 'version'); assert.equal(s.version, null);
  s = W.back(s); assert.equal(s.phase, 'home');
  assert.equal(W.back(s).phase, 'home');
  let t = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), { version: '11' });
  const first = t.stepIdx; t = W.stepResult(t, 'notfixed'); assert.equal(t.stepIdx, first + 1);
  t = W.back(t); assert.equal(t.stepIdx, first); assert.equal(t.results.length, 0);
  assert.equal(view(t).canBack, true);
});

test('restart clears everything but keeps the display mode', () => {
  let s = answerAll(W.chooseFlow(W.setMode(W.createSession(), 'advanced'), 'slow-computer'), {});
  s = W.stepResult(s, 'notfixed');
  const r = W.restart(s);
  assert.equal(r.phase, 'home'); assert.equal(r.flowId, null); assert.deepEqual(r.answers, {});
  assert.equal(r.results.length, 0); assert.equal(r.history.length, 0); assert.equal(r.text, '');
  assert.equal(r.mode, 'advanced');
});

test('step outcomes drive the next action', () => {
  const s = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), { version: '11', when: 'always', recent: 'unsure' });
  const n = s.steps.length;
  assert.equal(W.stepResult(s, 'fixed').phase, 'resolved');
  const nf = W.stepResult(s, 'notfixed'); assert.equal(nf.phase, 'steps'); assert.equal(nf.stepIdx, 1);
  const sk = W.stepResult(s, 'skipped'); assert.equal(sk.phase, 'skipHelp'); assert.ok(view(sk).skipHelp.length > 10);
  assert.equal(W.afterSkip(sk, 'continue').stepIdx, 1);
  assert.equal(W.afterSkip(sk, 'escalate').phase, 'escalate');
  let e = s; for (let i = 0; i < n; i++) e = W.stepResult(e, 'notfixed');
  assert.equal(e.phase, 'escalate');
  assert.equal(W.stepResult(e, 'fixed'), e);
});

test('Windows version changes the instructions', () => {
  let s11 = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), { version: '11', when: 'startup' });
  let s10 = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), { version: '10', when: 'startup' });
  s11 = W.stepResult(s11, 'notfixed'); s10 = W.stepResult(s10, 'notfixed');
  const t11 = view(s11).step.sets.map(x => x.lines.join(' ')).join(' ');
  const t10 = view(s10).step.sets.map(x => x.lines.join(' ')).join(' ');
  assert.match(t11, /Startup apps/); assert.match(t10, /\*\*Startup\*\* tab/);
  assert.notEqual(t11, t10);
  assert.equal(view(s11).step.sets.length, 1);
  const unsure = W.setVersion(s11, 'unsure');
  assert.equal(view(unsure).step.sets.length, 2);
  assert.deepEqual(view(unsure).step.sets.map(x => x.label), ['Windows 11', 'Windows 10']);
});

test('commands are shown only in advanced mode and are never built from user input', () => {
  const s = answerAll(W.chooseFlow(W.createSession(), 'dns-issues'), { version: '11', browser: 'all', others: 'unsure' });
  assert.equal(s.steps[0], 'dns-ping');
  assert.equal(view(s).step.commands.length, 0); assert.ok(view(s).step.commandsAvailable > 0);
  const cmds = view(W.setMode(s, 'advanced')).step.commands.map(c => c.cmd);
  assert.ok(cmds.includes('ping 1.1.1.1') && cmds.includes('nslookup microsoft.com'));
  const evil = W.begin(W.createSession('advanced'), 'dns problem; calc.exe && del /s C:\\ `whoami` $(evil)');
  const all = JSON.stringify(Object.values(KB.commands).map(c => c.cmd));
  assert.ok(!all.includes('calc.exe') && !all.includes('whoami'));
  assert.ok(!/"cmd":"[^"]*(calc\.exe|whoami)/.test(JSON.stringify(view(evil))));
});

test('safety answers stop troubleshooting immediately', () => {
  const s = answerAll(W.chooseFlow(W.createSession(), 'battery-drain'), { version: '11', when: 'use', age: 'new', swell: 'yes' });
  assert.equal(s.phase, 'safety'); assert.equal(s.safetyKey, 'battery-swollen');
  const v = view(s); assert.ok(v.safety.stop); assert.match(v.safety.text.join(' '), /fire|swollen/i);
  assert.match(W.reportToText(W.buildReport(s)), /Stopped for safety reasons/);
  const s2 = W.begin(W.createSession(), 'my laptop is overheating and there is a burning smell and smoke');
  assert.equal(s2.phase, 'safety'); assert.equal(s2.safetyKey, 'smoke-burning');
  assert.notEqual(W.begin(W.createSession(), 'laptop burning hot and loud fan').phase, 'safety');
});

test('BitLocker and managed-device guidance is present where it matters', () => {
  assert.equal(W.getStepDef(W.getFlow('wont-boot'), 'boot-bitlocker').safety, 'bitlocker');
  assert.match(KB.safety.bitlocker.text.join(' '), /recovery key/);
  assert.match(KB.safety['managed-device'].text.join(' '), /IT administrator/);
  assert.match(W.getStepDef(W.getFlow('blue-screen'), 'bsod-safe').warn, /BitLocker/);
});

test('report has required sections, labels hypotheses and omits secrets', () => {
  let s = W.begin(W.createSession(), 'wifi connected but no internet, my password is Secret123 on windows 10');
  s = answerAll(s, { others: 'yes', scope: 'all' });
  s = W.stepResult(s, 'notfixed'); s = W.stepResult(s, 'skipped'); s = W.afterSkip(s, 'continue');
  s = W.setNotes(s, 'recovery key: 123456-123456-123456-123456-123456-123456-123456-123456 and token=abcdef');
  const txt = W.reportToText(W.buildReport(s, new Date('2026-10-13T10:00:00Z')));
  ['Reported problem', 'Windows version', 'Diagnostic answers', 'Possible causes (hypotheses, not confirmed)', 'Steps attempted', 'Current status', 'Recommended next steps', 'Notes for an IT technician'].forEach(h => assert.ok(txt.toUpperCase().includes(h.toUpperCase()), 'missing ' + h));
  assert.match(txt, /Windows 10/); assert.match(txt, /2026/);
  assert.match(txt, /Tried, problem remained/); assert.match(txt, /Could not complete/);
  assert.ok(!/Secret123/.test(txt) && !/123456-123456/.test(txt) && !/abcdef/.test(txt));
  assert.match(txt, /not produced by scanning the computer/);
  assert.doesNotMatch(txt, /we (scanned|repaired|fixed|inspected)/i);
});

test('PDF generation yields a structurally valid file', () => {
  const s = answerAll(W.chooseFlow(W.createSession(), 'slow-computer'), {});
  const str = Buffer.from(W.buildPdfBytes(W.buildReport(s))).toString('latin1');
  assert.ok(str.startsWith('%PDF-1.4') && str.trimEnd().endsWith('%%EOF'));
  const xrefAt = Number(str.match(/startxref\n(\d+)/)[1]);
  assert.equal(str.slice(xrefAt, xrefAt + 4), 'xref');
  const entries = str.slice(xrefAt).split('\n').filter(l => /^\d{10} 00000 n/.test(l));
  assert.ok(entries.length >= 5);
  entries.forEach((l, i) => assert.ok(str.slice(Number(l.slice(0, 10))).startsWith((i + 1) + ' 0 obj'), 'bad offset for object ' + (i + 1)));
  const long = W.buildReport(s);
  for (let i = 0; i < 120; i++) long.blocks.push({ t: 'p', text: 'Line \u201cquoted\u201d \u2014 \u00e9 (paren) ' + i });
  const b2 = Buffer.from(W.buildPdfBytes(long)).toString('latin1');
  assert.ok(Number(b2.match(/\/Count (\d+)/)[1]) >= 2);
  assert.ok(!/[^\x00-\x7f]/.test(b2));
});

test('markup renderer never produces HTML', () => {
  const t = W.parseMarkup('Press {{Ctrl + Shift + Esc}} then **bold** and `code` <img src=x onerror=alert(1)>');
  assert.deepEqual(t.map(x => x.t), ['text', 'kbd', 'text', 'b', 'text', 'code', 'text']);
  assert.ok(t[t.length - 1].v.includes('<img'));
  assert.deepEqual(W.parseMarkup(''), []);
});

test('session objects survive a JSON round-trip (storage restore)', () => {
  const s = answerAll(W.chooseFlow(W.createSession(), 'printer-offline'), {});
  const r = JSON.parse(JSON.stringify(s));
  assert.equal(view(r).step.title, view(s).step.title);
  assert.equal(view(W.stepResult(r, 'notfixed')).phase, 'steps');
});

test('suggest() only accepts known flows', () => {
  const s = W.begin(W.createSession(), 'banana');
  assert.equal(W.suggest(s, ['nope', '../../etc']).phase, 'unknown');
  assert.equal(W.suggest(s, ['printer-offline']).flowId, 'printer-offline');
  assert.equal(W.suggest(s, ['printer-offline', 'no-sound', 'x']).candidates.length, 2);
});
