import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AppFooter() {
  const year = new Date().getFullYear();
  const email = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL;
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  return (
    <footer className="app-footer">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-[1fr_auto] sm:items-center lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-3"><Image src="/logo-mark.svg" alt="" width={34} height={34} /><b>CampusChoice BD</b></Link>
          <p className="mt-2 text-xs leading-5 text-slate-500">Independent, Source-checked guidance. Confirm final details with the university.</p>
        </div>
        <div className="sm:text-right">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300 sm:justify-end">
            <Link href="/methodology">Methodology</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link>
          </nav>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 sm:justify-end">
            {email ? <a href={`mailto:${email}`}>Email</a> : null}
            {phone ? <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call</a> : null}
            <a href="https://www.linkedin.com/in/md-iftee-raiyan-b20336386/" target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={11} className="inline" /></a>
            <a href="https://github.com/MdIfteeRaiyan/" target="_blank" rel="noreferrer">GitHub <ExternalLink size={11} className="inline" /></a>
            <span>Built by Md Iftee Raiyan</span><span>© {year} CampusChoice BD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
