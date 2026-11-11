# SignalForge V1 (release candidate)

SignalForge turns public market signals into evidence-backed content recommendations. It normalizes and deduplicates sources, scores evidence, preserves counterevidence, isolates provider failures, enforces budgets, and writes traceable JSON and Markdown reports. It was developed by Notrix Data & Automation.

## Architecture

`providers` collect public data; deterministic core modules normalize, deduplicate, score, and rank it; the report layer emits up to three recommendations. LLM use is not required in V1. Fixture mode is fully offline.

## Prerequisites and installation

- Node.js 20 or newer
- npm (bundled with Node)

```bash
npm install
npm run demo
```

No runtime packages are currently required. `npm install` only creates the lockfile. Video tooling and the Notrix Video Engine are not dependencies.

## Quick start

```bash
node src/cli.js run --config config/demo.json
```

Reports appear under `examples/generated/`. The included data is synthetic and safe for demos.

## Configuration

JSON configuration supports niche, audiences, geography, research/content languages, topics, keywords, competitors/reference creators, enabled providers, request/credit/token budgets, cache expiration, bounded pagination, HTTP retry/timeout/rate interval, evidence thresholds, and output directory. Copy `config/demo.json`; paths are resolved relative to the config file.

## API keys and providers

Fixture mode needs no credentials and costs nothing. ScrapeCreators is optional and uses `SCRAPECREATORS_API_KEY` from the process environment. Never commit `.env`. Its API may consume paid credits; configure `maxRequests`, `maxCredits`, `creditsPerRequest`, and `maxPagesPerQuery` according to your account. No unverified price is stated here.

Historical Notrix runs (not included) indicate: Reddit and YouTube worked reliably; LinkedIn, Facebook, and TikTok had partial public coverage; Instagram failed; Threads was untested. These are historical observations, not a current service guarantee. Each live provider must be reverified by the operator. Provider failures are disclosed and do not stop other enabled providers.

## How recommendations work

Evidence scores rank source proximity, problem specificity, configured commercial relevance, independent corroboration, and geographic relevance. Scores do not prove prevalence. Vendor claims are marked separately. Recommendations require configurable evidence and independent-source thresholds and preserve sources, uncertainty, and counterevidence. If evidence is weak, fewer than three recommendations are returned.

## Commands

```bash
npm run demo
npm test
npm run check:release
npm run validate
node src/cli.js validate-config --config config/demo.json
```

## Known limitations

- Public discovery is incomplete and platform-dependent.
- ScrapeCreators field shapes may change; live endpoints were not called for this release preparation.
- V1 uses deterministic templates, not semantic clustering; configure topics carefully.
- Public evidence must not be interpreted as representative market prevalence.

## Privacy and security

Collect public data only. Do not bypass authentication, CAPTCHAs, access controls, or platform protections. Do not add private profiles, DMs, contact lists, customer data, cookies, research exports, or credentials. The release scanner reports affected paths and risk categories without printing matched values. See `SECURITY.md`.

## Troubleshooting

- Missing key: export `SCRAPECREATORS_API_KEY` or disable that provider.
- Zero recommendations: lower thresholds only after reviewing evidence quality, or collect more independent sources.
- Partial coverage: inspect the report's coverage section; successful providers still complete.
- Budget error: reduce keywords/pages or explicitly raise the corresponding limit.

## Roadmap

Reverify live provider adapters, add authorized official APIs, improve deterministic topic clustering, and add an optional economical LLM synthesis adapter with strict token budgets.
