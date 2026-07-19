import type { Metadata } from "next";
import { ArrowRight, BadgeEuro, Calendar, CarFront, Fuel, Gauge, MessageCircle, Phone, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/car-card";
import { ContactForm } from "@/components/forms/contact-form";
import { FinancingForm } from "@/components/forms/financing-form";
import { Gallery } from "@/components/gallery";
import { DynamicCarPage } from "@/components/pages/dynamic-car-page";
import { SectionHeading } from "@/components/section-heading";
import { demoCars } from "@/data/cars";
import { findCar, listCars } from "@/lib/db";
import { formatMileage, formatPrice } from "@/lib/format";
import { getDictionary, isLocale, localizedPath, routeMap } from "@/lib/i18n";
import { locales } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => [...demoCars.map((car) => ({ locale, slug: routeMap[locale].cars, carSlug: car.slug })), { locale, slug: routeMap[locale].cars, carSlug: "vehicle" }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string; carSlug: string }> }): Promise<Metadata> {
  const { locale, slug, carSlug } = await params;
  const catalog = slug;
  if (!isLocale(locale) || catalog !== routeMap[locale].cars) return {};
  if (carSlug === "vehicle") return { title: getDictionary(locale).catalog.title, robots: { index: false, follow: true } };
  const car = await findCar(carSlug); if (!car) return {};
  const title = `${car.text[locale].title} ${car.year} — ${formatPrice(car.price, locale)}`;
  return { title, description: car.text[locale].short, alternates: { canonical: `/${locale}/${catalog}/${car.slug}`, languages: { "sk-SK": `/sk/${routeMap.sk.cars}/${car.slug}`, "uk-UA": `/ua/${routeMap.ua.cars}/${car.slug}`, "ru-RU": `/ru/${routeMap.ru.cars}/${car.slug}`, "en-GB": `/en/${routeMap.en.cars}/${car.slug}` } }, openGraph: { title, description: car.text[locale].short, images: [{ url: car.images[0], width: 1200, height: 760, alt: car.text[locale].title }] } };
}

export default async function CarPage({ params }: { params: Promise<{ locale: string; slug: string; carSlug: string }> }) {
  const { locale, slug, carSlug } = await params;
  const catalog = slug;
  if (!isLocale(locale) || catalog !== routeMap[locale].cars) notFound();
  if (carSlug === "vehicle") return <DynamicCarPage locale={locale}/>;
  const car = await findCar(carSlug); if (!car) notFound();
  const d = getDictionary(locale);
  const t = car.text[locale];
  const whatsapp = `https://wa.me/${d.whatsapp}?text=${encodeURIComponent(d.whatsappMessage(t.title))}`;
  const similar = (await listCars()).filter((item) => item.id !== car.id && (item.body === car.body || item.brand === car.brand)).slice(0, 3);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gta-bratislava.pages.dev";
  const jsonLd = { "@context": "https://schema.org", "@type": "Vehicle", name: `${t.title} ${car.year}`, image: car.images.map((image) => image.startsWith("http") ? image : `${siteUrl}${image}`), description: t.description, vehicleIdentificationNumber: car.vin, productionDate: String(car.year), mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileage, unitCode: "KMT" }, fuelType: d.specs[car.fuel], vehicleTransmission: d.specs[car.transmission], vehicleConfiguration: d.specs[car.body], offers: { "@type": "Offer", priceCurrency: "EUR", price: car.price, availability: car.status === "available" ? "https://schema.org/InStock" : car.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/LimitedAvailability", areaServed: "Bratislava, Slovakia", url: `${siteUrl}/${locale}/${catalog}/${car.slug}` } };
  const specs = [[Calendar,d.car.year,String(car.year)],[Gauge,d.car.mileage,formatMileage(car.mileage,locale)],[Fuel,d.car.fuel,d.specs[car.fuel]],[Settings2,d.car.transmission,d.specs[car.transmission]],[CarFront,d.car.body,d.specs[car.body]],[ShieldCheck,d.car.drive,d.specs[car.drive]],[BadgeEuro,d.car.power,`${car.powerKw} kW`],[CarFront,d.car.engine,car.engine]] as const;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}/>
    <section className="py-8 sm:py-12"><div className="shell"><Link href={localizedPath(locale,"cars")} className="mb-7 inline-flex items-center gap-2 text-sm font-black text-white/50 hover:text-acid">← {d.nav.cars}</Link><div className="grid gap-9 lg:grid-cols-[1.45fr_.75fr]"><Gallery images={car.images} alt={t.title} zoomLabel={d.car.zoom}/><aside className="neon-panel h-fit rounded-[24px] p-6 lg:sticky lg:top-24"><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black ${car.status === "available" ? "bg-acid" : car.status === "reserved" ? "bg-[#ffd27d]" : "bg-white"}`}>{d.car[car.status]}</span><h1 data-car-name={t.title} className="mt-5 text-4xl font-black leading-[.98] tracking-[-.045em] sm:text-5xl">{t.title}</h1><p className="mt-3 text-lg text-white/50">{car.year} · {car.engine} · {d.specs[car.transmission]}</p><div className="mt-8 border-y border-acid/20 py-6"><p className="text-4xl font-black tracking-[-.045em] text-acid">{formatPrice(car.price,locale)}</p>{car.financing && <p className="mt-1 font-bold text-white/50">{formatPrice(car.monthlyPrice,locale)} {d.car.perMonth}</p>}</div><div className="mt-6 grid gap-3"><a href={whatsapp} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-[#071a0d]"><MessageCircle size={19}/>{d.car.whatsapp}</a><a href={`tel:${d.phone.replace(/\s/g,"")}`} className="btn btn-dark"><Phone size={18}/>{d.car.call}</a><a href="#test-drive" className="btn btn-outline border-white/35">{d.car.apply}<ArrowRight size={18}/></a></div></aside></div></div></section>
    <section className="pb-16"><div className="shell"><div className="grid gap-px overflow-hidden rounded-[22px] border border-acid/20 bg-acid/20 sm:grid-cols-2 lg:grid-cols-4">{specs.map(([Icon,label,value]) => <div key={label} className="bg-[#0d0e0e] p-5"><Icon className="text-acid" size={19}/><p className="mt-5 text-xs font-bold uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 font-black">{value}</p></div>)}</div></div></section>
    <section className="section-pad border-y border-white/10 bg-black"><div className="shell grid gap-14 lg:grid-cols-[1.1fr_.9fr]"><div><Content title={d.car.description}><p>{t.description}</p></Content><Content title={d.car.equipment}><ul className="grid gap-3 sm:grid-cols-2">{t.equipment.map((item)=><li key={item} className="flex gap-2"><span className="text-acid">✓</span>{item}</li>)}</ul></Content></div><div><Content title={d.car.service}><p>{t.serviceHistory}</p></Content><Content title={d.car.damage}><p>{t.damageInfo}</p></Content><dl className="neon-panel grid gap-3 rounded-[22px] p-6"><div><dt className="text-xs font-black uppercase tracking-wider text-white/40">{d.car.vin}</dt><dd className="mt-1 font-mono font-bold">{car.vin}</dd></div><div className="border-t border-white/10 pt-3"><dt className="text-xs font-black uppercase tracking-wider text-white/40">{d.car.origin}</dt><dd className="mt-1 font-bold">{t.origin}</dd></div></dl></div></div></section>
    <section id="test-drive" className="section-pad"><div className="shell grid gap-10 lg:grid-cols-2"><div><SectionHeading eyebrow={d.car.testDrive} title={d.car.testDrive} lead={t.short}/><div className="card p-6 sm:p-8"><ContactForm locale={locale} type="test_drive" carSlug={car.slug}/></div></div><div><SectionHeading eyebrow={d.car.financing} title={d.finance.button} lead={d.finance.text}/><FinancingForm locale={locale} initialCarPrice={car.price}/></div></div></section>
    {similar.length > 0 && <section className="section-pad border-t border-white/10 bg-black"><div className="shell"><SectionHeading eyebrow={d.catalog.eyebrow} title={d.car.similar}/><div className="grid gap-5 lg:grid-cols-3">{similar.map((item)=><CarCard key={item.id} car={item} locale={locale}/>)}</div></div></section>}
  </>;
}
function Content({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-12"><h2 className="text-3xl font-black tracking-[-.03em]">{title}</h2><div className="mt-5 leading-7 text-white/60">{children}</div></section>; }
