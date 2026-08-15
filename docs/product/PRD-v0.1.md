# PicTofu v0.1 Product Brief

## Problem

People discover cute photobooth styles through search and social links, but installing an app creates unnecessary friction for a short, playful moment. PicTofu should let a user open a URL, pose, style a photo strip, and download/share it immediately.

## Target user

Primary: mobile users, especially Gen Z users opening a shared/search result for a cute, Korean, Y2K, couple, best-friend, birthday or graduation photobooth experience.

Secondary: desktop/laptop users who want a webcam photobooth without installing software.

## Primary outcome

Within one session, the user completes and exports a photo strip they would be willing to keep or share.

## Product promise

**No install. Open. Pose. Download.**

## Core flow

1. Land on a search/template/home page.
2. Tap **Start Booth**.
3. Grant camera permission or choose upload fallback where supported.
4. See live preview and choose minimal capture settings.
5. Take a short sequence of photos with countdown.
6. Review/retake if needed.
7. Apply layout, filter, frame and optional simple sticker/text treatment.
8. Export a high-quality PNG.
9. Use native share when available or download locally.

## v0.1 scope

### Landing / discovery
- Responsive PicTofu home page matching the approved soft pastel visual direction.
- Mobile-first hero and horizontally scrollable template cards.
- Desktop hero showing an interactive booth preview direction.
- First template presets: Korean Date, Y2K Summer, Best Friends, Graduation.

### Capture
- Front camera by default.
- Countdown.
- 4-shot primary strip flow.
- Camera flip when supported.
- Permission-denied recovery state.
- Retake/restart path.

### Styling
- Layout presets: 1×4, 1×3, 2×2, Polaroid-like single frame.
- Filters: Original, B&W, Warm, Vintage, Y2K.
- Basic frame color/theme choices.
- Minimal sticker support only after capture/export loop works.

### Export/share
- Client-side composition.
- PNG download.
- Web Share API when supported.

## Explicit non-goals

- Login/authentication
- Cloud gallery/history
- AI retouching or generation
- Native app
- Payment/subscriptions
- Server-side photo storage
- Real-time collaborative booths

## Failure states

- Camera API unavailable: explain browser/device limitation and offer upload path when implemented.
- Permission denied: show exact recovery guidance and retry action.
- Camera startup timeout/error: preserve page state and offer retry.
- Export failure: keep captured session in memory and allow retry.
- Share unavailable: fall back to download.

## Acceptance criteria

1. At 375px, 390px and 430px viewport widths, the primary CTA and core camera controls are usable without horizontal overflow.
2. At desktop width around 1440px, the landing page uses the approved two-column hero direction and remains readable.
3. A user can move from landing CTA into the booth without account creation.
4. The camera flow does not upload image bytes to PicTofu servers in v0.1.
5. Camera-denied state presents a retry/recovery action rather than a dead end.
6. Captured photos can be assembled into at least the default 1×4 strip in-browser.
7. Export produces a downloadable PNG.
8. Native share is used where supported, with download fallback.
9. Search-facing pages contain indexable title/H1/body copy and internal links independent of camera permission.
10. Template routes configure meaningful defaults in the booth rather than only changing SEO copy.

## Measurement

North-star: `photo_strip_completed` per day.

Funnel:

`landing_view → start_booth → camera_permission_granted → capture_started → capture_completed → edit_started → export_completed → share_clicked`

Secondary metrics:
- Start Booth rate
- Camera permission success rate
- Capture completion rate
- Export rate
- Share rate
- Organic impressions/clicks by landing page

## Implementation slice recommendation

Slice 1: production-capable responsive landing + booth shell + instrumentation contract.

Slice 2: real camera capture + countdown + retake.

Slice 3: client-side strip composer + filters + export/share.

Slice 4: template-route presets + first SEO landing pages.

Slice 5: analytics provider wiring, Search Console, sitemap/canonical verification and launch hardening.
