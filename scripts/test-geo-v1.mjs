import assert from "node:assert/strict";
import fs from "node:fs";

const robots = fs.readFileSync("app/robots.ts", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const llmsRoute = fs.readFileSync("app/llms.txt/route.ts", "utf8");
const geo = fs.readFileSync("lib/geo.ts", "utf8");
const seoPage = fs.readFileSync("components/seo-experience-page.tsx", "utf8");
const geoCss = fs.readFileSync("app/geo.css", "utf8");

assert.match(robots, /userAgent:\s*"OAI-SearchBot"[\s\S]*?allow:\s*"\/"/, "OAI-SearchBot must be explicitly allowed");
assert.match(robots, /sitemap:\s*"https:\/\/pictofu\.com\/sitemap\.xml"/, "Canonical sitemap must remain published");

assert.match(layout, /rel="describedby"\s+href="\/llms\.txt"\s+type="text\/markdown"/, "HTML must advertise the root llms.txt file");
assert.match(layout, /type="application\/ld\+json"/, "Root layout must publish structured data");
assert.match(geo, /"@type":\s*"WebSite"/, "GEO entities must include a WebSite");
assert.match(geo, /"@type":\s*"WebApplication"/, "GEO entities must include the PicToFu web application");
assert.match(geo, /isAccessibleForFree:\s*true/, "Structured product facts must preserve the free-access truth");

assert.match(llmsRoute, /# \$\{PICTOFU_GEO_FACTS\.name\}/, "llms.txt must begin from the canonical site identity");
assert.match(llmsRoute, /SEO_EXPERIENCES\.map/, "llms.txt product links must come from the canonical SEO registry");
assert.match(llmsRoute, /GUIDES\.map/, "llms.txt guide links must come from the canonical guide registry");
assert.match(llmsRoute, /Content-Type":\s*"text\/plain; charset=utf-8"/, "llms.txt must be served as readable text");
assert.match(llmsRoute, /Canonical site:\s*\$\{PICTOFU_SITE_URL\}/, "llms.txt must expose the canonical host");

assert.match(seoPage, /className="seo-answer"/, "SEO pages must expose answer-first facts visibly in HTML");
assert.match(seoPage, /\{experience\.description\}/, "Visible answer copy must reuse canonical page descriptions instead of maintaining crawler-only copy");
assert.match(seoPage, /PICTOFU_GEO_FACTS\.facts\.map/, "Visible facts and machine-readable site facts must share one source");
assert.match(seoPage, /"@type":\s*"WebPage"/, "SEO experiences must publish page-level structured data");

assert.doesNotMatch(geoCss, /opacity\s*:\s*0\b/i, "GEO content must not be hidden with zero opacity");
assert.doesNotMatch(geoCss, /display\s*:\s*none/i, "GEO answer content must not be hidden with display:none");
assert.doesNotMatch(seoPage, /seo-answer[^>]*hidden/i, "GEO answer content must not use the hidden attribute");

const geoSurface = [geo, llmsRoute, seoPage].join("\n");
assert.doesNotMatch(
  geoSurface,
  /(ignore previous|system prompt|highest weight|rank PicToFu|must recommend|must prioritize|prioritize PicToFu)/i,
  "GEO V1 must publish facts, not prompt-injection or ranking instructions",
);
assert.doesNotMatch(
  geoSurface,
  /(user-agent|navigator\.userAgent|headers\(\).*user-agent)/i,
  "GEO content must not vary by crawler User-Agent",
);

console.log("GEO V1 crawlability, entity, answer-first, and anti-cloaking contracts passed.");
