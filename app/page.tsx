import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  CalendarDays,
  ChartNoAxesCombined,
  GraduationCap,
  House,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { privateUniversities } from "@/data/private-universities";
import { gradeCharts } from "@/data/grade-charts";

const verifiedTotals = privateUniversities.reduce(
  (total, university) => total + (university.programCosts?.filter((item) => !item.pending && item.total > 0).length ?? 0),
  0,
);

const journeys = [
  { href: "/explore", icon: Search, title: "Find universities", copy: "Browse programmes, locations and verified academic costs.", tone: "lime" },
  { href: "/my-decision", icon: Sparkles, title: "Build my decision", copy: "Test programme, GPA, city and complete family budget together.", tone: "violet" },
  { href: "/shortlist", icon: BookmarkCheck, title: "Review saved choices", copy: "Return to the universities saved in this browser.", tone: "blue" },
  { href: "/living-costs", icon: House, title: "Plan living costs", copy: "Compare hall, hostel, mess and family-living estimates.", tone: "mint" },
  { href: "/grade-scales", icon: ChartNoAxesCombined, title: "Check grade scales", copy: "Read each university’s own verified grading policy.", tone: "amber" },
  { href: "/admission-calendar", icon: CalendarDays, title: "Check admission dates", copy: "Follow source-checked applications, tests and results.", tone: "coral" },
];

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen text-slate-100">
      <a href="#start" className="skip-link">Skip to choices</a>
      <header className="landing-header">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="brand-lockup flex min-w-0 items-center gap-3">
            <span className="brand-mark-wrap"><Image className="logo-mark" src="/logo-mark.svg" alt="" width={44} height={44} priority /></span>
            <span className="min-w-0"><b className="block truncate">CampusChoice BD</b><small className="text-xs text-slate-400">Clearer university decisions</small></span>
          </Link>
          <Link href="/explore" className="landing-header-action inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">Explore <ArrowRight size={15} /></Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-glow landing-glow-one" aria-hidden="true" />
        <div className="landing-glow landing-glow-two" aria-hidden="true" />
        <div className="relative z-[1] mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-20">
          <div className="landing-copy">
            <p className="landing-kicker">SOURCE-CHECKED UNIVERSITY GUIDANCE</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[.94] tracking-[-.06em] sm:text-6xl lg:text-7xl">One clear place for your <span>next campus.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Choose the task you need. CampusChoice keeps university discovery, complete costs, grade scales and admission dates on focused pages—without the crowded dashboard.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/explore" className="landing-primary inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 font-bold">Find universities <ArrowRight size={17} /></Link>
              <Link href="/my-decision" className="landing-secondary inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3 font-bold"><Sparkles size={17} /> Try My Decision</Link>
            </div>
            <div className="landing-proof mt-8 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10">
              <div><b>{privateUniversities.length}</b><span>universities</span></div>
              <div><b>{verifiedTotals}</b><span>verified totals</span></div>
              <div><b>{Object.keys(gradeCharts).length}</b><span>grade policies</span></div>
            </div>
          </div>

          <div className="landing-feature-card">
            <span className="landing-card-label">START SIMPLY</span>
            <div className="landing-card-icon"><ShieldCheck size={26} /></div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#bbb7ff]">CampusChoice promise</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">Facts first. Pressure off.</h2>
            <p className="mt-4 leading-7 text-slate-300">Every published cost or rule points back to a source. Missing information stays visibly pending instead of becoming a guess.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="landing-mini-proof"><ShieldCheck size={17} /><span><b>Official sources</b><small>Linked and dated</small></span></div>
              <div className="landing-mini-proof"><GraduationCap size={17} /><span><b>Separate paths</b><small>Public and private</small></span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="start" tabIndex={-1} className="landing-journeys outline-none">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="landing-kicker">CHOOSE YOUR NEXT STEP</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Open one focused workspace.</h2></div>
            <Link href="/tools" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#bbb7ff]">See all tools <ArrowRight size={15} /></Link>
          </div>
          <div className="landing-journey-grid mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journeys.map(({ href, icon: Icon, title, copy, tone }, index) => (
              <Link key={href} href={href} className={`landing-journey-card tone-${tone}`} style={{ "--journey-index": index } as CSSProperties}>
                <span className="landing-journey-icon"><Icon size={21} /></span>
                <h3>{title}</h3><p>{copy}</p><span className="landing-journey-link">Open page <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
          <Link href="/public-universities" className="landing-public mt-5 flex min-h-20 items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:px-6"><span><b className="block">Looking for public universities?</b><small className="mt-1 block text-slate-400">Open the separate public admission experience.</small></span><ArrowRight className="shrink-0" /></Link>
        </div>
      </section>

      <footer className="landing-footer border-t border-slate-800"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-sm text-slate-500 lg:px-8"><b className="text-slate-300">CampusChoice BD</b><span>Independent, source-checked guidance for Bangladesh.</span><nav className="flex gap-4"><Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/disclaimer">Disclaimer</Link></nav></div></footer>
    </main>
  );
}
