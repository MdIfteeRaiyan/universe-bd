"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Printer, ShieldCheck } from "lucide-react";
import { privateUniversities } from "@/data/private-universities";
import type { ProgramCost, University } from "@/data/models";
import { parseSharedShortlist } from "@/lib/shortlist-share";

const money = (value: number) =>
  `৳${new Intl.NumberFormat("en-IN").format(Math.round(value))}`;

const programMatches = (name: string, selected: string) =>
  name === selected ||
  (selected === "BBA" && (name === "BBA General" || name.startsWith("BBA in ")));

function programmeCost(university: University, programme: string): ProgramCost | undefined {
  if (!programme) return undefined;
  return university.programCosts?.find((item) => programMatches(item.name, programme));
}

export default function DecisionReport() {
  const searchParams = useSearchParams();
  const parsed = parseSharedShortlist(
    `?${searchParams.toString()}`,
    new Set(privateUniversities.map((university) => university.id)),
  );
  const choices = (parsed?.ids ?? [])
    .map((id) => privateUniversities.find((university) => university.id === id))
    .filter((university): university is University => Boolean(university));
  const programme = parsed?.programme ?? "";
  const generatedOn = new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (choices.length < 2) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101827] px-5 text-slate-100">
        <div className="max-w-lg rounded-2xl border border-slate-700 bg-[#172337] p-8 text-center">
          <h1 className="text-2xl font-bold">Choose at least two universities</h1>
          <p className="mt-3 leading-7 text-slate-300">Create a shortlist first, then open its decision report.</p>
          <Link href="/#universities" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white">Build my shortlist</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="site-shell decision-report min-h-screen bg-[#101827] text-slate-100">
      <a href="#decision-report-content" className="skip-link">Skip to decision report</a>
      <header className="premium-header border-b border-slate-700 bg-[#101827]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={42} height={42} />
            <span><b className="block">CampusChoice BD</b><small className="text-slate-400">University decision report</small></span>
          </Link>
          <div className="flex gap-2">
            <Link href={`/?${searchParams.toString()}#shortlist`} className="inline-flex min-h-11 items-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold">Edit shortlist</Link>
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Printer size={17} aria-hidden="true" /> Print or save PDF</button>
          </div>
        </div>
      </header>

      <section id="decision-report-content" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-10 outline-none">
        <p className="text-sm font-bold tracking-wide text-blue-400">PERSONAL DECISION REPORT</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Compare your shortlisted universities.</h1>
            <p className="mt-3 text-slate-300">Programme: <b className="text-white">{programme || "General overview"}</b></p>
          </div>
          <p className="text-sm text-slate-400">Prepared {generatedOn}</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {choices.map((university) => {
            const cost = programmeCost(university, programme);
            const available = !programme || university.programs.some((item) => programMatches(item, programme));
            return (
              <article key={university.id} className="surface-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-blue-300">{university.short}</p>
                    <h2 className="mt-1 text-xl font-bold">{university.name}</h2>
                    <p className="mt-2 text-sm text-slate-400">{[university.area, university.district, university.division].filter(Boolean).join(", ")}</p>
                  </div>
                  <ShieldCheck className={university.status === "Official" ? "text-emerald-400" : "text-amber-300"} aria-hidden="true" />
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <ReportFact label="Programme" value={programme ? (available ? "Listed" : "Not listed") : `${university.programs.length} programmes listed`} />
                  <ReportFact label="Published total" value={!programme ? (university.totalCost ? money(university.totalCost) : "Select a programme") : cost && !cost.pending && cost.total > 0 ? money(cost.total) : "Verification pending"} />
                  <ReportFact label="Credits" value={cost?.credits ? String(cost.credits) : "Not verified"} />
                  <ReportFact label="Minimum GPA" value={university.minGpa ? university.minGpa.toFixed(1) : "Programme rules apply / pending"} />
                  <ReportFact label="Scholarships" value={university.scholarships?.length ? `${university.scholarships.length} published notes` : "Verification pending"} />
                  <ReportFact label="Last checked" value={university.verifiedAt ?? "Pending"} />
                </dl>
                <div className="mt-5 border-t border-slate-700 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Official sources</p>
                  <div className="mt-2 grid gap-2">
                    {university.sources?.slice(0, 4).map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-300">{source.label} <ExternalLink size={13} aria-hidden="true" /></a>
                    )) ?? <span className="text-sm text-amber-200">Source verification pending</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-300/5 p-5 text-sm leading-6 text-slate-300">
          <b className="text-amber-200">Before applying:</b> Confirm the current intake, admission deadline, programme-specific subject requirements and payable fees directly with the university. Pending information is never estimated in this report.
        </div>
      </section>
    </main>
  );
}

function ReportFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-700/70 pb-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-semibold text-slate-100">{value}</dd>
    </div>
  );
}
