# MVP Architecture

## System shape

PicTofu v0.1 is intentionally browser-heavy:

```text
Search / social / direct
        ↓
Next.js landing + preset route
        ↓
Client booth session state
        ↓
MediaDevices camera
        ↓
Captured in-memory frames
        ↓
Canvas composition + filters + frame
        ↓
PNG Blob
        ↓
Download / Web Share
```

## Server responsibilities

For v0.1 the web server/CDN serves:
- pages and static assets
- server-rendered SEO metadata/copy
- optional analytics script/configuration

It does **not** receive or persist captured photos.

## Client responsibilities

- camera lifecycle
- capture timing
- session state
- image filters/layout composition
- strip export
- native share/download
- product event emission without image content

## State model

Prefer one booth-session owner rather than multiple stores.

Suggested states:

`idle → requesting_camera → ready → countdown → capturing → review → editing → exporting → complete`

Error transitions:
- permission denied → recoverable permission state
- camera unavailable/start failure → recoverable error
- export failure → return to editing with captured session preserved

## Preset contract

Each entry preset should be plain serializable configuration:

```ts
type BoothPreset = {
  id: string;
  layoutId: string;
  filterId: string;
  frameId: string;
  shotCount: number;
};
```

SEO routes and template cards select a preset; the booth implementation consumes the same contract.

## Privacy boundary

Image bytes stay inside browser memory/Blob/object-URL boundaries. Analytics APIs receive only normalized action metadata.

## First technical risks

1. Mobile Safari camera lifecycle and viewport behavior.
2. Front/rear camera switching differences across browsers.
3. Canvas memory pressure on mobile for high-resolution frames.
4. Download/share behavior on iOS.
5. Keeping SEO routes useful without duplicating thin content.

## Risk response

- Start with bounded capture dimensions suitable for high-quality strips rather than full sensor resolution.
- Revoke media tracks and object URLs when sessions end.
- Feature-detect share/camera APIs.
- Keep export path deterministic and local.
- Require real mobile-browser evidence before calling capture/export production-ready.
