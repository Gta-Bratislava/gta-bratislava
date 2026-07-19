"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/types";

export type AnalyticsEvent = "view" | "whatsapp_click" | "lead_submit";

function sessionKey() {
  try {
    const key = "gta-analytics-session";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(key, created);
    return created;
  } catch { return crypto.randomUUID(); }
}

export function analyticsConsentGranted() {
  try { return localStorage.getItem("gta-cookie-consent") === "accepted"; }
  catch { return false; }
}

export async function trackAnalyticsEvent(event: AnalyticsEvent, locale: Locale, carSlug?: string) {
  if (!analyticsConsentGranted()) return;
  const db = getSupabaseBrowserClient();
  if (!db) return;
  await db.rpc("track_analytics_event", { p_event_type: event, p_car_slug: carSlug || null, p_locale: locale, p_session_key: sessionKey() });
}
