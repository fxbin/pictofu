# PicToFu v0.2 Review / Adjust — Verifier

Issues: #64, #65
PR: #66
Mode: `soft_orchestration_only`

## Scope verified

- Post-capture Review no longer overloads thumbnail selection as an immediate retake action.
- Each captured slot can be selected independently for non-destructive framing adjustment.
- Per-slot framing uses normalized `PhotoCrop { x, y, zoom }` metadata.
- Horizontal and vertical pan are bounded to `[-1, 1]`; zoom is bounded to `[1, 2.5]`.
- Users can adjust with touch/mouse drag and with explicit horizontal / vertical / zoom range controls.
- Reset changes only the active slot back to centered `1x` framing.
- Single-slot Retake remains a separate action. A successful retake replaces only that slot and resets only that slot's crop metadata; every other captured slot remains unchanged.
- Retake failure preserves the previous slot.
- Layout changes preserve normalized crop metadata deterministically; the compositor re-resolves the normalized crop against the selected layout geometry.
- Final PNG export passes ordered per-slot crop metadata into the Canvas compositor.
- The compositor clamps the source crop inside the image, so framing controls cannot reveal an empty Canvas area.
- The result-strip and Review surfaces expose the active framing state for immediate visual feedback.
- No gallery upload, server-side photo processing, AI beauty, account system, cloud gallery or photo/blob/base64 analytics were added.

## Automated evidence

Foundation CI run `31897291586` passed before the Review UI work.

Final integrated code head before this evidence-only commit: `c2878b8eee63d0ff7ab255615742bd5331b2cc83`.

CI run `31898583252` (Node 24):
- dependency install: pass
- lint: pass
- typecheck: pass
- production build: pass

The v0.2 branch was also synchronized with the latest `dev` encoded-backslash routing hotfix through PR #70. Compare after synchronization: `behind_by = 0`; the dev-side change was isolated to `proxy.ts` and did not modify Booth code.

## Residual acceptance gates

Automated CI cannot prove camera hardware, pointer/touch ergonomics, Canvas visual parity or mobile browser delivery. Before merging #66 to `dev`, owner/device acceptance should cover:

1. iOS Safari: capture → select photo → drag/pan → zoom → Reset → retake one slot → export PNG.
2. Android Chrome: same flow.
3. Confirm untouched slots keep both their original image and crop after another slot is adjusted or retaken.
4. Confirm a retaken slot resets its old framing rather than reusing crop tuned for the previous image.
5. Exercise 1-shot Polaroid, 3-shot strip and 4-shot strip/grid paths.
6. Compare final PNG framing against the Review preview and verify no blank Canvas edge appears at pan/zoom extremes.
7. Recheck Download PNG and native Share on the existing supported mobile paths.
8. Smoke 375 / 390 / 430 widths plus desktop for overflow and >=44px essential actions.

## Verdict

**PASS_WITH_WATCH** — implementation and automated quality gates pass. Keep PR #66 unmerged until real-device acceptance confirms touch/pointer behavior and exported crop parity.