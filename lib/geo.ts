export const PICTOFU_SITE_URL = "https://pictofu.com";

export const PICTOFU_GEO_FACTS = {
  name: "PicToFu",
  summary:
    "PicToFu is a free, privacy-friendly online photobooth for making photo strips directly in a web browser.",
  description:
    "Take photos with a browser camera or use existing images, adjust framing, choose a layout, filter and frame, then export the finished photo strip as a PNG. No account is required, and PicToFu processes session photos in the browser instead of building a cloud photo gallery.",
  facts: [
    { label: "Runs in", value: "A modern web browser" },
    { label: "Account", value: "Not required" },
    { label: "Photo processing", value: "In the browser" },
    { label: "Output", value: "One finished PNG photo strip" },
  ],
  features: [
    "Browser camera capture",
    "Existing-photo upload",
    "Photo reposition, zoom, rotate, straighten and flip controls",
    "Photo strip and grid layouts",
    "Filters and frames",
    "PNG export",
    "Browser/device sharing where supported",
  ],
} as const;

export function pictofuSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${PICTOFU_SITE_URL}/#website`,
        url: PICTOFU_SITE_URL,
        name: PICTOFU_GEO_FACTS.name,
        description: PICTOFU_GEO_FACTS.summary,
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${PICTOFU_SITE_URL}/#app`,
        url: PICTOFU_SITE_URL,
        name: PICTOFU_GEO_FACTS.name,
        description: PICTOFU_GEO_FACTS.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser with JavaScript.",
        isAccessibleForFree: true,
        featureList: [...PICTOFU_GEO_FACTS.features],
      },
    ],
  };
}
