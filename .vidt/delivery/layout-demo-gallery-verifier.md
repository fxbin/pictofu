# Layout Demo Gallery Verifier

Status: **pass_with_watch**

## Product / visual evidence

- `strip-4`: globally representative solo portrait session; four poses, one subject, one wardrobe/background/lighting setup.
- `strip-3`: three connected frames from one mixed-friend session, recomposed into PicTofu's current three-cut geometry.
- `grid-4`: four connected frames from the same mixed-friend session in a 2 × 2 grid.
- `polaroid`: single portrait in PicTofu's current Polaroid geometry.
- No generated UI mockup, sticker, AI background, beauty control, or other unavailable capability is shown in the approved derivatives.
- Ethnicity is treated as ordinary human representation, not as a filter/preset selector.

## Performance evidence

Production WebP derivatives are 300px intrinsic width:

| Layout | Dimensions | Bytes |
| --- | ---: | ---: |
| 1 × 4 | 300 × 857 | 11,788 |
| 1 × 3 | 300 × 652 | 19,146 |
| 2 × 2 | 300 × 314 | 10,988 |
| Polaroid | 300 × 346 | 8,066 |
| **Total** |  | **49,988 bytes** |

The original generation-resolution sources are not added to the web payload.

## UX evidence

- `/layouts` adds a real-photo section before the preset cards.
- Native CSS horizontal scrolling + `scroll-snap-type: x mandatory`; no carousel JS dependency.
- The gallery preserves each asset's intrinsic aspect ratio inside a shared viewing stage.
- Mobile cards use `78vw` / `82vw`, leaving the next item partially discoverable.
- Copy explicitly says the examples demonstrate output geometry; preset cards below own filter/frame styling.
- Images use Next Image with `unoptimized` because these derivatives are already WebP-compressed; this avoids shipping high-resolution originals or embedding base64 in page markup.

## Watches before merge

- PR Node 24 lint/typecheck/build must be green.
- Verify all four binary files decode correctly from Git blobs in the built site.
- Do a 375 / 390 / 430px visual smoke when a deployable environment is available. Preview deployments are currently intentionally disabled, so this may be owner/local evidence rather than Vercel Preview.
- This slice covers one real example per *geometry*. Preset-specific human assets for Korean / Y2K / Vintage / Couple / Graduation remain follow-up scope under #16.
