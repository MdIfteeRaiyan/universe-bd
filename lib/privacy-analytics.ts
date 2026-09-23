import { track } from "@vercel/analytics";

export function trackPrivacyEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  track(name, properties);
}
