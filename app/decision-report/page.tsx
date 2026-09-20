import type { Metadata } from "next";
import { Suspense } from "react";
import DecisionReport from "./report";

export const metadata: Metadata = {
  title: "University Decision Report — CampusChoice BD",
  description: "A printable comparison of shortlisted private universities and source-checked programme information.",
  robots: { index: false, follow: false },
};

export default function DecisionReportPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#101827] p-8 text-slate-100">Preparing report…</main>}>
      <DecisionReport />
    </Suspense>
  );
}
