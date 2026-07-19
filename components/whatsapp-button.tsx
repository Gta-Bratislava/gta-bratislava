"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function WhatsAppButton({ locale, car }: { locale: Locale; car?: string }) {
  const d = getDictionary(locale);
  const pathname = usePathname();
  const [pageCar, setPageCar] = useState(car);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const carHeading = document.querySelector<HTMLElement>("[data-car-name]");
      setPageCar(carHeading?.dataset.carName || car);
    });
    return () => cancelAnimationFrame(frame);
  }, [car, pathname]);
  const href = `https://wa.me/${d.whatsapp}?text=${encodeURIComponent(d.whatsappMessage(pageCar))}`;
  return <a href={href} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 font-black text-[#071a0d] shadow-2xl transition-transform hover:scale-105"><MessageCircle size={23} /><span className="hidden sm:inline">WhatsApp</span></a>;
}
