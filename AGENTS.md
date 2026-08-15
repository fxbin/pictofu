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

Until a lockfile is committed, use:

```bash
npm install --no-audit --no-fund
npm run lint
npm run typecheck
npm run build
```

Once `package-lock.json` is present and maintained, CI/local verification should switch dependency installation to `npm ci`.

When camera behavior changes, add manual verification notes for:

- iOS Safari
- Android Chrome
- Desktop Chrome/Safari

## Git workflow

### Branch roles

- `main` is production-only and must remain releasable. Vercel production tracks `main`.
- `dev` is the integration and owner-acceptance branch for normal feature development.
- Create `feature/*`, `fix/*`, and `chore/*` branches from the latest `dev` unless the task is explicitly classified as an urgent production hotfix.

### Normal delivery path

1. GitHub Issue / WorkOrder.
2. Branch from latest `dev`.
3. Worker implementation.
4. Independent Verifier + Node 24 CI.
5. PR into `dev`.
6. Owner validates locally and/or on a Vercel Preview, including real-device smoke where browser hardware behavior matters.
7. Accepted changes are promoted through a dedicated release PR `dev → main`.
8. Production smoke follows the `main` deployment.

Do not merge ordinary features, experiments, SEO changes, or UI work directly into `main`.

### Hotfix exception

An urgent production repair may use `fix/* → main` only when the task is explicitly classified as a production hotfix. After the hotfix is verified and merged, reconcile the fix back into `dev` before continuing normal development.

### General rules

- Prefer focused semantic commits.
- Use pull requests for user-visible changes.
- Do not force-push or use destructive reset/clean operations as part of automated work.
- Development slices should be tied to a GitHub Issue and close through PR evidence.
- Never treat CI success alone as proof of camera, Canvas, download/share, or embedded-browser behavior when real-device verification is required.

## Definition of done

A slice is not accepted only because code exists. It needs objective evidence for its declared acceptance gates. If runtime/browser evidence is unavailable, report `hold` or `pass_with_watch`; never invent validation.
