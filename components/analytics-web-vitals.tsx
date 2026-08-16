"use client";

import { useReportWebVitals } from "next/web-vitals";
import { emitProductEvent } from "@/lib/analytics";

function reportWebVital(metric: {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating?: string;
}) {
  emitProductEvent("web_vital", {
    metric_id: metric.id,
    metric_name: metric.name,
    metric_value: Math.round(metric.value * 1000) / 1000,
    metric_delta: Math.round(metric.delta * 1000) / 1000,
    metric_rating: metric.rating ?? "unknown",
  });
}

export default function AnalyticsWebVitals() {
  useReportWebVitals(reportWebVital);
  return null;
}
