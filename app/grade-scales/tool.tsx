"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { gradeCharts } from "@/data/grade-charts";
import { privateUniversities } from "@/data/private-universities";

export function GradeScaleTool() {
  const [short, setShort] = useState("");
  const university = privateUniversities.find((item) => item.short === short);
  const chart = short ? gradeCharts[short] : undefined;
  return (
    <div className="tool-panel rounded-3xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
      <label className="block text-sm font-bold text-slate-200">University
        <select className="field mt-2 min-h-12" value={short} onChange={(event) => setShort(event.target.value)}>
          <option value="">Choose a university…</option>
          {privateUniversities.map((item) => <option key={item.id} value={item.short}>{item.name} ({item.short})</option>)}
        </select>
      </label>
      {!short ? <Empty text="Select a university to view its verified scale." /> : !chart ? <Empty text={`${university?.name ?? short}'s official grading policy is still pending verification.`} /> : (
        <div className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold">{university?.name}</h2><p className="mt-1 text-sm text-emerald-300"><ShieldCheck className="mr-1 inline" size={15} />Checked {chart.checked}</p></div><a href={chart.source} target="_blank" rel="noreferrer" className="quiet-action inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold">Official policy <ExternalLink size={14} /></a></div>
          <p className="mt-5 rounded-2xl border border-[#bbb7ff]/20 bg-[#6863e7]/10 p-4 text-sm leading-6 text-slate-300">{chart.note}</p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700" role="region" aria-label={`${university?.name} grade scale`} tabIndex={0}>
            <table className="w-full min-w-[30rem] text-left text-sm"><thead className="bg-[#111b2a] text-slate-300"><tr><th className="p-3">Marks</th><th className="p-3">Letter</th><th className="p-3">Grade point</th></tr></thead><tbody>{chart.bands.map((band) => <tr key={`${band.score}-${band.letter}`} className="border-t border-slate-700"><td className="p-3">{band.score}</td><td className="p-3 font-bold text-[#d6f36a]">{band.letter}</td><td className="p-3">{band.point}</td></tr>)}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="mt-6 rounded-2xl border border-dashed border-slate-600 p-8 text-center text-sm leading-6 text-slate-400">{text}</div>; }
