# Launch Readiness Verifier Checklist

Verifier role: independent release verification lens under `soft_orchestration_only`.

## Gates

- [ ] Final PR CI passes install / lint / typecheck / build.
- [ ] GA4 code is disabled unless both analytics enable flag and valid `G-...` ID are present.
- [ ] First landing event is not lost before the provider bridge subscribes.
- [ ] `start_booth` does not double-count the landing click plus immediate camera enable action.
- [ ] Repeated new booth starts later in the same tab remain countable.
- [ ] Analytics event properties are allow-listed scalars and contain no photo/blob/base64 payload.
- [ ] Canvas export failure is represented as `export_error` at the emitted event boundary.
- [ ] Web Vitals contain scalar metric metadata only.
- [ ] Security headers do not block self camera access.
- [ ] SEO sitemap/robots/canonical baseline still builds.
- [ ] Vercel project identity is unresolved and therefore production mutation remains blocked.
- [ ] Release verdict remains HOLD until real device/browser and provider evidence exists.

## Verdict

Pending fresh CI and final diff review.
