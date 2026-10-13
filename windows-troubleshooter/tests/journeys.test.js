'use strict';
/* Integration journeys: the major user journeys, driven end to end through the engine API. */
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('./load.js');
const v = s => W.getView(s);
const pick = (s, id, val) => { assert.equal(v(s).question.id, id); return W.answer(s, id, val); };
function run(text, map) { let s = W.begin(W.createSession(), text); while (s.phase === 'question') { const q = v(s).question; s = W.answer(s, q.id, map[q.id]); } return s; }

test('journey 1: slow PC, described in plain English', () => {
  let s = W.begin(W.createSession(), 'My laptop is really slow, and it takes forever to start...');
  assert.equal(s.flowId, 'slow-computer');
  s = pick(s, 'version', '11'); s = pick(s, 'recent', 'months');
  assert.equal(s.phase, 'steps'); assert.equal(v(s).step.title, 'Restart the PC properly');
  s = W.stepResult(s, 'notfixed'); assert.match(v(s).step.title, /start/i);
  s = W.stepResult(s, 'fixed'); assert.equal(v(s).phase, 'resolved');
  assert.match(W.reportToText(v(s).report), /Resolved/);
});

test('journey 2: Wi-Fi connected but no internet; steps depend on whether other devices work', () => {
  let s = W.begin(W.createSession(), 'my internet says connected but nothing opens');
  assert.equal(s.flowId, 'wifi-no-internet');
  s = pick(s, 'version', '10'); s = pick(s, 'others', 'yes'); s = pick(s, 'scope', 'all');
  assert.equal(s.steps[0], 'net-toggle');
  assert.ok(!s.steps.includes('net-router'));
  assert.equal(run('my internet says connected but nothing opens', { version: '11', others: 'no', scope: 'all' }).steps[0], 'net-router');
});

test('journey 3: Outlook not opening ends in a hand-off if nothing works', () => {
  let s = W.begin(W.createSession(), 'Outlook wont open, it closes immediately');
  assert.equal(s.flowId, 'outlook-not-opening');
  assert.equal(s.answers.when, 'closes');
  s = pick(s, 'version', '11'); s = pick(s, 'which', 'classic');
  assert.equal(v(s).step.title, 'Close any hidden Outlook process and restart');
  while (s.phase === 'steps') s = W.stepResult(s, 'notfixed');
  assert.equal(s.phase, 'escalate');
  const ev = v(s); assert.match(ev.escalation, /IT|Microsoft/); assert.ok(ev.report.blocks.length);
});

test('journey 4: Windows update failure with an error code and low disk space', () => {
  let s = W.begin(W.createSession(), 'windows update keeps failing with 0x80070005');
  assert.equal(s.flowId, 'windows-update-failure'); assert.deepEqual(s.codes, ['0x80070005']);
  s = pick(s, 'version', '11'); s = pick(s, 'code', 'yes'); s = pick(s, 'space', 'low');
  assert.equal(s.steps[0], 'wuf-space');
  assert.match(W.reportToText(v(W.stepResult(s, 'fixed')).report), /0x80070005/);
});

test('journey 5: an unknown description never dead-ends', () => {
  const s = W.begin(W.createSession(), 'the thingy does a weird beep sometimes');
  assert.ok(['unknown', 'pickFlow'].includes(s.phase));
  assert.equal(v(s).canBack, true);
  const picked = W.chooseFlow(s, 'no-sound');
  assert.equal(picked.flowId, 'no-sound');
  assert.equal(W.restart(picked).phase, 'home');
});

test('journey 6: a safety stop is terminal but recoverable by restarting', () => {
  let s = W.chooseFlow(W.createSession(), 'overheating');
  s = pick(s, 'version', '11'); s = pick(s, 'danger', 'smoke');
  assert.equal(s.phase, 'safety'); assert.equal(W.stepResult(s, 'fixed'), s);
  assert.equal(W.restart(s).phase, 'home');
});
