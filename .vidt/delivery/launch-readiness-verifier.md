# Launch Readiness Verifier Checklist

Verifier role: independent release verification lens under `soft_orchestration_only`.

## Gates

- [x] Final PR CI passes install / lint / typecheck / build. Evidence: GitHub Actions run `31877128348`, job `94994423625`, head `2d21566d`.
- [x] GA4 code is disabled unless both analytics enable flag and valid `G-...` ID are present.
- [x] First landing event can enter the provider queue: GA bootstrap is defined before hydration and the forwarding listener is installed before landing emission.
- [x] `start_booth` does not double-count the landing click plus immediate camera enable action; duplicate suppression is limited to a 3-second window.
- [x] Repeated new booth starts later in the same tab remain countable.
- [x] Analytics event properties are allow-listed scalars and contain no photo/blob/base64 payload.
- [x] Canvas export failure is represented as `export_error` at the emitted event boundary.
- [x] Web Vitals contain scalar metric metadata only.
- [x] Security headers allow `camera=(self)` while disabling microphone/geolocation.
- [x] SEO sitemap/robots/canonical baseline still compiles in the production build.
- [x] Vercel project identity is unresolved and therefore production mutation remains blocked.
- [x] Release verdict remains HOLD until real device/browser and provider evidence exists.

## Verification report

- code-plane verdict: `pass`
- production release verdict: `hold`
- confirmed blockers: canonical Vercel PicTofu project/domain proof, real camera/device smoke, mobile download/share smoke, Search Console operator setup
- runtime claim: `soft_orchestration_only`
- false-positive risk: medium for physical-browser behavior because CI cannot exercise camera hardware or native share sheets

## Next state

The repository slice may merge as a release-candidate baseline. Issue #5 must remain open until control-plane and data-plane evidence closes the release gate.
