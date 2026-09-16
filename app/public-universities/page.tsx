import Link from "next/link";
import { ArrowLeft, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";
import { publicUniversities } from "@/data/public-universities";

export const metadata = {
  title: "Public Universities — UniVerse BD",
  description: "A separate verified public-university admission guide for Bangladesh.",
};

export default function PublicUniversitiesPage() {
  return (
    <main className="min-h-screen bg-[#101827] text-slate-100">
      <header className="border-b border-slate-700">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300"><ArrowLeft size={16} /> Private university guide</Link>
          <b>UniVerse BD</b>
        </div>
      </header>
      <section className="border-b border-slate-700 bg-[#121c2b]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <p className="text-sm font-bold text-blue-400">PUBLIC UNIVERSITY GUIDE</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">Public admission needs its own clear path.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Public universities are kept separate because admission units, merit positions, subject allocation, quotas, seats and session circulars work differently from private admission.</p>
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">This section is being verified in depth. No academic cost, deadline, seat count or eligibility rule will be shown as confirmed until it is supported by a current official circular.</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-blue-400">ENGINEERING BATCH</p><h2 className="mt-2 text-2xl font-bold">First verification cohort</h2></div><span className="text-sm text-slate-400">{publicUniversities.length} profiles</span></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {publicUniversities.map((university) => (
            <article key={university.id} className="rounded-2xl border border-slate-700 bg-[#172337] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200"><GraduationCap size={14} /> Public engineering</span><h3 className="mt-3 text-xl font-bold">{university.name}</h3><p className="mt-1 text-sm text-slate-400">{university.area}, {university.district}</p></div><b className="rounded-lg bg-[#111b2a] px-3 py-2 text-blue-300">{university.short}</b></div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-[#111b2a] p-3"><span className="block text-xs text-slate-400">Programmes listed</span><b>{university.programs.length}</b></div><div className="rounded-lg bg-[#111b2a] p-3"><span className="block text-xs text-slate-400">Deep verification</span><b className="text-amber-200">In progress</b></div></div>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck size={14} /> Sources checked {university.verifiedAt}</div>
              <div className="mt-4 flex flex-wrap gap-2">{university.programs.slice(0, 6).map((programme) => <span key={programme} className="rounded-md bg-slate-700/70 px-2 py-1 text-xs text-slate-300">{programme}</span>)}{university.programs.length > 6 && <span className="px-2 py-1 text-xs text-slate-500">+{university.programs.length - 6} more</span>}</div>
              <div className="mt-5 grid gap-2 border-t border-slate-700 pt-4">{university.sources?.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-between gap-3 rounded-lg bg-[#111b2a] px-4 py-3 text-sm font-semibold text-blue-300">{source.label}<ExternalLink size={14} /></a>)}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
