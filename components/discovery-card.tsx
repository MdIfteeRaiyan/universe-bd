import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { University } from "@/data/models";
import { universityProfilePath } from "@/lib/university-profile";

const money = (value: number) =>
  `৳${new Intl.NumberFormat("en-IN").format(Math.round(value))}`;

export function DiscoveryCard({
  university,
  programme,
}: {
  university: University;
  programme?: string;
}) {
  const cost = programme
    ? university.programCosts?.find((item) => item.name === programme)
    : undefined;
  return (
    <article className="discovery-card surface-card flex h-full flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-lg bg-slate-950/40 px-3 py-2 text-xs font-black tracking-wide text-blue-200">
          {university.short}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
          <ShieldCheck size={13} aria-hidden="true" /> Checked
        </span>
      </div>
      <h2 className="mt-4 text-xl font-bold">{university.name}</h2>
      <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
        <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        {university.area ? `${university.area}, ` : ""}{university.district}
      </p>
      <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950/20 p-4 text-sm">
        {programme ? (
          <>
            <span className="text-slate-400">Published {programme} total</span>
            <b className={`mt-1 block ${cost && !cost.pending && cost.total > 0 ? "text-xl text-blue-200" : "text-amber-200"}`}>
              {cost && !cost.pending && cost.total > 0 ? money(cost.total) : "Verification pending"}
            </b>
          </>
        ) : (
          <>
            <span className="text-slate-400">Undergraduate programmes</span>
            <b className="mt-1 block text-lg text-slate-100">{university.programs.length} listed</b>
          </>
        )}
      </div>
      <Link href={universityProfilePath(university)} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-blue-400">
        View verified profile
      </Link>
    </article>
  );
}
