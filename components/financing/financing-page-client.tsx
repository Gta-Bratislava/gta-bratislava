"use client";

import { AlertTriangle, Calculator, Check, FileText, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FinancingForm } from "@/components/forms/financing-form";
import { defaultFinancingSettings } from "@/data/financing-settings";
import { demoCars } from "@/data/cars";
import { calculateFinancing, validateFinancing } from "@/lib/financing-calculator";
import { getDictionary } from "@/lib/i18n";
import { loadFinancingSettings, loadPublicCars } from "@/lib/supabase-browser";
import type { Car, FinancingSettings, Locale } from "@/lib/types";

const text = {
  sk: { eyebrow: "Financovanie", calculator: "Kalkulačka splátky", car: "Vybrané vozidlo", ownPrice: "Vlastná cena", price: "Cena vozidla", downEur: "Akontácia v €", downPercent: "Akontácia v %", term: "Doba splácania", monthly: "Orientačná mesačná splátka", financed: "Financovaná suma", months: "mesiacov", apply: "Prejsť k žiadosti", documents: "Čo si pripraviť", process: "Ako to funguje", faq: "Časté otázky", call: "Zavolať", whatsapp: "WhatsApp", errors: { invalid_price: "Zadajte platnú cenu vozidla.", below_minimum: "Financovaná suma je nižšia ako povolené minimum.", above_maximum: "Maximálna suma financovania je {amount}.", invalid_term: "Vyberte povolenú dobu splácania.", down_payment_too_low: "Akontácia je nižšia ako nastavené minimum." } },
  ru: { eyebrow: "Финансирование", calculator: "Калькулятор платежа", car: "Выбранный автомобиль", ownPrice: "Своя стоимость", price: "Стоимость автомобиля", downEur: "Первоначальный взнос в €", downPercent: "Первоначальный взнос в %", term: "Срок финансирования", monthly: "Ориентировочный платёж в месяц", financed: "Сумма финансирования", months: "месяцев", apply: "Перейти к заявке", documents: "Что подготовить", process: "Как всё проходит", faq: "Частые вопросы", call: "Позвонить", whatsapp: "WhatsApp", errors: { invalid_price: "Укажите корректную стоимость автомобиля.", below_minimum: "Сумма финансирования ниже установленного минимума.", above_maximum: "Максимальная сумма финансирования — {amount}.", invalid_term: "Выберите доступный срок финансирования.", down_payment_too_low: "Первоначальный взнос ниже установленного минимума." } },
  ua: { eyebrow: "Фінансування", calculator: "Калькулятор платежу", car: "Обраний автомобіль", ownPrice: "Власна вартість", price: "Вартість автомобіля", downEur: "Перший внесок у €", downPercent: "Перший внесок у %", term: "Строк фінансування", monthly: "Орієнтовний платіж на місяць", financed: "Сума фінансування", months: "місяців", apply: "Перейти до заявки", documents: "Що підготувати", process: "Як усе відбувається", faq: "Часті запитання", call: "Зателефонувати", whatsapp: "WhatsApp", errors: { invalid_price: "Укажіть коректну вартість автомобіля.", below_minimum: "Сума фінансування нижча за встановлений мінімум.", above_maximum: "Максимальна сума фінансування — {amount}.", invalid_term: "Оберіть доступний строк фінансування.", down_payment_too_low: "Перший внесок нижчий за встановлений мінімум." } },
  en: { eyebrow: "Financing", calculator: "Payment calculator", car: "Selected vehicle", ownPrice: "Custom price", price: "Vehicle price", downEur: "Down payment in €", downPercent: "Down payment in %", term: "Financing term", monthly: "Estimated monthly payment", financed: "Financed amount", months: "months", apply: "Continue to application", documents: "What to prepare", process: "How it works", faq: "Frequently asked questions", call: "Call", whatsapp: "WhatsApp", errors: { invalid_price: "Enter a valid vehicle price.", below_minimum: "The financed amount is below the configured minimum.", above_maximum: "The maximum financing amount is {amount}.", invalid_term: "Choose an available financing term.", down_payment_too_low: "The down payment is below the configured minimum." } },
} as const;

const euro = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const localeTags: Record<Locale, string> = { sk: "sk-SK", ua: "uk-UA", ru: "ru-RU", en: "en-GB" };

function formatWholeEuros(amount: number, locale: Locale) {
  return `${new Intl.NumberFormat(localeTags[locale], { maximumFractionDigits: 0 }).format(amount)} €`;
}

export function FinancingPageClient({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = text[locale];
  const [settings, setSettings] = useState<FinancingSettings>(defaultFinancingSettings);
  const [cars, setCars] = useState<Car[]>(demoCars.filter((car) => car.status === "available" || car.status === "reserved"));
  const [selectedCarId, setSelectedCarId] = useState("");
  const [price, setPrice] = useState(15_000);
  const [downEur, setDownEur] = useState(0);
  const [downPercent, setDownPercent] = useState(0);
  const [term, setTerm] = useState(84);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const requestedId = query.get("carId") || "";
    const requestedPrice = Number(query.get("price"));
    void Promise.allSettled([loadFinancingSettings(), loadPublicCars()]).then(([settingsResult, carsResult]) => {
      if (!active) return;
      const effectiveSettings = settingsResult.status === "fulfilled" && settingsResult.value
        ? { ...defaultFinancingSettings, ...settingsResult.value, localized: { ...defaultFinancingSettings.localized, ...settingsResult.value.localized } }
        : defaultFinancingSettings;
      const loadedCars = carsResult.status === "fulfilled" && carsResult.value.length
        ? carsResult.value.filter((car) => car.status === "available" || car.status === "reserved")
        : demoCars.filter((car) => car.status === "available" || car.status === "reserved");
      const requestedCar = requestedId ? loadedCars.find((car) => car.id === requestedId) : undefined;
      const targetPrice = requestedCar?.price || (Number.isFinite(requestedPrice) && requestedPrice > 0 ? requestedPrice : 15_000);
      if (requestedId) setSelectedCarId(requestedId);
      setPrice(targetPrice);
      setDownEur(0);
      setDownPercent(0);
      if (settingsResult.status === "fulfilled" && settingsResult.value) {
        setSettings(effectiveSettings);
        setTerm(settingsResult.value.allowed_terms.includes(84) ? 84 : (settingsResult.value.allowed_terms[0] || settingsResult.value.min_term || 12));
      }
      setCars(loadedCars);
    });
    return () => { active = false; };
  }, []);

  const input = useMemo(() => ({ carPrice: price, downPaymentEur: downEur, termMonths: term }), [price, downEur, term]);
  const { calculation, errors } = useMemo(() => validateFinancing(input, settings), [input, settings]);
  const selectedCar = cars.find((car) => car.id === selectedCarId);
  const content = settings.localized[locale] || defaultFinancingSettings.localized[locale];

  function changeDownEur(value: number) {
    const safe = Math.max(0, Math.min(Number.isFinite(value) ? value : 0, Math.max(0, price)));
    setDownEur(safe);
    setDownPercent(price > 0 ? Math.round(safe / price * 10_000) / 100 : 0);
  }
  function changeDownPercent(value: number) {
    const safe = Math.max(0, Math.min(Number.isFinite(value) ? value : 0, 100));
    setDownPercent(safe);
    setDownEur(Math.round(Math.max(0, price) * safe) / 100);
  }
  function changePrice(value: number, clearCar = true) {
    const next = Number.isFinite(value) ? value : 0;
    const safeDown = Math.min(downEur, Math.max(0, next));
    setPrice(next);
    setDownEur(safeDown);
    setDownPercent(next > 0 ? Math.round(safeDown / next * 10_000) / 100 : 0);
    if (clearCar) setSelectedCarId("");
  }

  return <>
    <section className="neon-grid relative overflow-hidden border-b border-acid/20 bg-black py-20 text-white sm:py-28"><div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(223,39,127,.2),transparent_65%)]"/><div className="shell relative"><div className="eyebrow text-white/50">{t.eyebrow}</div><h1 className="page-title max-w-5xl">{content.title}</h1><p className="mt-7 max-w-3xl text-lg leading-relaxed text-white/55">{content.description}</p></div></section>
    <section className="section-pad"><div className="shell">
      {settings.enabled ? <div className="grid gap-7 xl:grid-cols-[1.05fr_.95fr]">
        <article className="neon-panel rounded-[24px] p-5 sm:p-8"><div className="flex items-center gap-3"><Calculator className="text-acid"/><h2 className="text-2xl font-black">{t.calculator}</h2></div><div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="label sm:col-span-2">{t.car}<select data-testid="financing-car" className="field" value={selectedCarId} onChange={(event) => { const id = event.target.value; setSelectedCarId(id); const selected = cars.find((car) => car.id === id); if (selected) changePrice(selected.price, false); }}><option value="">{t.ownPrice}</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.text[locale].title} — {euro.format(car.price)}</option>)}</select></label>
          <label className="label">{t.price}<input className="field" type="number" min="1" max="10000000" value={price} onChange={(event) => changePrice(Number(event.target.value))}/></label>
          <label className="label">{t.term}<select className="field" value={term} onChange={(event) => setTerm(Number(event.target.value))}>{settings.allowed_terms.map((months) => <option key={months} value={months}>{months} {t.months}</option>)}</select></label>
          <label className="label">{t.downEur}<input data-testid="financing-down-eur" className="field" type="number" min="0" max={Math.max(0, price)} value={downEur} onChange={(event) => changeDownEur(Number(event.target.value))}/></label>
          <label className="label">{t.downPercent}<input data-testid="financing-down-percent" className="field" type="number" min="0" max="100" step="0.1" value={downPercent} onChange={(event) => changeDownPercent(Number(event.target.value))}/></label>
        </div>
        {errors.length > 0 && <div className="mt-5 rounded-xl border border-amber-400/35 bg-amber-400/10 p-4 text-sm text-amber-100" role="alert">{errors.map((error) => <p key={error}>• {error === "above_maximum" ? t.errors.above_maximum.replace("{amount}", formatWholeEuros(settings.max_amount, locale)) : t.errors[error as Exclude<keyof typeof t.errors, "above_maximum">]}</p>)}</div>}
        </article>
        <aside className="rounded-[24px] border border-acid/35 bg-acid/10 p-5 sm:p-8"><p className="text-sm font-black uppercase tracking-widest text-acid">{t.monthly}</p><p className="mt-3 text-5xl font-black tracking-tight text-white">{euro.format(calculation.monthlyPayment)}</p><div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">{[[t.price, euro.format(calculation.carPrice)],[t.downEur, euro.format(calculation.downPaymentEur)],[t.financed, euro.format(calculation.financedAmount)],[t.term, `${calculation.termMonths} ${t.months}`]].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between gap-4 border-t border-white/10 pt-3"><span className="text-sm text-white/50">{label}</span><strong className="text-right">{value}</strong></div>)}</div><p className="mt-7 text-xs leading-relaxed text-white/50">{content.warning}</p>{errors.length ? <span className="btn btn-primary mt-6 w-full cursor-not-allowed opacity-50" aria-disabled="true">{t.apply}</span> : <a href="#application" className="btn btn-primary mt-6 w-full">{t.apply}</a>}</aside>
      </div> : <div className="rounded-2xl border border-white/10 p-7 text-white/60">{content.description}</div>}

      <div className="mt-14 grid gap-5 lg:grid-cols-2"><InfoList icon={FileText} title={t.documents} items={content.documents}/><InfoList icon={ShieldCheck} title={t.process} items={content.steps} numbered/></div>
      <div className="mt-14"><h2 className="section-title">{t.faq}</h2><div className="mt-7 grid gap-3">{content.faq.map((item) => <details key={item.question} className="neon-panel rounded-2xl p-5"><summary className="cursor-pointer font-black">{item.question}</summary><p className="mt-4 leading-7 text-white/55">{item.answer}</p></details>)}</div></div>
      <div id="application" className="mt-14 scroll-mt-24 grid gap-8 lg:grid-cols-[.65fr_1.35fr]"><div><h2 className="section-title">{content.applyButton}</h2><p className="mt-5 text-white/50">{content.warning}</p><div className="mt-6 flex flex-wrap gap-3"><a className="btn btn-primary" href={`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(d.whatsappMessage(selectedCar?.text[locale].title))}`} target="_blank" rel="noreferrer"><MessageCircle size={18}/>{t.whatsapp}</a><a className="btn btn-dark" href={`tel:${d.phone.replace(/\s/g, "")}`}><Phone size={18}/>{t.call}</a></div><div className="mt-6 flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100"><AlertTriangle className="shrink-0" size={18}/><p>{content.warning}</p></div></div><FinancingForm locale={locale} initialCarPrice={calculation.carPrice} carId={selectedCar?.id} carSlug={selectedCar?.slug} calculation={calculation} calculationValid={errors.length === 0} allowedTerms={settings.allowed_terms} applyLabel={content.applyButton}/></div>
    </div></section>
  </>;
}

function InfoList({ icon: Icon, title, items, numbered = false }: { icon: typeof FileText; title: string; items: string[]; numbered?: boolean }) {
  return <article className="neon-panel rounded-[24px] p-6 sm:p-8"><Icon className="text-acid"/><h2 className="mt-5 text-2xl font-black">{title}</h2><ol className="mt-6 grid gap-3">{items.map((item, index) => <li key={item} className="flex gap-3 text-white/65"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-acid/40 text-xs font-black text-acid">{numbered ? index + 1 : <Check size={14}/>}</span><span>{item}</span></li>)}</ol></article>;
}
