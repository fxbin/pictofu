"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./home-booth-preview.module.css";

const FILTERS = [
  {
    id: "original",
    label: "Original",
    treatment: "none",
  },
  {
    id: "bw",
    label: "B&W",
    treatment: "grayscale(1)",
  },
  {
    id: "warm",
    label: "Warm",
    treatment: "sepia(.16) saturate(1.1) brightness(1.04)",
  },
  {
    id: "vintage",
    label: "Vintage",
    treatment: "sepia(.32) saturate(.72) contrast(.92) brightness(1.02)",
  },
  {
    id: "y2k",
    label: "Y2K",
    treatment: "saturate(1.18) hue-rotate(315deg) brightness(1.04)",
  },
] as const;

const AUTO_SWITCH_MS = 2200;
const RESUME_AFTER_CLICK_MS = 8000;

export function HomeBoothPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const resumeTimerRef = useRef<number | null>(null);
  const activeFilter = FILTERS[activeIndex];

  useEffect(() => {
    if (!autoPlay) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FILTERS.length);
    }, AUTO_SWITCH_MS);

    return () => window.clearInterval(intervalId);
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  function selectFilter(index: number) {
    setActiveIndex(index);
    setAutoPlay(false);

    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      setAutoPlay(true);
    }, RESUME_AFTER_CLICK_MS);
  }

  return (
    <div className="booth-preview" aria-label="PicToFu booth filter preview">
      <div className="booth-preview__topbar">
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="status-pill">✨ Ready when you are!</span>
        <span className="camera-pill">▣ Camera</span>
      </div>

      <div className="booth-preview__body">
        <div className="preview-tools" aria-hidden="true">
          <span><b>3:4</b><small>Ratio</small></span>
          <span><b>◷</b><small>Timer</small></span>
          <span><b>●</b><small>Camera</small></span>
          <span><b>↻</b><small>Flip</small></span>
        </div>

        <div className={`camera-stage ${styles.cameraStage}`} aria-live="polite">
          <Image
            src="/demo/hero/main-original.webp"
            alt={`PicToFu ${activeFilter.label} filter photo preview`}
            width={480}
            height={640}
            sizes="(max-width: 780px) 100vw, 560px"
            priority
            className={styles.previewImage}
            style={{ filter: activeFilter.treatment }}
          />
          <div className="countdown-ring">3</div>
          <span className="camera-doodle camera-doodle--one">♡</span>
          <span className="camera-doodle camera-doodle--two">✦</span>
        </div>

        <div className={`demo-strip ${styles.demoStrip}`} aria-label={`${activeFilter.label} four-photo strip preview`}>
          <Image
            src="/demo/hero/strip-original.webp"
            alt="Four-pose PicToFu photo strip preview"
            width={180}
            height={540}
            sizes="124px"
            priority
            className={styles.stripImage}
            style={{ filter: activeFilter.treatment }}
          />
        </div>
      </div>

      <div className="booth-preview__bottom">
        <div className="editor-preview">
          <div className="editor-tabs" aria-hidden="true">
            <span>▦ Layouts</span><span className="is-active">◉ Filters</span><span>▢ Frames</span><span>↺ Retake</span>
          </div>
          <div className="filter-row" aria-label="Preview filters">
            {FILTERS.map((filter, index) => (
              <button
                type="button"
                className={`${styles.filterButton} ${index === activeIndex ? styles.filterButtonActive : ""}`}
                key={filter.id}
                onClick={() => selectFilter(index)}
                aria-pressed={index === activeIndex}
                aria-label={`Preview ${filter.label} filter`}
              >
                <i className={`filter-swatch filter-swatch--${index + 1} ${styles.filterSwatch}`} aria-hidden="true" />
                <small>{filter.label}</small>
              </button>
            ))}
          </div>
        </div>
        <Link className="gradient-button" href="/booth?preset=classic-booth" prefetch={false}>Open Booth ✦</Link>
      </div>
    </div>
  );
}
