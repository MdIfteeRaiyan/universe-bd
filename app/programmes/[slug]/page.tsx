import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DiscoveryCard } from "@/components/discovery-card";
import { privateUniversities } from "@/data/private-universities";
import { programmeDirectory, programmeFromSlug } from "@/lib/discovery";
import { universityProfilePath } from "@/lib/university-profile";

type PageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return programmeDirectory.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const programme = programmeFromSlug((await params).slug);
  if (!programme) return {};
  return {
    title: `${programme.name} University Costs in Bangladesh | CampusChoice BD`,
    description: `Compare source-checked ${programme.name} availability and published programme costs across private universities in Bangladesh.`,
    alternates: { canonical: `/programmes/${programme.slug}` },
  };
}

export default async function ProgrammePage({ params }: PageProps) {
  const programme = programmeFromSlug((await params).slug);
  if (!programme) notFound();
  const universities = privateUniversities.filter((university) =>
    university.programs.includes(programme.name),
  );
  const verified = universities.filter((university) =>
    university.programCosts?.some(
      (cost) => cost.name === programme.name && !cost.pending && cost.total > 0,
    ),
  ).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${programme.name} universities in Bangladesh`,
    description: `Source-checked ${programme.name} university and cost directory.`,
    url: `https://campuschoice-bd.vercel.app/programmes/${programme.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: universities.length,
      itemListElement: universities.map((university, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: university.name,
        url: `https://campuschoice-bd.vercel.app${universityProfilePath(university)}`,
      })),
    },
  };
  return (
    <main className="site-shell min-h-screen bg-[#101827] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="premium-header border-b border-slate-700"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/#universities" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200"><ArrowLeft size={16} /> University finder</Link><b>CampusChoice BD</b></div></header>
      <section className="discovery-hero subpage-hero border-b border-slate-700"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><p className="text-sm font-bold text-blue-300">PROGRAMME GUIDE</p><h1 className="editorial-title mt-3 text-4xl font-bold sm:text-5xl">Study {programme.name} in Bangladesh.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">Compare where the programme is listed, which published totals are verified and what still requires confirmation—without treating missing data as a price.</p><div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-blue-400/10 px-3 py-1.5 text-blue-200">{universities.length} universities</span><span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-emerald-200">{verified} verified totals</span></div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{universities.map((university) => <DiscoveryCard key={university.id} university={university} programme={programme.name} />)}</div></section>
    </main>
  );
}
