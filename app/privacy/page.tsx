import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = { title: "Privacy | CampusChoice BD", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() {
  return <TrustPage eyebrow="PRIVACY" title="Simple tools, minimal data." intro="CampusChoice BD is designed to work without student accounts or hidden personal profiles.">
    <h2>What stays on your device</h2><p>Your shortlist and application stages are stored in your browser. They are not uploaded by CampusChoice BD. A shortlist link contains only selected university identifiers and an optional programme—not your application stage.</p>
    <h2>Measurement</h2><p>When privacy-conscious traffic measurement is enabled, it should record aggregated page and feature usage without collecting names, email addresses, admission results or form contents. Search text and financial inputs must not be sent as analytics properties.</p>
    <h2>External websites</h2><p>Official-source links open university or government websites. Their own privacy policies apply after you leave CampusChoice BD.</p>
    <h2>Correction reports</h2><p>The correction form prepares a report in your browser. Nothing is submitted automatically. You choose whether to copy or send it.</p>
  </TrustPage>;
}
