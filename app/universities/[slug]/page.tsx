import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { ReportUpdate } from "@/components/report-update";
import { privateUniversities } from "@/data/private-universities";
import {
  universityFromProfileSlug,
  universityProfileSlug,
} from "@/lib/university-profile";

type ProfilePageProps = { params: Promise<{ slug: string }> };

const money = (value: number) =>
  value > 0
    ? `৳${new Intl.NumberFormat("en-IN").format(Math.round(value))}`
    : "Pending";

export const dynamicParams = false;

export function generateStaticParams() {
  return privateUniversities.map((university) => ({
    slug: universityProfileSlug(university),
  }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const university = universityFromProfileSlug(privateUniversities, (await params).slug);
  if (!university) return {};
  const description = `Review ${university.name} programmes, published costs, admission information, scholarships and official sources on CampusChoice BD.`;
  return {
    title: `${university.name} — Programmes and Costs | CampusChoice BD`,
    description,
    alternates: { canonical: `/universities/${universityProfileSlug(university)}` },
    openGraph: { title: `${university.name} | CampusChoice BD`, description },
  };
}

export default async function UniversityProfilePage({ params }: ProfilePageProps) {
  const university = universityFromProfileSlug(privateUniversities, (await params).slug);
  if (!university) notFound();
  const verifiedCosts = university.programCosts?.filter(
    (programme) => !programme.pending && programme.total > 0,
  ) ?? [];
  const pendingCosts = university.programCosts?.filter(
    (programme) => programme.pending || programme.total <= 0,
  ) ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name,
    alternateName: university.short,
    address: university.address ?? [university.area, university.district, university.division, "Bangladesh"].filter(Boolean).join(", "),
    url: university.sources?.[0]?.url,
    subjectOf: `https://campuschoice-bd.vercel.app/universities/${universityProfileSlug(university)}`,
  };

  return (
    <main className="site-shell min-h-screen bg-[#101827] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <a href="#profile-content" className="skip-link">Skip to university profile</a>
      <header className="premium-header border-b border-slate-700 bg-[#101827]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="brand-lockup flex items-center gap-3">
            <span className="brand-mark-wrap"><Image src="/logo-mark.svg" alt="" width={42} height={42} priority /></span>
            <span><b className="block">CampusChoice BD</b><small className="text-slate-400">Private university profile</small></span>
          </Link>
          <Link href="/#universities" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold hover:border-blue-400">
            <ArrowLeft size={16} aria-hidden="true" /> <span className="hidden sm:inline">University finder</span><span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <section className="profile-hero subpage-hero border-b border-slate-700 bg-gradient-to-br from-[#172337] to-[#101827]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-blue-400/10 px-3 py-1 font-bold text-blue-200">{university.short}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold ${university.status === "Official" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>
                  <ShieldCheck size={14} aria-hidden="true" /> {university.status === "Official" ? `Checked ${university.verifiedAt}` : "Verification pending"}
                </span>
              </div>
              <h1 className="editorial-title mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">{university.name}</h1>
              <p className="mt-4 flex items-start gap-2 text-slate-300"><MapPin size={18} className="mt-0.5 shrink-0 text-blue-300" aria-hidden="true" /> {university.address ?? [university.area, university.district, university.division].filter(Boolean).join(", ")}</p>
            </div>
            <div className="grid min-w-52 grid-cols-2 gap-2 rounded-xl border border-slate-700 bg-[#111b2a] p-4 text-center">
              <ProfileMetric label="Programmes" value={String(university.programs.length)} />
              <ProfileMetric label="Verified totals" value={String(verifiedCosts.length)} />
            </div>
          </div>
        </div>
      </section>

      <section id="profile-content" tabIndex={-1} className="mx-auto grid max-w-6xl gap-6 px-5 py-10 outline-none lg:grid-cols-[1.35fr_.65fr]">
        <div className="motion-cluster space-y-6">
          <ProfileSection title="Undergraduate programmes" note={university.programCatalogComplete ? "Complete official catalogue" : "Catalogue verification is still in progress"}>
            {university.programs.length ? (
              <div className="flex flex-wrap gap-2">
                {university.programs.map((programme) => <span key={programme} className="rounded-lg border border-slate-700 bg-[#111b2a] px-3 py-2 text-sm text-slate-200">{programme}</span>)}
              </div>
            ) : <PendingMessage text="The current official programme catalogue has not yet been verified." />}
          </ProfileSection>

          <ProfileSection title="Published programme costs" note="Totals are shown only when a complete official amount can be supported">
            {verifiedCosts.length ? (
              <div className="overflow-x-auto rounded-xl border border-slate-700" role="region" aria-label="Published programme costs" tabIndex={0}>
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[#111b2a] text-slate-300"><tr><th className="p-3">Programme</th><th className="p-3">Credits</th><th className="p-3">Semesters</th><th className="p-3">Published total</th></tr></thead>
                  <tbody>{verifiedCosts.map((programme) => <tr key={programme.name} className="border-t border-slate-700"><td className="p-3 font-semibold">{programme.name}</td><td className="p-3 text-slate-300">{programme.credits || "Not separated"}</td><td className="p-3 text-slate-300">{programme.semesters ?? "Not published"}</td><td className="p-3 font-bold text-blue-300">{money(programme.total)}{programme.minimum ? "+" : ""}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <PendingMessage text="No complete current programme total has been verified. CampusChoice BD does not estimate it." />}
            {pendingCosts.length > 0 && <p className="mt-4 text-sm leading-6 text-amber-200">{pendingCosts.length} listed {pendingCosts.length === 1 ? "programme has" : "programmes have"} cost verification pending.</p>}
          </ProfileSection>

          <ProfileSection title="Admission information" note="Programme subject rules and admission tests may apply separately">
            {university.admissionRules ? <div className="space-y-4"><p className="leading-7 text-slate-200">{university.admissionRules.generalRule}</p>{university.admissionRules.programmeRules?.map((rule) => <div key={`${rule.programmes.join("-")}-${rule.summary}`} className="rounded-xl border border-slate-700 bg-[#111b2a] p-4"><b>{rule.programmes.join(", ")}</b><p className="mt-2 text-sm leading-6 text-slate-300">{rule.summary}</p>{rule.requiredSubjects?.length ? <p className="mt-2 text-sm text-blue-200">Required subjects: {rule.requiredSubjects.join(", ")}</p> : null}</div>)}</div> : <PendingMessage text="Current official admission requirements are still being verified." />}
          </ProfileSection>

          <ProfileSection title="Scholarships and waivers" note="Eligibility never guarantees an award; confirm the active intake policy">
            {university.scholarships?.length ? <ul className="grid gap-3">{university.scholarships.map((item) => <li key={item} className="rounded-xl border border-emerald-500/20 bg-emerald-400/5 p-4 text-sm leading-6 text-slate-200">{item}</li>)}</ul> : <PendingMessage text="Current numerical scholarship or waiver rules have not yet been verified." />}
          </ProfileSection>
        </div>

        <aside className="motion-cluster space-y-6">
          <ProfileSection title="Verification summary">
            <dl className="grid gap-3 text-sm">
              <ProfileFact label="Profile stage" value={university.status === "Official" ? "Official sources checked" : "Directory identity only"} />
              <ProfileFact label="Programme catalogue" value={university.programCatalogComplete ? "Complete" : "In progress"} />
              <ProfileFact label="Verified programme totals" value={String(verifiedCosts.length)} />
              <ProfileFact label="Last checked" value={university.verifiedAt ?? "Pending"} />
              <ProfileFact label="Applicable intake" value={university.dataContext?.intake ?? "Not specified by source"} />
              <ProfileFact label="Next review" value={university.dataContext?.reviewDue ?? "Scheduled through catalogue audit"} />
            </dl>
            {university.dataContext?.note ? <p className="mt-4 rounded-lg bg-blue-400/5 p-3 text-xs leading-5 text-blue-100">{university.dataContext.note}</p> : null}
          </ProfileSection>

          <ProfileSection title="Official sources">
            {university.sources?.length ? <div className="grid gap-2">{university.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="quiet-action inline-flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-blue-300"><span className="min-w-0 break-words">{source.label}</span><ExternalLink size={14} className="shrink-0" aria-hidden="true" /></a>)}</div> : <PendingMessage text="Official source links are still being collected." />}
          </ProfileSection>

          <ProfileSection title="Help keep this profile current" note="Reports never change published information automatically">
            <ReportUpdate university={university.name} />
          </ProfileSection>

          {university.facts?.length ? <ProfileSection title="Source-checked notes"><ul className="grid gap-3 text-sm leading-6 text-slate-300">{university.facts.map((fact) => <li key={fact} className="border-l-2 border-blue-400 pl-3">{fact}</li>)}</ul></ProfileSection> : null}
        </aside>
      </section>
    </main>
  );
}

function ProfileSection({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return <section className="profile-section surface-card rounded-2xl p-5 sm:p-6"><h2 className="text-xl font-bold">{title}</h2>{note ? <p className="mt-1 text-sm leading-6 text-slate-400">{note}</p> : null}<div className="mt-5">{children}</div></section>;
}
function ProfileMetric({ label, value }: { label: string; value: string }) { return <div><b className="block text-xl text-blue-200">{value}</b><span className="text-xs text-slate-400">{label}</span></div>; }
function ProfileFact({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-slate-700 pb-2"><dt className="text-slate-400">{label}</dt><dd className="text-right font-semibold">{value}</dd></div>; }
function PendingMessage({ text }: { text: string }) { return <p className="rounded-xl border border-amber-400/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">{text}</p>; }
