"use client";

import { Copy, ExternalLink, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageTitle, Panel, TextArea, TextField } from "@/components/admin/admin-ui";
import { adLengthLabels, adPlatformLabels, adStyleLabels, adminErrorMessage, adminRu } from "@/lib/admin-i18n";
import { can } from "@/lib/admin-permissions";
import { generateCarAd } from "@/lib/ad-generator";
import { localizedPath } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdLength, AdPlatform, AdStyle, AdminRole, Car, GeneratedAd, Locale } from "@/lib/types";

const platforms: AdPlatform[] = ["bazos", "facebook", "instagram", "tiktok", "whatsapp", "telegram", "universal"];
const lengths: AdLength[] = ["short", "standard", "detailed"];
const styles: AdStyle[] = ["business", "friendly", "sales", "neutral", "premium"];

export function AdGeneratorAdmin({ cars, role, authorId, phone = "+421 949 711 370", whatsapp = "421949711370", preview, setNotice }: { cars: Car[]; role: AdminRole; authorId: string; phone?: string; whatsapp?: string; preview: boolean; setNotice: (message: string) => void }) {
  const [carId, setCarId] = useState(cars[0]?.id || "");
  const [language, setLanguage] = useState<Locale>("ru");
  const [platform, setPlatform] = useState<AdPlatform>("universal");
  const [length, setLength] = useState<AdLength>("standard");
  const [style, setStyle] = useState<AdStyle>("business");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [history, setHistory] = useState<GeneratedAd[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [variant, setVariant] = useState(0);
  const [contactPhone, setContactPhone] = useState(phone);
  const [contactWhatsapp, setContactWhatsapp] = useState(whatsapp);
  const editable = can(role, "ads:edit");
  const deletable = can(role, "ads:delete");
  const t = adminRu.ads;

  useEffect(() => {
    if (preview) return;
    const db = getSupabaseBrowserClient(); if (!db) return;
    void db.from("generated_ads").select("*").order("updated_at", { ascending: false }).limit(100).then(({ data, error }) => error ? setNotice(adminErrorMessage(error)) : setHistory((data || []) as GeneratedAd[]));
    void db.from("site_settings").select("phone,whatsapp").eq("id", true).maybeSingle().then(({ data }) => { if (data?.phone) setContactPhone(String(data.phone)); if (data?.whatsapp) setContactWhatsapp(String(data.whatsapp)); });
  }, [preview, setNotice]);

  function generate(nextVariant = variant) {
    const car = cars.find((item) => item.id === carId); if (!car) { setNotice(t.chooseCar); return; }
    const carUrl = `${window.location.origin}${localizedPath(language, "cars")}/vehicle?slug=${encodeURIComponent(car.slug)}`;
    const generated = generateCarAd(car, { language, platform, length, style, contact: `${contactPhone} · WhatsApp: ${contactWhatsapp}`, website: carUrl, variant: nextVariant });
    setTitle(generated.title); setBody(generated.text); setHashtags(generated.hashtags); setEditingId(null);
  }
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setNotice(adminRu.common.copied); } catch { setNotice("Не удалось скопировать текст. Выделите его вручную."); } }
  async function save() {
    if (!title.trim() || !body.trim()) { setNotice("Создайте или заполните объявление."); return; }
    const item: GeneratedAd = { id: editingId || crypto.randomUUID(), car_id: carId, language, platform, style, length, title: title.trim(), text: body.trim(), hashtags, author_id: authorId, created_at: history.find((entry) => entry.id === editingId)?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    if (preview) { setHistory((items) => [item, ...items.filter((entry) => entry.id !== item.id)]); setEditingId(item.id); setNotice(adminRu.common.previewNotice); return; }
    const db = getSupabaseBrowserClient(); if (!db) return;
    const { data, error } = await db.from("generated_ads").upsert({ id: item.id, car_id: item.car_id, language: item.language, platform: item.platform, style: item.style, length: item.length, title: item.title, text: item.text, hashtags: item.hashtags, author_id: authorId }).select("*").single();
    if (error) { setNotice(adminErrorMessage(error)); return; }
    const saved = data as GeneratedAd; setHistory((items) => [saved, ...items.filter((entry) => entry.id !== saved.id)]); setEditingId(saved.id); setNotice(t.saved);
  }
  async function remove(item: GeneratedAd) {
    if (!window.confirm(t.deleteConfirm)) return;
    if (!preview) { const db = getSupabaseBrowserClient(); if (!db) return; const { error } = await db.from("generated_ads").delete().eq("id", item.id); if (error) return setNotice(adminErrorMessage(error)); }
    setHistory((items) => items.filter((entry) => entry.id !== item.id)); if (editingId === item.id) setEditingId(null); setNotice(t.deleted);
  }
  function loadSaved(item: GeneratedAd, clone: boolean) { setCarId(item.car_id); setLanguage(item.language); setPlatform(item.platform); setStyle(item.style); setLength(item.length); setTitle(item.title); setBody(item.text); setHashtags(item.hashtags); setEditingId(clone ? null : item.id); window.scrollTo({ top: 0, behavior: "smooth" }); }

  const selectedCar = cars.find((item) => item.id === carId);
  const carHref = selectedCar ? `${localizedPath(language, "cars")}/vehicle?slug=${encodeURIComponent(selectedCar.slug)}` : "#";
  return <><PageTitle title={t.title} subtitle={t.subtitle}/><div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]"><Panel><div className="grid gap-4"><label className="label">{t.selectCar}<select className="field" value={carId} onChange={(event) => setCarId(event.target.value)}><option value="">—</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.text.ru.title || `${car.brand} ${car.model}`}</option>)}</select></label><label className="label">{adminRu.common.language}<select className="field" value={language} onChange={(event) => setLanguage(event.target.value as Locale)}>{(["ru","sk","ua","en"] as Locale[]).map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select></label><label className="label">{t.platform}<select className="field" value={platform} onChange={(event) => setPlatform(event.target.value as AdPlatform)}>{platforms.map((item) => <option key={item} value={item}>{adPlatformLabels[item]}</option>)}</select></label><label className="label">{t.length}<select className="field" value={length} onChange={(event) => setLength(event.target.value as AdLength)}>{lengths.map((item) => <option key={item} value={item}>{adLengthLabels[item]}</option>)}</select></label><label className="label">{t.style}<select className="field" value={style} onChange={(event) => setStyle(event.target.value as AdStyle)}>{styles.map((item) => <option key={item} value={item}>{adStyleLabels[item]}</option>)}</select></label>{editable && <button onClick={() => generate()} className="btn btn-primary"><Sparkles size={17}/>{t.generate}</button>}{selectedCar && <a href={carHref} target="_blank" rel="noreferrer" className="btn btn-dark"><ExternalLink size={17}/>{t.openCar}</a>}</div></Panel>
    <Panel><div className="grid gap-4"><TextField label={t.heading} value={title} disabled={!editable} onChange={setTitle}/><TextArea label={t.body} value={body} disabled={!editable} rows={18} wide={false} onChange={setBody}/><TextField label={t.hashtags} value={hashtags.join(" ")} disabled={!editable} onChange={(value) => setHashtags(value.split(/\s+/).filter(Boolean).slice(0, 5))}/><div className="flex flex-wrap gap-2"><button onClick={() => void copy(title)} className="btn btn-dark"><Copy size={16}/>{t.copyTitle}</button><button onClick={() => void copy(body)} className="btn btn-dark"><Copy size={16}/>{t.copyText}</button><button onClick={() => void copy(`${title}\n\n${body}`)} className="btn btn-dark"><Copy size={16}/>{t.copyAll}</button>{editable && <button onClick={() => { const next = variant + 1; setVariant(next); generate(next); }} className="btn btn-dark"><RefreshCw size={16}/>{t.regenerate}</button>}{editable && <button onClick={() => void save()} className="btn btn-primary"><Save size={16}/>{t.save}</button>}</div></div></Panel></div>
    <div className="mt-6"><h2 className="mb-4 text-xl font-black">{t.history}</h2>{history.length ? <div className="grid gap-3 lg:grid-cols-2">{history.map((item) => <Panel key={item.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{item.title}</h3><p className="mt-1 text-xs text-black/45">{item.language.toUpperCase()} · {adPlatformLabels[item.platform]} · {adStyleLabels[item.style]}</p></div>{deletable && <button onClick={() => void remove(item)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 text-red-700" aria-label={adminRu.common.delete}><Trash2 size={16}/></button>}</div><p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-black/55">{item.text}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => loadSaved(item, false)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black">{adminRu.common.edit}</button><button onClick={() => loadSaved(item, true)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black">{t.basedOn}</button><button onClick={() => void copy(`${item.title}\n\n${item.text}`)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-black">{adminRu.common.copy}</button></div></Panel>)}</div> : <EmptyState icon={<Sparkles/>} title={t.noHistory}/>}</div>
  </>;
}
