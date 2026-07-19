"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary, localizedPath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function CookieBanner({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setVisible(!localStorage.getItem("gta-cookie-consent")), 0); return () => window.clearTimeout(timer); }, []);
  const choose = (value: "accepted" | "essential") => { localStorage.setItem("gta-cookie-consent", value); setVisible(false); };
  if (!visible) return null;
  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-ink p-5 text-paper shadow-2xl" aria-label="Cookie preferences">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><p className="max-w-xl text-sm text-white/70">{d.cookies.text} <Link href={localizedPath(locale, "cookies")} className="font-bold text-acid underline">{d.cookies.more}</Link></p><div className="flex flex-wrap gap-2"><button onClick={() => choose("essential")} className="btn btn-outline min-h-11 px-4 text-sm">{d.cookies.reject}</button><button onClick={() => choose("accepted")} className="btn btn-primary min-h-11 px-4 text-sm">{d.cookies.accept}</button></div></div>
    </aside>
  );
}
