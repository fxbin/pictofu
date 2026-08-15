# UI Direction v0.1

## Approved visual character

PicTofu should feel like a polished, friendly consumer product rather than a generic utility site.

Keywords:
- soft
- playful
- modern
- Korean photobooth inspired
- Gen Z friendly
- premium but lightweight

## Brand shell

- Warm cream/off-white page background.
- Primary accent: blush/coral pink.
- Supporting accents: soft lilac, pale mint, gentle peach.
- Dark warm charcoal text rather than pure black.
- Rounded cards and controls, restrained soft shadows.
- Small doodle/sparkle/heart motifs; decorative density must not compete with controls.
- PicTofu mascot: a tiny rounded tofu/square face that can sit beside the wordmark and on exported strip footers.

## Desktop landing

Two-column hero:

Left:
- PicTofu promise headline: `Your cute online photobooth`
- one short explanatory paragraph
- primary `Start Booth` CTA
- secondary `Try Templates` CTA
- trust/value chips: `No app needed`, `Private by design`, `Free download`

Right:
- large booth preview card
- camera preview
- visible countdown treatment
- narrow vertical strip preview
- compact layout/filter/frame/sticker controls
- prominent export CTA

Below hero:
- `Popular Templates` horizontal/4-column desktop row
- Korean Date
- Y2K Summer
- Best Friends
- Graduation

## Mobile landing

Do not shrink desktop mechanically.

- compact logo + menu header
- centered/left-balanced hero depending width
- primary CTA large enough for thumb use
- secondary template CTA
- value chips wrap naturally
- popular template cards scroll horizontally
- no horizontal page overflow

## Mobile booth

Treat capture as an app-like immersive mode:

- minimal top bar: close/back, status, settings
- camera preview occupies most of the viewport
- countdown is visually dominant during capture
- bottom capture tray uses 44px+ targets
- central shutter control is prominent
- ratio/timer/flip/flash remain secondary
- edit controls become a bottom sheet after capture
- photo strip preview can remain visible in the editor, but must not squeeze the camera during active capture

## Responsive priorities

Target widths for manual checks:
- 320px minimum support
- 375px
- 390px
- 430px
- 768px
- 1024px
- ~1440px desktop

Use:
- `100dvh` / dynamic viewport behavior for immersive camera screens
- safe area insets around bottom controls
- CSS responsive layout, not user-agent branching

## Interaction principles

1. Start Booth is always obvious.
2. Camera permission appears only after user intent, not immediately on page load.
3. Capture state, countdown state, review state and edit state are visually distinct.
4. Users can recover from denied permission, failed camera startup and accidental capture.
5. Download/share is the payoff; do not bury it in a menu.
6. Essential actions never depend on hover.

## Copy tone

Short, warm, direct. Avoid infantilizing the user despite the cute visual language.

Examples:
- `Ready when you are!`
- `Start Booth ✨`
- `Your photo strip is ready.`
- `Photos stay on your device.`

## Accessibility baseline

- Focus-visible state for interactive controls.
- Decorative doodles are hidden from assistive technology.
- Controls use text labels or accessible names.
- Contrast remains readable against pastel surfaces.
- Motion respects reduced-motion preferences where animation is added.
