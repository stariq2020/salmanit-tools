/* Adds the shared tool-page theme (sx-page.css + Inter) to every tool page. Idempotent.
 * Usage: node scripts/apply-page-theme.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const SKIP = new Set(['index.html']);
const inject = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="sx-page.css">\n';
let n = 0;
for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html') && !SKIP.has(f))) {
  let h = fs.readFileSync(path.join(root, f), 'utf8');
  if (h.includes('sx-page.css') || !h.includes('--ink:')) continue; // only pages using the shared variable set
  h = h.replace(/font-family:\s*'Bebas Neue'[^;}"]*/g, 'font-family:Inter,system-ui,sans-serif;font-weight:800;letter-spacing:-.02em')
       .replace(/font-family:\s*'Outfit'[^;}"]*/g, 'font-family:Inter,system-ui,sans-serif');
  if (!h.includes('</head>')) continue;
  h = h.replace('</head>', inject + '</head>');
  fs.writeFileSync(path.join(root, f), h); n++; console.log('themed', f);
}
console.log(n + ' pages updated');
