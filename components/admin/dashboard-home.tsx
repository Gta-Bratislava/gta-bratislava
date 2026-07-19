"use client";

import { CalendarDays, CarFront, Clock3, Eye, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { Appointment, Car, CarMetric, CrmApplication } from "@/lib/types";
import { EmptyState, PageTitle, Panel, StatusBadge, formatAdminDate } from "./admin-ui";

export function DashboardHome({ cars, applications, appointments, metrics, staleDays }: { cars: Car[]; applications: CrmApplication[]; appointments: Appointment[]; metrics: CarMetric[]; staleDays: number }) {
  const [now] = useState(() => Date.now());
  const available = cars.filter((car) => car.status === "available").length;
  const reserved = cars.filter((car) => car.status === "reserved").length;
  const sold = cars.filter((car) => car.status === "sold").length;
  const newLeads = applications.filter((item) => item.crm_status === "new").length;
  const upcoming = appointments.filter((item) => item.status === "scheduled" && +new Date(item.starts_at) >= now).sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)).slice(0, 5);
  const popular = [...metrics].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
  const staleLimit = now - staleDays * 86_400_000;
  const stale = cars.filter((car) => +new Date(car.updatedAt || car.createdAt) < staleLimit && !["sold", "hidden"].includes(car.status)).sort((a, b) => +new Date(a.updatedAt || a.createdAt) - +new Date(b.updatedAt || b.createdAt)).slice(0, 5);
  return <>
    <PageTitle title="Dashboard" subtitle="Prehľad predaja, žiadostí a najbližších úloh" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="V ponuke" value={available} icon={<CarFront />} tone="lime" /><MetricCard label="Rezervované / predané" value={`${reserved} / ${sold}`} icon={<CarFront />} tone="dark" /><MetricCard label="Nové žiadosti" value={newLeads} icon={<FileText />} tone="blue" /><MetricCard label="Najbližšie termíny" value={upcoming.length} icon={<CalendarDays />} tone="amber" /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2"><Panel><h2 className="text-lg font-black">Posledné žiadosti</h2><div className="mt-4 grid gap-3">{applications.slice(0, 5).map((item) => <div key={`${item.source_type}-${item.id}`} className="flex items-center justify-between gap-3 border-b border-black/8 pb-3 last:border-0 last:pb-0"><div className="min-w-0"><p className="truncate font-black">{item.name}</p><p className="truncate text-xs text-black/45">{item.application_type} · {item.phone}</p></div><div className="text-right"><StatusBadge value={item.crm_status} /><p className="mt-1 text-[11px] text-black/40">{formatAdminDate(item.created_at)}</p></div></div>)}{!applications.length && <p className="text-sm text-black/45">Zatiaľ bez žiadostí.</p>}</div></Panel><Panel><h2 className="text-lg font-black">Najbližšie obhliadky</h2><div className="mt-4 grid gap-3">{upcoming.map((item) => <div key={item.id} className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-100 text-lime-800"><Clock3 size={18} /></div><div><p className="font-black">{item.client_name}</p><p className="text-xs text-black/50">{formatAdminDate(item.starts_at)} · {item.location}</p></div></div>)}{!upcoming.length && <p className="text-sm text-black/45">Žiadne naplánované termíny.</p>}</div></Panel><Panel><h2 className="text-lg font-black">Najviac prezerané autá</h2><div className="mt-4 grid gap-3">{popular.map((item) => <div key={item.car_slug} className="flex items-center justify-between"><div><p className="font-black">{cars.find((car) => car.slug === item.car_slug)?.text.sk.title || item.car_slug}</p><p className="text-xs text-black/45"><MessageCircle className="mr-1 inline" size={12} />{item.whatsapp_click_count} WhatsApp · {item.lead_count} žiadostí</p></div><span className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-sm font-black"><Eye size={14} />{item.view_count}</span></div>)}{!popular.length && <p className="text-sm text-black/45">Analytika sa začne plniť po nasadení migrácie.</p>}</div></Panel><Panel><h2 className="text-lg font-black">Dlho neaktualizované</h2><p className="mt-1 text-xs text-black/45">Viac než {staleDays} dní</p><div className="mt-4 grid gap-3">{stale.map((car) => <div key={car.id} className="flex items-center justify-between gap-3"><div><p className="font-black">{car.text.sk.title || `${car.brand} ${car.model}`}</p><p className="text-xs text-black/45">{formatAdminDate(car.updatedAt || car.createdAt)}</p></div><StatusBadge value={car.status} /></div>)}{!stale.length && <p className="text-sm text-black/45">Všetky aktívne autá sú aktuálne.</p>}</div></Panel></div>
  </>;
}

function MetricCard({ label, value, icon, tone }: { label: string; value: number | string; icon: React.ReactNode; tone: "lime" | "dark" | "blue" | "amber" }) {
  const colors = { lime: "bg-lime-300 text-ink", dark: "bg-ink text-white", blue: "bg-blue-100 text-blue-950", amber: "bg-amber-100 text-amber-950" };
  return <article className={`rounded-2xl p-5 ${colors[tone]}`}><div className="flex items-start justify-between"><p className="text-sm font-black opacity-60">{label}</p>{icon}</div><p className="mt-5 text-4xl font-black">{value}</p></article>;
}
