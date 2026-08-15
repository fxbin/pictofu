# PicTofu Competitive Capability Audit

Date: 2026-08-15
Issue: #21

## Decision frame

PicTofu should not copy competitor checklists blindly. Features are ranked by five factors: user value, competitor prevalence, implementation cost, privacy/cost impact, and SEO/viral impact. The product goal remains: **Choose → Capture → Curate → Style → Share**.

Scoring uses 1–5 where higher user value / prevalence / SEO is better, while higher implementation and privacy cost is worse.

## Capability gap matrix

| Capability | User value | Competitor prevalence | Impl. cost | Privacy/cost impact | SEO / viral | PicTofu status | Priority | Decision |
|---|---:|---:|---:|---:|---:|---|---|---|
| Post-capture review | 5 | 4 | 2 | 1 | 2 | Missing | P0 | Build now |
| Selective single-shot retake | 5 | 3 | 2 | 1 | 2 | Missing | P0 | Build now (#22) |
| Real human result samples | 5 | 5 | 2 | 1 | 5 | In progress | P0 | Build now (#16) |
| Choose-layout before camera | 4 | 5 | 2 | 1 | 4 | Planned | P0 | Build now (#20) |
| Privacy page | 5 | 4 | 1 | 1 | 2 | Planned | P0 trust | Build now (#19) |
| Upload from gallery | 5 | 4 | 2 | 1 | 3 | Missing | P1 | Build after #22 |
| Replace one slot from gallery | 5 | 3 | 2 | 1 | 2 | Missing | P1 | Build on slot model |
| Crop / pan / zoom per shot | 4 | 4 | 3 | 1 | 2 | Missing | P1 | Build after upload |
| Switch layout after capture | 4 | 4 | 2 | 1 | 3 | Partial | P1 | Improve |
| Caption / custom text / date | 4 | 4 | 2 | 1 | 4 | Missing | P1 | Build |
| Draggable / resizable stickers | 4 | 4 | 3 | 1 | 5 | Missing | P1 | Build with layer model |
| Share Hub / destination UX | 5 | 4 | 3 | 2 | 5 | Planned | P1 | Build (#17) |
| About + FAQ | 3 | 4 | 1 | 1 | 4 | Planned | P1 | Build (#18) |
| Overcapture → choose best N | 5 | 2 | 3 | 1 | 3 | Missing | P2 | Strong follow-up |
| GIF export | 3 | 3 | 3 | 1 | 4 | Missing | P2 | Validate first |
| QR cross-device download | 3 | 3 | 4 | 3 | 2 | Missing | P2 | Desktop/event use case only |
| Filter intensity | 3 | 3 | 2 | 1 | 2 | Missing | P2 | Defer |
| Rearrange captured frame order | 3 | 2 | 2 | 1 | 2 | Missing | P2 | Cheap after slot model |
| Face-following AR overlays | 3 | 2 | 5 | 2 | 5 | Missing | Later | Do not build yet |
| Beauty / glam controls | 3 | 2 | 4 | 2 | 3 | Missing | Later | Do not build yet |
| AI background / face swap | 2 | 2 | 5 | 5 | 4 | Missing | Later | Do not build yet |
| Accounts / cloud gallery | 2 | 2 | 5 | 5 | 2 | Missing | Later | Do not build yet |
| Event / B2B mode | 3 | 2 | 5 | 4 | 2 | Missing | Later | Revisit after traffic |

## Competitive evidence summary

### SnapBooth
- Captures up to 8 photos, then lets the user pick 4.
- Includes frame, font, caption, date, stickers and strip customization.
- Strong signal for a `Curate` stage rather than forcing every capture into the final strip.

### Snappy
- Explicit `Choose Layout → Camera or Gallery → Snap → Customize` flow.
- Existing-photo upload is treated as a first-class capture source.
- Border / overlay / caption customization and client-side privacy messaging are product basics.

### Picapica
- Camera and Upload Images are separate inputs.
- Provides filters, frame colors, stickers, QR download and GIF export.
- FAQ explicitly notes individual retake is not available, showing a visible usability gap we can exploit.

### DigiBooth
- Camera plus upload/replacement flow.
- Live filters, face-following effects, draggable stickers and captions.
- Demonstrates where the category becomes more editor-like, but AR is not required for PicTofu v0.1.

### Simple Booth
- Mature post-capture editor supports retake, crop, filters, alternate layouts, rearrange, props/stickers, margin colors and other controls.
- Important product lesson: keep the number of editing tools focused so the session does not become slow or overwhelming.

## Product architecture implications

### 1. Captures must become stable slots

Move away from append-only `CapturedPhoto[]` semantics toward a slot model:

```ts
type CaptureSlot = {
  slotId: string;
  source: "camera" | "upload";
  blob: Blob;
  url: string;
  crop?: { x: number; y: number; zoom: number };
  transform?: { rotation: number; mirrorX: boolean };
};
```

This makes selective retake, upload replacement, crop, rearrange and later overcapture possible without rewriting the capture system.

### 2. Separate capture from curation

Target flow:

`Choose → Capture → Review / Curate → Style → Share`

The user should never need to throw away three good shots because one frame is poor.

### 3. Separate geometry from style

`Layout` is geometry; `Preset` is layout + filter + frame + styling. This prevents template growth from multiplying compositor code.

### 4. Editing should stay browser-local

P0/P1 editing features can remain entirely client-side. Avoid account, cloud gallery and AI processing until traffic data justifies privacy and infrastructure complexity.

## Approved roadmap from this audit

### P0 — current build queue
1. #22 Post-capture Review + selective retake.
2. #16 Global human demo assets.
3. #20 Choose-layout pre-camera experience.
4. #19 Privacy baseline before broader public acquisition.

### P1 — immediately after P0
1. Gallery upload + replace slot.
2. Crop / pan / zoom per slot.
3. Caption/date.
4. Draggable/resizable sticker layer.
5. Improve post-capture layout switching.
6. #17 Share Hub.
7. #18 About / FAQ.

### P2 — only after funnel data
1. Overcapture → choose best N.
2. GIF export.
3. QR cross-device delivery.
4. Frame rearrange / filter intensity.

### Explicitly deferred
Face-tracking AR, beauty ML, AI backgrounds, accounts/cloud gallery, event/B2B infrastructure.

## Release principle

Do not judge PicTofu by the number of controls. Judge it by whether a new visitor can quickly produce a photo strip they are happy enough to download and share.
