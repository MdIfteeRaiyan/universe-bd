import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = { title: "Terms | CampusChoice BD", alternates: { canonical: "/terms" } };
export default function TermsPage() {
  return <TrustPage eyebrow="TERMS" title="Use the guide as a decision aid." intro="CampusChoice BD helps students compare published information; it does not replace an official admission decision.">
    <h2>Permitted use</h2><p>You may use the website for personal education planning and share links to its public pages. Automated copying, resale or presentation of the database as your own work is not permitted.</p>
    <h2>No admission or scholarship guarantee</h2><p>A match, readiness result or scholarship route is informational. Universities decide admission, credit transfer, waivers, hall allocation and payable fees.</p>
    <h2>Responsible confirmation</h2><p>Before applying or paying, confirm the active intake, deadline, subject requirements and final invoice with the university through the linked official source.</p>
    <h2>Changes</h2><p>Programme and policy information can change. CampusChoice BD may update, correct or temporarily mark information pending when a source changes.</p>
  </TrustPage>;
}
