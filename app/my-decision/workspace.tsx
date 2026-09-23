"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleDollarSign, MapPin, Sparkles } from "lucide-react";
import type { AccommodationMode } from "@/data/models";
import { privateUniversities } from "@/data/private-universities";
import { accommodationLabels, accommodationSetupCosts, districtLivingCosts } from "@/data/living-costs";
import { programmeDirectory } from "@/lib/discovery";
import { createFinancialPlan } from "@/lib/financial-planner";
import { universityProfilePath } from "@/lib/university-profile";
import { trackPrivacyEvent } from "@/lib/privacy-analytics";

const money = (value: number) => `৳${new Intl.NumberFormat("en-IN").format(Math.round(value))}`;

export function DecisionWorkspace() {
  const [programme, setProgramme] = useState("");
  const [division, setDivision] = useState("");
  const [gpa, setGpa] = useState(4);
  const [budget, setBudget] = useState(1500000);
  const [living, setLiving] = useState<AccommodationMode>("mess");
  const [started, setStarted] = useState(false);
  const divisions = [...new Set(privateUniversities.map((university) => university.division))].sort();

  const matches = (() => {
    if (!programme) return [];
    return privateUniversities
      .filter((university) => university.programs.includes(programme))
      .map((university) => {
        const cost = university.programCosts?.find((item) => item.name === programme && !item.pending && item.total > 0);
        const model = districtLivingCosts[university.district] ?? districtLivingCosts[university.division] ?? districtLivingCosts.default;
        const monthlyLow = model.rent[living][0] + model.food[0] + model.transport[0] + model.personal[0];
        const monthlyHigh = model.rent[living][1] + model.food[1] + model.transport[1] + model.personal[1];
        const plan = cost ? createFinancialPlan({ academicTotal: cost.total, studyMonths: 48, monthlyLiving: { low: monthlyLow, high: monthlyHigh }, annualAcademicIncreasePercent: 0, contingencyPercent: 8, setupCost: { low: accommodationSetupCosts[living][0], high: accommodationSetupCosts[living][1] } }) : undefined;
        const reasons = [
          `${programme} is listed`,
          division ? (university.division === division ? `Located in ${division} Division` : `Located in ${university.division} Division`) : `${university.district} location`,
          university.minGpa === undefined ? "General GPA rule needs confirmation" : gpa >= university.minGpa ? `GPA meets the published ${university.minGpa.toFixed(1)} reference` : `Published GPA reference is ${university.minGpa.toFixed(1)}`,
          plan ? (plan.grandTotal.high <= budget ? "Complete planning range fits the family budget" : plan.grandTotal.low <= budget ? "Lower planning range fits; upper range exceeds budget" : "Planning range exceeds the family budget") : "Complete programme cost is still pending",
        ];
        const fitCount = Number(!division || university.division === division) + Number(university.minGpa === undefined || gpa >= university.minGpa) + Number(Boolean(plan && plan.grandTotal.low <= budget)) + Number(Boolean(cost));
        return { university, cost, plan, reasons, fitCount };
      })
      .sort((a, b) => b.fitCount - a.fitCount || (a.plan?.grandTotal.low ?? Infinity) - (b.plan?.grandTotal.low ?? Infinity) || a.university.name.localeCompare(b.university.name))
      .slice(0, 9);
  })();

  const reveal = () => {
    if (!programme) return;
    setStarted(true);
    trackPrivacyEvent("my_decision_completed", { programme, locationSelected: Boolean(division), living });
  };

  return (
    <main className="site-shell min-h-screen bg-[#101827] text-slate-100">
      <a href="#decision-form" className="skip-link">Skip to decision form</a>
      <header className="premium-header border-b border-slate-700"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200"><ArrowLeft size={16} /> Home</Link><b>CampusChoice BD</b></div></header>
      <section className="decision-workspace-hero subpage-hero border-b border-slate-700"><div className="mx-auto max-w-6xl px-5 py-12"><p className="text-sm font-bold text-blue-300">MY DECISION</p><h1 className="editorial-title mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">One calm place to test your plan.</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Enter the essentials once. Every suggestion explains its programme, location, GPA and complete-budget fit—there is no hidden ranking.</p></div></section>
      <section id="decision-form" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-10 outline-none">
        <div className="tool-panel rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-semibold text-slate-200 lg:col-span-2">Programme<select className="field mt-2 min-h-12" value={programme} onChange={(event) => { setProgramme(event.target.value); setStarted(false); }}><option value="">Choose a programme…</option>{programmeDirectory.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-200">Preferred division<select className="field mt-2 min-h-12" value={division} onChange={(event) => setDivision(event.target.value)}><option value="">Any division</option>{divisions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-200">Living arrangement<select className="field mt-2 min-h-12" value={living} onChange={(event) => setLiving(event.target.value as AccommodationMode)}>{Object.entries(accommodationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-200">SSC/HSC reference GPA<input className="field mt-2 min-h-12" type="number" min="2" max="5" step="0.1" value={gpa} onChange={(event) => setGpa(Number(event.target.value))} /></label>
          </div>
          <label className="mt-6 block text-sm font-semibold text-slate-200"><span className="flex justify-between gap-4"><span>Complete four-year family budget</span><b className="text-blue-200">{money(budget)}</b></span><input className="mt-3" type="range" min="500000" max="5000000" step="100000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} aria-label="Complete four-year family budget" /></label>
          <button type="button" disabled={!programme} onClick={reveal} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173b68] px-5 py-3 font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#1d4b80] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"><Sparkles size={18} /> Show transparent matches</button>
        </div>

        {started && <div className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold text-blue-300">EXPLAINED RESULTS</p><h2 className="editorial-title mt-2 text-3xl font-bold">Your strongest visible fits.</h2></div><span className="text-sm text-slate-400">Showing up to 9 · not a universal ranking</span></div><div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{matches.map(({ university, plan, reasons, fitCount }) => <article key={university.id} className="decision-result surface-card flex flex-col rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><b className="rounded-lg bg-slate-950/40 px-3 py-2 text-xs text-blue-200">{university.short}</b><span className="text-xs font-semibold text-emerald-300">{fitCount}/4 visible checks</span></div><h3 className="mt-4 text-xl font-bold">{university.name}</h3><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={14} /> {university.district}, {university.division}</p><ul className="mt-5 grid gap-2 text-sm">{reasons.map((reason, index) => <li key={reason} className="flex items-start gap-2 text-slate-300"><Check size={15} className={`mt-0.5 shrink-0 ${index === 3 && !plan ? "text-amber-300" : "text-emerald-300"}`} /> {reason}</li>)}</ul><div className="mt-5 rounded-xl bg-slate-950/25 p-4"><p className="flex items-center gap-2 text-xs text-slate-400"><CircleDollarSign size={14} /> Academic + living + 8% safety allowance</p><b className="mt-2 block text-lg text-blue-200">{plan ? `${money(plan.grandTotal.low)}–${money(plan.grandTotal.high)}` : "Verification pending"}</b></div><Link href={universityProfilePath(university)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold hover:border-blue-400">Review the evidence</Link></article>)}</div></div>}
      </section>
    </main>
  );
}
