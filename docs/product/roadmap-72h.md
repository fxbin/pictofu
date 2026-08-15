# 72-Hour MVP Roadmap

## Goal frame

### Success evidence
- Responsive PicTofu landing is implemented in the approved visual direction.
- Core booth flow reaches real camera capture and in-browser export.
- Required analytics events have a stable contract and can be wired without rewriting product logic.
- First SEO routes are technically indexable and map to real presets.
- CI can install, lint, typecheck and build the project.

### Stop condition
At the end of the launch slice, stop feature expansion and move to measurement once the funnel can produce an exported strip on supported browsers and the site is deployable.

### Non-goals
Accounts, cloud persistence, AI, payment, native apps, advanced editor, creator marketplace.

## H0–H8 — Foundation

- Repository context: `AGENTS.md`, engineering constraints, PRD, analytics and SEO contracts.
- Next.js / TypeScript application foundation.
- Responsive design tokens and home page matching approved desktop/mobile directions.
- Booth route shell and permission/error states.
- CI workflow.

Exit gate: build/lint/typecheck evidence or explicit hold if CI is unavailable.

## H8–H24 — Capture vertical slice

- `getUserMedia` camera lifecycle.
- Front camera default; camera flip when available.
- 3-2-1 countdown.
- Four-shot session state.
- Restart/retake behavior.
- Mobile safe-area and dynamic viewport behavior.

Exit gate: real-browser evidence on desktop plus at least one mobile browser before production-ready claim.

## H24–H40 — Compose/export vertical slice

- Canvas strip compositor.
- 1×4 default layout plus 1×3 / 2×2 / Polaroid presets.
- Original / B&W / Warm / Vintage / Y2K visual filters.
- Frame themes.
- PNG export.
- Web Share API with download fallback.

Exit gate: exported image dimensions/quality checked and no server photo upload occurs.

## H40–H56 — Search + template vertical slice

First routes:

- `/online-photobooth`
- `/photo-strip-maker`
- `/korean-photobooth`
- `/y2k-photobooth`
- `/vintage-photobooth`
- `/couple-photobooth`
- `/best-friend-photobooth`
- `/graduation-photobooth`

Each route must:
- contain unique useful copy
- provide canonical metadata
- internally link to related experiences
- configure actual booth defaults

Exit gate: no thin route whose only difference is keyword substitution.

## H56–H72 — Launch hardening

- sitemap / robots / metadata review
- analytics provider wiring
- Core Web Vitals quick pass
- permission/error UX review
- mobile browser smoke test
- production deployment/domain binding
- Search Console submission

Exit gate: release gate returns `ship`, `hold`, or explicit remediation list.

## Post-launch: 7 / 14 / 30 day gates

### Day 7
- pages indexed?
- crawler/rendering errors?
- funnel instrumentation alive?

### Day 14
- organic impressions appearing?
- which routes/queries receive impressions?
- Start Booth rate by landing page?

### Day 30
Continue only if at least one of these is true:
- non-brand organic impressions show clear growth
- a template/social loop produces repeatable referral traffic
- user completion/share data indicates strong product pull

Otherwise reduce scope, pivot keyword/template strategy, or stop the experiment.
