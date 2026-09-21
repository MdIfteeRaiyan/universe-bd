"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, GraduationCap, Search, ShieldCheck, X } from "lucide-react";
import { publicUniversities } from "@/data/public-universities";

export default function PublicDirectory() {
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const divisions = [...new Set(publicUniversities.map((item) => item.division))].sort();
  const filtered = useMemo(
    () => publicUniversities.filter((university) => {
      const searchable = [university.name, university.short, university.district, university.area, ...university.programs]
        .filter(Boolean).join(" ").toLowerCase();
      return (!division || university.division === division) && (!normalizedQuery || searchable.includes(normalizedQuery));
    }),
    [division, normalizedQuery],
  );
  const hasFilters = Boolean(query || division);

  return (
    <main className="min-h-screen bg-[#101827] text-slate-100">
      <a href="#public-directory" className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white focus:not-sr-only">Skip to public university directory</a>
      <header className="border-b border-slate-700">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"><ArrowLeft size={16} aria-hidden="true" /> Private university guide</Link>
          <b>CampusChoice BD</b>
        </div>
      </header>
      <section className="border-b border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
          <p className="text-sm font-bold text-blue-400">PUBLIC UNIVERSITY GUIDE</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">A separate, simpler public admission path.</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Search the verified engineering cohort by university, location or programme. Admission units, merit positions, quotas, seats and session circulars stay separate from private-university results.</p>
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">Current-session costs, deadlines, seats and eligibility remain pending until supported by an official circular. Directory information does not imply admission eligibility.</div>
        </div>
      </section>
      <section id="public-directory" tabIndex={-1} className="mx-auto max-w-7xl px-5 py-10 outline-none lg:px-8 lg:py-12">
        <div className="surface-card rounded-2xl p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem_auto] md:items-end">
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Search university or programme</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field min-h-12 pl-10" placeholder="Search CSE, BUET, Chattogram..." /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-200">Division</span><select value={division} onChange={(event) => setDivision(event.target.value)} className="field min-h-12"><option value="">Search division...</option>{divisions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button type="button" onClick={() => { setQuery(""); setDivision(""); }} disabled={!hasFilters} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 text-sm font-semibold text-slate-200 enabled:hover:border-blue-400 disabled:cursor-not-allowed disabled:opacity-40"><X size={16} aria-hidden="true" /> Clear</button>
          </div>
        </div>
        <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-blue-400">ENGINEERING BATCH</p><h2 className="mt-2 text-2xl font-bold">Verified directory</h2></div><span className="text-sm text-slate-400" role="status" aria-live="polite">{filtered.length} of {publicUniversities.length} profiles</span></div>
        {filtered.length ? <div className="mt-6 grid gap-5 md:grid-cols-2">{filtered.map((university) => (
          <article key={university.id} className="surface-card rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200"><GraduationCap size={14} aria-hidden="true" /> Public engineering</span><h3 className="mt-3 text-xl font-bold">{university.name}</h3><p className="mt-1 text-sm text-slate-400">{university.area}, {university.district}</p></div><b className="rounded-lg bg-[#111b2a] px-3 py-2 text-blue-300">{university.short}</b></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-[#111b2a] p-3"><span className="block text-xs text-slate-400">Programmes listed</span><b>{university.programs.length}</b></div><div className="rounded-lg bg-[#111b2a] p-3"><span className="block text-xs text-slate-400">Session details</span><b className="text-amber-200">Pending circular</b></div></div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck size={14} aria-hidden="true" /> Sources checked {university.verifiedAt}</div>
            <details className="mt-4 rounded-xl border border-slate-700 bg-[#111b2a] p-4"><summary className="cursor-pointer font-semibold text-slate-200">View all {university.programs.length} programmes</summary><ul className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">{university.programs.map((programme) => <li key={programme} className="rounded-md bg-slate-700/50 px-3 py-2">{programme}</li>)}</ul></details>
            <div className="mt-5 grid gap-2 border-t border-slate-700 pt-4">{university.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#111b2a] px-4 py-3 text-sm font-semibold text-blue-300 hover:text-blue-200">{source.label}<ExternalLink size={14} aria-hidden="true" /></a>)}</div>
          </article>
        ))}</div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-600 bg-[#172337] p-8 text-center"><Search className="mx-auto text-slate-500" aria-hidden="true" /><h3 className="mt-3 text-lg font-bold">No matching public university</h3><p className="mt-2 text-sm text-slate-400">Try another programme, university name or division.</p></div>}
      </section>
    </main>
  );
}
