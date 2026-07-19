import { ArrowRight, BadgeCheck, CarFront, Check, FileCheck2, HandCoins, MapPin, Phone, SearchCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { FeaturedCarsClient } from "@/components/featured-cars-client";
import { LiveHeroCopy } from "@/components/live-hero-copy";
import { SectionHeading } from "@/components/section-heading";
import { financingInfo, servicePackages } from "@/data/business-info";
import { demoCars } from "@/data/cars";
import { getDictionary, localizedPath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const serviceIcons = [CarFront, SearchCheck, FileCheck2, HandCoins, BadgeCheck];

export function HomePage({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const cars = demoCars;
  const services = servicePackages[locale];
  const finance = financingInfo[locale];

  return (
    <>
      <section className="relative overflow-hidden border-b border-acid/20 bg-black text-white">
        <div className="neon-grid absolute inset-0 opacity-70" />
        <div className="absolute -right-24 top-8 h-[520px] w-[520px] rounded-full bg-[#df277f]/20 blur-[110px]" />
        <div className="shell relative grid min-h-[calc(100svh-74px)] items-center gap-8 py-14 lg:grid-cols-[1fr_.88fr]">
          <div className="relative z-10 reveal">
            <div className="eyebrow text-white/55">{d.hero.eyebrow}</div>
            <LiveHeroCopy locale={locale} title={d.hero.title} lead={d.hero.lead}/>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={localizedPath(locale, "cars")} className="btn btn-primary">{d.hero.primary}<ArrowRight size={18}/></Link>
              <Link href={localizedPath(locale, "contacts")} className="btn btn-outline border-white/45 text-white">{d.hero.secondary}</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-white/60">
              <span className="flex items-center gap-2"><BadgeCheck className="text-acid" size={18}/>{d.hero.note}</span>
              <a href={`tel:${d.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-white hover:text-acid"><Phone className="text-acid" size={18}/>{d.phone}</a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[590px]">
            <div className="absolute inset-[7%] rounded-full bg-[#df277f]/30 blur-[60px]" />
            <div className="absolute inset-4 overflow-hidden rounded-full border border-acid/50 shadow-[0_0_70px_rgba(157,222,24,.14)]">
              <Image src="/brand/gta-bratislava-logo.jpg" alt="GTA Bratislava — Grand the Auto" fill priority sizes="(max-width: 1024px) 90vw, 46vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-acid/15 bg-[#0b0c0c]">
        <div className="shell grid divide-y divide-white/10 py-2 md:grid-cols-4 md:divide-x md:divide-y-0">{d.trust.map((item) => <div key={item} className="flex items-center gap-3 px-4 py-5 text-sm font-bold text-white/75 first:pl-0"><BadgeCheck className="text-acid" size={19}/>{item}</div>)}</div>
      </section>

      <section className="section-pad"><div className="shell"><SectionHeading eyebrow={d.sections.featuredEyebrow} title={d.sections.featured} lead={d.sections.featuredLead}/><FeaturedCarsClient fallbackCars={cars.filter((car) => car.featured).slice(0,3)} locale={locale}/><div className="mt-9"><Link href={localizedPath(locale, "cars")} className="btn btn-dark">{d.hero.primary}<ArrowRight size={18}/></Link></div></div></section>

      <section className="section-pad border-y border-white/10 bg-[#050505]"><div className="shell"><SectionHeading eyebrow={d.sections.benefitsEyebrow} title={d.sections.benefits}/><div className="grid gap-4 lg:grid-cols-3">{d.benefits.map((item, index) => <article key={item.title} className="dark-card p-7"><span className="text-sm font-black text-acid">0{index + 1}</span><h3 className="mt-10 text-2xl font-black tracking-tight text-white">{item.title}</h3><p className="mt-3 text-white/55">{item.text}</p></article>)}</div><div className="mt-5 grid gap-px overflow-hidden rounded-[22px] border border-acid/20 bg-acid/20 md:grid-cols-3">{d.stats.map((stat) => <div key={stat.label} className="bg-[#0c0d0d] p-7"><p className="text-5xl font-black tracking-[-.06em] text-acid">{stat.value}</p><p className="mt-2 text-sm text-white/50">{stat.label}</p></div>)}</div></div></section>

      <section className="section-pad relative overflow-hidden bg-[#0a0a0b]"><div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-[#df277f]/10 blur-[100px]"/><div className="shell relative"><SectionHeading light eyebrow={d.sections.servicesEyebrow} title={d.sections.services}/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => { const Icon = serviceIcons[index]; return <Link key={service.title} href={`${localizedPath(locale, "services")}?service=${index + 1}`} className="dark-card group flex min-h-56 flex-col justify-between p-6 transition-colors hover:border-acid hover:bg-white/[.07]"><div className="flex items-start justify-between gap-4"><Icon className="text-acid"/><span className="rounded-lg border border-acid/30 bg-acid/10 px-3 py-1 text-lg font-black text-acid">{service.price}</span></div><div><h3 className="text-xl font-black leading-tight text-white">{service.title}</h3><p className="mt-3 text-sm text-white/48">{service.note}</p><ArrowRight className="mt-5 transition-transform group-hover:translate-x-1"/></div></Link>; })}</div><Link href={localizedPath(locale, "services")} className="btn btn-primary mt-8">{d.servicesPage.request}<ArrowRight size={18}/></Link></div></section>

      <section className="section-pad border-y border-white/10"><div className="shell"><SectionHeading eyebrow={d.sections.processEyebrow} title={d.sections.process}/><div className="grid gap-8 border-t border-acid/25 pt-8 md:grid-cols-2 xl:grid-cols-4">{d.process.map((step) => <article key={step.n}><span className="text-sm font-black text-acid">{step.n}</span><h3 className="mt-8 text-xl font-black text-white">{step.title}</h3><p className="mt-3 text-white/50">{step.text}</p></article>)}</div></div></section>

      <section className="relative overflow-hidden bg-[#080909]"><div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(223,39,127,.19),transparent_60%)]"/><div className="shell relative grid items-center gap-10 py-20 lg:grid-cols-[1fr_.9fr]"><div><div className="eyebrow text-white/50">{d.sections.financeEyebrow}</div><h2 className="section-title text-white">{d.sections.finance}</h2><p className="lead mt-5">{d.finance.text}</p><Link href={localizedPath(locale, "financing")} className="btn btn-primary mt-7">{d.finance.button}<ArrowRight size={18}/></Link></div><div className="neon-panel rounded-[28px] p-7 sm:p-9"><p className="text-xs font-black uppercase tracking-[.18em] text-acid">GTA Financing</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{finance.terms.slice(0,4).map((term) => <div key={term.label} className="rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs font-bold uppercase tracking-wider text-white/40">{term.label}</p><p className="mt-2 text-xl font-black text-acid">{term.value}</p></div>)}</div><p className="mt-6 flex gap-2 text-sm text-white/50"><Check className="shrink-0 text-acid" size={18}/>{d.finance.disclaimer}</p></div></div></section>

      <section className="section-pad border-y border-white/10 bg-black"><div className="shell"><SectionHeading eyebrow={d.sections.reviewsEyebrow} title={d.sections.reviews}/><div className="grid gap-4 lg:grid-cols-3">{d.reviews.map((review) => <figure key={review.name} className="dark-card p-7"><blockquote className="text-xl font-bold leading-relaxed text-white">“{review.text}”</blockquote><figcaption className="mt-8 text-sm text-white/45">{review.name}</figcaption></figure>)}</div></div></section>

      <section className="section-pad"><div className="shell grid gap-12 lg:grid-cols-[.78fr_1.22fr]"><div><SectionHeading eyebrow={d.sections.contactEyebrow} title={d.sections.contact}/><div className="neon-panel rounded-[20px] p-6"><MapPin className="text-acid"/><p className="mt-12 text-xl font-black">{d.contacts.map}</p><p className="mt-2 text-sm text-white/50">{d.contacts.mapNote}</p><p className="mt-6 font-black text-acid">{d.phone}</p></div></div><div className="neon-panel rounded-[24px] p-6 sm:p-8"><ContactForm locale={locale}/></div></div></section>
    </>
  );
}
