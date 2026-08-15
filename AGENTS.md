# AGENTS.md

## Product

PicTofu is a mobile-first, privacy-first web photobooth. The MVP must make the path from landing page to a downloadable photo strip feel immediate.

Core promise: **No install. Open. Pose. Download.**

## Current objective

Ship the smallest production-capable MVP for `pictofu.com` and validate the funnel:

`organic/landing view → start booth → camera granted → capture complete → edit → export → share`

North-star for the first experiment: **completed photo strips / day**.

## Stack

- Next.js App Router
- TypeScript
- React
- Plain CSS for the first slice; do not add a component framework without evidence it reduces delivery risk
- Browser-native `MediaDevices`, Canvas and Web Share APIs
- Client-side image processing by default

## Product constraints

- Mobile-first; desktop remains first-class and SEO-friendly.
- No login, account, cloud photo library, AI image processing, payment, or backend photo persistence in v0.1.
- Photos must stay on-device in the MVP unless a later spec explicitly changes this.
- Camera flow must be usable on current iOS Safari and Android Chrome.
- SEO landing pages must expose indexable server-rendered copy and internal links.
- A template page must change the actual default booth experience, not only the page title.

## UX constraints

- Primary mobile interaction targets: at least 44px.
- Use dynamic viewport units and safe-area insets for mobile camera UI.
- Do not require hover to discover essential controls.
- Prefer portrait mobile capture; landscape must not break.
- Camera-denied and camera-unavailable states need useful recovery paths.

## Engineering constraints

Read `.vidt/harness/engineering-constraints.md` before code-facing changes.

## Verification commands

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

When camera behavior changes, add manual verification notes for:

- iOS Safari
- Android Chrome
- Desktop Chrome/Safari

## Git workflow

- `main` is releasable.
- Use `feature/*` and `fix/*` branches.
- Prefer focused semantic commits.
- Use pull requests for user-visible changes.
- Do not force-push or use destructive reset/clean operations as part of automated work.

## Definition of done

A slice is not accepted only because code exists. It needs objective evidence for its declared acceptance gates. If runtime/browser evidence is unavailable, report `hold` or `pass_with_watch`; never invent validation.
