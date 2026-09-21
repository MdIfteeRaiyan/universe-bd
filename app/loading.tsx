import Image from "next/image";

export default function Loading() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-[#101827] px-5 py-12 text-slate-100"
      aria-busy="true"
      aria-live="polite"
    >
      <section className="surface-card w-full max-w-md rounded-2xl p-7 text-center sm:p-9">
        <Image
          className="mx-auto motion-safe:animate-pulse"
          src="/logo-mark.svg"
          alt=""
          width={52}
          height={52}
          priority
        />
        <h1 className="mt-5 text-xl font-bold">Preparing your university guide</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Loading the latest source-checked information…
        </p>
        <div className="mx-auto mt-6 h-1.5 max-w-56 overflow-hidden rounded-full bg-slate-700" aria-hidden="true">
          <span className="loading-sheen block h-full w-2/5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300" />
        </div>
      </section>
    </main>
  );
}
