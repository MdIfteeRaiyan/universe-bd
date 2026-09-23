"use client";

import { useState } from "react";
import { ClipboardCheck, Flag, Send } from "lucide-react";

export function ReportUpdate({ university }: { university: string }) {
  const [field, setField] = useState("Programme or cost");
  const [source, setSource] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const feedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL;
  const report = `CampusChoice BD correction report\nUniversity: ${university}\nAffected field: ${field}\nOfficial source: ${source || "Not supplied"}\nDetails: ${details || "Not supplied"}`;

  const prepare = async () => {
    if (!details.trim()) {
      setMessage("Please describe what appears outdated.");
      return;
    }
    if (feedbackEmail) {
      window.location.href = `mailto:${feedbackEmail}?subject=${encodeURIComponent(`CampusChoice BD correction — ${university}`)}&body=${encodeURIComponent(report)}`;
      setMessage("Your email app should open with the report. Nothing was sent automatically.");
      return;
    }
    try {
      await navigator.clipboard.writeText(report);
      setMessage("Report copied. Send it to the project creator through LinkedIn or GitHub.");
    } catch {
      window.prompt("Copy this correction report", report);
      setMessage("Report prepared. Nothing was submitted automatically.");
    }
  };

  return (
    <details className="report-update rounded-xl border border-slate-700 bg-slate-950/20 p-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-slate-200"><Flag size={16} className="text-amber-300" /> Report outdated information</summary>
      <div className="mt-4 grid gap-4 border-t border-slate-700 pt-4">
        <label className="text-sm font-semibold text-slate-300">Affected information<select className="field mt-2" value={field} onChange={(event) => setField(event.target.value)}><option>Programme or cost</option><option>Admission requirement</option><option>Scholarship or waiver</option><option>Location or identity</option><option>Official source link</option></select></label>
        <label className="text-sm font-semibold text-slate-300">Official source link <span className="font-normal text-slate-500">(recommended)</span><input className="field mt-2" type="url" inputMode="url" value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://university.edu/..." /></label>
        <label className="text-sm font-semibold text-slate-300">What should be reviewed?<textarea className="field mt-2 min-h-28 resize-y" value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1200} placeholder="Briefly explain the outdated or missing information." /></label>
        <button type="button" onClick={prepare} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-400/40 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-400/20">{feedbackEmail ? <Send size={16} /> : <ClipboardCheck size={16} />} Prepare correction report</button>
        <p className="min-h-5 text-xs leading-5 text-slate-400" aria-live="polite">{message || "The report stays on your device until you choose to send or copy it."}</p>
        {!feedbackEmail && <p className="flex flex-wrap gap-3 text-xs"><a className="font-semibold text-blue-300 hover:text-blue-200" href="https://www.linkedin.com/in/md-iftee-raiyan-b20336386/" target="_blank" rel="noreferrer">Send via LinkedIn ↗</a><a className="font-semibold text-blue-300 hover:text-blue-200" href="https://github.com/MdIfteeRaiyan/" target="_blank" rel="noreferrer">Send via GitHub ↗</a></p>}
      </div>
    </details>
  );
}
