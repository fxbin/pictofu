# PicTofu v0.1 Release Evidence Matrix

Status: **HOLD until required production/browser evidence is complete**.

| Plane | Required | Current evidence | Result |
|---|---:|---|---|
| Code | yes | Issues #1/#2/#3/#4 merged; Issue #5 launch-readiness implementation passed install/lint/typecheck/build on GitHub Actions run `31877128348`; final documentation head still requires fresh CI before merge | pass-with-final-CI-pending |
| Vercel control plane | yes | Team `fxbin` resolved; no canonical PicTofu Vercel project exists in current project list | hold |
| Domain control plane | yes | `pictofu.com` is owned by the user, but no verified Vercel-domain binding/read-back exists yet | hold |
| Analytics control plane | conditional | Provider bridge is configuration-gated; no production measurement ID / activation read-back exists | disabled-safe / hold if required at launch |
| Search Console control plane | yes for SEO experiment | No connected Search Console action is available in this runtime; operator handoff recorded | operator handoff required |
| Desktop camera data plane | yes | Issue #2 implementation/CI passed; physical browser smoke not yet provided | hold |
| Mobile camera data plane | yes | Issue #2 implementation/CI passed; iOS Safari or Android Chrome smoke not yet provided | hold |
| Mobile download/share data plane | yes | Issue #3 implementation/CI passed; real device share/download smoke not yet provided | hold |
| Public-page HTTP/data plane | yes | Requires deployed production URL and live fetch of home + representative SEO routes | hold |

## Vercel preflight

Canonical team:
- name: `XiaoYi`
- slug: `fxbin`
- id: `team_aa9uWwkGEP2RqX6gXCD7wMe1`

Resolved projects at preflight:
- `ahaframe`
- `sunny-review-ai`
- `sunny-review-ai-production-secure-deploy`

No `pictofu` project was present, so the production-bound protocol blocks use of the ambiguous no-argument deploy action.

## Code-plane verifier

The launch-readiness verifier confirmed:
- analytics enablement is opt-in and measurement-ID validated;
- event properties are scalar/allow-listed and exclude captured image content;
- initial landing events can reach the GA queue;
- immediate landing-click/camera-start `start_booth` duplication is suppressed without suppressing later booth starts for the whole tab;
- Canvas export failure normalizes to `export_error` at the emitted event boundary;
- Web Vitals reporting contains scalar metric metadata only;
- security headers preserve self-camera access;
- the production build still compiles SEO metadata/sitemap/robots routes.

Verifier record: `.vidt/delivery/launch-readiness-verifier.md`.

## Release decision rule

Return `ship` only after:

1. Fresh CI passes for the final merged/shipped commit.
2. Canonical PicTofu Vercel project exists and the expected deployment is read back as active.
3. `pictofu.com` points to the intended production deployment and representative public routes return successfully.
4. Issue #2 physical camera gates are satisfied.
5. Issue #3 mobile export/share gates are satisfied.
6. Search Console setup/sitemap submission is completed or explicitly accepted as a post-ship non-blocker by the human owner.
7. If analytics is enabled, provider activation is verified and test events contain no photo/blob/base64 payloads.

Until then, the release verdict remains **HOLD** even if repository CI is green.
