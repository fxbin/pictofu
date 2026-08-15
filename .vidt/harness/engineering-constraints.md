# PicTofu Engineering Constraints

Status: active for MVP v0.1

## Objective

Protect the fastest path to a measurable, mobile-first photobooth MVP without accumulating infrastructure that the first experiment does not need.

## Hard constraints

1. **Client-side photos by default** — camera frames, filters, composition and export remain in the browser for v0.1.
2. **No account system** — no auth, user profile, cloud gallery or saved-history service.
3. **No AI dependency** — the core booth must have zero inference dependency and zero per-photo AI cost.
4. **No hidden backend coupling** — adding storage, database, server actions that persist photos, queues or image workers requires a new approved WorkOrder.
5. **Mobile-first camera** — use `navigator.mediaDevices.getUserMedia`; prefer `facingMode: user`; provide a flip path when multiple cameras exist.
6. **Safe viewport** — camera screens use dynamic viewport units and safe-area padding where relevant.
7. **Privacy** — do not transmit captured image bytes to analytics or third parties.
8. **SEO content is renderable** — search landing copy, titles, canonical metadata and primary internal links must not depend on camera permission or client-only rendering.
9. **Template truth** — SEO template routes must configure real booth defaults; no thin pages produced only by swapping keywords.
10. **Accessibility baseline** — semantic buttons/links, visible focus, alt text for meaningful images, and no essential interaction smaller than 44px on mobile.
11. **No premature frameworks** — avoid state libraries, design-system packages, databases and image SDKs unless the current slice proves a need.
12. **No destructive Git automation** — no force push, hard reset, or clean operations.

## Supported baseline

- Node.js >= 20.9 (Next.js requirement)
- Next.js Active LTS line
- React 19.x
- Modern evergreen browsers, with explicit product attention to iOS Safari and Android Chrome

## Verification gates

Every user-visible PR must, when the environment permits, show evidence for:

- dependency install
- lint
- typecheck
- production build
- responsive layout at 375/390/430px widths
- desktop layout around 1440px
- camera permission denied state

Camera capture/export changes additionally require real-browser manual evidence before a production-ready claim.

## Change-control triggers

Stop and request a route update before introducing:

- server-side photo persistence
- user identity/accounts
- payment
- AI processing
- external photo transformation/CDN pipelines
- schema/database ownership
- multiple competing state owners for the same booth session

## Non-goals for v0.1

- social network
- cloud photo album
- native mobile app
- AI retouching
- collaborative sessions
- creator marketplace
- subscription billing
