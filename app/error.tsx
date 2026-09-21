"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#101827] px-5 py-12 text-slate-100">
      <section className="surface-card w-full max-w-xl rounded-2xl p-6 text-center sm:p-10">
        <Image className="mx-auto" src="/logo-mark.svg" alt="" width={52} height={52} priority />
        <p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-amber-300">
          Something interrupted this page
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Your saved choices are still safe.
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-300">
          Try loading this section again. If the problem continues, return to the finder and resume from your saved shortlist.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-400"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 transition hover:border-blue-400 hover:text-white"
          >
            Return to finder
          </Link>
        </div>
      </section>
    </main>
  );
}
