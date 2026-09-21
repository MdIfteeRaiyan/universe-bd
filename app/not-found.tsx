import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#101827] px-5 py-12 text-slate-100">
      <section className="surface-card w-full max-w-xl rounded-2xl p-6 text-center sm:p-10">
        <Image
          className="mx-auto"
          src="/logo-mark.svg"
          alt=""
          width={52}
          height={52}
          priority
        />
        <p className="mt-6 text-sm font-bold uppercase tracking-[.14em] text-blue-300">
          Page not found
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          This university link may have changed.
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-slate-300">
          Return to the directory and search by university name or programme.
          Your saved shortlist in this browser will remain available.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-400"
          >
            Open private finder
          </Link>
          <Link
            href="/public-universities"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 transition hover:border-blue-400 hover:text-white"
          >
            Browse public universities
          </Link>
        </div>
      </section>
    </main>
  );
}
