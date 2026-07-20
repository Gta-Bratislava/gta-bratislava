"use client";

import { BarChart3, Eye, FileText, MessageCircle } from "lucide-react";
import type { Car, CarMetric, PriceHistoryEntry } from "@/lib/types";
import { adminRu } from "@/lib/admin-i18n";
import { EmptyState, PageTitle, Panel, formatAdminDate } from "./admin-ui";

export function AnalyticsAdmin({ cars, metrics, priceHistory, applicationsCount }: { cars: Car[]; metrics: CarMetric[]; priceHistory: PriceHistoryEntry[]; applicationsCount?: number }) {
  const totalViews = metrics.reduce((sum, item) => sum + Number(item.view_count), 0);
  const totalWhatsApp = metrics.reduce((sum, item) => sum + Number(item.whatsapp_click_count), 0);
  const totalLeads = applicationsCount ?? metrics.reduce((sum, item) => sum + Number(item.lead_count), 0);
  const sorted = [...metrics].sort((a, b) => Number(b.view_count) - Number(a.view_count));
  const maxViews = Math.max(1, ...sorted.map((item) => Number(item.view_count)));
  return <><PageTitle title={adminRu.analytics.title} subtitle={adminRu.analytics.subtitle} /><div className="grid gap-3 sm:grid-cols-3"><Counter label={adminRu.analytics.views} value={totalViews} icon={<Eye />} /><Counter label={adminRu.analytics.whatsapp} value={totalWhatsApp} icon={<MessageCircle />} /><Counter label={adminRu.analytics.leads} value={totalLeads} icon={<FileText />} /></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><Panel><h2 className="text-lg font-black">{adminRu.analytics.popular}</h2>{sorted.length ? <div className="mt-5 grid gap-4">{sorted.map((item) => <div key={item.car_slug}><div className="mb-1 flex items-end justify-between gap-3"><div><p className="font-black">{cars.find((car) => car.slug === item.car_slug)?.text.ru.title || item.car_slug}</p><p className="text-xs text-black/45">{item.whatsapp_click_count} WhatsApp · {item.lead_count} заявок</p></div><span className="text-sm font-black">{item.view_count}</span></div><div className="h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.max(2, Number(item.view_count) / maxViews * 100)}%` }} /></div></div>)}</div> : <EmptyState icon={<BarChart3 />} title={adminRu.analytics.empty} text={adminRu.analytics.emptyText} />}</Panel><Panel><h2 className="text-lg font-black">{adminRu.analytics.priceHistory}</h2><div className="mt-4 grid gap-3">{priceHistory.slice(0, 20).map((entry) => <div key={entry.id} className="border-b border-black/8 pb-3 last:border-0"><p className="font-black">{cars.find((car) => car.id === entry.car_id)?.text.ru.title || entry.car_id}</p><p className="text-sm"><span className="text-black/40">{entry.old_price === null ? "—" : `${Number(entry.old_price).toLocaleString("ru-RU")} €`}</span> → <strong>{Number(entry.new_price).toLocaleString("ru-RU")} €</strong></p><time className="text-xs text-black/40">{formatAdminDate(entry.created_at)}</time></div>)}{!priceHistory.length && <p className="text-sm text-black/45">{adminRu.analytics.noPrices}</p>}</div></Panel></div></>;
}

function Counter({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <Panel><div className="flex items-start justify-between"><p className="text-sm font-black text-black/45">{label}</p><span className="text-lime-600">{icon}</span></div><p className="mt-4 text-3xl font-black">{value.toLocaleString("sk-SK")}</p></Panel>;
}
