"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { NumberField, PageTitle, Panel, TextArea, TextField, Toggle } from "@/components/admin/admin-ui";
import { defaultFinancingSettings } from "@/data/financing-settings";
import { adminErrorMessage, adminRu } from "@/lib/admin-i18n";
import { can } from "@/lib/admin-permissions";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminRole, FinancingLocaleContent, FinancingSettings, Locale } from "@/lib/types";

export function FinancingAdmin({ role, preview, setNotice }: { role: AdminRole; preview: boolean; setNotice: (message: string) => void }) {
  const [settings, setSettings] = useState<FinancingSettings>(defaultFinancingSettings);
  const [locale, setLocale] = useState<Locale>("ru");
  const [busy, setBusy] = useState(false);
  const editable = can(role, "financing:edit");
  const t = adminRu.financing;

  useEffect(() => {
    if (preview) return;
    const db = getSupabaseBrowserClient(); if (!db) return;
    void db.from("financing_settings").select("*").eq("id", true).maybeSingle().then(({ data, error }) => {
      if (error) setNotice(adminErrorMessage(error));
      else if (data) setSettings({ ...defaultFinancingSettings, ...(data as FinancingSettings), localized: { ...defaultFinancingSettings.localized, ...(data as FinancingSettings).localized } });
    });
  }, [preview, setNotice]);

  function setNumber(key: keyof FinancingSettings, value: number) { setSettings((current) => ({ ...current, [key]: Number.isFinite(value) ? Math.max(0, value) : 0 })); }
  function updateLocalized(key: keyof FinancingLocaleContent, value: string) {
    setSettings((current) => ({ ...current, localized: { ...current.localized, [locale]: { ...current.localized[locale], [key]: key === "documents" || key === "steps" ? value.split("\n").map((line) => line.trim()).filter(Boolean) : key === "faq" ? value.split("\n").map((line) => { const [question, ...answer] = line.split("|"); return { question: question.trim(), answer: answer.join("|").trim() }; }).filter((item) => item.question && item.answer) : value } } }));
  }

  async function save() {
    const normalized = { ...settings, allowed_terms: [...new Set(settings.allowed_terms.filter((value) => Number.isInteger(value) && value >= settings.min_term && value <= settings.max_term))].sort((a, b) => a - b) };
    if (!normalized.allowed_terms.length) { setNotice("Укажите хотя бы один допустимый срок финансирования."); return; }
    if (normalized.max_amount < normalized.min_amount || normalized.max_term < normalized.min_term) { setNotice("Проверьте минимальные и максимальные значения."); return; }
    setSettings(normalized);
    if (preview) { setNotice(adminRu.common.previewNotice); return; }
    const db = getSupabaseBrowserClient(); if (!db) return;
    setBusy(true);
    const { error } = await db.from("financing_settings").update({ enabled: normalized.enabled, min_amount: normalized.min_amount, max_amount: normalized.max_amount, min_term: normalized.min_term, max_term: normalized.max_term, allowed_terms: normalized.allowed_terms, default_interest_rate: normalized.default_interest_rate, min_down_payment_eur: normalized.min_down_payment_eur, min_down_payment_percent: normalized.min_down_payment_percent, fixed_fee: normalized.fixed_fee, percent_fee: normalized.percent_fee, localized: normalized.localized }).eq("id", true);
    setBusy(false); setNotice(error ? adminErrorMessage(error) : t.saved);
  }

  const content = settings.localized[locale];
  return <><PageTitle title={t.title} subtitle={t.subtitle}/><div className="grid gap-5 xl:grid-cols-2"><Panel><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">{t.calculator}</h2><Toggle label={settings.enabled ? adminRu.common.enabled : adminRu.common.disabled} checked={settings.enabled} disabled={!editable} onChange={(enabled) => setSettings({ ...settings, enabled })}/></div><p className="mt-2 text-sm text-black/45">{t.ranges}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><NumberField label={t.minAmount} value={settings.min_amount} disabled={!editable} min={0} onChange={(value) => setNumber("min_amount", value)}/><NumberField label={t.maxAmount} value={settings.max_amount} disabled={!editable} min={0} onChange={(value) => setNumber("max_amount", value)}/><NumberField label={t.minTerm} value={settings.min_term} disabled={!editable} min={1} onChange={(value) => setNumber("min_term", value)}/><NumberField label={t.maxTerm} value={settings.max_term} disabled={!editable} min={1} onChange={(value) => setNumber("max_term", value)}/><TextField label={t.terms} value={settings.allowed_terms.join(", ")} disabled={!editable} onChange={(value) => setSettings({ ...settings, allowed_terms: value.split(",").map(Number).filter(Number.isFinite) })}/><NumberField label={t.rate} value={settings.default_interest_rate} disabled={!editable} min={0} onChange={(value) => setNumber("default_interest_rate", value)}/><NumberField label={t.minDownEur} value={settings.min_down_payment_eur} disabled={!editable} min={0} onChange={(value) => setNumber("min_down_payment_eur", value)}/><NumberField label={t.minDownPercent} value={settings.min_down_payment_percent} disabled={!editable} min={0} onChange={(value) => setNumber("min_down_payment_percent", Math.min(100, value))}/><NumberField label={t.fixedFee} value={settings.fixed_fee} disabled={!editable} min={0} onChange={(value) => setNumber("fixed_fee", value)}/><NumberField label={t.percentFee} value={settings.percent_fee} disabled={!editable} min={0} onChange={(value) => setNumber("percent_fee", Math.min(100, value))}/></div></Panel>
    <Panel><h2 className="text-lg font-black">{t.localized}</h2><div className="mt-4 flex gap-2">{(["ru","sk","ua","en"] as Locale[]).map((item) => <button key={item} onClick={() => setLocale(item)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase ${locale === item ? "bg-ink text-white" : "bg-paper"}`}>{item}</button>)}</div><div className="mt-5 grid gap-4"><TextField label={t.titleField} value={content.title} disabled={!editable} onChange={(value) => updateLocalized("title", value)}/><TextArea label={t.description} value={content.description} disabled={!editable} wide={false} onChange={(value) => updateLocalized("description", value)}/><TextArea label={t.warning} value={content.warning} disabled={!editable} wide={false} onChange={(value) => updateLocalized("warning", value)}/><TextArea label={t.documents} value={content.documents.join("\n")} disabled={!editable} wide={false} rows={7} onChange={(value) => updateLocalized("documents", value)}/><TextArea label={t.steps} value={content.steps.join("\n")} disabled={!editable} wide={false} rows={7} onChange={(value) => updateLocalized("steps", value)}/><TextArea label={t.faq} value={content.faq.map((item) => `${item.question} | ${item.answer}`).join("\n")} disabled={!editable} wide={false} rows={8} onChange={(value) => updateLocalized("faq", value)}/><TextField label={t.applyButton} value={content.applyButton} disabled={!editable} onChange={(value) => updateLocalized("applyButton", value)}/></div></Panel></div>{editable && <button onClick={() => void save()} disabled={busy} className="btn btn-primary mt-5 disabled:opacity-50"><Save size={17}/>{busy ? adminRu.common.loading : t.save}</button>}</>;
}
