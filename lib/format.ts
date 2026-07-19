import type { Locale } from "@/lib/types";

export function formatPrice(value: number, locale: Locale) {
  const localeTag = locale === "sk" ? "sk-SK" : locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB";
  return new Intl.NumberFormat(localeTag, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function formatMileage(value: number, locale: Locale) {
  const localeTag = locale === "sk" ? "sk-SK" : locale === "ua" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-GB";
  return `${new Intl.NumberFormat(localeTag).format(value)} km`;
}
