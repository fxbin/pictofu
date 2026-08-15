# PicTofu Dev Acceptance Sweep — 2026-08-15

## Purpose

This file is a release-evidence checkpoint for the `dev` integration branch. It records automated/static verification that has actually been observed and separates it from owner-only browser/hardware gates.

## Integrated fixes verified before this checkpoint

- Privacy summary card padding specificity fixed (#35 / PR #38).
- About page made discoverable through shared footer and sitemap (#37 / PR #39).
- About/Privacy duplicate brand suffixes removed from browser titles (#40 / PR #42).
- Open Graph dynamic emoji-font build warning removed (#41 / PR #43).
- CI uses same-PR concurrency cancellation, Node 24, `npm ci`, npm cache, lint, typecheck and production build (#34 / PR #29 + #44).
- GA4 moved behind explicit `unknown / granted / denied` analytics consent; fresh Preview HTML contains no Google tag before consent (#31 / PR #46).
- Pre-camera `/layouts` chooser integrated with eight presets including one-shot Polaroid, correct singular/plural shot labels, stable preset URLs, footer/sitemap discovery and page-specific OG metadata (#20 / PR #50; findings #47/#48/#49/#51).
- Home decorative Booth preview now represents real Camera/Retake capabilities rather than unsupported Flash/Stickers (#52 / PR #53).
- SEO preset cards use human-readable geometry labels (`1 × 4 strip`, `1 × 3 strip`, `2 × 2 grid`, `Polaroid`) instead of internal layout-ID formatting (#54 / PR #56).

## Automated/static evidence already observed

- GitHub final dev Push CI #99 for SHA `00f14e34ff1c80d84420df67cc228feafad309ab`: completed successfully.
- Full CI gate remains `npm ci` → lint → typecheck → production build on Node 24.
- Vercel Preview responses use `x-robots-tag: noindex`.
- Representative Home, About, Privacy, Layouts and SEO route Previews returned HTTP 200 during the sweep.
- Representative SEO Preview retained unique title/canonical/OG URL, preset CTA, visible FAQ and matching FAQ JSON-LD.
- `/booth` source metadata is `index: false, follow: true`; sitemap intentionally excludes Booth.
- Sitemap source includes Home, Layouts, About, Privacy and all eight SEO intent routes.
- Vercel Preview error/fatal runtime-log query returned no errors during the sweep.
- Vercel build log after the OG fix no longer emitted the previous dynamic-font warning.
- Android/iOS download and share real-device evidence predates this sweep; no export/share implementation was changed by these acceptance fixes.

## Freshness finding

At the end of the sweep, the stable `dev` Vercel alias was still serving the preceding dev deployment at SHA `faeb544a407f8e219827f55f24def1cbca5aa912`, even though GitHub `dev` had advanced to `00f14e34...`. The stale alias still showed the old `grid × 4` SEO label. Issue #57 tracks forcing a fresh real tree change through the normal PR/CI path, then using the resulting READY dev Preview as the authoritative final route/runtime gate.

## Owner-only gates — do not auto-mark passed

- Camera permission/front-camera/flip on representative real devices (#2).
- Selective single-slot retake on a real device, preserving untouched slots (#22).
- Low-memory Canvas/export behavior (#3).
- GA4 consent interactions in a real browser: Allow → Realtime/page_view; No thanks + reload → no GA; allow then revoke → denied/no-tag lifecycle (#31).
- Final 375 / 390 / 430 responsive visual smoke, especially consent UI + Booth controls.
- Public monitored privacy contact decision (#19).
- Search Console/indexing evidence is a production SEO gate, not implied by sitemap existence.

## Release state at checkpoint

Automated code/static acceptance is close to PASS. Overall release acceptance remains HOLD until the fresh `dev` Vercel deployment is verified and the owner-only gates above are either evidenced or explicitly accepted as release watches.
