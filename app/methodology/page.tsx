import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = { title: "Data Methodology | CampusChoice BD", alternates: { canonical: "/methodology" } };
export default function MethodologyPage() {
  return <TrustPage eyebrow="DATA METHODOLOGY" title="Published facts, visible uncertainty." intro="Every profile separates verified information from fields that still need an official source.">
    <h2>Source priority</h2><p>University fee tables, admission circulars, academic catalogues and policy pages are preferred. UGC records support institutional identity. Search snippets and third-party summaries are not used as final evidence.</p>
    <h2>Cost rules</h2><p>A complete total is shown only when the published components support it. Minimum or discounted figures are labelled. Missing charges are not silently estimated, and a waiver is applied only to a separately verified tuition component.</p>
    <h2>Review process</h2><p>Official pages are monitored for changes and availability. A change creates a human-review signal; it never rewrites published data automatically.</p>
    <h2>Rankings</h2><p>CampusChoice BD does not publish a universal “best university” ranking. Filters and comparisons show fit against the student’s selected needs, with the reasons visible.</p>
  </TrustPage>;
}
