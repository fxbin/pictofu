import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoExperiencePage } from "@/components/seo-experience-page";
import { SEO_EXPERIENCES, getSeoExperience } from "@/lib/seo-pages";
import "../seo.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_EXPERIENCES.map((experience) => ({ slug: experience.slug }));
}

type SeoPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const experience = getSeoExperience(slug);
  if (!experience) return {};

  return {
    title: experience.title,
    description: experience.description,
    alternates: { canonical: `/${experience.slug}` },
    openGraph: {
      title: `${experience.title} | PicTofu`,
      description: experience.description,
      url: `https://pictofu.com/${experience.slug}`,
      siteName: "PicTofu",
      type: "website",
    },
  };
}

export default async function SeoPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const experience = getSeoExperience(slug);
  if (!experience) notFound();

  return <SeoExperiencePage experience={experience} />;
}
