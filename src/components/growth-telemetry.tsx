"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackGrowthEvent } from "@/lib/growth/tracker";

const LAST_VISIT_KEY = "vitrion.growth.last_visit_at";
const RETURN_VISIT_WINDOW_MS = 60 * 60 * 1000;

export function GrowthTelemetry() {
  const pathname = usePathname();

  useEffect(() => {
    trackGrowthEvent("page_view", { path: pathname });

    try {
      const lastVisit = Number(window.localStorage.getItem(LAST_VISIT_KEY) ?? "0");
      const now = Date.now();
      if (lastVisit > 0 && now - lastVisit > RETURN_VISIT_WINDOW_MS) {
        trackGrowthEvent("return_visit", {
          path: pathname,
          hoursSinceLastVisit: Math.round((now - lastVisit) / (60 * 60 * 1000)),
        });
      }
      window.localStorage.setItem(LAST_VISIT_KEY, String(now));
    } catch {
      // Return-visit analytics should never affect rendering.
    }
  }, [pathname]);

  return null;
}
