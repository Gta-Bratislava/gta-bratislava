"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Car, FinancingRecord, FinancingSettings, LeadRecord, Locale, SiteSettings } from "@/lib/types";

export type AdminApplication = Record<string, unknown> & {
  id: string;
  kind: "lead" | "financing";
  created_at: string;
};

let browserClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (browserClient !== undefined) return browserClient;
  if (!isSupabaseConfigured()) {
    browserClient = null;
    return browserClient;
  }
  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
  );
  return browserClient;
}

export async function loadPublicCars(): Promise<Car[]> {
  const db = getSupabaseBrowserClient();
  if (!db) return [];
  const { data, error } = await db.from("cars").select("data,status,price,sort_order,featured,is_new,good_price,financing_calculator_enabled,updated_at").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...(row.data as Car), status: row.status as Car["status"], price: Number(row.price), sortOrder: row.sort_order, featured: row.featured, isNew: row.is_new, goodPrice: row.good_price, financingCalculatorEnabled: row.financing_calculator_enabled, updatedAt: row.updated_at }));
}

export async function loadPublicCar(slug: string): Promise<Car | null> {
  const db = getSupabaseBrowserClient();
  if (!db) return null;
  const { data, error } = await db.from("cars").select("data,financing_calculator_enabled").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? { ...(data.data as Car), financingCalculatorEnabled: data.financing_calculator_enabled } : null;
}

export async function loadFinancingSettings(): Promise<FinancingSettings | null> {
  const db = getSupabaseBrowserClient();
  if (!db) return null;
  const { data, error } = await db.from("financing_settings").select("id,enabled,min_amount,max_amount,min_term,max_term,allowed_terms,default_interest_rate,min_down_payment_eur,min_down_payment_percent,fixed_fee,percent_fee,localized,created_at,updated_at").eq("id", true).maybeSingle();
  if (error) throw error;
  return data as FinancingSettings | null;
}

export async function loadPublicContent(locale: Locale): Promise<Record<string, string>> {
  const db = getSupabaseBrowserClient();
  if (!db) return {};
  const { data, error } = await db.from("site_content").select("content").eq("locale", locale).maybeSingle();
  if (error) throw error;
  return (data?.content ?? {}) as Record<string, string>;
}

export async function loadPublicSettings(): Promise<SiteSettings | null> {
  const db = getSupabaseBrowserClient();
  if (!db) return null;
  const { data, error } = await db.from("site_settings").select("*").eq("id", true).maybeSingle();
  if (error) throw error;
  return data as SiteSettings | null;
}

export async function submitLead(record: LeadRecord) {
  const db = getSupabaseBrowserClient();
  if (!db) throw new Error("Supabase is not configured");
  const { error } = await db.from("leads").insert({
    type: record.type,
    locale: record.locale,
    name: record.name,
    phone: record.phone,
    email: record.email || null,
    message: record.message || null,
    car_slug: record.carSlug || null,
    service: record.service || null,
    consent: record.consent,
  });
  if (error) throw error;
}

export async function submitFinancing(record: FinancingRecord) {
  const db = getSupabaseBrowserClient();
  if (!db) throw new Error("Supabase is not configured");
  const { error } = await db.from("financing_applications").insert(record);
  if (error) throw error;
}

export function submissionIsCoolingDown(key: string, cooldownMs = 30_000) {
  try {
    const last = Number(localStorage.getItem(`gta-form-${key}`) || 0);
    return Date.now() - last < cooldownMs;
  } catch {
    return false;
  }
}

export function rememberSubmission(key: string) {
  try {
    localStorage.setItem(`gta-form-${key}`, String(Date.now()));
  } catch {
    // Storage can be unavailable in privacy modes; the database rules still apply.
  }
}
