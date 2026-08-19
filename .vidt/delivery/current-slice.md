# Current Slice — Pose Guide V1

## Intent
Ship a lightweight live pose-guidance layer for PicToFu camera capture.

## Lead / guard
- semantic lead: World-Class Product Architect
- Git guard: Git Workflow Guardian
- verifier: independent acceptance via #193
- runtime: soft orchestration only; no isolated subagent runtime is available in this chat

## Scope
- preset-aware local pose registry
- four launch packs: Classic Booth, Korean Date, Couple Date, Best Friends
- SVG/line-art live camera overlay
- shot-index progression and retake alignment
- on/off + next-pose controls
- bounded privacy-safe analytics
- verifier contract + release

## Non-goals
AI/body detection, scoring, cloud pose assets, custom uploads, exported pose artwork.

## Acceptance
See Epic #188 and children #189–#193.

## Verification
`npm run verify:growth` plus Pose Guide contract, then Production Next.js compile / TypeScript / static generation and `/booth?preset=korean-date` smoke.

## Resume anchor
This file plus #188.
