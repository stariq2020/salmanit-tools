'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('./load.js');

const top = t => { const c = W.classify(t); return c.flowId || c.candidates[0] || null; };

test('spec example phrases map to the right flow', () => {
  const cases = {
    'My laptop is very slow.': 'slow-computer',
    'My internet says connected but nothing opens.': 'wifi-no-internet',
    'My screen goes black after logging in.': 'black-screen-login',
    'Outlook keeps asking for my password.': 'outlook-credentials',
    'Windows updates keep failing.': 'windows-update-failure',
    'My laptop fan is very loud.': 'overheating'
  };
  Object.entries(cases).forEach(([t, id]) => {
    const c = W.classify(t);
    assert.equal(c.flowId, id, t + ' -> ' + JSON.stringify(c.matches));
    assert.equal(c.confidence, 'high');
  });
});

test('each quick card phrase matches its card flow', () => {
  const phrases = { 'My PC is running slowly': 'slow-computer', 'Wi-Fi connected but no internet': 'wifi-no-internet', "Windows won't start": 'wont-boot', 'Printer not working': 'printer-offline', 'No sound from speakers': 'no-sound', 'Blue screen error': 'blue-screen', 'Outlook not working': 'outlook-not-opening', 'Windows update failing': 'windows-update-failure', 'Laptop battery draining quickly': 'battery-drain', 'USB device not recognised': 'usb-not-recognised', 'Computer keeps freezing': 'freezing', 'Bluetooth not connecting': 'bluetooth-not-connecting' };
  Object.entries(phrases).forEach(([t, id]) => assert.equal(W.classify(t).flowId, id, t));
  W.KB.quickCards.forEach(c => assert.ok(W.getFlow(c.flow)));
  assert.equal(W.KB.quickCards.length, 12);
});

test('synonyms and informal language are recognised', () => {
  assert.equal(top('my pc is sooo laggy and sluggish'), 'slow-computer');
  assert.equal(top('cant hear anything from my speakers'), 'no-sound');
  assert.equal(top('people cant hear me on teams'), 'teams-mic-not-working');
  assert.equal(top('my wi-fi disappeared from the list'), 'wifi-not-appearing');
  assert.equal(top('cant print anything, printer says offline'), 'printer-offline');
});

test('common spelling mistakes are tolerated', () => {
  assert.equal(top('my scren goes blak after loging in'), 'black-screen-login');
  assert.equal(top('blutooth wont conect'), 'bluetooth-not-connecting');
  assert.equal(top('prnter offlne'), 'printer-offline');
  assert.equal(top('keybord not responding'), 'keyboard-not-responding');
});

test('error codes and stop codes route to the right flows', () => {
  assert.equal(W.classify('error 0x80070005 when installing').matches[0].flowId, 'windows-update-failure');
  assert.equal(W.classify('0x800f0922').flowId, 'windows-update-failure');
  assert.equal(W.classify('it says CRITICAL_PROCESS_DIED').flowId, 'blue-screen');
  assert.equal(W.classify('stop code IRQL_NOT_LESS_OR_EQUAL').flowId, 'blue-screen');
  assert.deepEqual(W.classify('fails with 0xc000000f').codes, ['0xc000000f']);
});

test('unknown input is not guessed', () => {
  ['banana', 'asdfghjkl', 'hello', 'what is the weather today', '', '   '].forEach(t => {
    const c = W.classify(t);
    assert.notEqual(c.confidence, 'high', t + ' => ' + c.confidence);
  });
  assert.equal(W.classify('banana').confidence, 'none');
  assert.equal(W.begin(W.createSession(), 'banana').phase, 'unknown');
});

test('ambiguous input offers choices instead of guessing', () => {
  const c = W.classify('wifi');
  assert.ok(['weak', 'ambiguous'].includes(c.confidence)); assert.ok(c.candidates.length >= 2);
  assert.equal(W.begin(W.createSession(), 'wifi').phase, 'pickFlow');
});

test('a general flow beats its more specific child so the diagnostic question is asked', () => {
  assert.equal(W.classify('My laptop is really slow, and it takes forever to start...').flowId, 'slow-computer');
});

test('version detection from text', () => {
  assert.equal(W.classify('windows 11 is slow').version, '11');
  assert.equal(W.classify('Win 10 laptop slow').version, '10');
  assert.equal(W.classify('windows 10 and windows 11 slow').version, null);
});

test('input is length-limited and stripped of control characters and secrets', () => {
  assert.equal(W.sanitizeInput('abc '.repeat(2000)).length, W.MAX_INPUT);
  assert.equal(W.sanitizeInput('hi\u0000\u0007there'), 'hi there');
  assert.ok(!W.sanitizeInput('my password is Hunter2!').includes('Hunter2'));
  assert.ok(!W.sanitizeInput('key 123456-123456-123456-123456-123456-123456-123456-123456').includes('123456-'));
  assert.ok(!W.sanitizeInput('token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abcdefghijkl').includes('eyJhbGci'));
});
