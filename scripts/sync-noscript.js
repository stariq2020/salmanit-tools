/* Refreshes the crawler/no-JS link list in index.html from tools-registry.js.
 * Run after adding or editing a tool:  node scripts/sync-noscript.js
 * (The live grid is rendered from the registry in the browser; this static list keeps every tool
 *  linkable without JavaScript.) */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'tools-registry.js'), 'utf8'));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const items = window.SX_TOOLS.slice().sort((a, b) => a.name.localeCompare(b.name))
  .map(t => `<li><a href="${t.url}">${esc(t.name)}</a> &mdash; ${esc(t.description)}</li>`).join('');
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const re = /<!--SX-NOSCRIPT-START-->[\s\S]*?<!--SX-NOSCRIPT-END-->/;
if (!re.test(html)) throw new Error('markers not found in index.html');
html = html.replace(re, `<!--SX-NOSCRIPT-START-->\n<noscript><div class="sx-wrap sx-noscript"><h2>All tools</h2><ul>${items}</ul></div></noscript>\n<!--SX-NOSCRIPT-END-->`);
fs.writeFileSync(file, html);
console.log('Updated noscript list with', window.SX_TOOLS.length, 'tools');
