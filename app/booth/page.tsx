import type { Metadata } from "next";
import { BoothClient } from "./booth-client";
import { PhotoFramingController } from "./photo-framing-controller";
import "./booth-foundation.css";
import "./booth-shell.css";
import "./camera.css";
import "./photo-framing.css";
import "./export.css";
import "./filter-picker.css";
import "./workspace-modes.css";
import "./progressive-disclosure.css";
import "./sticker-editor.css";
import "./mobile-viewport.css";
import { getPreset } from "@/lib/presets";

export const metadata: Metadata = {
  title: "Online Photo Booth",
  description: "Open PicToFu’s browser photobooth and choose a cute strip preset. Captured photos are processed on your device.",
  alternates: { canonical: "/booth" },
  robots: { index: false, follow: true },
};

type BoothPageProps = {
  searchParams: Promise<{ preset?: string | string[] }>;
};

export default async function BoothPage({ searchParams }: BoothPageProps) {
  const params = await searchParams;
  const presetId = Array.isArray(params.preset) ? params.preset[0] : params.preset;
  const preset = getPreset(presetId);

  return (
    <>
      <BoothClient initialPreset={preset} />
      <PhotoFramingController />
    </>
  );
}
