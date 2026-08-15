# PicTofu v0.1 Release Evidence Matrix

Status: **HOLD until required production/browser evidence is complete**.

| Plane | Required | Current evidence | Result |
|---|---:|---|---|
| Code | yes | Issues #1/#2/#3/#4 merged; launch-readiness branch adds analytics/security/metadata hardening; fresh CI required for final candidate | pending |
| Vercel control plane | yes | Team `fxbin` resolved; no canonical PicTofu Vercel project exists in current project list | hold |
| Domain control plane | yes | `pictofu.com` is owned by the user, but no verified Vercel-domain binding/read-back exists yet | hold |
| Analytics control plane | conditional | Provider bridge is configuration-gated; no production measurement ID / activation read-back exists | hold if analytics is required at launch |
| Search Console control plane | yes for SEO experiment | No connected Search Console tool/plugin is available in this runtime | operator handoff required |
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

## Release decision rule

Return `ship` only after:

1. Fresh CI passes for the final shipped commit.
2. Canonical PicTofu Vercel project exists and the expected deployment is read back as active.
3. `pictofu.com` points to the intended production deployment and representative public routes return successfully.
4. Issue #2 physical camera gates are satisfied.
5. Issue #3 mobile export/share gates are satisfied.
6. Search Console setup/sitemap submission is completed or explicitly accepted as a post-ship non-blocker by the human owner.
7. If analytics is enabled, provider activation is verified and test events contain no photo/blob/base64 payloads.

Until then, the release verdict remains **HOLD** even if repository CI is green.
