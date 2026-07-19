"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { rememberSubmission, submissionIsCoolingDown, submitFinancing } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/types";

export function FinancingForm({ locale, initialCarPrice }: { locale: Locale; initialCarPrice?: number }) {
  const d = getDictionary(locale);
  const started = useRef(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const raw = Object.fromEntries(new FormData(form));
    if (String(raw.website || "") || !started.current || Date.now() - started.current < 900 || submissionIsCoolingDown("financing")) { setStatus("error"); return; }
    setStatus("loading");
    try {
      await submitFinancing({
        locale,
        first_name: String(raw.first_name || "").trim(),
        last_name: String(raw.last_name || "").trim(),
        phone: String(raw.phone || "").trim(),
        email: String(raw.email || "").trim(),
        citizenship: String(raw.citizenship || "").trim(),
        employment: String(raw.employment || "").trim(),
        monthly_income: Number(raw.monthly_income),
        down_payment: Number(raw.down_payment),
        car_price: Number(raw.car_price),
        term_months: Number(raw.term_months),
        comment: String(raw.comment || "").trim(),
        consent: true,
      });
      rememberSubmission("financing");
      form.reset();
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return (
    <form onFocusCapture={() => { if (!started.current) started.current = Date.now(); }} onSubmit={submit} className="form-grid neon-panel rounded-[24px] p-5 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="label">{d.form.name}<input className="field" name="first_name" required autoComplete="given-name" /></label>
      <label className="label">{d.form.surname}<input className="field" name="last_name" required autoComplete="family-name" /></label>
      <label className="label">{d.form.phone}<input className="field" name="phone" required type="tel" pattern="[+0-9 ()-]{7,20}" autoComplete="tel" /></label>
      <label className="label">{d.form.email}<input className="field" name="email" required type="email" autoComplete="email" /></label>
      <label className="label">{d.form.citizenship}<input className="field" name="citizenship" required autoComplete="country-name" /></label>
      <label className="label">{d.form.employment}<select className="field" name="employment" required defaultValue=""><option value="" disabled>{d.form.select}</option>{d.form.employmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
      <label className="label">{d.form.income}<input className="field" name="monthly_income" required min="0" type="number" inputMode="decimal" /></label>
      <label className="label">{d.form.downPayment}<input className="field" name="down_payment" required min="0" type="number" inputMode="decimal" /></label>
      <label className="label">{d.form.carPrice}<input className="field" name="car_price" required min="1" type="number" inputMode="decimal" defaultValue={initialCarPrice} /></label>
      <label className="label">{d.form.term}<select className="field" name="term_months" required defaultValue="60">{[12,24,36,48,60,72,84,96].map((months) => <option key={months} value={months}>{months} {d.form.months}</option>)}</select></label>
      <label className="label md:col-span-2">{d.form.comment}<textarea className="field min-h-28 resize-y" name="comment" /></label>
      <label className="flex items-start gap-3 text-sm text-white/65 md:col-span-2"><input type="checkbox" name="consent" required className="mt-1 h-5 w-5 accent-[#9dde18]"/><span>{d.form.consent}</span></label>
      <div className="md:col-span-2"><button disabled={status === "loading"} className="btn btn-primary disabled:opacity-60" type="submit">{status === "loading" ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18}/>} {status === "loading" ? d.form.sending : d.form.send}</button>{status === "success" && <p className="form-status success mt-3" role="status">{d.form.success}</p>}{status === "error" && <p className="form-status error mt-3" role="alert">{d.form.error}</p>}</div>
    </form>
  );
}
