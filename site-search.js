/* ============================================================
   salmanittools.co.uk — Site Search Widget
   ============================================================
   Self-contained: injects its own CSS, finds the <nav>, drops a
   search box in automatically (no manual markup needed), and
   matches by name / description / keyword ("pdf", "o365", "mfa"…).
   Reuses the page's own --ink/--white/--muted/--green/--border
   CSS variables so it matches whichever page it's on. Starts as a
   small icon button so it never crowds the logo/hamburger on
   narrow screens; expands into an input on click/focus.
   ============================================================ */

(function () {
  "use strict";

  // ---- YOUR TOOLS & GUIDES ------------------------------------------
  const TOOLS = [
    { name: "PDF Toolkit", url: "pdf-toolkit.html",
      description: "Merge, split, compress, rotate and convert PDF files — runs entirely in your browser.",
      keywords: ["pdf", "merge pdf", "split pdf", "compress pdf", "convert pdf", "rotate", "organize pdf"] },

    { name: "SharePoint Report Builder", url: "sharepoint-report.html",
      description: "Generate a client-ready SharePoint report — live site inventory via Microsoft Graph, plus storage & activity from an imported M365 usage export.",
      keywords: ["sharepoint", "report", "o365", "office 365", "microsoft 365", "storage report", "usage report", "site inventory", "graph api", "csv import"] },

    { name: "Microsoft 365 Tenant Audit", url: "m365-scan.html",
      description: "Full Microsoft 365 tenant audit — MFA gaps, risky sign-ins, Conditional Access, license usage, mailbox sizes, inbox rules and more.",
      keywords: ["o365", "office 365", "microsoft 365", "tenant", "tenant audit", "mfa", "security scan", "security audit", "entra", "azure ad", "license usage", "mailbox size", "inbox rules"] },

    { name: "Conditional Access Policy Explainer", url: "ca-policy-explainer.html",
      description: "Paste your Entra ID Conditional Access policy JSON and get a plain-English explanation instantly.",
      keywords: ["conditional access", "ca policy", "entra", "azure ad", "guid", "mfa", "o365", "microsoft 365"] },

    { name: "Email Header Analyzer", url: "email-header-analyzer.html",
      description: "Paste raw email headers to see the delivery path, hop timing, and SPF/DKIM/DMARC results.",
      keywords: ["spf", "dkim", "dmarc", "email routing", "spam score", "email security", "headers"] },

    { name: "Universal File Converter", url: "file-converter.html",
      description: "Convert PDF, Word, JPG, PNG, WebP, HEIC, CSV, Excel and JSON files instantly in your browser.",
      keywords: ["convert", "pdf", "word", "jpg", "png", "webp", "heic", "csv", "excel", "json", "file converter"] },

    { name: "Image Compressor", url: "image-compressor.html",
      description: "Compress JPG, PNG and WebP images instantly — no uploads, 100% private.",
      keywords: ["compress image", "shrink photo", "jpg", "png", "webp", "resize"] },

    { name: "Invoice Generator", url: "invoice-generator.html",
      description: "Create a professional invoice with logo, line items, VAT and payment terms — download as PDF.",
      keywords: ["invoice", "pdf", "billing", "vat", "quote"] },

    { name: "JWT Decoder", url: "jwt-decoder.html",
      description: "Decode a JSON Web Token's header, payload and claims — expiry, roles, scopes, tenant info.",
      keywords: ["jwt", "token", "oauth", "json web token", "claims", "auth"] },

    { name: "Letterhead Generator", url: "letterhead-generator.html",
      description: "Design a professional letterhead with your logo, colours and contact details — print to PDF.",
      keywords: ["letterhead", "logo", "print pdf", "branding"] },

    { name: "Life Calculator", url: "life-calculator.html",
      description: "Everyday calculators: percentage, discount, VAT, salary, mortgage, loan, tip, split bill, age & more.",
      keywords: ["calculator", "percentage", "discount", "vat", "salary", "take-home pay", "mortgage", "loan", "interest", "tip", "split bill", "age", "date"] },

    { name: "Network Tools", url: "network-tools.html",
      description: "Check your public IP, DNS lookup, IP geolocation, and run a ping test.",
      keywords: ["ip lookup", "dns", "ping", "geolocation", "public ip"] },

    { name: "Object & Watermark Remover", url: "object-remover.html",
      description: "Remove unwanted objects, logos or watermarks from your own photos — right in your browser.",
      keywords: ["remove object", "watermark remover", "logo remover", "photo editing"] },

    { name: "Password Generator", url: "password-generator.html",
      description: "Generate strong, secure passwords — customise length, characters and complexity.",
      keywords: ["password", "secure password", "generator"] },

    { name: "QR Code Generator", url: "qr-generator.html",
      description: "Create QR codes for URLs, text, WiFi, vCard, SMS, email and phone — custom colours & logo.",
      keywords: ["qr code", "wifi qr", "vcard", "barcode"] },

    { name: "Screenshot Privacy Tool", url: "screenshot-privacy.html",
      description: "Find and blur sensitive info in screenshots — emails, phone numbers, IPs, URLs, secrets.",
      keywords: ["blur", "redact", "screenshot", "sensitive info", "privacy"] },

    { name: "SEO & Website Health Checker", url: "seo-checker.html",
      description: "Check a site's on-page SEO and technical health — title tags, meta descriptions, headings, robots.txt.",
      keywords: ["seo", "meta tags", "website health", "on-page seo", "robots.txt", "site audit"] },

    { name: "Subnet Calculator", url: "subnet-calculator.html",
      description: "Enter an IP and CIDR prefix to get network address, broadcast, usable hosts and subnet mask.",
      keywords: ["subnet", "cidr", "ipv4", "network mask", "broadcast", "wildcard mask"] },

    { name: "DNS Propagation Checker", url: "dns-propagation.html",
      description: "Check if DNS changes have propagated globally — A, AAAA, MX, TXT, NS, CNAME, SOA across 16 resolvers.",
      keywords: ["dns", "propagation", "a record", "mx record", "txt record", "cname", "ns record", "soa"] },

    { name: "Is This Email a Scam?", url: "is-this-email-a-scam.html",
      description: "Paste an email to check for phishing, scam and impersonation warning signs.",
      keywords: ["phishing", "scam", "email checker", "impersonation", "spam"] },

    { name: "OneClickFix", url: "index.html#tools",
      description: "Windows PC download — fix, clean and optimise a PC in one click. 17 automated checks.",
      keywords: ["windows fix", "pc cleanup", "temp files", "registry fix", "windows repair", "exe download"] },

    { name: "ProfileCleaner", url: "index.html#tools",
      description: "Windows PC download — safely remove old user profiles to free up disk space.",
      keywords: ["windows profiles", "disk space", "user profile cleanup", "exe download"] },

    { name: "IT Guides", url: "guides.html",
      description: "Practical IT guides — email deliverability, M365 security, Conditional Access, email headers.",
      keywords: ["guides", "articles", "resources"] },

    { name: "Guide: What Conditional Access Actually Does", url: "guide-conditional-access.html",
      description: "What Conditional Access does and where to start, in plain English.",
      keywords: ["conditional access guide", "entra", "mfa", "o365"] },

    { name: "Guide: How to Read Email Headers", url: "guide-email-headers.html",
      description: "How to read email headers to see where a message came from and why it failed.",
      keywords: ["email headers guide", "spf", "dkim", "dmarc"] },

    { name: "Guide: Why Your Email Is Going to Spam", url: "guide-email-spam.html",
      description: "Real causes of email deliverability failures — DKIM, DMARC, IP reputation, content scoring.",
      keywords: ["spam guide", "deliverability", "dkim", "dmarc", "spf", "junk folder"] },

    { name: "Guide: M365 Security Settings Most Businesses Get Wrong", url: "guide-m365-security.html",
      description: "The Microsoft 365 misconfigurations that come up most often, and how to fix them.",
      keywords: ["m365 security guide", "o365 misconfiguration", "tenant security"] },
  ];

  // ---- STYLES (uses the page's own theme variables) ----------------------
  const style = document.createElement("style");
  style.textContent = `
    .sit-search { position: relative; width: 34px; height: 34px; flex: 0 0 auto; font-family: inherit; }
    .sit-search-toggle {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--border, rgba(255,255,255,.07)); border-radius: 8px; cursor: pointer;
      background: var(--card, #0E1A2E); color: var(--muted, #5A6A85); font-size: 15px; padding: 0;
      transition: border-color .2s, color .2s;
    }
    .sit-search-toggle:hover { border-color: var(--green, #00E87A); color: var(--white, #F0F6FF); }
    .sit-search.expanded .sit-search-toggle { opacity: 0; pointer-events: none; }
    .sit-search input {
      position: absolute; top: 0; right: 0; height: 34px; width: 0; opacity: 0; pointer-events: none;
      box-sizing: border-box; padding: 0 12px; font-size: 0.85rem;
      border: 1px solid var(--border, rgba(255,255,255,.07)); border-radius: 8px; outline: none;
      background: var(--card, #0E1A2E); color: var(--white, #F0F6FF);
      transition: width .2s ease, opacity .15s ease, border-color .2s;
    }
    .sit-search.expanded input { width: min(260px, 65vw); opacity: 1; pointer-events: auto; }
    .sit-search input:focus { border-color: var(--green, #00E87A); box-shadow: 0 0 0 3px rgba(0,232,122,.15); }
    .sit-search input::placeholder { color: var(--muted, #5A6A85); }
    .sit-search-results {
      position: absolute; top: calc(100% + 8px); right: 0; width: min(320px, 85vw);
      background: var(--card, #0E1A2E); border: 1px solid var(--border, rgba(255,255,255,.07));
      border-radius: 10px; box-shadow: 0 12px 32px rgba(0,0,0,.4); max-height: 360px; overflow-y: auto;
      z-index: 1000; display: none;
    }
    .sit-search-results.open { display: block; }
    .sit-search-item { display: block; padding: 10px 14px; text-decoration: none; border-bottom: 1px solid var(--border, rgba(255,255,255,.07)); }
    .sit-search-item:last-child { border-bottom: none; }
    .sit-search-item:hover, .sit-search-item.active { background: rgba(0,232,122,.08); }
    .sit-search-item .name { font-weight: 600; font-size: 0.85rem; color: var(--white, #F0F6FF); }
    .sit-search-item .desc { font-size: 0.75rem; color: var(--muted, #5A6A85); margin-top: 3px; line-height: 1.4; }
    .sit-search-empty { padding: 14px; font-size: 0.8rem; color: var(--muted, #5A6A85); }
  `;
  document.head.appendChild(style);

  // ---- MARKUP + BEHAVIOUR --------------------------------------------
  function buildWidget(container) {
    container.classList.add("sit-search");
    container.innerHTML = `
      <button type="button" class="sit-search-toggle" aria-label="Search tools">&#128269;</button>
      <input type="text" placeholder="Search tools…" aria-label="Search tools" autocomplete="off" />
      <div class="sit-search-results"></div>
    `;

    const toggle = container.querySelector(".sit-search-toggle");
    const input = container.querySelector("input");
    const resultsEl = container.querySelector(".sit-search-results");
    let activeIndex = -1;
    let currentMatches = [];

    function expand() {
      container.classList.add("expanded");
      input.focus();
    }

    function collapse() {
      container.classList.remove("expanded");
      resultsEl.classList.remove("open");
    }

    toggle.addEventListener("click", expand);

    function score(tool, q) {
      const name = tool.name.toLowerCase();
      const desc = (tool.description || "").toLowerCase();
      const kws = (tool.keywords || []).map((k) => k.toLowerCase());
      if (name.includes(q)) return name.startsWith(q) ? 3 : 2;
      if (kws.some((k) => k.includes(q))) return 1.5;
      if (desc.includes(q)) return 1;
      return 0;
    }

    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) return [];
      return TOOLS.map((t) => ({ t, s: score(t, q) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((r) => r.t);
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function render(matches) {
      currentMatches = matches;
      activeIndex = -1;
      if (!matches.length) {
        resultsEl.innerHTML = input.value.trim()
          ? `<div class="sit-search-empty">No tools found. Try a different word.</div>`
          : "";
        resultsEl.classList.toggle("open", !!input.value.trim());
        return;
      }
      resultsEl.innerHTML = matches
        .map(
          (t) => `
        <a href="${t.url}" class="sit-search-item">
          <div class="name">${escapeHtml(t.name)}</div>
          <div class="desc">${escapeHtml(t.description || "")}</div>
        </a>`
        )
        .join("");
      resultsEl.classList.add("open");
    }

    function setActive(i) {
      const items = resultsEl.querySelectorAll(".sit-search-item");
      items.forEach((el) => el.classList.remove("active"));
      if (items[i]) {
        items[i].classList.add("active");
        items[i].scrollIntoView({ block: "nearest" });
      }
      activeIndex = i;
    }

    input.addEventListener("input", () => render(search(input.value)));

    input.addEventListener("keydown", (e) => {
      const items = resultsEl.querySelectorAll(".sit-search-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(activeIndex + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(activeIndex - 1, 0));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && currentMatches[activeIndex]) {
          window.location.href = currentMatches[activeIndex].url;
        } else if (currentMatches.length) {
          window.location.href = currentMatches[0].url;
        }
      } else if (e.key === "Escape") {
        collapse();
        input.blur();
      }
    });

    document.addEventListener("click", (e) => {
      if (container.contains(e.target)) return;
      resultsEl.classList.remove("open");
      if (!input.value.trim()) collapse();
    });
  }

  // ---- FIND (OR CREATE) A HOME FOR THE WIDGET -----------------------
  function init() {
    let container = document.getElementById("site-search");

    if (!container) {
      const nav = document.querySelector("nav");
      if (!nav) return;
      container = document.createElement("div");
      container.id = "site-search";
      const hamburger = nav.querySelector(".hamburger");
      if (hamburger) {
        nav.insertBefore(container, hamburger);
      } else {
        nav.appendChild(container);
      }
    }

    buildWidget(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
