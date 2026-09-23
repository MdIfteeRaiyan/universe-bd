import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function TrustPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="site-shell min-h-screen bg-[#101827] text-slate-100">
      <a href="#trust-content" className="skip-link">Skip to content</a>
      <header className="premium-header border-b border-slate-700">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="brand-lockup flex items-center gap-3">
            <span className="brand-mark-wrap"><Image src="/logo-mark.svg" alt="" width={40} height={40} /></span>
            <b>CampusChoice BD</b>
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-200"><ArrowLeft size={16} /> Home</Link>
        </div>
      </header>
      <section className="trust-hero subpage-hero border-b border-slate-700">
        <div className="mx-auto max-w-4xl px-5 py-12">
          <p className="text-sm font-bold text-blue-300">{eyebrow}</p>
          <h1 className="editorial-title mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{intro}</p>
        </div>
      </section>
      <article id="trust-content" tabIndex={-1} className="trust-copy mx-auto max-w-4xl px-5 py-12 outline-none">
        {children}
        <p className="mt-10 border-t border-slate-700 pt-6 text-sm text-slate-400">Last updated: 23 September 2026</p>
      </article>
    </main>
  );
}
