# PicToFu Weekly Growth Review

## Purpose

Run one evidence-driven growth review per week without turning low-volume directional data into false certainty.

The review exists to answer one product question:

> Should PicToFu CONTINUE, ITERATE, or HOLD the current validation direction?

It is not a vanity analytics report and it is not a reason to resume feature breadth.

## Source of truth

Primary product-behavior source:
- Supabase `public.pictofu_growth_daily`

Supporting sources when available:
- Search Console for impressions / clicks / CTR / queries / landing pages
- Vercel for production health and provider-level traffic context
- GA4 only as optional consent-dependent supporting evidence

Do not create a second raw event warehouse for this review.

## Measurement semantics

`pictofu_growth_daily` contains privacy-minimized aggregate stage reaches.

Important constraints:
- `landing_view` is not unique users.
- funnel stages are browser-session stage reaches with bounded dedupe.
- `landing_view` covers configured product landing routes, not every site route or Guide page.
- old direct-to-Booth sessions can have no acquisition context.
- owner / ChatGPT-assisted testing can contaminate gross traffic.
- retention is consent-dependent and must remain `UNKNOWN` when the cohort is sparse.
- no photo/blob/base64/file-name/free-form payload belongs in growth reporting.

## Review window

Default:
- current 7 complete/available UTC dates
- compare with the preceding 7-day window when volume is sufficient

For launch milestones, also preserve explicit Day 7 / Day 14 snapshots.

## Step 1 — Production health

Record:
- production runtime error clusters
- known blocking regressions
- whether capture/export/share remain operational

If the product is functionally broken, stop growth interpretation and fix the bounded defect first.

## Step 2 — Gross funnel

Read:

`landing_view → start_booth → camera_permission_granted → capture_completed → edit_started → export_completed → download_clicked/share_clicked`

Report counts first. Ratios are directional only at low volume.

North star:
- `completed_photo_strips_per_day = export_completed`

## Step 3 — Acquisition hygiene

Always separate:
- search
- referral
- social
- direct
- explicit UTM campaigns
- `utm_source=chatgpt.com` / owner-assisted or uncertain traffic

Create a clean-acquisition view that excludes known owner/assistant contamination before making channel claims.

Do not infer that every direct session is a real stranger or that every referral is external growth.

## Step 4 — Search signal

Track weekly:
- search-attributed landings
- search → start
- search → capture
- search → export
- timing / acceleration of search landings

When Search Console is available, add:
- impressions
- clicks
- CTR
- average position
- top queries
- landing pages

Decision rule:
- impressions but weak CTR → improve existing title/snippet/content alignment first
- repeated adjacent query pull → consider one bounded new intent page
- no meaningful search evidence → keep URLs stable; do not mass-produce pSEO

## Step 5 — Completion friction

Split capture source:
- camera
- upload
- mixed

Track capture → export directionally for each source.

A zero-export subgroup is a validation risk, not automatically a bug. Open a bounded bug only after reproduction or stronger behavioral evidence.

## Step 6 — Editor/framing watch

Rank bounded `editor_tool_used` reaches.

Pay particular attention to:
- pan
- ratio
- zoom
- rotate
- straighten
- flip

High transform usage has two competing interpretations:
1. users value editing;
2. default framing forces corrective work.

Do not choose between them without evidence. Correlate with known framing defects, real-device reproduction, and downstream export direction.

## Step 7 — Retention

Read `pictofu_retention_cohorts` only as consented browser-cohort evidence.

If cohort counts are sparse, write:

`Retention: UNKNOWN`

Never convert a tiny consented cohort into a product-wide retention percentage.

## Step 8 — Product Gate

Choose exactly one:

### CONTINUE
Use when the current acquisition + product path repeats with improving clean evidence and no dominant completion blocker.

### ITERATE
Use when there is a real positive signal but a bounded friction/gap should be improved before scaling.

### HOLD
Use when the current thesis is not producing meaningful behavior after a sufficient validation window, or a blocker makes further acquisition wasteful.

For every gate, record:
- evidence
- confidence / gaps
- reversal conditions
- next smallest experiment
- explicit non-goals

## Feature-breadth guardrail

Until behavioral pull exists, do not add presets, filters, frames, stickers, accounts, payments, AI, or cloud persistence merely for completeness.

Allowed work:
- bounded bug fixes
- UX simplification
- performance/privacy improvements
- validation instrumentation
- evidence-backed SEO/content improvement
- tracked distribution experiments

## Weekly output template

```text
As-of:
Window:
Decision: CONTINUE | ITERATE | HOLD

Production health:
Gross funnel:
Clean acquisition:
Search:
Social/referral:
Capture source:
Editor/framing:
Retention:

Strongest positive signal:
Biggest risk / unknown:
What would reverse the decision:

Next 1–3 actions:
Non-goals this week:
Related issues:
```

## Current issue routing

- #65 — release train / product gate
- #116 — acquisition validation
- #120 — Search Console evidence baseline
- #289 — production mobile + behavioral evidence backlog
- #30 — Analytics Cockpit, only after its explicit start gate fires
