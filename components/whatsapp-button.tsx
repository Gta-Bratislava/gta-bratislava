"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrackedWhatsAppLink } from "@/components/analytics-events";
import { getDictionary } from "@/lib/i18n";
import { loadPublicSettings } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/types";

export function WhatsAppButton({ locale, car }: { locale: Locale; car?: string }) {
  const d = getDictionary(locale);
  const pathname = usePathname();
  const [pageCar, setPageCar] = useState(car);
  const [whatsapp, setWhatsapp] = useState(d.whatsapp);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const carHeading = document.querySelector<HTMLElement>("[data-car-name]");
      setPageCar(carHeading?.dataset.carName || car);
    });
    return () => cancelAnimationFrame(frame);
  }, [car, pathname]);
  useEffect(() => { void loadPublicSettings().then((settings) => { if (settings?.whatsapp) setWhatsapp(settings.whatsapp); }).catch(() => undefined); }, []);
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(d.whatsappMessage(pageCar))}`;
  const slug = pathname.includes("?slug=") ? new URLSearchParams(pathname.split("?")[1]).get("slug") || undefined : undefined;
  return <TrackedWhatsAppLink href={href} locale={locale} carSlug={slug} ariaLabel="WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 font-black text-[#071a0d] shadow-2xl transition-transform hover:scale-105"><MessageCircle size={23} /><span className="hidden sm:inline">WhatsApp</span></TrackedWhatsAppLink>;
}
