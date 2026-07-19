import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage, CatalogPage, ContactsPage, FinancingPage, LegalPage, ServicesPage } from "@/components/pages/static-pages";
import { getDictionary, isLocale, routeMap } from "@/lib/i18n";
import { locales, type Locale } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => Object.values(routeMap[locale]).map((slug) => ({ locale, slug })));
}

function resolve(locale: Locale, slug: string) { return (Object.entries(routeMap[locale]).find(([, value]) => value === slug)?.[0] || null) as keyof typeof routeMap.sk | null; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const key = resolve(locale, slug); const d = getDictionary(locale); const titles = { cars: d.catalog.title, services: d.servicesPage.title, financing: d.financingPage.title, about: d.about.title, contacts: d.contacts.title, privacy: d.legal.privacy, cookies: d.legal.cookies, data: d.legal.data, terms: d.legal.terms }; const title = key ? titles[key] : d.brand; return { title, description: key === "cars" ? d.catalog.lead : key === "services" ? d.servicesPage.lead : key === "financing" ? d.financingPage.lead : d.hero.lead, alternates: { canonical: `/${locale}/${slug}` } }; }

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const key = resolve(locale, slug); if (key === "cars") return <CatalogPage locale={locale}/>; if (key === "services") return <ServicesPage locale={locale}/>; if (key === "financing") return <FinancingPage locale={locale}/>; if (key === "about") return <AboutPage locale={locale}/>; if (key === "contacts") return <ContactsPage locale={locale}/>; if (key === "privacy" || key === "cookies" || key === "data" || key === "terms") return <LegalPage locale={locale} kind={key}/>; notFound(); }
