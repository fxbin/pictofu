import { GUIDES } from "@/lib/guides";
import { PICTOFU_GEO_FACTS, PICTOFU_SITE_URL } from "@/lib/geo";
import { SEO_EXPERIENCES } from "@/lib/seo-pages";

export const dynamic = "force-static";

function absolute(path: string) {
  return `${PICTOFU_SITE_URL}${path}`;
}

function llmsText() {
  const experienceLinks = SEO_EXPERIENCES.map(
    (experience) => `- [${experience.title}](${absolute(`/${experience.slug}`)}): ${experience.description}`,
  ).join("\n");

  const guideLinks = GUIDES.map(
    (guide) => `- [${guide.title}](${absolute(`/guides/${guide.slug}`)}): ${guide.description}`,
  ).join("\n");

  return `# ${PICTOFU_GEO_FACTS.name}

> ${PICTOFU_GEO_FACTS.summary}

${PICTOFU_GEO_FACTS.description}

Canonical site: ${PICTOFU_SITE_URL}

Core product facts:
- Runs in a modern web browser.
- No account is required for the photobooth flow.
- Session photos are processed in the browser rather than stored in a PicToFu cloud photo gallery.
- Users can take photos with the browser camera or use existing images from their device.
- Users can adjust framing, choose compatible layouts, filters and frames, and export one finished PNG photo strip.
- PicToFu is a browser photo-strip tool, not an AI portrait generator or a physical photobooth service.

## Product experiences

${experienceLinks}

## Guides

${guideLinks}

## Reference

- [About PicToFu](${absolute("/about")}): Product background and positioning.
- [Privacy](${absolute("/privacy")}): How PicToFu handles photos and analytics.
- [Layouts](${absolute("/layouts")}): Current photo-strip layout options.
`;
}

export function GET() {
  return new Response(llmsText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
