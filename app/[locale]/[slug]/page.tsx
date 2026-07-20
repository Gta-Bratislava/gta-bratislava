import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage, CatalogPage, ContactsPage, FinancingPage, LegalPage, ServicesPage } from "@/components/pages/static-pages";
import { defaultFinancingSettings } from "@/data/financing-settings";
import { getDictionary, isLocale, routeMap } from "@/lib/i18n";
import { locales, type Locale } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.flatMap((locale) => Object.values(routeMap[locale]).map((slug) => ({ locale, slug })));
}

function resolve(locale: Locale, slug: string) { return (Object.entries(routeMap[locale]).find(([, value]) => value === slug)?.[0] || null) as keyof typeof routeMap.sk | null; }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const key = resolve(locale, slug); const d = getDictionary(locale); const finance = defaultFinancingSettings.localized[locale]; const titles = { cars: d.catalog.title, services: d.servicesPage.title, financing: finance.title, about: d.about.title, contacts: d.contacts.title, privacy: d.legal.privacy, cookies: d.legal.cookies, data: d.legal.data, terms: d.legal.terms }; const title = key ? titles[key] : d.brand; const description = key === "cars" ? d.catalog.lead : key === "services" ? d.servicesPage.lead : key === "financing" ? finance.description : d.hero.lead; const languages = key === "financing" ? { "sk-SK": `/sk/${routeMap.sk.financing}`, "uk-UA": `/ua/${routeMap.ua.financing}`, "ru-RU": `/ru/${routeMap.ru.financing}`, "en-GB": `/en/${routeMap.en.financing}` } : undefined; return { title, description, alternates: { canonical: `/${locale}/${slug}`, languages }, openGraph: key === "financing" ? { title, description, type: "website", locale: locale === "sk" ? "sk_SK" : locale === "ua" ? "uk_UA" : locale === "ru" ? "ru_RU" : "en_GB", images: [{ url: "/brand/gta-bratislava-logo.jpg", alt: "GTA Bratislava" }] } : undefined }; }

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const key = resolve(locale, slug); if (key === "cars") return <CatalogPage locale={locale}/>; if (key === "services") return <ServicesPage locale={locale}/>; if (key === "financing") return <FinancingPage locale={locale}/>; if (key === "about") return <AboutPage locale={locale}/>; if (key === "contacts") return <ContactsPage locale={locale}/>; if (key === "privacy" || key === "cookies" || key === "data" || key === "terms") return <LegalPage locale={locale} kind={key}/>; notFound(); }
