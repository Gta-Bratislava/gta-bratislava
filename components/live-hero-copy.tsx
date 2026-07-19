"use client";

import { useEffect, useState } from "react";
import { loadPublicContent } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/types";

export function LiveHeroCopy({ locale, title, lead }: { locale: Locale; title: string; lead: string }) {
  const [copy, setCopy] = useState({ title, lead });
  useEffect(() => {
    let active = true;
    loadPublicContent(locale).then((content) => {
      if (active) setCopy({ title: content.heroTitle || title, lead: content.heroLead || lead });
    }).catch(() => { /* Static text remains visible if the free database is paused. */ });
    return () => { active = false; };
  }, [lead, locale, title]);
  return <><h1 className="display max-w-3xl">{copy.title}</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-white/62">{copy.lead}</p></>;
}
