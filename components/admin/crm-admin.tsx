"use client";

import { Download, FileText, MessageCircle, Phone, Save, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { can } from "@/lib/admin-permissions";
import { adminErrorMessage, adminOptionLabel, adminRu, replaceTemplate } from "@/lib/admin-i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminProfile, AdminRole, ApplicationStatusEvent, Car, CrmApplication, CrmStatus } from "@/lib/types";
import { EmptyState, PageTitle, Panel, SelectField, StatusBadge, TextArea, formatAdminDate } from "./admin-ui";

const baseStatuses: CrmStatus[] = ["new", "contacted", "appointment", "thinking", "financing", "reserved", "completed", "rejected"];
const financeStatuses: CrmStatus[] = ["new", "contacted", "documents_requested", "documents_received", "submitted", "decision_pending", "approved", "rejected", "contract_signed", "completed"];
const statuses: CrmStatus[] = [...new Set([...baseStatuses, ...financeStatuses])];

export function CrmAdmin({ applications, admins, cars, role, onUpdated, setNotice }: { applications: CrmApplication[]; admins: AdminProfile[]; cars: Car[]; role: AdminRole; onUpdated: (application: CrmApplication) => void; setNotice: (message: string) => void }) {
  const [selected, setSelected] = useState<CrmApplication | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [car, setCar] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => applications.filter((item) => {
    const haystack = `${item.name} ${item.phone} ${item.email || ""} ${item.message || ""}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (status !== "all" && item.crm_status !== status) return false;
    if (type !== "all" && item.application_type !== type && item.source_type !== type) return false;
    if (car !== "all" && item.car_slug !== car) return false;
    if (from && item.created_at < `${from}T00:00:00`) return false;
    if (to && item.created_at > `${to}T23:59:59`) return false;
    return true;
  }), [applications, car, from, query, status, to, type]);

  function exportCsv() {
    const rows = filtered.map((item) => ({ created_at: item.created_at, source: item.source_type, type: item.application_type, status: item.crm_status, name: item.name, phone: item.phone, email: item.email || "", car: item.car_slug || "", assigned_to: admins.find((admin) => admin.id === item.assigned_to)?.display_name || item.assigned_to || "", notes: item.manager_notes || "", message: item.message || "" }));
    const keys = Object.keys(rows[0] || { created_at: "", source: "", type: "", status: "", name: "", phone: "", email: "", car: "", assigned_to: "", notes: "", message: "" });
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = `\uFEFF${keys.map(escape).join(",")}\n${rows.map((row) => keys.map((key) => escape(row[key as keyof typeof row])).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `gta-bratislava-crm-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  return <>
    <PageTitle title={adminRu.crm.title} subtitle={replaceTemplate(adminRu.crm.subtitle, { filtered: filtered.length, total: applications.length })} action={<button onClick={exportCsv} disabled={!filtered.length} className="btn btn-dark disabled:opacity-50"><Download size={18} />{adminRu.common.exportCsv}</button>} />
    <Panel className="mb-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><label className="label xl:col-span-2">{adminRu.common.search}<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" placeholder="Имя, телефон, e-mail…" /></div></label><SelectField label={adminRu.common.status} value={status} values={["all", ...statuses]} onChange={setStatus} /><SelectField label={adminRu.common.type} value={type} values={["all", "lead", "financing", "contact", "service", "test_drive"]} onChange={setType} /><SelectField label={adminRu.crm.car} value={car} values={["all", ...cars.map((item) => item.slug)]} onChange={setCar} /><div className="grid grid-cols-2 gap-2"><label className="label">{adminRu.crm.from}<input className="field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="label">{adminRu.crm.to}<input className="field" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label></div></div></Panel>
    {filtered.length ? <div className="grid gap-3">{filtered.map((item) => <button key={`${item.source_type}-${item.id}`} onClick={() => setSelected(item)} className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[1fr_auto] sm:p-5"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{item.name}</h2><StatusBadge value={item.crm_status} /><span className="rounded-full bg-black/5 px-2 py-1 text-[11px] font-black uppercase">{adminOptionLabel(item.application_type)}</span></div><p className="mt-2 text-sm text-black/60">{item.phone}{item.email ? ` · ${item.email}` : ""}</p><p className="mt-1 line-clamp-1 text-sm text-black/45">{item.car_slug || "Автомобиль не выбран"}{item.message ? ` · ${item.message}` : ""}</p></div><div className="text-left sm:text-right"><time className="text-xs text-black/45">{formatAdminDate(item.created_at)}</time><p className="mt-1 text-xs font-bold text-black/50">{admins.find((admin) => admin.id === item.assigned_to)?.display_name || adminRu.common.unassigned}</p></div></button>)}</div> : <EmptyState icon={<FileText />} title={adminRu.crm.noRecords} text={adminRu.crm.noRecordsText} />}
    {selected && <ApplicationDrawer application={selected} admins={admins} role={role} close={() => setSelected(null)} saved={(item) => { onUpdated(item); setSelected(item); }} setNotice={setNotice} />}
  </>;
}

function ApplicationDrawer({ application, admins, role, close, saved, setNotice }: { application: CrmApplication; admins: AdminProfile[]; role: AdminRole; close: () => void; saved: (application: CrmApplication) => void; setNotice: (message: string) => void }) {
  const [draft, setDraft] = useState(application);
  const [history, setHistory] = useState<ApplicationStatusEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const editable = can(role, "crm:edit");
  useEffect(() => {
    const db = getSupabaseBrowserClient();
    if (!db) return;
    void db.from("application_status_history").select("*").eq("application_source", application.source_type).eq("application_id", application.id).order("created_at", { ascending: false }).then(({ data }) => setHistory((data || []) as ApplicationStatusEvent[]));
  }, [application.id, application.source_type]);

  async function save() {
    const db = getSupabaseBrowserClient();
    if (!db || !editable) return;
    setBusy(true);
    const table = draft.source_type === "lead" ? "leads" : "financing_applications";
    const { error } = await db.from(table).update({ crm_status: draft.crm_status, assigned_to: draft.assigned_to, manager_notes: draft.manager_notes, last_contacted_at: draft.crm_status === "contacted" ? new Date().toISOString() : undefined }).eq("id", draft.id);
    setBusy(false);
    if (error) return setNotice(adminErrorMessage(error));
    const now = new Date().toISOString();
    saved({ ...draft, updated_at: now });
    setNotice(adminRu.crm.saved);
    if (draft.crm_status !== application.crm_status) setHistory((items) => [{ id: Date.now(), application_source: draft.source_type, application_id: draft.id, old_status: application.crm_status, new_status: draft.crm_status, note: null, changed_by: null, created_at: now }, ...items]);
  }

  const whatsapp = `https://wa.me/${draft.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Здравствуйте, ${draft.name}. Пишем из GTA Bratislava по вашей заявке.`)}`;
  const availableStatuses = draft.source_type === "financing" ? financeStatuses : baseStatuses;
  return <div className="fixed inset-0 z-[95] flex justify-end bg-black/65"><div className="h-full w-full max-w-2xl overflow-y-auto bg-paper shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#ecebe5]/95 p-4 text-[#111310] backdrop-blur sm:p-5"><div><h2 className="text-xl font-black">{draft.name}</h2><p className="text-xs text-black/45">{adminOptionLabel(draft.source_type)} · {formatAdminDate(draft.created_at)}</p></div><button onClick={close} className="grid h-11 w-11 place-items-center rounded-xl border border-black/15" aria-label={adminRu.common.close}><X /></button></div><div className="grid gap-5 p-4 sm:p-6"><div className="grid grid-cols-2 gap-2"><a href={`tel:${draft.phone}`} className="btn btn-dark"><Phone size={17} />{adminRu.crm.call}</a><a href={whatsapp} target="_blank" rel="noreferrer" className="btn btn-primary"><MessageCircle size={17} />WhatsApp</a></div><Panel><dl className="grid gap-4 text-sm sm:grid-cols-2">{Object.entries({ Имя: draft.name, Телефон: draft.phone, Email: draft.email || "—", Тип: adminOptionLabel(draft.application_type), Автомобиль: draft.car_slug || "—", Язык: draft.locale.toUpperCase(), Сообщение: draft.message || "—" }).map(([key, value]) => <div key={key}><dt className="text-xs font-black uppercase text-black/35">{key}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl>{Object.keys(draft.payload || {}).length > 0 && <details className="mt-5 border-t border-black/10 pt-4"><summary className="cursor-pointer text-sm font-black">{adminRu.crm.extra}</summary><dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{Object.entries(draft.payload).filter(([key]) => !["consent"].includes(key)).map(([key, value]) => <div key={key}><dt className="text-xs font-black uppercase text-black/35">{payloadLabel(key)}</dt><dd>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}</dd></div>)}</dl></details>}</Panel><Panel><div className="grid gap-4 sm:grid-cols-2"><SelectField label={adminRu.common.status} value={draft.crm_status} values={availableStatuses} disabled={!editable} onChange={(value) => setDraft({ ...draft, crm_status: value as CrmStatus })} /><label className="label">{adminRu.crm.manager}<select className="field" value={draft.assigned_to || ""} disabled={!editable} onChange={(event) => setDraft({ ...draft, assigned_to: event.target.value || null })}><option value="">{adminRu.common.unassigned}</option>{admins.filter((admin) => admin.is_active).map((admin) => <option key={admin.id} value={admin.id}>{admin.display_name || admin.email || admin.id}</option>)}</select></label></div><div className="mt-4"><TextArea label={adminRu.crm.notes} value={draft.manager_notes || ""} disabled={!editable} onChange={(value) => setDraft({ ...draft, manager_notes: value })} /></div>{editable && <button onClick={() => void save()} disabled={busy} className="btn btn-primary mt-4 disabled:opacity-50"><Save size={17} />{adminRu.crm.save}</button>}</Panel><Panel><h3 className="font-black">{adminRu.crm.history}</h3><div className="mt-4 grid gap-3">{history.length ? history.map((event) => <div key={event.id} className="flex gap-3 border-l-2 border-lime-400 pl-3"><div><p className="text-sm font-bold"><span className="text-black/40">{event.old_status ? adminOptionLabel(event.old_status) : "Создано"}</span> → {adminOptionLabel(event.new_status)}</p><time className="text-xs text-black/40">{formatAdminDate(event.created_at)}</time></div></div>) : <p className="text-sm text-black/45">{adminRu.crm.noHistory}</p>}</div></Panel></div></div></div>;
}

function payloadLabel(key: string) {
  const labels: Record<string, string> = { citizenship: "Гражданство", employment: "Занятость", monthly_income: "Ежемесячный доход", down_payment: "Первоначальный взнос", car_price: "Стоимость автомобиля", term_months: "Срок, месяцев", selected_car_id: "ID автомобиля", selected_car_slug: "Автомобиль", down_payment_percent: "Первоначальный взнос, %", interest_rate: "Процентная ставка", fixed_fee: "Фиксированная комиссия", percent_fee: "Процентная комиссия", financed_amount: "Сумма финансирования", estimated_monthly_payment: "Расчётный платёж", estimated_total_payment: "Общая сумма", estimated_overpayment: "Переплата", calculator_payload: "Параметры калькулятора", service: "Услуга", type: "Тип заявки", last_contacted_at: "Последний контакт", locale: "Язык", comment: "Комментарий" };
  return labels[key] || "Дополнительное поле";
}
