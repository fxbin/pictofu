import type { MetadataRoute } from "next";
import { SEO_EXPERIENCES } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://pictofu.com",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://pictofu.com/privacy",
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...SEO_EXPERIENCES.map((experience) => ({
      url: `https://pictofu.com/${experience.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
