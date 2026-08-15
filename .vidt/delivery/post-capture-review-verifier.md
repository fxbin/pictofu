# Post-capture review / selective retake — Verifier

Issue: #22
Mode: `soft_orchestration_only`

## Scope verified

- Session capture data is modeled as stable ordered slots rather than an append-only photo list.
- A completed capture session exposes a dedicated Review area.
- Selecting one captured slot runs the existing countdown and replaces only that slot.
- The previous slot remains in state until a replacement frame is successfully captured.
- Retake failure returns to Review and keeps the previous capture.
- `Retake all` remains available as a separate destructive reset path.
- Export consumes the ordered slots required by the selected layout.
- Replaced Object URLs are removed from the tracked URL list and revoked after state replacement is scheduled.
- `retake_single` analytics includes only scalar slot/count metadata; no Blob, Object URL, base64 or image payload is emitted.
- Gallery upload, crop/pan/zoom, rotate/mirror, overcapture and per-photo filters remain outside this PR.

## Automated evidence

Initial CI run `31881286872` failed at lint because React's immutability rule rejected a mutable `for` loop counter. The implementation was remediated instead of weakening ESLint.

Remediation commit: `1f549c64cbca14a126e914e94a0b8a74eb1935d4`.

CI run `31881387722` on that code head:
- install: pass
- lint: pass
- typecheck: pass
- production build: pass
- runtime: Node 24

## Residual validation gate

Automated verification cannot prove physical-camera UX. After merge/deployment, real-device smoke must confirm on iOS and Android:

1. Capture a complete set.
2. Select a middle slot (prefer photo 2 or 3).
3. Retake that slot.
4. Confirm only that visual frame changes and all other frames remain intact.
5. Confirm final PNG download and native share still work.

## Verdict

**PASS_WITH_WATCH** — code and automated gates pass; mergeable pending final-head CI after this evidence commit. Physical iOS/Android selective-retake smoke remains a release acceptance check.
