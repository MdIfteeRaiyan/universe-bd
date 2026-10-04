"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { BookmarkCheck, MapPin, Search, Trash2 } from "lucide-react";
import { privateUniversities } from "@/data/private-universities";
import { universityProfilePath } from "@/lib/university-profile";

export function ShortlistWorkspace() {
  const savedValue = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("campuschoice-shortlist-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("campuschoice-shortlist-change", onChange);
      };
    },
    () => localStorage.getItem("campuschoice-bd-shortlist") ?? "{}",
    () => "{}",
  );
  let ids: number[] = [];
  try {
    const parsed = JSON.parse(savedValue);
    ids = Array.isArray(parsed.ids) ? parsed.ids.filter((id: unknown) => Number.isInteger(id)).slice(0, 3) : [];
  } catch { ids = []; }
  const remove = (id: number) => {
    const next = ids.filter((item) => item !== id);
    try {
      const parsed = JSON.parse(localStorage.getItem("campuschoice-bd-shortlist") ?? "{}");
      localStorage.setItem("campuschoice-bd-shortlist", JSON.stringify({ ...parsed, ids: next }));
    } catch { localStorage.setItem("campuschoice-bd-shortlist", JSON.stringify({ ids: next })); }
    window.dispatchEvent(new Event("campuschoice-shortlist-change"));
  };
  const saved = ids.map((id) => privateUniversities.find((item) => item.id === id)).filter(Boolean);
  if (!saved.length) return <div className="rounded-3xl border border-dashed border-slate-600 bg-[#172337] p-8 text-center sm:p-12"><BookmarkCheck className="mx-auto text-slate-500"/><h2 className="mt-4 text-xl font-bold">Nothing saved yet</h2><p className="mt-2 text-sm text-slate-400">Browse universities and use Save on up to three choices.</p><Link href="/explore" className="landing-primary mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 font-bold"><Search size={16}/> Find universities</Link></div>;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{saved.map((university) => university && <article key={university.id} className="surface-card rounded-3xl p-5"><span className="inline-flex rounded-xl bg-[#111b2a] px-3 py-2 text-sm font-black text-[#bbb7ff]">{university.short}</span><h2 className="mt-4 text-xl font-bold">{university.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={14}/>{university.district}, {university.division}</p><p className="mt-4 text-sm text-slate-300">{university.programs.length} programmes listed</p><div className="mt-5 grid grid-cols-[1fr_auto] gap-2"><Link href={universityProfilePath(university)} className="landing-secondary inline-flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-bold">View profile</Link><button type="button" onClick={() => remove(university.id)} className="quiet-action grid min-h-11 min-w-11 place-items-center rounded-xl text-rose-200" aria-label={`Remove ${university.name}`}><Trash2 size={16}/></button></div></article>)}</div>;
}
