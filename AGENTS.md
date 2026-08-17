# AGENTS.md

## Product

PicToFu is a mobile-first, privacy-first web photobooth. The core promise remains:

**No install. Open. Pose. Download.**

## Current objective

PicToFu is in **validation-first mode**. The existing product surface is sufficient for the current experiment; do not expand Frames, Filters, Presets, AI, accounts, payments, or cloud-photo persistence until the current P0 validation debt is closed.

Current validation lanes:

- #139 — release boundary + executable state/privacy contracts
- #102 — real-device iOS Safari / Android Chrome Booth acceptance
- #116 / #120 — acquisition + Search Console evidence after the product baseline is stable

North star: **completed photo strips / day**.

Core funnel:

`organic/landing view → start booth → camera granted → capture complete → review/edit → export → share/referral`

## Stack

- Next.js App Router
- TypeScript
- React
- Plain CSS unless evidence justifies another UI dependency
- Browser-native `MediaDevices`, Canvas and Web Share APIs
- Client-side image processing by default

## Product constraints

- Mobile-first; desktop remains first-class and SEO-friendly.
- Photos stay on-device unless a separately approved spec changes the privacy model.
- Camera flow must be usable on current iOS Safari and Android Chrome.
- SEO landing pages must expose indexable server-rendered copy and internal links.
- A template page must change the actual default booth experience, not only the page title.
- Do not add a feature because the implementation is easy; require a stated product hypothesis or observed user pull.

## Brand

- Canonical human-facing product name: **PicToFu**.
- Keep domain, package, repository, filenames, analytics ids, CSS classes, and other technical identifiers lowercase where already defined, for example `pictofu.com` and `pictofu`.
- Do not rewrite historical `.vidt/delivery` or cycle evidence solely to change brand casing.

## UX constraints

- Primary mobile interaction targets: at least 44px.
- Use dynamic viewport units and safe-area insets for mobile camera UI.
- Do not require hover to discover essential controls.
- Prefer portrait mobile capture; landscape must not break.
- Camera-denied and camera-unavailable states need useful recovery paths.
- Default completion should remain simple; advanced customization should not become a mandatory path to export.

## Engineering constraints

Read `.vidt/harness/engineering-constraints.md` before code-facing changes.

### P0 invariants

The following are release-blocking contracts:

1. Template/layout changes must not destroy captured photos or per-photo crop state.
2. Final export order must match the selected photo order.
3. Single-slot retake must replace only that slot; untouched slots stay identical and the replacement starts with fresh framing.
4. Analytics/referral payloads must never contain photo bytes, Blob URLs, base64, camera frames, generated PNG data, or equivalent media payloads.
5. GitHub Actions may verify/build/deploy, but must not mutate application code and push commits to `main`.

Run:

```bash
npm ci --no-audit --no-fund
npm run verify:p0
npm run lint
npm run typecheck
npm run build
```

When camera/share/Canvas behavior changes, manual evidence is still required for:

- iOS Safari
- Android Chrome
- Desktop Chrome/Safari where applicable

CI success never substitutes for real-device evidence.

## Git workflow

### Branch roles

- `main` is production-only and must remain releasable. Vercel production tracks `main`.
- `dev` is the integration and owner-acceptance branch for normal feature development.
- Create `feature/*`, `fix/*`, and `chore/*` branches from the latest `dev` unless the task is explicitly classified as an urgent production hotfix.

### Mandatory branch preflight

Before starting ordinary development:

1. Compare `main` and `dev`.
2. If `main` is ahead and `dev` has no conflicting unique work, fast-forward/reconcile `main → dev` first.
3. Never branch from a stale `dev` that does not contain current Production.
4. If both branches diverged, stop feature work and reconcile explicitly before continuing.

### Normal delivery path

1. GitHub Issue / bounded WorkOrder.
2. Branch from latest `dev`.
3. Worker implementation.
4. Independent verification lens + Node 24 CI.
5. PR into `dev`.
6. Owner validates locally and/or on a Vercel Preview, including real-device smoke where browser hardware behavior matters.
7. Accepted changes are promoted through a dedicated release PR `dev → main`.
8. Production smoke follows the `main` deployment.

Do not merge ordinary features, experiments, SEO changes, or UI work directly into `main`.

### Automation boundary

AI/automation autonomy ends at the integration boundary:

- Workflows must not grant `contents: write` for application-code mutation.
- Workflows must not execute `git push` to write code back into the repository.
- Never create a self-modifying workflow that patches application files, commits them, pushes to `main`, then deletes itself.
- Use normal branches and pull requests so the diff, CI, owner acceptance, and release boundary remain inspectable.

The CI `verify:release-policy` contract enforces these rules for tracked workflow files.

### Hotfix exception

An urgent production repair may use `fix/* → main` only when the task is explicitly classified as a production hotfix. Prefer a PR even for hotfixes. After the hotfix is verified and merged, reconcile `main → dev` before continuing ordinary development.

### CI efficiency

- CI efficiency must never weaken release evidence: P0 contracts, install, lint, typecheck, and production build remain required for the latest PR state.
- Workflow concurrency may cancel superseded runs; never rely on an outdated green run after a newer commit exists.
- Prefer coherent implementation checkpoints instead of many tiny pushes.
- Do not add path-based CI skips merely to save Actions minutes.

## Definition of done

A slice is not accepted only because code exists. It needs objective evidence for its declared acceptance gates.

For browser-hardware work, use `hold` / `pass_with_watch` until real-device evidence exists. Never invent validation.

For product expansion, completion also requires a reason to build: observed user evidence, an explicit experiment hypothesis, or a bounded validation plan. While #139/#102 remain open, stabilization and validation take priority over new feature breadth.
