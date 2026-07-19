"use client";

import { CalendarDays, Check, List, Plus, Save, X, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { can } from "@/lib/admin-permissions";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminProfile, AdminRole, Appointment, AppointmentStatus, Car } from "@/lib/types";
import { EmptyState, PageTitle, Panel, SelectField, StatusBadge, TextArea, TextField, formatAdminDate } from "./admin-ui";

type View = "list" | "calendar";

function emptyAppointment(): Appointment {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setHours(10, 0, 0, 0);
  return { id: crypto.randomUUID(), application_source: null, application_id: null, client_name: "", client_phone: "", car_id: null, starts_at: date.toISOString(), duration_minutes: 60, location: "Bratislava", comment: null, status: "scheduled", assigned_to: null, created_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

export function CalendarAdmin({ appointments, cars, admins, role, onChanged, setNotice }: { appointments: Appointment[]; cars: Car[]; admins: AdminProfile[]; role: AdminRole; onChanged: (items: Appointment[]) => void; setNotice: (message: string) => void }) {
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const editable = can(role, "calendar:edit");
  const sorted = useMemo(() => [...appointments].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)), [appointments]);

  async function save(item: Appointment) {
    const db = getSupabaseBrowserClient(); if (!db || !editable) return false;
    const payload = { id: item.id, application_source: item.application_source, application_id: item.application_id, client_name: item.client_name.trim(), client_phone: item.client_phone.trim(), car_id: item.car_id, starts_at: item.starts_at, duration_minutes: item.duration_minutes, location: item.location.trim(), comment: item.comment || null, status: item.status, assigned_to: item.assigned_to };
    if (payload.client_name.length < 2 || payload.client_phone.length < 7 || payload.location.length < 2) { setNotice("Vyplňte meno, telefón a miesto."); return false; }
    const { data, error } = await db.from("appointments").upsert(payload).select("*").single();
    if (error) { setNotice(error.message); return false; }
    const saved = data as Appointment;
    onChanged(appointments.some((entry) => entry.id === saved.id) ? appointments.map((entry) => entry.id === saved.id ? saved : entry) : [...appointments, saved]);
    setNotice("Termín bol uložený."); return true;
  }

  async function setStatus(item: Appointment, status: AppointmentStatus) {
    const db = getSupabaseBrowserClient(); if (!db || !editable) return;
    const { error } = await db.from("appointments").update({ status }).eq("id", item.id);
    if (error) return setNotice(error.message);
    onChanged(appointments.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
  }

  return <>
    <PageTitle title="Kalendár" subtitle={`${appointments.filter((item) => item.status === "scheduled").length} plánovaných termínov`} action={<div className="flex gap-2"><div className="flex rounded-xl border border-black/10 bg-white p-1"><button onClick={() => setView("list")} className={`grid h-9 w-9 place-items-center rounded-lg ${view === "list" ? "bg-ink text-white" : ""}`} aria-label="Zoznam"><List size={17} /></button><button onClick={() => setView("calendar")} className={`grid h-9 w-9 place-items-center rounded-lg ${view === "calendar" ? "bg-ink text-white" : ""}`} aria-label="Kalendár"><CalendarDays size={17} /></button></div>{editable && <button onClick={() => setEditing(emptyAppointment())} className="btn btn-dark"><Plus size={17} />Termín</button>}</div>} />
    {view === "list" ? <AppointmentList items={sorted} cars={cars} editable={editable} edit={setEditing} setStatus={setStatus} /> : <MonthCalendar items={appointments} edit={setEditing} />}
    {editing && <AppointmentModal item={editing} cars={cars} admins={admins} editable={editable} close={() => setEditing(null)} save={async (item) => { if (await save(item)) setEditing(null); }} />}
  </>;
}

function AppointmentList({ items, cars, editable, edit, setStatus }: { items: Appointment[]; cars: Car[]; editable: boolean; edit: (item: Appointment) => void; setStatus: (item: Appointment, status: AppointmentStatus) => Promise<void> }) {
  if (!items.length) return <EmptyState icon={<CalendarDays />} title="Kalendár je prázdny" text="Vytvorte prvú obhliadku alebo testovaciu jazdu." />;
  return <div className="grid gap-3">{items.map((item) => <Panel key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black">{item.client_name}</h2><StatusBadge value={item.status} /></div><p className="mt-2 text-sm font-bold">{formatAdminDate(item.starts_at)} · {item.duration_minutes} min.</p><p className="mt-1 text-sm text-black/55">{item.location} · {cars.find((car) => car.id === item.car_id)?.text.sk.title || "Bez auta"}</p><p className="mt-1 text-sm text-black/45">{item.client_phone}{item.comment ? ` · ${item.comment}` : ""}</p></div><div className="flex gap-2"><button onClick={() => edit(item)} className="h-10 rounded-lg border border-black/10 px-3 text-xs font-black">Detail</button>{editable && item.status === "scheduled" && <><button onClick={() => void setStatus(item, "completed")} className="grid h-10 w-10 place-items-center rounded-lg border border-green-200 text-green-700" aria-label="Dokončiť"><Check size={17} /></button><button onClick={() => void setStatus(item, "cancelled")} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-700" aria-label="Zrušiť"><XCircle size={17} /></button></>}</div></div></Panel>)}</div>;
}

function MonthCalendar({ items, edit }: { items: Appointment[]; edit: (item: Appointment) => void }) {
  const [month, setMonth] = useState(() => { const value = new Date(); return new Date(value.getFullYear(), value.getMonth(), 1); });
  const firstOffset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => index - firstOffset + 1);
  const label = new Intl.DateTimeFormat("sk-SK", { month: "long", year: "numeric" }).format(month);
  return <Panel><div className="mb-4 flex items-center justify-between"><button className="rounded-lg border border-black/10 px-3 py-2 text-sm font-black" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><h2 className="font-black capitalize">{label}</h2><button className="rounded-lg border border-black/10 px-3 py-2 text-sm font-black" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div><div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-black/10 text-center text-[11px] font-black uppercase text-black/40">{["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map((day) => <div key={day} className="bg-black/[.035] py-2">{day}</div>)}{cells.map((day, index) => { const valid = day >= 1 && day <= days; const daily = valid ? items.filter((item) => { const date = new Date(item.starts_at); return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth() && date.getDate() === day; }) : []; return <div key={index} className={`min-h-24 bg-white p-1 text-left sm:min-h-28 sm:p-2 ${valid ? "" : "opacity-30"}`}><span className="text-xs text-black/45">{valid ? day : ""}</span><div className="mt-1 grid gap-1">{daily.slice(0, 3).map((item) => <button key={item.id} onClick={() => edit(item)} className="truncate rounded bg-lime-100 px-1.5 py-1 text-left text-[10px] font-bold text-lime-900">{new Date(item.starts_at).toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" })} {item.client_name}</button>)}{daily.length > 3 && <span className="text-[10px] text-black/40">+{daily.length - 3}</span>}</div></div>; })}</div></Panel>;
}

function AppointmentModal({ item, cars, admins, editable, close, save }: { item: Appointment; cars: Car[]; admins: AdminProfile[]; editable: boolean; close: () => void; save: (item: Appointment) => Promise<void> }) {
  const [draft, setDraft] = useState(item);
  const localDate = new Date(draft.starts_at);
  const dateValue = Number.isNaN(localDate.getTime()) ? "" : `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}T${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(2, "0")}`;
  return <div className="fixed inset-0 z-[96] grid place-items-center overflow-y-auto bg-black/65 p-3"><div className="w-full max-w-2xl rounded-3xl bg-paper"><div className="flex items-center justify-between border-b border-black/10 p-5"><h2 className="text-xl font-black">Termín obhliadky / testovacej jazdy</h2><button onClick={close} className="grid h-10 w-10 place-items-center rounded-xl border border-black/10" aria-label="Zavrieť"><X /></button></div><div className="form-grid p-5"><TextField label="Meno klienta" value={draft.client_name} disabled={!editable} onChange={(value) => setDraft({ ...draft, client_name: value })} /><TextField label="Telefón" value={draft.client_phone} disabled={!editable} onChange={(value) => setDraft({ ...draft, client_phone: value })} /><label className="label">Dátum a čas<input type="datetime-local" className="field" value={dateValue} disabled={!editable} onChange={(event) => setDraft({ ...draft, starts_at: new Date(event.target.value).toISOString() })} /></label><SelectField label="Trvanie" value={String(draft.duration_minutes)} values={["30", "45", "60", "90", "120"]} disabled={!editable} onChange={(value) => setDraft({ ...draft, duration_minutes: Number(value) })} /><label className="label">Automobil<select className="field" value={draft.car_id || ""} disabled={!editable} onChange={(event) => setDraft({ ...draft, car_id: event.target.value || null })}><option value="">Bez auta</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.text.sk.title || `${car.brand} ${car.model}`}</option>)}</select></label><label className="label">Zodpovedný<select className="field" value={draft.assigned_to || ""} disabled={!editable} onChange={(event) => setDraft({ ...draft, assigned_to: event.target.value || null })}><option value="">Nepriradené</option>{admins.filter((admin) => admin.is_active).map((admin) => <option key={admin.id} value={admin.id}>{admin.display_name || admin.email || admin.id}</option>)}</select></label><TextField label="Miesto" value={draft.location} disabled={!editable} onChange={(value) => setDraft({ ...draft, location: value })} /><SelectField label="Stav" value={draft.status} values={["scheduled", "completed", "cancelled"]} disabled={!editable} onChange={(value) => setDraft({ ...draft, status: value as AppointmentStatus })} /><TextArea label="Komentár" value={draft.comment || ""} disabled={!editable} onChange={(value) => setDraft({ ...draft, comment: value })} /></div>{editable && <div className="flex justify-end border-t border-black/10 p-5"><button onClick={() => void save(draft)} className="btn btn-primary"><Save size={17} />Uložiť termín</button></div>}</div></div>;
}
