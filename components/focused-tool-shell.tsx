import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function FocusedToolShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="focused-tool-page site-shell min-h-screen text-slate-100">
      <a href="#tool-content" className="skip-link">Skip to tool</a>
      <header className="premium-header border-b border-slate-700/70">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="quiet-action inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-200">
            <ArrowLeft size={16} aria-hidden="true" /> Home
          </Link>
          <Link href="/tools" className="text-sm font-bold text-[#d6f36a]">All tools</Link>
        </div>
      </header>
      <section className="focused-tool-hero border-b border-slate-700/70">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#bbb7ff]">{eyebrow}</p>
          <h1 className="editorial-title mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">{description}</p>
        </div>
      </section>
      <section id="tool-content" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-8 outline-none sm:py-12 lg:px-8">
        {children}
      </section>
    </main>
  );
}
