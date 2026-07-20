"use client";

import { ArrowRight, BadgeEuro } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultFinancingSettings } from "@/data/financing-settings";
import { calculateFinancing } from "@/lib/financing-calculator";
import { localizedPath } from "@/lib/i18n";
import { loadFinancingSettings } from "@/lib/supabase-browser";
import type { Car, FinancingSettings, Locale } from "@/lib/types";

const labels = {
  sk: { title: "Orientačné financovanie", from: "odhadovaná splátka od", term: "na {months} mesiacov", button: "Vypočítať financovanie", apply: "Odoslať žiadosť", note: "Konečné podmienky určí finančná spoločnosť." },
  ru: { title: "Предварительный расчёт", from: "ориентировочный платёж от", term: "на {months} месяцев", button: "Рассчитать финансирование", apply: "Подать заявку", note: "Окончательные условия определяет финансовая компания." },
  ua: { title: "Попередній розрахунок", from: "орієнтовний платіж від", term: "на {months} місяців", button: "Розрахувати фінансування", apply: "Подати заявку", note: "Остаточні умови визначає фінансова компанія." },
  en: { title: "Initial estimate", from: "estimated payment from", term: "over {months} months", button: "Calculate financing", apply: "Apply", note: "The finance company determines the final terms." },
} as const;

export function CarFinancingCard({ car, locale }: { car: Car; locale: Locale }) {
  const [settings, setSettings] = useState<FinancingSettings>(defaultFinancingSettings);
  useEffect(() => { void loadFinancingSettings().then((value) => { if (value) setSettings({ ...defaultFinancingSettings, ...value }); }).catch(() => undefined); }, []);
  const term = settings.allowed_terms.includes(60) ? 60 : settings.allowed_terms[0] || 60;
  const down = Math.max(settings.min_down_payment_eur, car.price * settings.min_down_payment_percent / 100);
  const calculation = useMemo(() => calculateFinancing({ carPrice: car.price, downPaymentEur: down, termMonths: term, annualInterestRate: settings.default_interest_rate, fixedFee: settings.fixed_fee, percentFee: settings.percent_fee }), [car.price, down, term, settings.default_interest_rate, settings.fixed_fee, settings.percent_fee]);
  if (!settings.enabled || car.financingCalculatorEnabled === false || !car.financing) return null;
  const t = labels[locale];
  const href = `${localizedPath(locale, "financing")}?carId=${encodeURIComponent(car.id)}&car=${encodeURIComponent(car.text[locale].title)}&price=${car.price}`;
  return <div className="neon-panel rounded-[22px] p-6"><div className="flex items-center gap-3"><BadgeEuro className="text-acid"/><h3 className="text-xl font-black">{t.title}</h3></div><p className="mt-6 text-sm text-white/50">{t.from}</p><p className="mt-1 text-4xl font-black text-acid">{new Intl.NumberFormat(locale === "en" ? "en-GB" : "sk-SK", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(calculation.monthlyPayment)}</p><p className="mt-2 text-sm font-bold text-white/50">{t.term.replace("{months}", String(term))}</p><div className="mt-6 grid gap-2"><Link href={href} className="btn btn-primary w-full">{t.button}<ArrowRight size={18}/></Link><Link href={`${href}#application`} className="btn btn-dark w-full">{t.apply}</Link></div><p className="mt-4 text-xs leading-relaxed text-white/40">{t.note}</p></div>;
}
