import { ArrowUpRight, Calendar, Fuel, Gauge, Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatMileage, formatPrice } from "@/lib/format";
import { getDictionary, localizedPath } from "@/lib/i18n";
import type { Car, Locale } from "@/lib/types";

export function CarCard({ car, locale, dynamicRoute = false }: { car: Car; locale: Locale; dynamicRoute?: boolean }) {
  const d = getDictionary(locale);
  const status = d.car[car.status];
  const path = dynamicRoute ? `${localizedPath(locale, "cars")}/vehicle?slug=${encodeURIComponent(car.slug)}` : `${localizedPath(locale, "cars")}/${car.slug}`;
  const cardImage = car.thumbnails?.[0] || car.images[0] || "/cars/bmw-main.svg";
  return (
    <article className="card group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={path} className="relative block aspect-[16/10] overflow-hidden bg-[#111]">
        <Image src={cardImage} alt={`${car.text[locale].title} ${car.year}`} fill sizes="(max-width: 768px) 100vw, 33vw" className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${car.status === "sold" ? "grayscale" : ""}`} />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider ${car.status === "available" ? "bg-acid text-ink" : car.status === "reserved" ? "bg-[#ffd27d] text-ink" : "bg-ink text-white"}`}>{status}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-black tracking-[-.025em] text-white">{car.text[locale].title}</h3><p className="mt-1 text-sm text-white/45">{car.text[locale].short}</p></div><ArrowUpRight className="shrink-0 text-acid" /></div>
        <div className="my-5 grid grid-cols-2 gap-2 text-sm text-white/65"><span className="flex items-center gap-2"><Calendar className="text-acid" size={16}/>{car.year}</span><span className="flex items-center gap-2"><Gauge className="text-acid" size={16}/>{formatMileage(car.mileage, locale)}</span><span className="flex items-center gap-2"><Fuel className="text-acid" size={16}/>{d.specs[car.fuel]}</span><span className="flex items-center gap-2"><Settings2 className="text-acid" size={16}/>{d.specs[car.transmission]}</span></div>
        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-4"><div><p className="text-2xl font-black tracking-[-.03em] text-white">{formatPrice(car.price, locale)}</p>{car.financing && <p className="text-xs text-white/45">{formatPrice(car.monthlyPrice, locale)} {d.car.perMonth}</p>}</div><Link href={path} className="rounded-xl border border-acid/40 bg-acid px-4 py-3 text-sm font-black text-black">{d.car.detail}</Link></div>
      </div>
    </article>
  );
}
