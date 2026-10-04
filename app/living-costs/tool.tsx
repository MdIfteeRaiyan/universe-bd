"use client";

import { useMemo, useState } from "react";
import { House, Utensils, Bus, WalletCards } from "lucide-react";
import type { AccommodationMode } from "@/data/models";
import { accommodationLabels, accommodationSetupCosts, districtLivingCosts, livingCostChecked } from "@/data/living-costs";

const money = (value: number) => `৳${new Intl.NumberFormat("en-IN").format(value)}`;

export function LivingCostTool() {
  const [location, setLocation] = useState("Dhaka");
  const [mode, setMode] = useState<AccommodationMode>("mess");
  const [months, setMonths] = useState(12);
  const model = districtLivingCosts[location] ?? districtLivingCosts.default;
  const rows = useMemo(() => [
    { label: "Accommodation", icon: House, range: model.rent[mode] },
    { label: "Food", icon: Utensils, range: model.food },
    { label: "Transport", icon: Bus, range: model.transport },
    { label: "Personal", icon: WalletCards, range: model.personal },
  ], [mode, model]);
  const monthly = rows.reduce((sum, row) => [sum[0] + row.range[0], sum[1] + row.range[1]], [0, 0]);
  const setup = accommodationSetupCosts[mode];
  return (
    <div className="tool-panel rounded-3xl border border-slate-700 bg-[#172337] p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-bold">Location<select className="field mt-2 min-h-12" value={location} onChange={(e) => setLocation(e.target.value)}><option>Dhaka</option><option>Chattogram</option><option value="default">Other district</option></select></label>
        <label className="text-sm font-bold">Living arrangement<select className="field mt-2 min-h-12" value={mode} onChange={(e) => setMode(e.target.value as AccommodationMode)}>{Object.entries(accommodationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-bold">Planning period<select className="field mt-2 min-h-12" value={months} onChange={(e) => setMonths(Number(e.target.value))}><option value={6}>6 months</option><option value={12}>1 year</option><option value={24}>2 years</option><option value={48}>4 years</option></select></label>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{rows.map(({ label, icon: Icon, range }) => <div key={label} className="living-cost-row rounded-2xl border border-slate-700 bg-[#111b2a] p-4"><Icon size={18} className="text-[#bbb7ff]" /><p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><b className="mt-1 block text-lg">{money(range[0])}–{money(range[1])}<span className="ml-1 text-xs font-normal text-slate-500">/month</span></b></div>)}</div>
      <div className="mt-6 rounded-3xl border border-[#d6f36a]/25 bg-[#d6f36a]/5 p-5 sm:p-6"><p className="text-sm text-slate-300">Estimated monthly living cost</p><p className="mt-1 text-3xl font-black text-[#d6f36a]">{money(monthly[0])}–{money(monthly[1])}</p><div className="mt-5 grid gap-3 border-t border-slate-700 pt-4 sm:grid-cols-2"><p className="text-sm text-slate-300">{months}-month estimate<br/><b className="text-white">{money(monthly[0] * months + setup[0])}–{money(monthly[1] * months + setup[1])}</b></p><p className="text-sm text-slate-300">One-time setup allowance<br/><b className="text-white">{money(setup[0])}–{money(setup[1])}</b></p></div></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Planning data checked {livingCostChecked}. Actual rent, meals and transport vary by area and lifestyle. Confirm university hall availability directly.</p>
    </div>
  );
}
