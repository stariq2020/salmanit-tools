#!/usr/bin/env node
'use strict';
/* Generates the crawlable HTML pages from the knowledge base:
 *   windows-troubleshooter.html            (the tool)
 *   windows-troubleshooter-<issue>.html    (4 issue landing pages, content from kb-meta.js + the flow itself)
 * Run from the repo root:  node windows-troubleshooter/build-pages.js
 * Re-run after editing any kb-*.js file or the templates below. No dependencies. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const W = require('./tests/load.js');
const KB = W.KB;
const SITE = 'https://salmanittools.co.uk/';
const OG = SITE + 'og-image.png';
const TODAY = KB.reviewed;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = s => String(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\{\{(.+?)\}\}/g, '$1');
const jsonld = o => '<script type="application/ld+json">\n' + JSON.stringify(o, null, 2).replace(/</g, '\\u003c') + '\n</script>';

const FAQ = [
  ['Does this tool scan or repair my computer?', 'No. A website cannot see inside your PC. This tool asks questions about what you are seeing and then gives you reviewed, step-by-step instructions that you carry out yourself. It never claims to have scanned or fixed anything.'],
  ['Is it free, and do I need an account?', 'It is completely free. There is no sign-up, no login and nothing to install.'],
  ['Is my description sent anywhere?', 'No. By default everything you type is processed in your browser and goes nowhere. An optional AI helper only appears if the site owner has switched it on, and it only runs if you tick a clear consent box first. Fixes always come from the reviewed guides, never from AI.'],
  ['Does it cover Windows 10 and Windows 11?', 'Yes. Instructions adapt to the version you choose. Windows 10 reached its standard end of support on 14 October 2025, although some devices have Extended Security Updates or other support arrangements. If you are unsure which version you have, press the Windows key + R, type winver and press Enter.'],
  ['How safe are the steps?', 'Safe, reversible steps always come first. The tool will not tell you to edit the registry, disable your antivirus or firewall, format drives, reset Windows or change BIOS settings. Anything risky is flagged with a warning or passed to a technician. No fix is ever guaranteed.'],
  ['What if my PC belongs to my employer or school?', 'Some steps may be blocked by IT policy. If a step is greyed out or asks for an administrator password, stop and contact your IT team. The summary you can copy, print or save as a PDF is designed to be handed to them.'],
  ['Can I share the results with IT support?', 'Yes. At the end you can copy the summary, print it or download it as a PDF. It lists the problem, your answers, likely causes (labelled as hypotheses), the steps you tried and what happened. It never includes passwords or recovery keys.'],
  ['My problem is not listed. What now?', 'Describe it in your own words, including any error message. If the tool cannot match it, it will say so and let you browse by category instead of guessing. You can also search the error-code library on this page.']
];

const NAV = `<nav aria-label="Main">
  <a class="nav-logo" href="index.html">⚡ Salman IT<span class="dot">.</span>Tools</a>
  <div class="nav-links">
    <a href="index.html">Home</a>
    <a href="index.html#tools">Tools</a>
    <a href="guides.html">Guides</a>
    <a href="index.html#faq">FAQ</a>
    <a href="index.html#about">About</a>
    <a href="index.html#contact">Contact</a>
  </div>
  <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="index.html">Home</a>
  <a href="index.html#tools">Tools</a>
  <a href="guides.html">Guides</a>
  <a href="index.html#faq">FAQ</a>
  <a href="index.html#about">About</a>
  <a href="index.html#contact">Contact</a>
</div>`;

const FOOTER = `<footer>
  <div class="footer-logo">⚡ Salman IT<span class="dot">.</span>Tools</div>
  <p>Free online tools for everyone &nbsp;&middot;&nbsp; <a href="index.html">Home</a> &nbsp;&middot;&nbsp; <a href="privacy.html">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="terms.html">Terms of Service</a></p>
  <p>General troubleshooting guidance only. Guides last reviewed ${TODAY}.</p>
</footer>`;

function head({ title, desc, url, ld }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Salman IT Tools">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${OG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${OG}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="windows-troubleshooter/wt.css">
${ld.map(jsonld).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>
${NAV}`;
}
const TAIL = `${FOOTER}
<script src="windows-troubleshooter/nav.js" defer></script>
<script src="site-search.js" defer></script>`;

const breadcrumbLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: SITE + it[1] })) });
const faqLd = list => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) });
const crumbsHtml = items => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) => i === items.length - 1 ? `<li aria-current="page">${esc(it[0])}</li>` : `<li><a href="${it[1]}">${esc(it[0])}</a></li>`).join('')}</ol></nav>`;

function guideLink(id) {
  const page = KB.seoPages.find(p => p.flow === id);
  return page ? page.slug : `windows-troubleshooter.html?issue=${id}`;
}

/* ---------------- main tool page ---------------- */
function mainPage() {
  const TITLE = 'Free Windows Troubleshooter | Fix Common PC Problems – Salman IT Tools';
  const DESC = 'PC running slow, Wi-Fi not working or Windows showing errors? Use our free Windows troubleshooter for easy, step-by-step solutions. No signup needed.';
  const crumbs = [['Home', 'index.html'], ['Tools', 'index.html#tools'], ['Windows Troubleshooter', 'windows-troubleshooter.html']];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: "What's Wrong With My PC? - Windows Troubleshooter", url: SITE + 'windows-troubleshooter.html', description: DESC, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (runs in browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' }, publisher: { '@type': 'Organization', name: 'Salman IT Tools', url: SITE }, inLanguage: 'en-GB', dateModified: TODAY },
    breadcrumbLd(crumbs), faqLd(FAQ)
  ];
  const popular = KB.popular.map(id => {
    const f = KB.flows.find(x => x.id === id);
    return `<a class="qcard" href="${guideLink(id)}"><span><strong>${esc(f.title)}</strong><small>${esc(f.blurb)}</small></span></a>`;
  }).join('\n      ');
  return head({ title: TITLE, desc: DESC, url: 'windows-troubleshooter.html', ld }) + `
<main id="main">
<div class="wrap">
  ${crumbsHtml(crumbs)}

  <section class="hero home-only" aria-labelledby="h1">
    <div class="eyebrow">Free Windows troubleshooter</div>
    <h1 class="title" id="h1">What's Wrong<br><span class="acc">With My PC?</span></h1>
    <p class="tagline">Describe the problem. Find the fix. Get back to work.</p>
    <p class="sub">Describe your Windows problem in plain English and get easy, step-by-step troubleshooting guidance.</p>
    <form class="ask" id="ask-form" novalidate>
      <label for="problem">Describe your problem</label>
      <div class="ask-row">
        <textarea id="problem" name="problem" rows="2" maxlength="500" autocomplete="off" spellcheck="true" placeholder="Example: My laptop is really slow, and it takes forever to start..." aria-describedby="ask-err counter"></textarea>
        <button class="btn primary" id="find-btn" type="submit">Find My Fix</button>
      </div>
      <div style="display:flex;justify-content:space-between;gap:10px"><span id="ask-err" role="alert" style="color:#FF6B6B;font-size:.85rem"></span><span class="counter" id="counter">0 / 500</span></div>
      <div id="ai-slot"></div>
      <div class="chips" aria-label="Privacy">
        <span>Free to use</span><span>No account required</span><span>No software installation</span><span>Nothing leaves your browser by default</span>
      </div>
    </form>
    <div id="resume"></div>
    <h2 class="sec-title" style="margin-top:34px">Or pick a common problem</h2>
    <div class="cards" id="quick-cards"></div>
  </section>

  <section id="app" aria-label="Troubleshooting session">
    <div class="toolbar" id="toolbar"></div>
    <div class="progress" id="progress"></div>
    <div id="view"></div>
  </section>

  <div class="home-only">
    <h2 class="sec-title">Popular Problems We Can Help With</h2>
    <p class="sec-sub">Six of the most common Windows problems, each with a dedicated guide.</p>
    <div class="cards">
      ${popular}
    </div>

    <h2 class="sec-title">How It Works</h2>
    <div class="steps3">
      <div class="s3"><b class="n">1</b><h3>Tell us what's wrong.</h3><p>Type it in your own words, spelling mistakes included, or pick a common issue. Mention any error code you can see.</p></div>
      <div class="s3"><b class="n">2</b><h3>Answer a few simple questions.</h3><p>Only questions that matter for your problem are asked, and anything you already said is not asked again.</p></div>
      <div class="s3"><b class="n">3</b><h3>Follow your personalised troubleshooting guide.</h3><p>Safe, reversible steps first, with Windows 10 and Windows 11 instructions. Tell us after each step whether it worked.</p></div>
    </div>
    <p class="disclaimer" role="note"><strong>Free to use. No account required. No software installation.</strong><br>This tool provides general troubleshooting guidance. It cannot directly inspect or repair your computer.</p>

    <h2 class="sec-title">Browse all ${KB.flows.length} troubleshooting guides</h2>
    <div id="browse"></div>

    <h2 class="sec-title" id="errors">Windows Error Code Library</h2>
    <p class="sec-sub">A curated set of common Windows update, boot, blue-screen and device errors with what they mean and where to start.</p>
    <div class="search-row"><label class="sr-only" for="err-search">Search error codes</label><input id="err-search" type="search" placeholder="Search a code or word, e.g. 0x80070005 or CRITICAL_PROCESS_DIED" maxlength="80" autocomplete="off"></div>
    <p class="expect" id="err-count" role="status" style="color:#9FB0CC;margin-bottom:10px"></p>
    <div class="elist" id="err-list"></div>

    <h2 class="sec-title">Windows Commands Library</h2>
    <p class="sec-sub">Advanced reference. The troubleshooter only suggests a command when your answers justify it, and you always run it yourself. Nothing is executed for you.</p>
    <details class="more" id="cmd-details"><summary>Show all ${Object.keys(KB.commands).length} commands</summary><div id="cmd-list"></div></details>

    <h2 class="sec-title">Frequently Asked Questions</h2>
    <div class="faq">
${FAQ.map(f => `      <details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join('\n')}
    </div>

    <h2 class="sec-title">More tools you might need</h2>
    <div class="related">
      <a href="network-tools.html">Network Tools</a>
      <a href="dns-propagation.html">DNS Propagation Checker</a>
      <a href="email-header-analyzer.html">Email Header Analyzer</a>
      <a href="is-this-email-a-scam.html">Is This Email a Scam?</a>
      <a href="guides.html">IT Guides</a>
    </div>
  </div>
</div>
</main>
<div id="live" class="sr-only" role="status" aria-live="polite"></div>
<div id="print-area" aria-hidden="true"></div>
<noscript><div class="wrap"><p class="disclaimer">This troubleshooter needs JavaScript. You can still read the guides: <a href="windows-troubleshooter-slow-computer.html">slow computer</a>, <a href="windows-troubleshooter-wifi-connected-no-internet.html">Wi-Fi connected but no internet</a>, <a href="windows-troubleshooter-windows-update-error.html">Windows update error</a>, <a href="windows-troubleshooter-outlook-not-opening.html">Outlook not opening</a>.</p></div></noscript>
${TAIL}
<script src="windows-troubleshooter/kb-core.js"></script>
<script src="windows-troubleshooter/kb-performance.js"></script>
<script src="windows-troubleshooter/kb-network.js"></script>
<script src="windows-troubleshooter/kb-windows.js"></script>
<script src="windows-troubleshooter/kb-av-devices.js"></script>
<script src="windows-troubleshooter/kb-m365-hardware.js"></script>
<script src="windows-troubleshooter/kb-meta.js"></script>
<script src="windows-troubleshooter/engine.js"></script>
<script src="windows-troubleshooter/app.js"></script>
</body>
</html>
`;
}

/* ---------------- issue landing pages ---------------- */
function issuePage(p) {
  const f = KB.flows.find(x => x.id === p.flow);
  const def = f.branches[f.branches.length - 1];
  const crumbs = [['Home', 'index.html'], ['Windows Troubleshooter', 'windows-troubleshooter.html'], [f.title, p.slug]];
  const faq = p.faq;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebPage', name: p.h1, url: SITE + p.slug, description: p.desc, inLanguage: 'en-GB', dateModified: TODAY, isPartOf: { '@type': 'WebSite', name: 'Salman IT Tools', url: SITE } }, breadcrumbLd(crumbs), faqLd(faq)];
  const steps = def.steps.map(id => W.getStepDef(f, id)).filter(Boolean);
  const errs = KB.errors.filter(e => (e.flows || []).includes(f.id));
  const start = `windows-troubleshooter.html?issue=${f.id}`;
  const related = p.related.map(id => KB.flows.find(x => x.id === id)).filter(Boolean);
  return head({ title: p.title, desc: p.desc, url: p.slug, ld }) + `
<main id="main">
<div class="wrap page-article">
  ${crumbsHtml(crumbs)}
  <div class="eyebrow" style="margin-top:26px">Windows troubleshooting guide</div>
  <h1 class="title" style="font-size:clamp(2.4rem,6vw,4rem)">${esc(p.h1)}</h1>
  <p style="margin-top:14px;font-size:1.05rem">${esc(p.intro)}</p>
  <div class="cta"><a class="btn primary" href="${start}">Start the guided troubleshooter</a><a class="btn" href="windows-troubleshooter.html">Describe a different problem</a></div>
  <p class="disclaimer" role="note">This guide provides general troubleshooting guidance. It cannot directly inspect or repair your computer. Takes about ${esc(f.time)}; difficulty: ${esc(f.difficulty.toLowerCase())}; risk: ${esc(f.risk.toLowerCase())}. Last reviewed ${TODAY}.</p>

  <h2>${esc(p.whenTitle)}</h2>
  <ul class="why">
${p.when.map(w => `    <li><b>${esc(w[0])}</b><span>${esc(w[1])}</span></li>`).join('\n')}
  </ul>

  <h2>Common signs</h2>
  <ul class="why">
${f.symptoms.map(s => `    <li><span>${esc(s)}</span></li>`).join('\n')}
  </ul>

  <h2>The order we try fixes in</h2>
  <p>The guided troubleshooter personalises this order from your answers. Here is the general sequence, safest and quickest first:</p>
  <ol class="preview-steps">
${steps.map(s => `    <li><b>${esc(s.title)}</b><span>${esc(plain(s.why).split('. ')[0].replace(/\.$/, ''))}. (${esc(s.time)})</span></li>`).join('\n')}
  </ol>
  <div class="cta"><a class="btn primary" href="${start}">Get my personalised steps</a></div>
${errs.length ? `
  <h2>Error codes linked to this problem</h2>
  <ul class="why">
${errs.map(e => `    <li><b>${esc(e.code)} – ${esc(e.name)}</b><span>${esc(e.meaning)}</span></li>`).join('\n')}
  </ul>` : ''}

  <h2>Quick answers</h2>
  <div class="faq">
${faq.map(q => `    <details><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('\n')}
  </div>

  <h2>If it is a work or school device</h2>
  <p>Some of these steps may be blocked by your organisation's policies. If a step is unavailable or asks for an administrator password, stop and contact your IT team. Never share passwords or BitLocker recovery keys.</p>

  <h2>Related guides</h2>
  <div class="related">
${related.map(r => `    <a href="${guideLink(r.id)}">${esc(r.title)}</a>`).join('\n')}
    <a href="windows-troubleshooter.html#errors">Error code library</a>
    <a href="network-tools.html">Network Tools</a>
  </div>
${f.ms ? `  <p style="margin-top:22px;font-size:.9rem">Official reference: <a href="${esc(f.ms.url)}" target="_blank" rel="noopener noreferrer">${esc(f.ms.label)}</a></p>` : ''}
</div>
</main>
${TAIL}
</body>
</html>
`;
}

const out = [];
fs.writeFileSync(path.join(root, 'windows-troubleshooter.html'), mainPage(), 'utf8'); out.push('windows-troubleshooter.html');
KB.seoPages.forEach(p => { fs.writeFileSync(path.join(root, p.slug), issuePage(p), 'utf8'); out.push(p.slug); });
console.log('Wrote: ' + out.join(', '));
