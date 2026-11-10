import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AppFooter() {
  const year = new Date().getFullYear();
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  return (
    <footer className="app-footer">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center lg:px-8">
        <div className="min-w-0">
          <Link href="/" className="inline-flex items-center gap-2"><Image src="/logo-mark.svg" alt="" width={30} height={30} /><b className="text-sm sm:text-base">CampusChoice BD</b></Link>
        </div>
        <div className="sm:text-right">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300 sm:justify-end">
            <Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link>
          </nav>
          <div className="footer-meta mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:justify-end">
            {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call</a> : null}
            <a href="https://github.com/MdIfteeRaiyan/" target="_blank" rel="noreferrer">GitHub <ExternalLink size={11} className="inline" /></a>
            <span className="footer-credit">© {year} CampusChoice BD · Created by Md Iftee Raiyan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
