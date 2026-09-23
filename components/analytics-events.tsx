"use client";

import { useEffect } from "react";
import { trackPrivacyEvent } from "@/lib/privacy-analytics";

export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics]")
        : null;
      if (target?.dataset.analytics) trackPrivacyEvent(target.dataset.analytics);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
