"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { getDictionary, localizedPath, switchLocalePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    [dict.nav.cars, localizedPath(locale, "cars")],
    [dict.nav.services, localizedPath(locale, "services")],
    [dict.nav.financing, localizedPath(locale, "financing")],
    [dict.nav.about, localizedPath(locale, "about")],
    [dict.nav.contacts, localizedPath(locale, "contacts")],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-acid/20 bg-black/90 text-white backdrop-blur-xl">
      <div className="shell flex h-[74px] items-center justify-between gap-5">
        <Logo href={`/${locale}`} inverse />
        <nav className="hidden items-center gap-6 lg:flex" aria-label={dict.a11y.navigation}>
          {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-bold text-white/65 transition-colors hover:text-acid">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex rounded-lg border border-white/15 bg-white/5 p-1" aria-label={dict.a11y.language}>
            {(["sk", "ua", "ru", "en"] as Locale[]).map((item) => (
              <Link key={item} href={switchLocalePath(pathname, item)} aria-current={item === locale ? "page" : undefined} className={`rounded-md px-2.5 py-1.5 text-xs font-black uppercase ${item === locale ? "bg-acid text-black" : "text-white/50 hover:text-white"}`}>{item}</Link>
            ))}
          </div>
          <a className="btn btn-dark min-h-11 px-4 text-sm" href={`tel:${dict.phone.replace(/\s/g, "")}`}><Phone size={16} /> {dict.phone}</a>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 text-white md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={dict.a11y.menu}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-acid/20 bg-[#080909] px-5 py-5 text-white md:hidden">
          <nav className="grid gap-1">
            {links.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="rounded-xl px-3 py-3 text-lg font-extrabold hover:bg-white/5 hover:text-acid">{label}</Link>)}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex gap-2">{(["sk", "ua", "ru", "en"] as Locale[]).map((item) => <Link key={item} href={switchLocalePath(pathname, item)} className={`rounded-lg px-3 py-2 text-sm font-black uppercase ${item === locale ? "bg-acid text-black" : "bg-white/10"}`}>{item}</Link>)}</div>
            <a href={`tel:${dict.phone.replace(/\s/g, "")}`} className="grid h-11 w-11 place-items-center rounded-xl bg-acid" aria-label={dict.contacts.phone}><Phone size={19} /></a>
          </div>
        </div>
      )}
    </header>
  );
}
