"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Explore", "/explore"],
  ["My Decision", "/my-decision"],
  ["Saved", "/shortlist"],
  ["Living Costs", "/living-costs"],
  ["Grade Scales", "/grade-scales"],
  ["Admissions", "/admission-calendar"],
  ["Public Universities", "/public-universities"],
] as const;

export function AppNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div className="app-mobile-nav md:hidden">
      <button type="button" className="app-menu-button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="app-mobile-menu" onClick={() => setOpen((value) => !value)}>
        {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>
      {open && <button type="button" className="app-menu-backdrop" aria-label="Close navigation menu" onClick={() => setOpen(false)} />}
      <nav id="app-mobile-menu" aria-label="Mobile navigation" className={`app-menu-panel ${open ? "is-open" : ""}`}>
        <Link href="/" className="app-menu-brand"><Image src="/logo-mark.svg" alt="" width={38} height={38} /><span><b>CampusChoice BD</b><small>Choose your next step</small></span></Link>
        <div className="app-menu-links">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
        </div>
      </nav>
    </div>
  );
}
