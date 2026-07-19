import { Aperture, Send, Share2, Video } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { getDictionary, localizedPath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const socials = [
    ["Instagram", d.instagram, Aperture],
    ["TikTok", d.tiktok, Video],
    ["Facebook", d.facebook, Share2],
    ["Telegram", d.telegram, Send],
  ] as const;
  return (
    <footer className="border-t border-acid/20 bg-black text-white">
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.2fr_.8fr_.8fr]">
        <div><Logo href={`/${locale}`} inverse large /><p className="mt-6 max-w-sm text-white/60">{d.footer.line}</p><div className="mt-6 flex gap-2">{socials.map(([name, href, Icon]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/70 hover:border-acid hover:text-acid"><Icon size={18} /></a>)}</div></div>
        <div><p className="mb-4 text-xs font-black uppercase tracking-[.16em] text-white/40">Menu</p><div className="grid gap-3 text-sm font-bold"><Link href={localizedPath(locale, "cars")}>{d.nav.cars}</Link><Link href={localizedPath(locale, "services")}>{d.nav.services}</Link><Link href={localizedPath(locale, "financing")}>{d.nav.financing}</Link><Link href={localizedPath(locale, "about")}>{d.nav.about}</Link><Link href={localizedPath(locale, "contacts")}>{d.nav.contacts}</Link></div></div>
        <div><p className="mb-4 text-xs font-black uppercase tracking-[.16em] text-white/40">{d.nav.contacts}</p><div className="grid gap-3 text-sm"><a href={`tel:${d.phone.replace(/\s/g, "")}`} className="font-bold">{d.phone}</a><a href={`mailto:${d.email}`}>{d.email}</a><p className="text-white/60">{d.address}</p><p className="text-white/60">{d.contacts.hoursValue}</p></div></div>
      </div>
      <div className="border-t border-white/10"><div className="shell flex flex-col justify-between gap-4 py-6 text-xs text-white/45 md:flex-row"><p>© {new Date().getFullYear()} GTA_Bratislava. {d.footer.rights}</p><div className="flex flex-wrap gap-4"><Link href={localizedPath(locale, "privacy")}>{d.legal.privacy}</Link><Link href={localizedPath(locale, "cookies")}>{d.legal.cookies}</Link><Link href={localizedPath(locale, "data")}>{d.legal.data}</Link><Link href={localizedPath(locale, "terms")}>{d.legal.terms}</Link></div></div></div>
    </footer>
  );
}
