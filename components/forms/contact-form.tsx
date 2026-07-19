"use client";

import { Loader2, Send } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { rememberSubmission, submissionIsCoolingDown, submitLead } from "@/lib/supabase-browser";
import type { Locale } from "@/lib/types";

export function ContactForm({ locale, type = "contact", carSlug, service, compact = false }: { locale: Locale; type?: "contact" | "service" | "test_drive"; carSlug?: string; service?: string; compact?: boolean }) {
  const d = getDictionary(locale);
  const started = useRef(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const nextErrors: Record<string, string> = {};
    if (!String(data.name || "").trim()) nextErrors.name = d.form.required;
    if (!/^\+?[0-9\s()-]{7,20}$/.test(String(data.phone || ""))) nextErrors.phone = d.form.invalidPhone;
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) nextErrors.email = d.form.invalidEmail;
    if (!data.consent) nextErrors.consent = d.form.required;
    if (String(data.website || "") || !started.current || Date.now() - started.current < 900 || submissionIsCoolingDown(`lead-${type}`)) nextErrors.form = d.form.error;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus("loading");
    try {
      await submitLead({
        type,
        locale,
        name: String(data.name || "").trim(),
        phone: String(data.phone || "").trim(),
        email: String(data.email || "").trim(),
        message: String(data.message || "").trim(),
        carSlug,
        service,
        consent: true,
      });
      rememberSubmission(`lead-${type}`);
      void trackAnalyticsEvent("lead_submit", locale, carSlug);
      form.reset();
      setStatus("success");
    } catch { setStatus("error"); }
  }

  return (
    <form onFocusCapture={() => { if (!started.current) started.current = Date.now(); }} onSubmit={submit} className={compact ? "grid gap-4" : "form-grid"} noValidate>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="label">{d.form.name}<input className="field" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <span className="text-xs text-red-700">{errors.name}</span>}</label>
      <label className="label">{d.form.phone}<input className="field" name="phone" type="tel" autoComplete="tel" placeholder="+421" aria-invalid={Boolean(errors.phone)} />{errors.phone && <span className="text-xs text-red-700">{errors.phone}</span>}</label>
      <label className="label">{d.form.email}<input className="field" name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <span className="text-xs text-red-700">{errors.email}</span>}</label>
      <label className={`label ${compact ? "" : "md:col-span-2"}`}>{d.form.message}<textarea className="field min-h-32 resize-y" name="message" /></label>
      <label className={`flex items-start gap-3 text-sm text-white/65 ${compact ? "" : "md:col-span-2"}`}><input type="checkbox" name="consent" className="mt-1 h-5 w-5 accent-[#9dde18]" /><span>{d.form.consent}{errors.consent && <span className="mt-1 block text-xs text-red-400">{errors.consent}</span>}</span></label>
      <div className={`flex flex-col items-start gap-3 ${compact ? "" : "md:col-span-2"}`}><button disabled={status === "loading"} className="btn btn-primary min-w-40 disabled:opacity-60" type="submit">{status === "loading" ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} {status === "loading" ? d.form.sending : d.form.send}</button>{errors.form && <p className="form-status error" role="alert">{errors.form}</p>}{status === "success" && <p className="form-status success" role="status">{d.form.success}</p>}{status === "error" && <p className="form-status error" role="alert">{d.form.error}</p>}</div>
    </form>
  );
}
