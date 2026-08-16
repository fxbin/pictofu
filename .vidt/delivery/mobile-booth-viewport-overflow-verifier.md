# Mobile booth viewport overflow verifier — Issue #124

Status: **PASS_WITH_WATCH**

Runtime: `soft_orchestration_only`; this is a separate verification lens, not a claim of an independently running subagent.

## Scope reviewed

- `/booth` capture workspace width containment
- mobile camera surface dynamic-height sizing
- five-column shutter tray shrink behavior
- safe-area preservation
- desktop behavior isolation
- no camera / Canvas / storage / analytics logic changes

## Root cause

The existing mobile rules kept the camera surface at a `64dvh` minimum in `booth-shell.css`, then `camera.css` overrode it with a later `67dvh` minimum. Header, camera status, shutter tray, capture status/action, margins, padding, and safe-area insets were stacked around that surface. On a mobile dynamic viewport, the core capture UI could therefore require substantially more than one visible viewport.

The shell also lacked a consistent shrink contract (`min-width: 0` / `max-width: 100%`) across several grid/card descendants, leaving narrow screens vulnerable to intrinsic-width overflow.

## Fix reviewed

- last-loaded `mobile-viewport.css` overrides the older oversized mobile camera minimum
- camera height now uses `100dvh` minus surrounding capture chrome and safe-area insets
- camera height is bounded with `clamp(...)` so tall phones do not create an unnecessarily huge preview
- booth/header/workspace/cards/camera/tray/status are explicitly shrink-safe
- live header status truncates rather than widening the grid
- shutter tray tracks use `minmax(0, ...)` so labels cannot force horizontal page expansion
- short-height landscape receives an explicit smaller preview bound

## Width reasoning

At the narrowest declared 320px CSS viewport:
- booth page side padding leaves approximately 300px content width
- camera-card mobile padding leaves approximately 286px inner width
- shutter tray width leaves approximately 268px total width
- after tray padding/gaps, five tracks still have enough room for the four side controls and center shutter while staying inside the card

375 / 390 / 430px widths have progressively more headroom. The final page-level `max-width: 100vw` plus shrink-safe descendants prevents intrinsic content from expanding the document width.

## Guardrails checked

- no `getUserMedia` changes
- no facing-mode changes
- no countdown/capture state changes
- no captured photo or PNG handling changes
- no analytics changes
- no backend/storage changes
- no new framework/package
- horizontal containment is not the only fix; the underlying grid sizing and camera height were corrected

## Remaining real-device gates

1. iOS Safari: open booth → grant camera → verify preview/tray/status remain inside usable viewport width and essential controls are reachable.
2. Android Chrome: same flow.
3. Spot-check 375 / 390 / 430px portrait and a short landscape viewport.
4. Confirm 1440px desktop remains unchanged.

## Verdict

Suitable for merge into `dev` after final Node 24 CI is green. Do not promote to Production until real-device mobile smoke confirms the reported overflow is gone.
