"use client";

import { BarChart3, CalendarDays, CarFront, Gauge, Loader2, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AnalyticsAdmin } from "@/components/admin/analytics-admin";
import { CalendarAdmin } from "@/components/admin/calendar-admin";
import { CarsAdmin, storageObjectPath } from "@/components/admin/cars-admin";
import { CrmAdmin } from "@/components/admin/crm-admin";
import { DashboardHome } from "@/components/admin/dashboard-home";
import { SettingsAdmin } from "@/components/admin/settings-admin";
import { TeamAdmin } from "@/components/admin/team-admin";
import { Logo } from "@/components/logo";
import { demoCars } from "@/data/cars";
import { can, roleLabels } from "@/lib/admin-permissions";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import type { AdminProfile, Appointment, Car, CarMetric, CrmApplication, PriceHistoryEntry, SiteSettings } from "@/lib/types";

type Tab = "dashboard" | "cars" | "crm" | "calendar" | "settings" | "analytics" | "team";
type AuthState = "loading" | "signed-out" | "authorized" | "forbidden" | "config";

const fallbackSettings: SiteSettings = { id: true, phone: "+421 949 711 370", whatsapp: "421949711370", email: "info@gta-bratislava.sk", address: "Bratislava, Slovensko", hours: "Po–Pi 09:00–18:00 · So po dohode", socials: { instagram: "https://instagram.com/", tiktok: "https://tiktok.com/", facebook: "https://facebook.com/", telegram: "https://t.me/" }, hero_image_url: "/brand/gta-bratislava-logo.jpg", timezone: "Europe/Bratislava", stale_car_days: 30 };
const previewProfile: AdminProfile = { id: "preview-owner", role: "owner", display_name: "Demo Owner", email: "owner@gta-bratislava.sk", is_active: true, created_at: new Date().toISOString() };

export function AdminPortal() {
  const [authState, setAuthState] = useState<AuthState>(() => isSupabaseConfigured() ? "loading" : "config");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const isPreview = process.env.NODE_ENV === "development" && new URLSearchParams(window.location.search).get("preview") === "1";
    if (isPreview) {
      const timer = window.setTimeout(() => { setPreview(true); setProfile(previewProfile); setAuthState("authorized"); }, 0);
      return () => window.clearTimeout(timer);
    }
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const client = db; let active = true;
    async function verify(userId?: string) {
      if (!active) return;
      if (!userId) { setProfile(null); setAuthState("signed-out"); return; }
      const { data } = await client.from("admins").select("*").eq("id", userId).eq("is_active", true).maybeSingle();
      if (!active) return;
      setProfile(data as AdminProfile | null); setAuthState(data ? "authorized" : "forbidden");
    }
    void client.auth.getSession().then(({ data }) => verify(data.session?.user.id));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { void verify(session?.user.id); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (authState === "loading") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin" /></div>;
  if (authState === "config") return <AdminMessage title="Supabase nie je nastavený" text="Pridajte verejnú URL Supabase a anon key do Cloudflare Pages. Verejný web zostáva dostupný zo statických záložných dát." />;
  if (authState === "signed-out") return <div className="grid min-h-screen place-items-center p-5"><AdminLogin onSignedIn={() => window.location.reload()} /></div>;
  if (authState === "forbidden") return <AdminMessage title="Prístup zamietnutý" text="Prihlásený používateľ nie je aktívny administrátor. Owner mu musí prideliť rolu v administrácii." logout />;
  if (!profile) return null;
  return <AdminWorkspace profile={profile} preview={preview} />;
}

function AdminMessage({ title, text, logout = false }: { title: string; text: string; logout?: boolean }) {
  async function signOut() { await getSupabaseBrowserClient()?.auth.signOut(); window.location.reload(); }
  return <div className="grid min-h-screen place-items-center p-5"><div className="max-w-xl rounded-3xl bg-white p-8 shadow-lift"><Logo /><h1 className="mt-10 text-3xl font-black">{title}</h1><p className="mt-3 text-black/55">{text}</p>{logout && <button onClick={() => void signOut()} className="btn btn-dark mt-6"><LogOut size={17} />Odhlásiť</button>}</div></div>;
}

function AdminWorkspace({ profile, preview }: { profile: AdminProfile; preview: boolean }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cars, setCars] = useState<Car[]>(() => preview ? previewCars() : []);
  const [applications, setApplications] = useState<CrmApplication[]>(() => preview ? previewApplications() : []);
  const [appointments, setAppointments] = useState<Appointment[]>(() => preview ? previewAppointments() : []);
  const [admins, setAdmins] = useState<AdminProfile[]>(() => preview ? [previewProfile, { id: "preview-manager", role: "manager", display_name: "Martin", email: "manager@gta-bratislava.sk", is_active: true, created_at: new Date().toISOString() }] : []);
  const [metrics, setMetrics] = useState<CarMetric[]>(() => preview ? previewMetrics() : []);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(fallbackSettings);
  const [notice, setNotice] = useState(preview ? "Ukážkový režim – zmeny sa neukladajú do Supabase." : "Načítavam údaje…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (preview) return;
    const db = getSupabaseBrowserClient(); if (!db) return;
    const client = db;
    let active = true;
    async function load() {
      const requests = [
        client.from("cars").select("id,slug,data,status,price,sort_order,featured,is_new,good_price,created_at,updated_at").order("sort_order", { ascending: true }),
        client.from("car_metrics").select("*").order("view_count", { ascending: false }),
        client.from("car_price_history").select("*").order("created_at", { ascending: false }).limit(100),
        client.from("site_settings").select("*").eq("id", true).maybeSingle(),
      ];
      const [carsResult, metricsResult, priceResult, settingsResult] = await Promise.all(requests);
      if (!active) return;
      if (carsResult.error) { setNotice(`Autá: ${carsResult.error.message}. Spustite novú SQL migráciu.`); return; }
      setCars((carsResult.data || []).map(normalizeCar));
      if (!metricsResult.error) setMetrics((metricsResult.data || []) as CarMetric[]);
      if (!priceResult.error) setPriceHistory((priceResult.data || []) as PriceHistoryEntry[]);
      if (!settingsResult.error && settingsResult.data) setSiteSettings(settingsResult.data as SiteSettings);

      if (can(profile.role, "crm:view")) {
        const [applicationsResult, appointmentsResult, adminsResult] = await Promise.all([
          client.from("admin_applications").select("*").order("created_at", { ascending: false }),
          client.from("appointments").select("*").order("starts_at", { ascending: true }),
          client.from("admins").select("*").order("display_name"),
        ]);
        if (!active) return;
        if (!applicationsResult.error) setApplications((applicationsResult.data || []) as CrmApplication[]);
        if (!appointmentsResult.error) setAppointments((appointmentsResult.data || []) as Appointment[]);
        if (!adminsResult.error) setAdmins((adminsResult.data || []) as AdminProfile[]);
      } else if (can(profile.role, "admins:manage")) {
        const { data } = await client.from("admins").select("*").order("display_name"); if (active && data) setAdmins(data as AdminProfile[]);
      }
      setNotice("");
    }
    void load(); return () => { active = false; };
  }, [preview, profile.role]);

  const tabs = useMemo(() => [
    { id: "dashboard" as const, label: "Dashboard", icon: Gauge, show: true },
    { id: "cars" as const, label: "Automobily", icon: CarFront, show: can(profile.role, "cars:view") },
    { id: "crm" as const, label: "CRM", icon: Users, show: can(profile.role, "crm:view") },
    { id: "calendar" as const, label: "Kalendár", icon: CalendarDays, show: can(profile.role, "calendar:view") },
    { id: "settings" as const, label: "Nastavenia", icon: Settings, show: can(profile.role, "settings:view") },
    { id: "analytics" as const, label: "Analytika", icon: BarChart3, show: can(profile.role, "analytics:view") },
    { id: "team" as const, label: "Administrátori", icon: ShieldCheck, show: can(profile.role, "admins:manage") },
  ].filter((item) => item.show), [profile.role]);

  async function saveCar(car: Car) {
    if (!car.slug.trim() || !car.text.sk.title.trim()) { setNotice("URL slug a slovenský názov sú povinné."); return false; }
    const normalized = { ...car, slug: slugify(car.slug), updatedAt: new Date().toISOString() };
    if (preview) { setCars((items) => items.some((item) => item.id === normalized.id) ? items.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...items]); setNotice("Ukážková zmena bola uložená iba v prehliadači."); return true; }
    const db = getSupabaseBrowserClient(); if (!db) return false;
    setBusy(true);
    const record = { id: normalized.id, slug: normalized.slug, data: normalized, status: normalized.status, price: normalized.price, sort_order: normalized.sortOrder || (cars.length + 1) * 10, featured: normalized.featured, is_new: Boolean(normalized.isNew), good_price: Boolean(normalized.goodPrice) };
    const { data, error } = await db.from("cars").upsert(record).select("id,slug,data,status,price,sort_order,featured,is_new,good_price,created_at,updated_at").single();
    setBusy(false);
    if (error) { setNotice(error.message); return false; }
    const saved = normalizeCar(data);
    setCars((items) => items.some((item) => item.id === saved.id) ? items.map((item) => item.id === saved.id ? saved : item) : [saved, ...items]); setNotice("Automobil bol uložený."); return true;
  }

  async function deleteCar(car: Car) {
    if (!window.confirm(`Naozaj odstrániť ${car.text.sk.title || car.slug}? Táto operácia odstráni aj fotografie.`)) return;
    if (preview) { setCars((items) => items.filter((item) => item.id !== car.id)); return; }
    const db = getSupabaseBrowserClient(); if (!db) return;
    const storagePaths = [...car.images, ...(car.thumbnails || [])].map(storageObjectPath).filter((path): path is string => Boolean(path));
    if (storagePaths.length) { const { error } = await db.storage.from("cars").remove(storagePaths); if (error) return setNotice(error.message); }
    const { error } = await db.from("cars").delete().eq("id", car.id);
    if (error) return setNotice(error.message);
    setCars((items) => items.filter((item) => item.id !== car.id)); setNotice("Automobil a jeho fotografie boli odstránené.");
  }

  async function duplicateCar(car: Car) {
    const id = crypto.randomUUID();
    let images: string[] = [];
    let thumbnails: string[] = [];
    if (preview) {
      images = [...car.images]; thumbnails = [...(car.thumbnails || car.images)];
    } else {
      const db = getSupabaseBrowserClient();
      if (!db) return;
      setNotice("Kopírujem fotografie…");
      for (const [index, image] of car.images.entries()) {
        const fullSource = storageObjectPath(image);
        const thumbSource = storageObjectPath(car.thumbnails?.[index] || image);
        if (!fullSource || !thumbSource) { images.push(image); thumbnails.push(car.thumbnails?.[index] || image); continue; }
        const token = crypto.randomUUID();
        const fullTarget = `${id}/${token}-full.webp`;
        const thumbTarget = `${id}/${token}-thumb.webp`;
        const [fullResult, thumbResult] = await Promise.all([db.storage.from("cars").copy(fullSource, fullTarget), db.storage.from("cars").copy(thumbSource, thumbTarget)]);
        if (fullResult.error || thumbResult.error) { setNotice((fullResult.error || thumbResult.error)?.message || "Fotografie sa nepodarilo skopírovať."); return; }
        images.push(db.storage.from("cars").getPublicUrl(fullTarget).data.publicUrl);
        thumbnails.push(db.storage.from("cars").getPublicUrl(thumbTarget).data.publicUrl);
      }
    }
    const commercial = can(profile.role, "cars:edit_commercial");
    const copy: Car = structuredClone({ ...car, id, slug: `${car.slug}-copy-${id.slice(0, 4)}`, status: "draft", price: commercial ? car.price : 0, monthlyPrice: commercial ? car.monthlyPrice : 0, financing: commercial ? car.financing : false, featured: false, isNew: false, images, thumbnails, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), text: { ...car.text, sk: { ...car.text.sk, title: `${car.text.sk.title} – kópia` } } });
    await saveCar(copy);
  }

  async function reorderCars(sourceId: string, targetId: string) {
    const next = [...cars]; const source = next.findIndex((item) => item.id === sourceId); const target = next.findIndex((item) => item.id === targetId);
    if (source < 0 || target < 0) return;
    const [moved] = next.splice(source, 1); next.splice(target, 0, moved);
    const ordered = next.map((item, index) => ({ ...item, sortOrder: (index + 1) * 10 })); setCars(ordered);
    if (preview) return;
    const db = getSupabaseBrowserClient(); if (!db) return;
    const results = await Promise.all(ordered.map((item) => db.from("cars").update({ sort_order: item.sortOrder, data: item }).eq("id", item.id)));
    const error = results.find((item) => item.error)?.error; setNotice(error ? error.message : "Poradie bolo uložené.");
  }

  async function logout() { if (preview) { window.location.href = "/admin/"; return; } await getSupabaseBrowserClient()?.auth.signOut(); }

  return <><header className="border-b border-black/10 bg-white"><div className="mx-auto flex min-h-[72px] max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-5"><Logo href="/sk/" /><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-black">{profile.display_name || profile.email || "Admin"}</p><p className="text-xs text-black/40">{roleLabels[profile.role]}{preview ? " · preview" : ""}</p></div><button onClick={() => void logout()} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 text-black/55 hover:text-black" aria-label="Odhlásiť"><LogOut size={18} /></button></div></div></header><div className="mx-auto grid max-w-[1500px] gap-5 px-3 py-4 sm:px-5 sm:py-6 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="admin-scroll -mx-3 overflow-x-auto px-3 lg:mx-0 lg:overflow-visible lg:px-0"><nav className="flex min-w-max gap-1 rounded-2xl bg-ink p-2 text-white lg:sticky lg:top-5 lg:block lg:min-w-0 lg:p-3"><p className="hidden px-3 pb-3 pt-2 text-xs font-black uppercase tracking-wider text-white/35 lg:block">GTA Bratislava</p>{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-black lg:mb-1 lg:w-full lg:gap-3 ${tab === id ? "bg-acid text-ink" : "text-white/65 hover:bg-white/10"}`}><Icon size={18} />{label}</button>)}</nav></aside><section className="min-w-0">{notice && <div className={`mb-4 flex items-center justify-between gap-3 rounded-xl p-3 text-sm font-bold ${notice.toLowerCase().includes("error") || notice.includes(":") ? "bg-red-50 text-red-900" : "bg-white text-black/65"}`}><span>{notice}</span><button onClick={() => setNotice("")} className="text-lg">×</button></div>}{tab === "dashboard" && <DashboardHome cars={cars} applications={applications} appointments={appointments} metrics={metrics} staleDays={siteSettings.stale_car_days} />}{tab === "cars" && <CarsAdmin cars={cars} role={profile.role} busy={busy} onSave={saveCar} onDelete={deleteCar} onDuplicate={duplicateCar} onQuickPrice={async (car, price) => { await saveCar({ ...car, price }); }} onReorder={reorderCars} />}{tab === "crm" && <CrmAdmin applications={applications} admins={admins} cars={cars} role={profile.role} onUpdated={(item) => setApplications((items) => items.map((entry) => entry.id === item.id && entry.source_type === item.source_type ? item : entry))} setNotice={setNotice} />}{tab === "calendar" && <CalendarAdmin appointments={appointments} cars={cars} admins={admins} role={profile.role} onChanged={setAppointments} setNotice={setNotice} />}{tab === "settings" && <SettingsAdmin settings={siteSettings} role={profile.role} onSettings={setSiteSettings} setNotice={setNotice} />}{tab === "analytics" && <AnalyticsAdmin cars={cars} metrics={metrics} priceHistory={priceHistory} applicationsCount={can(profile.role, "crm:view") ? applications.length : undefined} />}{tab === "team" && <TeamAdmin admins={admins} currentId={profile.id} onChanged={setAdmins} setNotice={setNotice} />}</section></div></>;
}

function normalizeCar(row: Record<string, unknown>): Car {
  const data = row.data as Car;
  return { ...data, id: String(row.id || data.id), slug: String(row.slug || data.slug), status: String(row.status || data.status) as Car["status"], price: Number(row.price ?? data.price), sortOrder: Number(row.sort_order ?? data.sortOrder ?? 0), featured: Boolean(row.featured ?? data.featured), isNew: Boolean(row.is_new ?? data.isNew), goodPrice: Boolean(row.good_price ?? data.goodPrice), createdAt: String(row.created_at || data.createdAt), updatedAt: String(row.updated_at || data.updatedAt || data.createdAt) };
}

function slugify(value: string) { return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function previewCars() { return demoCars.map((car, index) => ({ ...car, sortOrder: (index + 1) * 10, isNew: index === 3, goodPrice: index === 1, updatedAt: new Date(Date.now() - index * 12 * 86_400_000).toISOString() })); }
function previewApplications(): CrmApplication[] { const now = Date.now(); return [{ id: "lead-1", source_type: "lead", application_type: "test_drive", created_at: new Date(now - 30 * 60_000).toISOString(), updated_at: new Date().toISOString(), crm_status: "new", assigned_to: null, manager_notes: null, name: "Peter Novák", phone: "+421 900 123 456", email: "peter@example.com", car_slug: demoCars[0].slug, message: "Mám záujem o testovaciu jazdu.", locale: "sk", payload: {} }, { id: "finance-1", source_type: "financing", application_type: "financing", created_at: new Date(now - 86_400_000).toISOString(), updated_at: new Date().toISOString(), crm_status: "financing", assigned_to: "preview-manager", manager_notes: "Čakáme na potvrdenie príjmu.", name: "Olena Kovalenko", phone: "+421 911 222 333", email: "olena@example.com", car_slug: null, message: "Kia Sorento", locale: "ua", payload: { citizenship: "Ukraine", monthly_income: 1800, down_payment: 5000, car_price: 31900, term_months: 60 } }]; }
function previewAppointments(): Appointment[] { const date = new Date(Date.now() + 24 * 60 * 60_000); date.setHours(11, 0, 0, 0); return [{ id: "appointment-1", application_source: "lead", application_id: "lead-1", client_name: "Peter Novák", client_phone: "+421 900 123 456", car_id: demoCars[0].id, starts_at: date.toISOString(), duration_minutes: 60, location: "Bratislava", comment: "Testovacia jazda", status: "scheduled", assigned_to: "preview-manager", created_by: "preview-owner", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]; }
function previewMetrics(): CarMetric[] { return demoCars.map((car, index) => ({ car_slug: car.slug, view_count: 184 - index * 31, whatsapp_click_count: 28 - index * 4, lead_count: 12 - index * 2, updated_at: new Date().toISOString() })); }
