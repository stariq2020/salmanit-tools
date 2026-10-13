# What's Wrong With My PC? (Windows Troubleshooter)

Static, client-side tool for salmanittools.co.uk. No build step, no dependencies, no backend required.

## Layout
| File | Role |
|---|---|
| `kb-core.js` | Registry, commands library, error-code library, safety messages, shared steps |
| `kb-performance.js` `kb-network.js` `kb-windows.js` `kb-av-devices.js` `kb-m365-hardware.js` | The 32 troubleshooting flows (content only) |
| `kb-meta.js` | Quick cards, flow hierarchy, SEO landing-page copy |
| `engine.js` | Classifier, decision-tree state machine, report builder, PDF writer (pure functions, runs in Node and browsers) |
| `app.js`, `wt.css`, `nav.js` | UI (DOM built with `textContent`, never HTML strings) |
| `build-pages.js` | Generates `windows-troubleshooter.html` and the 4 issue pages from the KB |
| `tests/` | `node:test` suite (no packages) |
| `../netlify/functions/wt-ai.js` | Optional AI helper, disabled by default |
| `../netlify.toml` | Functions dir + security headers for these pages only |

## Commands
```bash
node --test windows-troubleshooter/tests/*.test.js   # run tests
node windows-troubleshooter/build-pages.js           # regenerate HTML after editing kb-*.js or templates
python -m http.server 8123                           # preview, then open /windows-troubleshooter.html
```

## Adding or changing a guide
Add an object to the relevant `kb-*.js` (see any existing flow). Required: `id`, `title`, `cat`, `keywords`, `questions`, `branches` (last branch is the default), `steps`, `escalation`. Reuse steps from other flows by id. Run the tests: `validateKB` and the path-walk test fail on dead ends, unknown step ids, missing fields and unsafe commands. Markup in strings: `**bold**`, `` `code` ``, `{{Key}}`.

## Deploying on Netlify
Push to the connected repo. Publish directory is the repo root (already set in `netlify.toml`). Nothing else is needed for the core tool.

### Optional AI helper
Off unless both variables are set in Netlify > Site settings > Environment variables:
```
WT_AI_ENABLED=true
ANTHROPIC_API_KEY=<your key>          # server-side only
WT_AI_MODEL=claude-haiku-5-5          # optional
WT_ALLOWED_ORIGIN=https://salmanittools.co.uk   # optional origin lock
```
When enabled, a consent checkbox appears; text is sent only if it is ticked. The function returns only guide ids from an allow-list; all instructions still come from the reviewed KB. Rate limiting is in-memory per function instance (best effort): use a shared store or Netlify rate-limiting rules for strict limits. This is a paid third-party service; the tool is fully functional without it.

## Known limitations
- Classification is keyword/phrase scoring with typo correction; very unusual wording falls back to "pick a category".
- Error-code library is deliberately small (31 well-documented codes).
- Dark theme only (matches the rest of the site).
- Issue pages are generated HTML; the error-code and browse lists are rendered by JavaScript.
- No browser end-to-end suite is committed (Playwright is not a dependency of this repo); journeys are covered at engine level and were checked manually in a browser.
- Microsoft links were verified on 2026-10-13; re-check periodically.
