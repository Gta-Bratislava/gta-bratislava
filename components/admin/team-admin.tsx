"use client";

import { Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { roleLabels } from "@/lib/admin-permissions";
import { adminErrorMessage, adminRu } from "@/lib/admin-i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminProfile, AdminRole } from "@/lib/types";
import { EmptyState, PageTitle, Panel, StatusBadge, TextField, formatAdminDate } from "./admin-ui";

const roles: AdminRole[] = ["owner", "manager", "content_manager", "viewer"];

export function TeamAdmin({ admins, currentId, onChanged, setNotice }: { admins: AdminProfile[]; currentId: string; onChanged: (admins: AdminProfile[]) => void; setNotice: (message: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("manager");
  const [busy, setBusy] = useState(false);

  async function add() {
    const db = getSupabaseBrowserClient(); if (!db || !email.includes("@")) return setNotice("Укажите e-mail существующего пользователя Supabase Auth.");
    setBusy(true);
    const { data, error } = await db.rpc("owner_add_admin_by_email", { p_email: email, p_role: role, p_display_name: name || null });
    if (error) { setBusy(false); return setNotice(adminErrorMessage(error)); }
    const { data: admin } = await db.from("admins").select("*").eq("id", data).single();
    setBusy(false);
    if (admin) onChanged([...admins.filter((item) => item.id !== admin.id), admin as AdminProfile]);
    setEmail(""); setName(""); setNotice(adminRu.team.added);
  }

  async function update(admin: AdminProfile, patch: Partial<AdminProfile>) {
    const db = getSupabaseBrowserClient(); if (!db) return;
    const { data, error } = await db.from("admins").update(patch).eq("id", admin.id).select("*").single();
    if (error) return setNotice(adminErrorMessage(error));
    onChanged(admins.map((item) => item.id === admin.id ? data as AdminProfile : item)); setNotice(adminRu.team.updated);
  }

  async function remove(admin: AdminProfile) {
    if (!window.confirm(adminRu.team.removeConfirm.replace("{name}", admin.display_name || admin.email || admin.id))) return;
    const db = getSupabaseBrowserClient(); if (!db) return;
    const { error } = await db.from("admins").delete().eq("id", admin.id);
    if (error) return setNotice(adminErrorMessage(error));
    onChanged(admins.filter((item) => item.id !== admin.id)); setNotice(adminRu.team.removed);
  }

  return <><PageTitle title={adminRu.team.title} subtitle={adminRu.team.subtitle} /><Panel className="mb-5"><h2 className="font-black">{adminRu.team.add}</h2><p className="mt-1 text-sm text-black/45">{adminRu.team.addHint}</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><TextField label={adminRu.settings.email} type="email" value={email} onChange={setEmail} /><TextField label={adminRu.team.name} value={name} onChange={setName} /><label className="label">{adminRu.team.role}<select className="field" value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></label><button disabled={busy} onClick={() => void add()} className="btn btn-primary self-end disabled:opacity-50"><Plus size={17} />{adminRu.common.add}</button></div></Panel>{admins.length ? <div className="grid gap-3">{admins.map((admin) => <Panel key={admin.id}><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-lime-600" /><h2 className="font-black">{admin.display_name || admin.email || admin.id}</h2>{admin.is_active ? <StatusBadge value="available" /> : <StatusBadge value="hidden" />}</div><p className="mt-1 text-xs text-black/45">{admin.email || admin.id} · с {formatAdminDate(admin.created_at, false)}</p></div><div className="flex flex-wrap items-end gap-2"><label className="label min-w-44">{adminRu.team.role}<select className="field" value={admin.role} onChange={(event) => void update(admin, { role: event.target.value as AdminRole })}>{roles.map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></label><button onClick={() => void update(admin, { is_active: !admin.is_active })} className="grid h-11 w-11 place-items-center rounded-xl border border-black/10" title={admin.is_active ? adminRu.team.deactivate : adminRu.team.activate}><Save size={17} /></button>{admin.id !== currentId && <button onClick={() => void remove(admin)} className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 text-red-700" aria-label={adminRu.team.remove}><Trash2 size={17} /></button>}</div></div></Panel>)}</div> : <EmptyState icon={<ShieldCheck />} title={adminRu.team.empty} />}</>;
}
