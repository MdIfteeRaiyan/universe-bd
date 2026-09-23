import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = { title: "Disclaimer | CampusChoice BD", alternates: { canonical: "/disclaimer" } };
export default function DisclaimerPage() {
  return <TrustPage eyebrow="DISCLAIMER" title="Independent guidance for students." intro="CampusChoice BD is an independent student-built project and is not an official service of UGC or any listed university.">
    <h2>Independent status</h2><p>University names, abbreviations and linked materials belong to their respective institutions. Inclusion does not imply endorsement, partnership or affiliation.</p>
    <h2>Information limits</h2><p>Fees, eligibility, programmes, deadlines and scholarship policies can change without notice. “Checked” describes the cited source and review date—not a permanent guarantee.</p>
    <h2>Financial decisions</h2><p>Planner results are scenarios for budgeting. Living costs, annual increases, waivers and safety allowances are assumptions selected by the user or presented as ranges.</p>
    <h2>Final authority</h2><p>The university’s current written offer, invoice, admission circular and authorised office remain the final authority.</p>
  </TrustPage>;
}
