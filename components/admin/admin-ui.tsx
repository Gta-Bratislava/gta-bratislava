"use client";

import type { ReactNode } from "react";
import { adminOptionLabel } from "@/lib/admin-i18n";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>;
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-black sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-black/50">{subtitle}</p>}</div>{action}</div>;
}

export function EmptyState({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) {
  return <div className="rounded-2xl border border-dashed border-black/20 px-5 py-12 text-center text-black/45"><div className="mx-auto flex justify-center">{icon}</div><p className="mt-3 font-black text-black/70">{title}</p>{text && <p className="mx-auto mt-1 max-w-md text-sm">{text}</p>}</div>;
}

export function TextField({ label, value, onChange, type = "text", disabled = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean; placeholder?: string }) {
  return <label className="label">{label}<input className="field disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/45" type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function NumberField({ label, value, onChange, disabled = false, min }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean; min?: number }) {
  return <label className="label">{label}<input className="field disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/45" type="number" value={value} min={min} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function SelectField({ label, value, values, onChange, disabled = false }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="label">{label}<select className="field disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/45" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item} value={item}>{adminOptionLabel(item)}</option>)}</select></label>;
}

export function TextArea({ label, value, onChange, disabled = false, rows = 5, wide = true }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; rows?: number; wide?: boolean }) {
  return <label className={`label ${wide ? "md:col-span-2" : ""}`}>{label}<textarea className="field resize-y disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/45" rows={rows} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <label className="flex min-h-12 items-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm font-black"><input type="checkbox" className="h-5 w-5 accent-lime-500" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}

export function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = { available: "bg-green-100 text-green-800", sold: "bg-slate-200 text-slate-700", reserved: "bg-amber-100 text-amber-800", draft: "bg-blue-100 text-blue-800", hidden: "bg-black/10 text-black/60", new: "bg-lime-100 text-lime-800", completed: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800", cancelled: "bg-red-100 text-red-800", scheduled: "bg-blue-100 text-blue-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${colors[value] || "bg-violet-100 text-violet-800"}`}>{adminOptionLabel(value)}</span>;
}

export function formatAdminDate(value?: string | null, includeTime = true) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
}
