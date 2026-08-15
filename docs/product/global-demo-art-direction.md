# PicTofu Global Demo Art Direction

Issue: #16
Date: 2026-08-15

## Goal

PicTofu is a global consumer product with Korean / Y2K / vintage influences, not an East-Asia-only product. Production samples should make a visitor immediately understand the final photo-strip outcome while naturally representing a broad international audience.

## Rules

1. **Style is not ethnicity.** `Korean Date` describes lighting/layout/aesthetic; it does not require Korean or East Asian subjects.
2. **One strip = one believable session.** The same people, clothing, lighting, camera distance and backdrop must remain consistent across all frames; only pose/expression changes.
3. **No celebrity likeness.** Subjects must be original adults and not resemble identifiable public figures.
4. **No competitor assets.** Frames and styling can learn from category patterns but must remain PicTofu-original.
5. **Product truth.** Published examples must be achievable by PicTofu's actual geometry/filter/frame system. Do not advertise effects we cannot produce.
6. **Global diversity without tokenism.** Mix skin tones, hair textures, gender presentation and group structures across the whole set. Do not create rigid `template = ethnicity` mapping.
7. **Young-adult positioning.** Default subjects should read as adults roughly 20–30 because PicTofu's initial social-sharing use cases center on friends, dates, graduation and creator-style moments.
8. **Web first.** The strip itself must remain readable when displayed as a small card on mobile.

## Production matrix

| Asset ID | Preset / use | Subjects | Visual direction | Frame |
|---|---|---|---|---|
| demo-classic-01 | Classic Booth | Black woman, solo | soft neutral studio, natural smile / peace / cheek / wink | cream |
| demo-classic-02 | Classic Booth alt | White/Latina man, solo | clean daylight studio, relaxed expressions | cream |
| demo-korean-date-01 | Korean Date | mixed-ethnicity couple | Korean soft-light aesthetic, minimal outfits, heart/peace poses | cream/lilac |
| demo-couple-01 | Couple Date | Black + Asian couple | warm romantic tone, subtle heart styling | blush |
| demo-y2k-01 | Y2K Summer | two friends, mixed ethnicity | direct flash, pink/chrome feeling, playful poses | blush |
| demo-vintage-01 | Vintage Film | Middle Eastern / Mediterranean woman, solo | warm film tone, subtle grain/date mood | cream |
| demo-best-friends-01 | Best Friends | three friends of varied backgrounds | energetic gestures, candid laughter | mint/cream |
| demo-graduation-01 | Graduation | two graduates, mixed gender/background | caps/gowns, celebratory but uncluttered | lilac |

Follow-up set may expand to 10–12 sessions only after the first 8 are visually coherent.

## Composition contract

- Vertical 4-cut strips are the primary marketing asset because they communicate the product fastest.
- Keep outer marketing canvas 3:4 when used as standalone asset; strip centered with negative space.
- Photo cells should use a consistent crop close to current `strip-4` output.
- Brand footer should stay small: `✦ PicTofu ♡` for ordinary web/marketing previews.
- Keep a future unbranded export variant possible for platform-specific sharing policies.
- Avoid decorative stickers in the first production batch unless PicTofu can reproduce the same sticker placement in-product.

## Pose language

Prefer natural photobooth sequences:
- smile / neutral
- peace sign
- cheek pose or heart gesture
- laugh / wink / playful final frame

Couple/friend strips should vary interaction while keeping camera geometry stable.

## Asset delivery

Target repository structure:

```text
public/demo/
  classic-01.webp
  classic-02.webp
  korean-date-01.webp
  couple-01.webp
  y2k-01.webp
  vintage-01.webp
  best-friends-01.webp
  graduation-01.webp
```

Delivery target per final WebP asset:
- card/marketing source width around 900–1200 px
- generally < 250 KB where quality permits
- descriptive `alt` copy stored with preset/sample metadata, not duplicated across pages

## Integration order

1. Home hero outcome preview.
2. Template/preset cards.
3. `/layouts` chooser (#20).
4. Relevant SEO intent pages.
5. Optional `Try with demo photos` only after separate interaction design; do not make marketing composite strips masquerade as raw camera frames.

## Verifier questions

Before shipping each asset ask:
- Does the strip look like one real session?
- Can PicTofu actually produce this layout/frame/filter impression?
- Does the whole production set look global rather than region-locked?
- Is the subject clearly an adult and non-identifiable public figure?
- Does the asset still communicate at mobile card size?
- Is file weight acceptable for LCP?
