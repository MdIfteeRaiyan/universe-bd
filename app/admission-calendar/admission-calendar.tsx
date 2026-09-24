"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Search, ShieldCheck } from "lucide-react";
import type { AdmissionCalendarEvent, AdmissionEventKind } from "@/data/admission-calendar";
import { admissionEventStatus, formatAdmissionDate, sortAdmissionEvents } from "@/lib/admission-calendar";

const kindLabels: Record<AdmissionEventKind, string> = {
  application: "Application",
  "admission-test": "Admission test",
  scholarship: "Scholarship",
  result: "Result",
};

const statusLabels = {
  upcoming: "Upcoming",
  "closing-soon": "Closing soon",
  today: "Today",
  closed: "Closed",
};

export function AdmissionCalendar({ events }: { events: AdmissionCalendarEvent[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<AdmissionEventKind | "all">("all");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return sortAdmissionEvents(events).filter((event) =>
      (kind === "all" || event.kind === kind) &&
      (!normalized || `${event.university} ${event.short} ${event.intake} ${event.title}`.toLocaleLowerCase().includes(normalized)),
    );
  }, [events, kind, query]);

  return (
    <main id="top" className="min-h-screen bg-[#101827] text-slate-100">
      <a href="#calendar-results" className="skip-link">Skip to calendar results</a>
      <header className="border-b border-slate-700 bg-[#0b1421]">
        <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"><ArrowLeft size={16} aria-hidden="true" />Back to CampusChoice BD</Link>
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400">Official admission dates</p>
              <h1 className="editorial-title mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Deadlines without the guesswork.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Only dates found on an official university page are listed. Past dates remain visible for context and are never reused for a new intake.</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-300/5 p-5">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={20} aria-hidden="true" /><div><b className="text-emerald-100">Review-first calendar</b><p className="mt-1 text-sm leading-6 text-slate-300">Dates expire automatically. New dates enter a human review queue before publication.</p></div></div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <div className="grid gap-3 rounded-2xl border border-slate-700 bg-[#172337] p-4 sm:grid-cols-[1fr_220px]">
          <label className="relative"><span className="sr-only">Search university or intake</span><Search className="pointer-events-none absolute left-3 top-3.5 text-slate-500" size={18} aria-hidden="true" /><input className="field min-h-12 pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search university or intake..." /></label>
          <label><span className="sr-only">Filter by event type</span><select className="field min-h-12" value={kind} onChange={(event) => setKind(event.target.value as AdmissionEventKind | "all")}><option value="all">All date types</option>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>

        <div id="calendar-results" className="mt-7" tabIndex={-1}>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Published timeline</p><h2 className="mt-2 text-2xl font-bold">{filtered.length} source-checked {filtered.length === 1 ? "date" : "dates"}</h2></div><p className="text-sm text-slate-400">Bangladesh time · checked 23 Sep 2026</p></div>
          {filtered.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.map((event) => {
            const status = admissionEventStatus(event.date);
            return <article key={event.id} className="rounded-2xl border border-slate-700 bg-[#172337] p-5 transition hover:-translate-y-0.5 hover:border-slate-500">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-bold text-blue-200">{kindLabels[event.kind]}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "closed" ? "bg-slate-800 text-slate-400" : "bg-amber-300/10 text-amber-200"}`}>{statusLabels[status]}</span></div>
              <div className="mt-5 flex items-start gap-4"><div className="rounded-xl border border-slate-600 bg-[#111b2a] p-3 text-blue-300"><CalendarDays size={22} aria-hidden="true" /></div><div><p className="text-sm font-semibold text-slate-400">{event.short} · {event.intake}</p><h3 className="mt-1 text-lg font-bold text-white">{event.title}</h3><p className="mt-2 text-xl font-bold text-blue-200">{formatAdmissionDate(event.date)}{event.time ? ` · ${event.time}` : ""}</p></div></div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{event.scope}</p>{event.note ? <p className="mt-3 rounded-xl border border-amber-400/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100">{event.note}</p> : null}
              <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-blue-300 hover:border-blue-400 hover:text-blue-200">{event.sourceLabel}<ExternalLink size={14} aria-hidden="true" /></a>
            </article>;
          })}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-600 p-10 text-center"><CalendarDays className="mx-auto text-slate-500" aria-hidden="true" /><h3 className="mt-3 font-bold">No matching verified date</h3><p className="mt-2 text-sm text-slate-400">Try another university, intake or date type.</p></div>}
        </div>
      </section>
    </main>
  );
}
