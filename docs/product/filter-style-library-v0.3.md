# PicToFu v0.3 — Filter Style Library

Status: research/design baseline for #63 and implementation input for #99.

## 1. Product hypothesis

PicToFu does not need a long editor-style filter catalog. v0.3 should test whether a compact set of clearly differentiated, one-tap styles makes the final strip feel more desirable while preserving the fast photobooth loop.

Target: 10–12 high-quality styles, real-photo thumbnails after capture, immediate preview, and preview/export parity.

## 2. Market-inspired taxonomy

The research signal is consistent across current mobile camera/editing products:

- Meitu emphasizes digicam/CCD, flash, film grain/vintage, golden-hour and social aesthetic looks.
- Hypic highlights clean/aesthetic presets, retro film and soft glow.
- Wuta explicitly spans natural original, clear Japanese style, Korean dewy glow and vintage film.
- Dazz centers film-stock-inspired color, compact/CCD profiles, instant formats and one-tap camera looks.
- OldRoll centers film color/hue/grain/texture, instant/disposable and nostalgic camera families.
- ProCCD explicitly combines CCD/digicam, Y2K, instant camera and photobooth aesthetics.

PicToFu should use these broad visual families as inspiration, not copy proprietary filter names, assets, camera simulations or branded film stocks.

Research references:
- https://apps.apple.com/us/app/meitu-photo-editor-ai-art/id416048305
- https://apps.apple.com/us/app/hypic-photo-editor-ai-art/id1644042837
- https://apps.apple.com/us/app/wuta-camera-nice-shot-always/id1061534032
- https://apps.apple.com/us/app/dazz-cam-vintage-camera/id1422471180
- https://apps.apple.com/us/app/oldroll-vintage-film-camera/id1570093460
- https://apps.apple.com/us/app/proccd-digital-film-camera/id1616113199

## 3. PicToFu V1 style set

The recipes below intentionally use browser-native CSS/Canvas filter primitives. They are a lightweight first implementation, not a claim to reproduce film stock or camera science.

| ID | Public name | Intent | Initial shared recipe |
|---|---|---|---|
| `original` | Original | Neutral reference | `none` |
| `bw` | Mono | Crisp monochrome | `grayscale(1) contrast(1.06)` |
| `soft-cream` | Soft Cream | Brighter, softer, restrained saturation | `brightness(1.07) contrast(.93) saturate(.94)` |
| `airy-day` | Airy Day | Clear, light, slightly cool | `brightness(1.08) contrast(.95) saturate(.91) hue-rotate(3deg)` |
| `warm` | Rose Glow | Skin-friendly warm/pink social mood | `sepia(.12) saturate(1.12) brightness(1.04) hue-rotate(-4deg)` |
| `golden-hour` | Golden Hour | Gentle amber warmth | `sepia(.23) saturate(1.12) brightness(1.02) contrast(.98)` |
| `vintage` | Film Fade | Faded warm nostalgia | `sepia(.34) contrast(.90) saturate(.88) brightness(1.01)` |
| `ccd-flash` | CCD Flash | Punchier digital-camera / flash feel | `contrast(1.13) saturate(1.12) brightness(1.04)` |
| `y2k` | Y2K Pop | Saturated playful magenta/blue energy | `saturate(1.34) contrast(1.08) hue-rotate(-14deg)` |
| `cool-mint` | Cool Mint | Restrained cyan/green coolness | `saturate(.92) contrast(.98) brightness(1.02) hue-rotate(11deg)` |
| `peach-candy` | Peach Candy | Bright peach/pink social mood | `saturate(1.18) brightness(1.06) contrast(.96) hue-rotate(-7deg)` |

Backward compatibility: existing preset IDs `original`, `bw`, `warm`, `vintage`, and `y2k` remain valid. Public labels may improve without changing existing preset contracts.

## 4. Architecture decision: one filter registry

Current v0.2 behavior duplicates filter tuning:

- DOM strip preview uses CSS classes.
- Canvas PNG export uses a separate switch in `lib/compositor.ts`.

That creates drift. v0.3 should introduce `lib/filter-styles.ts` as the single source of truth.

The registry owns:

- `FilterId`
- public label
- short description
- browser-compatible filter recipe
- lightweight fallback swatch metadata if needed

Both DOM preview and Canvas export consume the exact same recipe string. `context.filter` supports the same filter-function syntax used by CSS for this initial set, so no second tuning table is required.

### Expected dependency direction

```text
lib/filter-styles.ts
  ├─ lib/presets.ts       (FilterId type)
  ├─ lib/compositor.ts    (export recipe)
  └─ app/booth/...        (picker + live preview recipe)
```

No filter-specific color math should remain duplicated in route CSS after migration.

## 5. Style-mode picker

### After capture

Use a real captured photo as every filter thumbnail:

```text
[Original] [Mono] [Soft Cream] [Airy Day] [Rose Glow] ...
   photo      photo      photo        photo       photo
```

Each thumbnail renders the same source image with that style's shared recipe. This makes filter differences immediately legible and avoids abstract color chips that do not predict skin-tone behavior.

### Before a usable captured photo

Use a lightweight fallback swatch. Do not load remote demo media just for the filter picker.

### Mobile interaction

- horizontal native scroll
- touch target >= 44px
- thumbnail target around 64–72px
- selected state visually strong but not layout-shifting
- no auto-selection based on scroll position; filter changes should be explicit taps
- keep picker inside Style mode, away from Review drag gestures

## 6. Preview/export parity acceptance

For each style:

1. choose style in Style mode
2. compare the visible strip preview with downloaded PNG
3. reject any style whose tone changes materially between DOM and Canvas

Parity is more important than sophisticated color grading in v0.3.

## 7. Skin-tone and visual guardrails

Before Production, test at least light, medium and deep skin tones plus indoor/warm and daylight scenes.

Guardrails:

- avoid large hue rotations
- avoid clipping highlights with excessive brightness/contrast
- avoid orange skin from aggressive sepia
- avoid gray/dead skin from excessive desaturation
- keep `Soft Cream`, `Airy Day`, `Rose Glow`, and `Golden Hour` especially conservative
- `CCD Flash` should feel punchy, not blown out
- `Y2K Pop` may be stylized but should remain recognizably photographic

Approved #16 human assets are the preferred repeatable acceptance set. Owner real-device captures can be used before those assets are approved.

## 8. Explicit exclusions for v0.3

Do not add in this slice:

- AI enhancement
- remote LUT downloads
- film grain/light-leak simulation requiring extra rendering passes
- filter intensity slider
- per-channel curves/HSL editor
- beauty/face retouching
- stickers/text editor
- cloud processing

These can be evidence-led follow-ups. The current hypothesis is about one-tap desirability, not editor depth.

## 9. Analytics

Reuse the existing `style_changed` event with `style_type=filter` and the filter ID. Do not add hover/scroll noise.

Validation questions:

- What percentage of completed sessions change away from the preset/default filter?
- Which filter IDs are actually selected?
- Does filter interaction correlate with `export_completed`?

## 10. Release gate

Code gate:
- Node 24 install/lint/typecheck/build
- existing presets compile unchanged
- no core capture/compositor regressions

Visual gate:
- preview/export parity
- mobile picker at 375/390/430px
- varied skin-tone review
- real-device iOS Safari / Android Chrome owner smoke before Production

Performance gate:
- preserve the current mobile baseline; do not chase 100/100, but investigate if LCP exceeds 2.5s, CLS exceeds .1, or the overall Lighthouse score regresses materially.
