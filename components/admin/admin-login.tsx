"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/logo";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AdminLogin({ onSignedIn }: { onSignedIn?: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "config">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const db = getSupabaseBrowserClient();
    if (!db) { setStatus("config"); return; }
    setStatus("loading");
    const data = new FormData(event.currentTarget);
    const { error } = await db.auth.signInWithPassword({
      email: String(data.get("email") || "").trim(),
      password: String(data.get("password") || ""),
    });
    if (error) { setStatus("error"); return; }
    setStatus("idle");
    if (onSignedIn) onSignedIn(); else window.location.assign("/admin/");
  }

  return <div className="w-full max-w-md rounded-[24px] border border-black/10 bg-white p-7 shadow-lift sm:p-9"><Logo/><div className="mt-10"><LockKeyhole className="text-[#789000]"/><h1 className="mt-4 text-3xl font-black tracking-tight">Administration</h1><p className="mt-2 text-sm text-black/50">Secure access through Supabase Auth.</p></div><form onSubmit={submit} className="mt-8 grid gap-4"><label className="label">Email<input className="field" name="email" type="email" required autoComplete="username"/></label><label className="label">Password<input className="field" name="password" type="password" required autoComplete="current-password"/></label><button className="btn btn-dark" disabled={status === "loading"}>{status === "loading" && <Loader2 className="animate-spin" size={18}/>}Sign in</button>{status === "error" && <p className="form-status error">Wrong email or password, or this account is not an administrator.</p>}{status === "config" && <p className="form-status error">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages.</p>}</form></div>;
}
