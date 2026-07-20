"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { can } from "@/lib/admin-permissions";
import { adminErrorMessage, adminRu } from "@/lib/admin-i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminRole, Locale, SiteSettings } from "@/lib/types";
import { PageTitle, Panel, TextArea, TextField } from "./admin-ui";

type LocaleContent = { heroTitle: string; heroLead: string; servicesTitle: string; aboutTitle: string; financingTitle: string; contactTitle: string; seoTitle: string; seoDescription: string };
const emptyContent: LocaleContent = { heroTitle: "", heroLead: "", servicesTitle: "", aboutTitle: "", financingTitle: "", contactTitle: "", seoTitle: "", seoDescription: "" };

export function SettingsAdmin({ settings, role, onSettings, setNotice }: { settings: SiteSettings; role: AdminRole; onSettings: (settings: SiteSettings) => void; setNotice: (message: string) => void }) {
  const [draft, setDraft] = useState(settings);
  const [locale, setLocale] = useState<Locale>("ru");
  const [contents, setContents] = useState<Record<Locale, LocaleContent>>({ sk: { ...emptyContent }, ua: { ...emptyContent }, ru: { ...emptyContent }, en: { ...emptyContent } });
  const [busy, setBusy] = useState(false);
  const editable = can(role, "settings:edit");

  useEffect(() => {
    const db = getSupabaseBrowserClient(); if (!db) return;
    void db.from("site_content").select("locale,content,seo_title,seo_description").then(({ data }) => {
      if (!data) return;
      setContents((current) => {
        const next = { ...current };
        for (const row of data) {
          const key = row.locale as Locale;
          const content = (row.content || {}) as Partial<LocaleContent>;
          next[key] = { ...emptyContent, ...content, seoTitle: row.seo_title || "", seoDescription: row.seo_description || "" };
        }
        return next;
      });
    });
  }, []);

  async function saveBusiness() {
    const db = getSupabaseBrowserClient(); if (!db || !editable) return;
    setBusy(true);
    const { data, error } = await db.from("site_settings").update({ phone: draft.phone, whatsapp: draft.whatsapp.replace(/\D/g, ""), email: draft.email, address: draft.address, hours: draft.hours, socials: draft.socials, hero_image_url: draft.hero_image_url, timezone: draft.timezone, stale_car_days: draft.stale_car_days }).eq("id", true).select("*").single();
    setBusy(false);
    if (error) return setNotice(adminErrorMessage(error));
    onSettings(data as SiteSettings); setNotice(adminRu.settings.contactsSaved);
  }

  async function saveContent() {
    const db = getSupabaseBrowserClient(); if (!db || !editable) return;
    setBusy(true);
    const value = contents[locale];
    const { seoTitle, seoDescription, ...content } = value;
    const { error } = await db.from("site_content").upsert({ locale, content, seo_title: seoTitle || null, seo_description: seoDescription || null, updated_at: new Date().toISOString() });
    setBusy(false);
    setNotice(error ? adminErrorMessage(error) : `${adminRu.settings.textsSaved} (${locale.toUpperCase()})`);
  }

  const updateContent = (key: keyof LocaleContent, value: string) => setContents({ ...contents, [locale]: { ...contents[locale], [key]: value } });
  return <>
    <PageTitle title={adminRu.settings.title} subtitle={adminRu.settings.subtitle} />
    <div className="grid gap-5 xl:grid-cols-2"><Panel><h2 className="text-lg font-black">{adminRu.settings.business}</h2><p className="mt-1 text-sm text-black/45">{adminRu.settings.publicHint}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><TextField label={adminRu.settings.phone} value={draft.phone} disabled={!editable} onChange={(value) => setDraft({ ...draft, phone: value })} /><TextField label={adminRu.settings.whatsapp} value={draft.whatsapp} disabled={!editable} onChange={(value) => setDraft({ ...draft, whatsapp: value })} /><TextField label={adminRu.settings.email} type="email" value={draft.email} disabled={!editable} onChange={(value) => setDraft({ ...draft, email: value })} /><TextField label={adminRu.settings.address} value={draft.address} disabled={!editable} onChange={(value) => setDraft({ ...draft, address: value })} /><TextField label={adminRu.settings.hours} value={draft.hours} disabled={!editable} onChange={(value) => setDraft({ ...draft, hours: value })} /><TextField label={adminRu.settings.timezone} value={draft.timezone} disabled={!editable} onChange={(value) => setDraft({ ...draft, timezone: value })} /><TextField label={adminRu.settings.banner} value={draft.hero_image_url} disabled={!editable} onChange={(value) => setDraft({ ...draft, hero_image_url: value })} /><TextField label={adminRu.settings.staleDays} type="number" value={String(draft.stale_car_days)} disabled={!editable} onChange={(value) => setDraft({ ...draft, stale_car_days: Number(value) || 30 })} /></div><h3 className="mt-6 font-black">{adminRu.settings.socials}</h3><div className="mt-3 grid gap-4 sm:grid-cols-2"><TextField label="Instagram" value={draft.socials.instagram} disabled={!editable} onChange={(value) => setDraft({ ...draft, socials: { ...draft.socials, instagram: value } })} /><TextField label="TikTok" value={draft.socials.tiktok} disabled={!editable} onChange={(value) => setDraft({ ...draft, socials: { ...draft.socials, tiktok: value } })} /><TextField label="Facebook" value={draft.socials.facebook} disabled={!editable} onChange={(value) => setDraft({ ...draft, socials: { ...draft.socials, facebook: value } })} /><TextField label="Telegram" value={draft.socials.telegram} disabled={!editable} onChange={(value) => setDraft({ ...draft, socials: { ...draft.socials, telegram: value } })} /></div>{editable && <button onClick={() => void saveBusiness()} disabled={busy} className="btn btn-primary mt-5 disabled:opacity-50"><Save size={17} />{adminRu.settings.saveContacts}</button>}</Panel>
    <Panel><h2 className="text-lg font-black">{adminRu.settings.contentSeo}</h2><p className="mt-1 text-sm text-black/45">{adminRu.settings.seoHint}</p><div className="mt-4 flex gap-2">{(["ru", "sk", "ua", "en"] as Locale[]).map((item) => <button key={item} onClick={() => setLocale(item)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase ${locale === item ? "bg-ink text-white" : "bg-paper"}`}>{item}</button>)}</div><div className="mt-5 grid gap-4"><TextField label={adminRu.settings.heroTitle} value={contents[locale].heroTitle} disabled={!editable} onChange={(value) => updateContent("heroTitle", value)} /><TextArea label={adminRu.settings.heroLead} value={contents[locale].heroLead} disabled={!editable} wide={false} rows={4} onChange={(value) => updateContent("heroLead", value)} /><TextField label={adminRu.settings.servicesTitle} value={contents[locale].servicesTitle} disabled={!editable} onChange={(value) => updateContent("servicesTitle", value)} /><TextField label={adminRu.settings.aboutTitle} value={contents[locale].aboutTitle} disabled={!editable} onChange={(value) => updateContent("aboutTitle", value)} /><TextField label={adminRu.settings.financingTitle} value={contents[locale].financingTitle} disabled={!editable} onChange={(value) => updateContent("financingTitle", value)} /><TextField label={adminRu.settings.contactsTitle} value={contents[locale].contactTitle} disabled={!editable} onChange={(value) => updateContent("contactTitle", value)} /><TextField label={adminRu.settings.seoTitle} value={contents[locale].seoTitle} disabled={!editable} onChange={(value) => updateContent("seoTitle", value)} /><TextArea label={adminRu.settings.seoDescription} value={contents[locale].seoDescription} disabled={!editable} wide={false} rows={3} onChange={(value) => updateContent("seoDescription", value)} /></div>{editable && <button onClick={() => void saveContent()} disabled={busy} className="btn btn-primary mt-5 disabled:opacity-50"><Save size={17} />{adminRu.common.save} {locale.toUpperCase()}</button>}</Panel></div>
  </>;
}
