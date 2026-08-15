# About + FAQ verifier — Issue #18

Status: **pass_with_watch**

Runtime: `soft_orchestration_only`; this is a separate verification lens, not a claim of an independently running subagent.

## Scope reviewed

- `/about` metadata and canonical URL
- visible product explanation and current capability claims
- camera/share troubleshooting copy
- FAQ content and JSON-LD parity
- mobile-first interaction sizing in page CSS
- branch isolation from Issue #19 shared footer/sitemap edits

## Product-truth checks

- Current preset contract supports 1×4, 1×3, 2×2 grid and Polaroid-style layouts.
- Current filters are Original, B&W, Warm, Vintage and Y2K.
- Current frame themes are cream, pink, lilac and mint.
- Selective single-slot retake exists in the merged capture flow.
- The page says PicTofu is designed for current iPhone Safari / Android Chrome / modern desktop browsers, but does not claim that every hardware/browser matrix is already validated.
- Sharing copy describes native share where supported and fallback behavior rather than promising direct posting to specific social networks.
- Local-photo wording matches the v0.1 harness: no account, cloud photo gallery or backend photo persistence.

## Guardrails checked

- No new camera/export/share capability is implemented or implied.
- No analytics, photo bytes, Blob/base64 payloads or backend persistence changes.
- FAQ JSON-LD is generated from the same in-file FAQ array rendered to users, preventing structured-data/content drift.
- Primary CTA controls are at least 44px by CSS contract.

## Watches / remaining gates

1. **CI pending:** Node 24 install/lint/typecheck/build must pass.
2. **Visual smoke pending:** verify `/about` at 375/390/430px and desktop Preview.
3. **Shared navigation reconciliation:** `/about` intentionally does not edit sitemap/home/footer while PR #32 owns those shared surfaces. After #32 lands in `dev`, add About to sitemap/footer and link Privacy from About before closing #18.
4. **Hardware claims:** Issue #2 remains the source of truth for unresolved physical camera/facing-mode validation.

## Verdict

The isolated About/FAQ page slice is suitable for PR into `dev` once CI is green. Keep Issue #18 open until shared-navigation reconciliation and dev visual acceptance are complete.
