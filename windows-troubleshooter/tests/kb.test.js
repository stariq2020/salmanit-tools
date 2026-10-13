'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('./load.js');
const KB = W.KB;

test('knowledge base passes structural validation', () => {
  assert.deepEqual(W.validateKB(), []);
});

test('has at least 30 flows covering every requested issue', () => {
  assert.ok(KB.flows.length >= 30);
  const need = ['slow-startup', 'high-cpu', 'high-memory', 'freezing', 'disk-space-low', 'wifi-no-internet', 'wifi-not-appearing', 'ethernet-not-working', 'dns-issues', 'vpn-problems', 'blue-screen', 'black-screen-login', 'stuck-updating', 'windows-update-failure', 'wont-boot', 'no-sound', 'mic-not-working', 'webcam-not-detected', 'external-monitor', 'printer-offline', 'usb-not-recognised', 'bluetooth-not-connecting', 'keyboard-not-responding', 'mouse-touchpad', 'outlook-not-opening', 'outlook-credentials', 'teams-mic-not-working', 'onedrive-sync', 'battery-drain', 'overheating', 'not-charging'];
  need.forEach(id => assert.ok(W.getFlow(id), 'missing flow ' + id));
});

test('flows are not placeholder content', () => {
  KB.flows.forEach(f => {
    const all = JSON.stringify(f).toLowerCase();
    assert.ok(!/lorem|todo|tbd|placeholder text|xxx/.test(all), f.id + ' contains placeholder text');
    assert.ok(Object.keys(f.steps).length >= 2, f.id + ' needs its own steps');
    assert.ok(new Set([].concat(...f.branches.map(b => b.steps))).size >= 5, f.id + ' needs a rich step set');
    assert.ok(f.branches.length >= 2, f.id + ' needs real branching');
    Object.keys(f.steps).forEach(k => {
      const s = f.steps[k];
      const lines = Array.isArray(s.i) ? s.i : s.i['11'].concat(s.i['10']);
      assert.ok(lines.length >= 3, f.id + '/' + k + ' has too few instructions');
    });
  });
});

/* Walk every combination of answers in every flow; every path must end in a valid conclusion. */
function combos(qs) {
  let acc = [{}];
  qs.forEach(q => { const next = []; acc.forEach(a => q.options.forEach(o => next.push(Object.assign({}, a, { [q.id]: o.v })))); acc = next; });
  return acc;
}

test('every flow reaches a conclusion or escalation on every answer path', () => {
  let paths = 0;
  KB.flows.forEach(f => {
    combos(f.questions).forEach(answers => {
      let s = W.chooseFlow(W.createSession(), f.id);
      let guard = 0;
      while (s.phase === 'question' && guard++ < 20) {
        const q = W.getView(s).question;
        s = W.answer(s, q.id, q.id === 'version' ? '11' : answers[q.id]);
      }
      assert.ok(['steps', 'safety'].includes(s.phase), `${f.id} ${JSON.stringify(answers)} ended in ${s.phase}`);
      if (s.phase === 'safety') { assert.ok(KB.safety[s.safetyKey].text.length, 'safety text'); paths++; return; }
      // path A: never fixed -> escalate
      let a = s, n = 0;
      while (a.phase === 'steps') { assert.ok(W.getView(a).step.sets.length, f.id + ' step has instructions'); a = W.stepResult(a, 'notfixed'); n++; }
      assert.equal(a.phase, 'escalate'); assert.equal(n, s.steps.length);
      // path B: fixed on the first step
      assert.equal(W.stepResult(s, 'fixed').phase, 'resolved');
      // path C: cannot complete each step, then continue to escalation
      let c = s;
      while (c.phase === 'steps') { c = W.stepResult(c, 'skipped'); assert.equal(c.phase, 'skipHelp'); c = W.afterSkip(c, 'continue'); }
      assert.equal(c.phase, 'escalate');
      paths++;
    });
  });
  assert.ok(paths > 100);
});

test('every escalation view carries guidance and a report', () => {
  KB.flows.forEach(f => {
    let s = W.chooseFlow(W.createSession(), f.id);
    while (s.phase === 'question') { const q = W.getView(s).question; s = W.answer(s, q.id, q.options[q.options.length - 1].v); }
    if (s.phase !== 'steps') return;
    while (s.phase === 'steps') s = W.stepResult(s, 'notfixed');
    const v = W.getView(s);
    assert.ok(v.escalation.length > 40); assert.ok(v.report.blocks.length > 5);
  });
});

test('commands library only contains static, non-destructive commands', () => {
  Object.entries(KB.commands).forEach(([id, c]) => {
    assert.ok(!/\b(format|diskpart|bcdedit|reg\s+(add|delete)|del\s|rd\s|rmdir|cipher\s+\/w|manage-bde|bootrec|fdisk|clean all)\b/i.test(c.cmd), id + ' looks destructive');
    assert.ok(!/(\$\{|\{\{|%s|\$\()/.test(c.cmd), id + ' looks templated');
    if (/<[^>]+>/.test(c.cmd)) assert.ok(c.placeholder, id + ' has angle-bracket text but no placeholder flag');
    ['what', 'when', 'prereq', 'output', 'interpret', 'caution'].forEach(k => assert.ok(c[k].length >= 5, id + ' ' + k));
  });
});

test('no step instructs a prohibited high-risk action', () => {
  const bad = /(regedit|registry editor|edit the registry|disable (your )?(antivirus|firewall|bitlocker|windows defender)|turn off (your )?(antivirus|firewall|bitlocker)|format (the |your )?(drive|disk|c:)|reset this pc|reinstall windows|flash (the )?bios|update (the )?bios)/i;
  KB.flows.forEach(f => Object.values(f.steps).concat(Object.values(KB.shared)).forEach(s => {
    // sentences that tell the user NOT to do something are fine
    const lines = (Array.isArray(s.i) ? s.i : s.i['11'].concat(s.i['10'])).concat(s.adv || []);
    const text = lines.filter(l => !/(do not|don't|avoid|never)/i.test(l)).join(' ');
    const m = text.match(bad);
    assert.ok(!m, f.id + ': instruction contains "' + (m && m[0]) + '"');
  }));
});

test('error-code library has curated entries with real explanations', () => {
  assert.ok(KB.errors.length >= 25);
  KB.errors.forEach(e => { assert.ok(e.meaning.length > 60, e.code); assert.ok(e.flows.length, e.code); });
  assert.equal(W.errorEntry('0x80070005').name.includes('Access denied'), true);
  assert.equal(W.searchErrors('critical_process_died').length, 1);
  assert.equal(W.searchErrors('zzzzqqq').length, 0);
});

test('Microsoft links are https and on microsoft.com', () => {
  KB.flows.forEach(f => f.ms && assert.match(f.ms.url, /^https:\/\/(support|learn)\.microsoft\.com\//));
});
