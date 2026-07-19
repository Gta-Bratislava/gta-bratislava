import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/cookie-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getDictionary, isLocale } from "@/lib/i18n";
import { locales } from "@/lib/types";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    title: { absolute: d.brand },
    description: d.hero.lead,
    alternates: { canonical: `/${locale}`, languages: { "sk-SK": "/sk", "uk-UA": "/ua", "ru-RU": "/ru", "en-GB": "/en" } },
    openGraph: { title: d.brand, description: d.hero.lead, locale: locale === "sk" ? "sk_SK" : locale === "ua" ? "uk_UA" : locale === "ru" ? "ru_RU" : "en_GB", images: [{ url: "/brand/gta-bratislava-logo.jpg", width: 1280, height: 1280, alt: d.hero.title }] },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Header locale={locale}/><main>{children}</main><Footer locale={locale}/><WhatsAppButton locale={locale}/><CookieBanner locale={locale}/></>;
}
