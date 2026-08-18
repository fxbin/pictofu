import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/guide-page";
import { GUIDES, getGuide } from "@/lib/guides";
import "../guides.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

type GuideRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.title} | PicToFu`,
      description: guide.description,
      url: `https://pictofu.com/guides/${guide.slug}`,
      siteName: "PicToFu",
      type: "article",
    },
  };
}

export default async function GuideRoute({ params }: GuideRouteProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuidePage guide={guide} />;
}
