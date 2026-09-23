import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DiscoveryCard } from "@/components/discovery-card";
import { privateUniversities } from "@/data/private-universities";
import { districtDirectory, districtFromSlug } from "@/lib/discovery";

type PageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return districtDirectory.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const district = districtFromSlug((await params).slug);
  if (!district) return {};
  return {
    title: `Private Universities in ${district.name} | CampusChoice BD`,
    description: `Browse source-checked private university profiles, programmes and published costs in ${district.name}, Bangladesh.`,
    alternates: { canonical: `/districts/${district.slug}` },
  };
}

export default async function DistrictPage({ params }: PageProps) {
  const district = districtFromSlug((await params).slug);
  if (!district) notFound();
  const universities = privateUniversities.filter(
    (university) => university.district === district.name,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Private universities in ${district.name}`,
    url: `https://campuschoice-bd.vercel.app/districts/${district.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: universities.length,
      itemListElement: universities.map((university, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: university.name,
      })),
    },
  };
  return (
    <main className="site-shell min-h-screen bg-[#101827] text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="premium-header border-b border-slate-700"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/#universities" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200"><ArrowLeft size={16} /> University finder</Link><b>CampusChoice BD</b></div></header>
      <section className="discovery-hero subpage-hero border-b border-slate-700"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><p className="text-sm font-bold text-blue-300">LOCATION GUIDE</p><h1 className="editorial-title mt-3 text-4xl font-bold sm:text-5xl">Private universities in {district.name}.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">Browse programmes, verified cost coverage and permanent profiles for universities in this district.</p><span className="mt-6 inline-flex rounded-full bg-blue-400/10 px-3 py-1.5 text-sm text-blue-200">{universities.length} university profiles</span></div></section>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{universities.map((university) => <DiscoveryCard key={university.id} university={university} />)}</div></section>
    </main>
  );
}
