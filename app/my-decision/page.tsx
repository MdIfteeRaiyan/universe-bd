import type { Metadata } from "next";
import { DecisionWorkspace } from "./workspace";

export const metadata: Metadata = {
  title: "My University Decision | CampusChoice BD",
  description: "Build a transparent university shortlist using programme, GPA, location and a complete family budget.",
  alternates: { canonical: "/my-decision" },
};

export default function MyDecisionPage() {
  return <DecisionWorkspace />;
}
