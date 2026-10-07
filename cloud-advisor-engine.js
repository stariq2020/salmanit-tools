/* ============================================================
   Cloud Productivity Advisor — deterministic recommendation engine
   No network calls, no AI, no randomness. Same answers → same result.
   Depends on cloud-advisor-pricing.js (CloudAdvisorData).
   ============================================================ */
(function (root) {
  'use strict';
  var D = (typeof module !== 'undefined' && module.exports) ? require('./cloud-advisor-pricing.js') : root.CloudAdvisorData;
  var C = D.CONFIG, PLANS = D.PLANS;

  var OFFICE_APPS = ['word', 'excel', 'powerpoint', 'outlook'];
  var GOOGLE_APPS = ['gmail', 'googleDocs', 'googleSheets', 'googleDrive'];
  var APP_LABELS = { word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint', outlook: 'Outlook', gmail: 'Gmail', googleDocs: 'Google Docs', googleSheets: 'Google Sheets', googleDrive: 'Google Drive', teams: 'Teams', zoom: 'Zoom', sharepoint: 'SharePoint', onedrive: 'OneDrive', dropbox: 'Dropbox' };
  var COLLAB_LABELS = { individual: 'individual files', sharedFolders: 'shared folders', coedit: 'simultaneous editing', networkDrive: 'a shared network drive', largeFiles: 'large files', remote: 'remote working', external: 'external sharing' };
  var PROVIDER_LABELS = { google: 'Google Workspace', microsoft: 'Microsoft 365', zoho: 'Zoho Workplace', dropbox: 'Dropbox' };

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function money(n) {
    var r = Math.round(n), s = Math.abs(r).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (r < 0 ? '-' : '') + C.CURRENCY + s;
  }
  function gbText(gb) { return gb >= 1000 ? (Math.round(gb / 100) / 10) + ' TB' : Math.round(gb) + ' GB'; }
  function fitLabel(score) { for (var i = 0; i < C.FIT_LABELS.length; i++) if (score >= C.FIT_LABELS[i][0]) return C.FIT_LABELS[i][1]; return 'Poor'; }
  function planName(p) { return p.id === 'dropbox-office' ? 'Dropbox Business + Microsoft 365 Apps for Business' : p.platform + ' ' + p.plan; }
  function list(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  /* ---------- normalise answers ---------- */
  function normalise(raw) {
    var a = raw || {};
    var users = clamp(Math.round(Number(a.users) || 0), 1, 500);
    var storageGB = null;
    if (Number(a.storageExactGB) > 0) storageGB = Number(a.storageExactGB);
    else if (a.storageBand && C.STORAGE_BANDS[a.storageBand]) storageGB = C.STORAGE_BANDS[a.storageBand];

    var costKnown = !a.costUnknown && Number(a.costAmount) > 0;
    var annualCost = null;
    if (costKnown) annualCost = a.costPeriod === 'year' ? Number(a.costAmount) : Number(a.costAmount) * 12;

    return {
      current: a.current || 'unsure',
      users: users,
      storageGB: storageGB,
      apps: (a.apps || []).filter(function (k) { return k !== 'other'; }),
      desktop: a.desktop || 'unsure',
      collab: (a.collab || []).filter(function (k) { return k !== 'notsure'; }),
      emailCurrent: a.emailCurrent || 'unsure',
      emailMove: a.emailMove || 'maybe',
      costKnown: costKnown,
      annualCost: annualCost,
      priorities: (a.priorities || []).slice(0, 3)
    };
  }

  function currentProvider(a) { return D.CURRENT_PROVIDER[a.current] || null; }
  // A plan belongs to the user's current platform. The Dropbox + Office bundle is an add-on option, not "staying".
  function isCurrentPlatform(plan, a) {
    var cur = currentProvider(a);
    if (!cur) return false;
    return cur === 'dropbox' ? plan.group === 'dropbox' : plan.provider === cur;
  }
  function emailProviderOf(a) { return a.emailCurrent === 'google' ? 'google' : a.emailCurrent === 'microsoft' ? 'microsoft' : null; }

  function weights(a) {
    var w = {};
    Object.keys(C.BASE_WEIGHTS).forEach(function (k) { w[k] = C.BASE_WEIGHTS[k]; });
    a.priorities.forEach(function (p) {
      var b = C.PRIORITY_BOOSTS[p];
      if (b) Object.keys(b).forEach(function (k) { w[k] *= b[k]; });
    });
    return w;
  }

  function eligible(plan, a) { return !(plan.maxUsers && a.users > plan.maxUsers); }
  function annualFor(plan, a) { return plan.pricePerUserMonth * Math.max(a.users, plan.minUsers || 0) * 12; }
  function capacityGB(plan, a) { return plan.storage.perUserGB * a.users + plan.storage.pooledGB; }

  /* ---------- migration ---------- */
  function migration(plan, a, isStay) {
    var cur = currentProvider(a);
    var same = isStay || isCurrentPlatform(plan, a);
    var pts = 0, changes = [];
    if (!same && plan.id === 'dropbox-office' && cur === 'dropbox') {
      return { level: 'Low', points: 1, changes: [
        { ok: true, text: 'Dropbox files and sharing stay exactly as they are' },
        { ok: true, text: 'Add Microsoft 365 Apps licences and install Office on each device' },
        { ok: true, text: 'Email stays where it is' } ] };
    }
    if (same) {
      changes.push({ ok: true, text: isStay ? 'No migration — you stay on your current platform' : 'Licence / plan change within your current provider' });
      return { level: 'Low', points: 0, changes: changes };
    }
    pts += a.users <= 10 ? 0 : a.users <= 50 ? 1 : a.users <= 150 ? 2 : 3;
    var gb = a.storageGB;
    pts += gb == null ? 1 : gb <= 250 ? 0 : gb <= 1000 ? 1 : 2;
    pts += 1; // file migration between providers
    changes.push({ ok: true, text: 'User accounts (' + a.users + ' to create)' });
    changes.push({ ok: true, text: 'File storage' + (gb != null ? ' (approx. ' + gbText(gb) + ' to move)' : '') });

    var emailMigrates = plan.email.provider && a.emailMove !== 'no' && emailProviderOf(a) !== plan.email.provider;
    if (emailMigrates) {
      pts += a.users <= 10 ? 2 : 3; // mailbox migration + MX/DNS cut-over
      changes.push({ ok: false, text: 'Email migration (mailboxes, calendars, contacts)' });
      changes.push({ ok: false, text: 'DNS records (MX, SPF, DKIM, DMARC)' });
    } else if (plan.email.provider && emailProviderOf(a) === plan.email.provider) {
      changes.push({ ok: true, text: 'Email stays with the same provider' });
    } else {
      changes.push({ ok: true, text: 'Email stays where it is — no mailbox migration' });
      changes.push({ ok: true, text: 'Domain verification only (a TXT record)' });
    }
    if (a.collab.indexOf('networkDrive') >= 0 || a.collab.indexOf('sharedFolders') >= 0) { pts += 1; changes.push({ ok: false, text: 'Shared folders and drive mappings' }); }
    if (a.collab.indexOf('external') >= 0 || a.collab.indexOf('sharedFolders') >= 0) { pts += 1; changes.push({ ok: false, text: 'Existing sharing permissions and client links' }); }
    if (plan.desktopOffice && cur !== 'microsoft') changes.push({ ok: false, text: 'Install desktop Office apps on each device' });
    var officeUsed = a.apps.filter(function (k) { return OFFICE_APPS.indexOf(k) >= 0; }).length;
    if (cur === 'microsoft' && !plan.desktopOffice && officeUsed >= 2) pts += 1;
    if (a.priorities.indexOf('Security') >= 0) { pts += 1; changes.push({ ok: false, text: 'Security policies (MFA, access rules) to rebuild' }); }
    var level = pts <= C.MIGRATION.lowMax ? 'Low' : pts <= C.MIGRATION.moderateMax ? 'Moderate' : 'High';
    return { level: level, points: pts, changes: changes };
  }

  /* ---------- scoring ---------- */
  function scorePlan(plan, a, w, ctx, opts) {
    opts = opts || {};
    var annual = opts.annualOverride != null ? opts.annualOverride : annualFor(plan, a);
    var s = {}, caps = [], why = [];

    // cost
    if (ctx.annualCost != null) s.cost = clamp(1 - (annual / ctx.annualCost - 0.6) / 1.0, 0, 1);
    else s.cost = clamp(1 - (annual / ctx.cheapest - 1) / 3, 0, 1);

    // applications
    var appScores = a.apps.map(function (k) { return plan.apps[k] != null ? plan.apps[k] : .3; });
    s.apps = appScores.length ? avg(appScores) : .8;

    // desktop Office
    var softDesktop = a.priorities.indexOf('Microsoft Office') >= 0 || a.priorities.indexOf('Desktop applications') >= 0;
    if (a.desktop === 'yes') { s.desktop = plan.desktopOffice ? 1 : 0; if (!plan.desktopOffice) caps.push({ key: 'desktopMissing', text: 'No desktop Microsoft Office apps' }); }
    else if (a.desktop === 'unsure') s.desktop = plan.desktopOffice ? 1 : .7;
    else s.desktop = softDesktop ? (plan.desktopOffice ? 1 : .5) : 1;

    // storage
    var cap = capacityGB(plan, a);
    if (a.storageGB == null) s.storage = .85;
    else {
      var r = cap / a.storageGB;
      s.storage = r >= 2 ? 1 : r >= 1.2 ? .9 : r >= 1 ? .6 : 0;
      if (r < 1) caps.push({ key: 'storageShort', text: 'Included storage (' + gbText(cap) + ') is below your requirement' });
    }

    // collaboration
    var cs = a.collab.map(function (k) { return plan.collab[k] != null ? plan.collab[k] : .5; });
    s.collab = cs.length ? avg(cs) : .8;

    // email
    var pe = plan.email.provider, ce = emailProviderOf(a), move = a.emailMove;
    if (!pe) s.email = move === 'yes' ? .4 : 1;
    else if (ce && pe === ce) s.email = 1;
    else if (ce) {
      s.email = move === 'yes' ? .9 : move === 'maybe' ? .6 : .1;
      if (move === 'no') caps.push({ key: 'emailMoveRefused', text: 'Would require moving email, which you want to avoid' });
    } else s.email = move === 'yes' ? .9 : move === 'maybe' ? .7 : .5;

    s.security = plan.security;
    s.admin = plan.admin;
    s.growth = plan.growth;
    if (a.priorities.indexOf('Security') >= 0 && plan.security < C.SECURITY_PRIORITY_MIN) caps.push({ key: 'securityLow', text: 'Security features are lighter than you asked for' });

    var tw = 0, ts = 0;
    Object.keys(w).forEach(function (k) { tw += w[k]; ts += w[k] * s[k]; });
    var fit = (ts / tw) * 100;
    caps.forEach(function (c) { fit = Math.min(fit, C.CAPS[c.key]); });
    fit = Math.round(fit);

    return { plan: plan, name: planName(plan), annual: annual, scores: s, caps: caps, fit: fit, fitLabel: fitLabel(fit), capacityGB: cap };
  }

  /* ---------- reasons ---------- */
  function buildReasons(c, a, cmp) {
    var p = c.plan, s = c.scores, out = [];
    var officeSel = a.apps.filter(function (k) { return OFFICE_APPS.indexOf(k) >= 0; });
    var googleSel = a.apps.filter(function (k) { return GOOGLE_APPS.indexOf(k) >= 0; });

    if (a.desktop === 'yes' && p.desktopOffice) out.push('You need desktop Word, Excel and PowerPoint, and this plan includes the installed apps');
    if (officeSel.length >= 2 && (p.apps[officeSel[0]] || 0) >= .9) out.push('Your team relies on ' + list(officeSel.map(function (k) { return APP_LABELS[k]; })) + ', which are fully supported');
    if (googleSel.length >= 2 && p.provider === 'google') out.push('You already use ' + list(googleSel.map(function (k) { return APP_LABELS[k]; })) + ', which are native to this platform');
    if (a.storageGB != null && c.capacityGB >= a.storageGB * 1.2) out.push('Your ~' + gbText(a.storageGB) + ' of data fits comfortably within the ' + gbText(c.capacityGB) + ' included');
    var strong = a.collab.filter(function (k) { return (p.collab[k] || 0) >= .85; });
    if (strong.length) out.push('Strong support for ' + list(strong.map(function (k) { return COLLAB_LABELS[k]; })));
    if (!p.email.provider && a.emailMove === 'no') out.push('You can keep your existing email provider — no mailbox migration needed');
    else if (p.email.provider && emailProviderOf(a) === p.email.provider) out.push('It matches your current email platform, so mail stays put');
    if (a.priorities.indexOf('Security') >= 0 && p.security >= .75) out.push('Security features meet the priority you set');
    if (a.priorities.indexOf('Simple administration') >= 0 && p.admin >= .8) out.push('Straightforward to administer for a small team');
    if (a.priorities.indexOf('Future growth') >= 0 && p.growth >= .85) out.push('Scales well as your business grows');
    if (cmp && cmp.saving != null) {
      if (cmp.saving > 0) out.push('Estimated to cost ' + money(cmp.saving) + ' less per year than your current setup');
      else if (cmp.saving > -0.15 * (cmp.currentAnnual || 1)) out.push('The estimated cost is similar to your current setup');
    } else if (a.priorities.indexOf('Lowest cost') >= 0 && s.cost >= .75) out.push('It is among the lowest-cost options that fit your needs');
    var fallback = ['It scores well across the answers you gave', 'It covers the applications and sharing methods you selected', 'Pricing is predictable per user, per month'];
    for (var i = 0; out.length < 3 && i < fallback.length; i++) out.push(fallback[i]);
    return out.slice(0, 5);
  }

  /* ---------- main ---------- */
  function evaluate(raw) {
    var a = normalise(raw);
    var w = weights(a);
    var cur = currentProvider(a);
    var pool = PLANS.filter(function (p) { return eligible(p, a); });
    var cheapest = Math.min.apply(null, pool.map(function (p) { return annualFor(p, a); }));
    var ctx = { annualCost: a.annualCost, cheapest: cheapest };

    var all = pool.map(function (p) { return scorePlan(p, a, w, ctx); });

    // current-setup candidate (best plan from the current provider, priced at what the user actually pays)
    var stay = null;
    if (cur) {
      // choose the closest plan using list prices, then re-score it at what the user actually pays
      var mine = pool.filter(function (p) { return isCurrentPlatform(p, a); }).map(function (p) {
        return scorePlan(p, a, w, ctx);
      });
      // prefer the cheapest plan that meets the requirements and is close to the best fit (a realistic "what you're on now")
      var top = mine.slice().sort(function (x, y) { return y.fit - x.fit || x.annual - y.annual; })[0];
      var ok = mine.filter(function (c) { return !c.caps.length && top && c.fit >= top.fit - 8; }).sort(function (x, y) { return x.annual - y.annual; });
      mine = ok.length ? [ok[0]] : (top ? [top] : []);
      stay = mine[0] ? (a.costKnown ? scorePlan(mine[0].plan, a, w, ctx, { annualOverride: a.annualCost }) : mine[0]) : null;
      if (stay) stay.migration = migration(stay.plan, a, true);
    }

    // best plan per platform group (excluding the current provider)
    var best = {};
    all.forEach(function (c) {
      if (isCurrentPlatform(c.plan, a)) return;
      var g = c.plan.group;
      if (!best[g] || c.fit > best[g].fit || (c.fit === best[g].fit && c.annual < best[g].annual)) best[g] = c;
    });
    var alts = Object.keys(best).map(function (k) { return best[k]; });
    alts.sort(function (x, y) { return y.fit - x.fit || x.annual - y.annual; });
    alts.forEach(function (c) { c.migration = migration(c.plan, a, false); });

    var topAlt = alts[0] || null;
    var currentAnnual = a.annualCost != null ? a.annualCost : (stay ? stay.annual : null);
    var refCost = a.annualCost != null ? a.annualCost : (stay ? stay.annual : null);
    function savingOf(c) { return refCost != null ? refCost - c.annual : null; }

    // decision
    var rec, isStay = false, stayReason = null;
    if (!stay) rec = topAlt;
    else if (!topAlt) { rec = stay; isStay = true; }
    else {
      var gain = topAlt.fit - stay.fit, saving = savingOf(topAlt), lvl = topAlt.migration.level;
      var needGain = C.STAY.requiredFitGain[lvl];
      var sv = C.STAY.requiredSaving[lvl];
      var needSaving = refCost != null ? Math.max(sv[0], sv[1] * refCost) : Infinity;
      var worthwhile = gain >= needGain || (saving != null && saving >= needSaving && gain >= C.STAY.fitTolerance);
      if (stay.fit >= C.STAY.acceptableFit && !worthwhile) { rec = stay; isStay = true; }
      else if (stay.fit < C.STAY.acceptableFit && stay.fit >= topAlt.fit) { rec = stay; isStay = true; }
      else rec = topAlt;
      stayReason = { gain: gain, saving: saving, needGain: needGain, needSaving: needSaving, level: lvl };
    }

    var recSaving = isStay ? 0 : savingOf(rec);
    var cmp = { saving: recSaving, currentAnnual: currentAnnual };
    var reasons = buildReasons(rec, a, isStay ? null : cmp);
    var mig = rec.migration || migration(rec.plan, a, isStay);

    // table rows
    var rows = [];
    if (stay) rows.push({ label: 'Current setup', sub: a.costKnown ? PROVIDER_LABELS[cur] : PROVIDER_LABELS[cur] + ' (' + stay.plan.plan + ', est.)', annual: a.costKnown ? a.annualCost : stay.annual, estimated: !a.costKnown, diff: 0, isCurrent: true, fit: stay.fit, fitLabel: stay.fitLabel, rec: isStay });
    alts.forEach(function (c) {
      rows.push({ label: c.plan.platform, sub: c.plan.plan, annual: c.annual, diff: a.annualCost != null ? c.annual - a.annualCost : (stay ? c.annual - stay.annual : null), diffEstimated: a.annualCost == null, fit: c.fit, fitLabel: c.fitLabel, rec: !isStay && c === rec, migration: c.migration.level });
    });

    var result = {
      answers: a,
      current: {
        known: a.costKnown, providerLabel: cur ? PROVIDER_LABELS[cur] : 'Not sure',
        annual: a.annualCost, monthly: a.annualCost != null ? a.annualCost / 12 : null,
        perUser: a.annualCost != null ? a.annualCost / a.users : null
      },
      isStay: isStay,
      recommended: rec,
      title: isStay ? 'Stay with your current setup' : rec.name,
      subtitle: isStay ? 'Best fit for your requirements: your current platform' : 'Best fit for your requirements',
      recommendedPlanName: rec.name,
      fitScore: rec.fit, fitLabel: rec.fitLabel,
      saving: recSaving,
      annual: rec.annual,
      migration: mig,
      reasons: reasons,
      rows: rows,
      stayDecision: stayReason,
      topAlternative: topAlt,
      stayCandidate: stay,
      caveats: rec.caps.map(function (c) { return c.text; })
    };
    result.explanation = explain(result);
    return result;
  }

  /* ---------- plain-English explanation (deterministic) ---------- */
  function explain(r) {
    var a = r.answers, rec = r.recommended, out = [];
    var users = a.users + (a.users === 1 ? ' user' : ' users');
    if (r.isStay) {
      var alt = r.topAlternative, d = r.stayDecision;
      out.push('Based on the information provided, we don’t think changing platforms would provide enough benefit to justify the migration effort.');
      if (alt && d) {
        var bit = 'The closest alternative, ' + alt.name + ', would be a ' + alt.migration.level.toLowerCase() + '-complexity move';
        if (d.saving != null) bit += d.saving > 0 ? ' saving about ' + money(d.saving) + ' a year' : ' costing about ' + money(-d.saving) + ' more a year';
        bit += ' and scores ' + alt.fit + '% for fit against ' + rec.fit + '% for staying put.';
        out.push(bit);
      }
      if (a.costKnown) out.push('You currently pay about ' + money(a.annualCost) + ' a year for ' + users + '. It is still worth reviewing your licences each renewal to make sure nobody is paying for features they don’t use.');
      if (rec.plan.plan) out.push('If you do want to tune your plan, ' + rec.name + ' looks like the closest match to what you described.');
    } else {
      out.push('For ' + users + ', ' + rec.name + ' is the best fit we can find, with an estimated Fit Score of ' + rec.fit + '% (' + rec.fitLabel.toLowerCase() + ').');
      if (r.saving != null && a.costKnown) {
        if (r.saving > 0) out.push('It is estimated to cost about ' + money(rec.annual) + ' a year, roughly ' + money(r.saving) + ' less than your current ' + money(a.annualCost) + '.');
        else if (r.saving < 0) out.push('It is estimated to cost about ' + money(rec.annual) + ' a year, roughly ' + money(-r.saving) + ' more than your current ' + money(a.annualCost) + ' — the extra cost buys a closer match to your requirements rather than a saving.');
        else out.push('It is estimated to cost about the same as you pay today.');
      } else out.push('It is estimated to cost about ' + money(rec.annual) + ' a year for ' + users + '.');
      out.push('We expect the migration to be ' + r.migration.level.toLowerCase() + ' complexity.' + (r.migration.level !== 'Low' ? ' Plan the email and file moves carefully and test with a pilot user first.' : ''));
    }
    return out;
  }

  var api = { evaluate: evaluate, normalise: normalise, money: money, gbText: gbText, APP_LABELS: APP_LABELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CloudAdvisorEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
