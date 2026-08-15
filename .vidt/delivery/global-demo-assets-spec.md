# #16 Global Human Demo Assets — Production Spec

## Selected route
- Lead: World-Class Product Architect
- Assistant lens: Technical Trinity for integration constraints
- Governance: Git Workflow Guardian
- Runtime tier: `soft_orchestration_only`
- Workflow: product asset definition → bounded integration slice → Worker/Verifier → PR → CI → production visual smoke

## Goal
Replace symbolic/placeholder faces with believable, original photobooth outcomes that make the final product result obvious before camera permission.

## Why this is P0
The current homepage uses abstract faces and CSS poster placeholders. Competitors establish trust and desire by showing a realistic finished human strip. PicTofu should show achievable outcomes rather than decorative placeholders.

## Global casting principles
1. Evaluate diversity across the complete production set, not one image at a time.
2. Do not assign one ethnicity to one style (e.g. Korean aesthetic does not require East Asian casting).
3. Use adult subjects only for the initial production set to avoid age ambiguity.
4. Avoid public figures, celebrities, brand logos, copyrighted character costumes, and competitor assets.
5. Within one strip, preserve the same people, wardrobe, background, lighting, hair and accessories across every pose.
6. Relationships shown must read naturally: solo / couple / friends / graduation group.
7. Avoid exaggerated ethnic, cultural, gender or sexuality stereotypes.

## First production batch
| Preset | Session | Layout | Reproducible PicTofu look |
|---|---|---|---|
| Classic Booth | Black woman, solo, 4 natural poses | 1×4 | Original + Cream |
| Korean Date | mixed-ethnicity couple, 4 connected poses | 1×4 | Warm + Blush |
| Y2K Summer | two friends, globally mixed casting, playful flash poses | 1×4 | Y2K + Lilac |
| Best Friends | three diverse friends, playful gestures | 2×2 | Original/Warm-compatible + Lilac |

Second batch after visual verification:
- Couple Date
- Vintage Film
- Graduation

## Visual constraints
- Human photography should feel like a real compact photobooth session, not editorial fashion photography.
- Camera framing: chest-up / waist-up, centered enough to survive `cover` cropping.
- Background: simple booth wall/studio surface; no complex environment that PicTofu cannot reproduce.
- No baked-in decorative frame that conflicts with PicTofu's real compositor. The marketing strip may include only frame/filter treatments that exist in the product.
- No fake features: no AR masks, AI background replacement, beauty retouch, advanced stickers, typography or chrome decorations that the current runtime cannot create.
- Expression changes should be the primary variation across shots.

## Asset output contract
For each approved preset:
- `public/demo/<preset>/strip.webp`: complete outcome preview
- `public/demo/<preset>/card.webp`: crop optimized for template cards
- source generation/reference kept outside runtime bundle where possible
- preferred web asset dimensions are bounded and chosen to avoid unnecessary LCP weight
- WebP first; AVIF may be added only if it materially improves delivery without workflow complexity

## Integration contract
`lib/demo-assets.ts` is the single mapping between preset and published demo imagery.

Consumers:
- homepage hero outcome preview
- homepage template cards
- representative SEO landing page outcome section
- future #20 Choose Layout page

Do not make SEO pages or UI components own their own independent demo-path strings.

## Verification gates
### Visual Verifier
- same person/group across every frame in a strip
- no obvious hand/face continuity failures at normal card/hero size
- global set does not read as targeting only one ethnicity
- style is consistent with the preset
- output looks desirable but achievable by the actual product

### Engineering Verifier
- no user-photo data path changes
- demo assets are static public marketing assets only
- alt text is descriptive and not keyword stuffed
- homepage mobile first viewport includes a human result without layout shift
- image loading does not materially regress LCP
- Node 24 lint, typecheck and production build pass

## Stop condition
Do not integrate a candidate merely because it is generated. If continuity, demographic balance, or product-achievability fails, reject/retry the asset without changing production UI.

## Resume anchor
`.vidt/delivery/global-demo-assets-spec.md`
