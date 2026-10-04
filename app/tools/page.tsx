import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChartNoAxesCombined, GraduationCap, House, Sparkles } from "lucide-react";
import { FocusedToolShell } from "@/components/focused-tool-shell";

export const metadata: Metadata = {
  title: "Student Tools | CampusChoice BD",
  description: "Open one focused university decision tool at a time.",
};

const tools = [
  { href: "/my-decision", icon: Sparkles, title: "My Decision", copy: "Programme, GPA, location and complete family budget in one transparent shortlist." },
  { href: "/living-costs", icon: House, title: "Living Cost", copy: "Compare hall, hostel, mess and family-living monthly estimates by location." },
  { href: "/grade-scales", icon: ChartNoAxesCombined, title: "University Grade Scale", copy: "Review only the official grading policies that have been source-checked." },
  { href: "/admission-calendar", icon: CalendarDays, title: "Admission Dates", copy: "Track verified applications, tests, results and scholarship deadlines." },
  { href: "/public-universities", icon: GraduationCap, title: "Public Universities", copy: "Use the separate public-university directory without mixing admission paths." },
];

export default function ToolsPage() {
  return (
    <FocusedToolShell eyebrow="FOCUSED TOOLS" title="One decision at a time." description="No crowded dashboard. Choose the task you need, finish it on a focused page, then return to university browsing.">
      <div className="focused-tool-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ href, icon: Icon, title, copy }, index) => (
          <Link key={href} href={href} className="focused-tool-card surface-card group flex min-h-56 flex-col rounded-3xl p-5 sm:p-6" style={{ "--tool-index": index } as CSSProperties}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d6f36a] text-[#172033]"><Icon size={22} aria-hidden="true" /></span>
            <h2 className="mt-5 text-xl font-bold">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{copy}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#bbb7ff]">Open tool <ArrowRight size={15} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </FocusedToolShell>
  );
}
