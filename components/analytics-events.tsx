"use client";

import { type MouseEvent, type ReactNode, useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/types";

export function CarViewTracker({ locale, carSlug }: { locale: Locale; carSlug: string }) {
  useEffect(() => {
    const trackView = () => { void trackAnalyticsEvent("view", locale, carSlug); };
    trackView();
    const trackWhatsApp = (event: globalThis.MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href*="wa.me/"]') : null;
      if (target) void trackAnalyticsEvent("whatsapp_click", locale, carSlug);
    };
    document.addEventListener("click", trackWhatsApp);
    window.addEventListener("gta-analytics-consent", trackView);
    return () => { document.removeEventListener("click", trackWhatsApp); window.removeEventListener("gta-analytics-consent", trackView); };
  }, [carSlug, locale]);
  return null;
}

export function TrackedWhatsAppLink({ href, locale, carSlug, className, children, ariaLabel }: { href: string; locale: Locale; carSlug?: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  function click(event: MouseEvent<HTMLAnchorElement>) {
    void trackAnalyticsEvent("whatsapp_click", locale, carSlug);
    if (!href) event.preventDefault();
  }
  return <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className={className} onClick={click}>{children}</a>;
}
