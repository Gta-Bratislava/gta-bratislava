import type { MetadataRoute } from "next";
import { demoCars } from "@/data/cars";
import { routeMap } from "@/lib/i18n";
import { locales } from "@/lib/types";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gta-bratislava.pages.dev";
  const pages: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    pages.push({ url: `${base}/${locale}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 });
    for (const slug of Object.values(routeMap[locale])) pages.push({ url: `${base}/${locale}/${slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: slug === routeMap[locale].cars ? .9 : .7 });
    for (const car of demoCars) pages.push({ url: `${base}/${locale}/${routeMap[locale].cars}/${car.slug}`, lastModified: new Date(car.createdAt), changeFrequency: "weekly", priority: .8 });
  }
  return pages;
}
