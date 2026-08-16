"use client";

import { useEffect } from "react";
import { trackGrowthEvent } from "@/lib/growth/tracker";

export function OpsTelemetry() {
  useEffect(() => {
    trackGrowthEvent("ops_page_viewed", {
      surface: "portfolio_case_study",
    });
  }, []);

  return null;
}

