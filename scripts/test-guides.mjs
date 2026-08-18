import assert from "node:assert/strict";
import fs from "node:fs";

const guides = fs.readFileSync("lib/guides.ts", "utf8");
const hub = fs.readFileSync("app/guides/page.tsx", "utf8");
const route = fs.readFileSync("app/guides/[slug]/page.tsx", "utf8");
const renderer = fs.readFileSync("components/guide-page.tsx", "utf8");
const sitemap = fs.readFileSync("app/sitemap.ts", "utf8");
const footer = fs.readFileSync("components/site-footer.tsx", "utf8");

const slugs = [...guides.matchAll(/^\s{4}slug:\s*"([^"]+)"/gm)].map((match) => match[1]);
assert.ok(slugs.length >= 10, `Expected at least 10 launch guides, found ${slugs.length}`);
assert.equal(new Set(slugs).size, slugs.length, "Guide slugs must be unique");

for (const required of [
  "how-to-use-pictofu",
  "make-photo-strip-from-existing-photos",
  "better-online-photobooth-photos",
  "edit-photo-strip-before-export",
  "photo-booth-pose-ideas",
  "couple-photobooth-pose-ideas",
  "best-friend-photobooth-pose-ideas",
  "korean-four-cut-photo-guide",
  "photo-strip-sizes-aspect-ratios",
  "how-to-print-photo-strips",
]) {
  assert.ok(slugs.includes(required), `Missing launch guide: ${required}`);
}

assert.match(guides, /sections:\s*\[/, "Guides must contain substantive section content");
assert.match(guides, /checklist:\s*\[/, "Guides must include a practical checklist");
assert.match(guides, /faq:\s*\[/, "Guides must include user-facing FAQ content");
assert.match(guides, /related:\s*\[/, "Guides must include internal related-guide paths");
assert.doesNotMatch(guides, /search volume is|monthly searches|keyword difficulty is/i, "Guides must not fabricate keyword metrics");

assert.match(hub, /getGuidesByCategory/, "Guides hub must be data-driven");
assert.match(hub, /Task first/, "Guides hub must communicate task-first content intent");
assert.match(route, /generateStaticParams/, "Guide detail routes must statically enumerate guide slugs");
assert.match(route, /dynamicParams = false/, "Unknown guide slugs must not become thin dynamic pages");
assert.match(renderer, /"@type": "Article"/, "Guide pages must expose Article structured data");
assert.match(renderer, /"@type": "FAQPage"/, "Guide pages must expose FAQ structured data");
assert.match(renderer, /Related PicToFu guides/, "Guide pages must include internal related content");
assert.match(renderer, /Try it now/, "Guide pages must include a non-interruptive product CTA");
assert.match(sitemap, /GUIDES\.map/, "Sitemap must enumerate guide detail pages");
assert.match(sitemap, /https:\/\/pictofu\.com\/guides/, "Sitemap must include the Guides hub");
assert.match(footer, /href="\/guides"/, "Global footer must expose Guides navigation");

console.log(`Guides contract passed for ${slugs.length} launch guides.`);
