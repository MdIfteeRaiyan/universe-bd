export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-1 overflow-hidden bg-slate-800" aria-live="polite" aria-busy="true">
      <span className="sr-only">Preparing your university guide</span>
      <span className="route-loading-bar block h-full w-1/3 bg-[#63d8c4]" aria-hidden="true" />
    </div>
  );
}
