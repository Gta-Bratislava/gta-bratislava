"use client";

import { ArrowDown, ArrowUp, CarFront, Database, Download, FileText, ImagePlus, Languages, Loader2, LogOut, Pencil, Plus, Save, Star, Trash2, Users, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/admin-login";
import { Logo } from "@/components/logo";
import { demoCars } from "@/data/cars";
import { MAX_SOURCE_IMAGE_BYTES, optimizeCarImage } from "@/lib/image-optimization";
import { getSupabaseBrowserClient, isSupabaseConfigured, type AdminApplication } from "@/lib/supabase-browser";
import type { Car, Locale } from "@/lib/types";

type Tab = "cars" | "applications" | "translations";
type AuthState = "loading" | "signed-out" | "authorized" | "forbidden" | "config";
const blankText = { title: "", short: "", description: "", equipment: [] as string[], serviceHistory: "", damageInfo: "", origin: "" };

function emptyCar(): Car {
  const id = crypto.randomUUID();
  return { id, slug: `new-car-${id.slice(0, 8)}`, brand: "", model: "", year: new Date().getFullYear(), mileage: 0, fuel: "diesel", transmission: "automatic", body: "sedan", drive: "fwd", powerKw: 0, engine: "", price: 0, monthlyPrice: 0, financing: true, status: "available", vin: "", featured: false, images: [], thumbnails: [], createdAt: new Date().toISOString().slice(0, 10), text: { sk: { ...blankText }, ua: { ...blankText }, ru: { ...blankText }, en: { ...blankText } } };
}

export function AdminPortal() {
  const [authState, setAuthState] = useState<AuthState>(() => isSupabaseConfigured() ? "loading" : "config");

  useEffect(() => {
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const client = db;
    let active = true;
    async function verify(userId?: string) {
      if (!active) return;
      if (!userId) { setAuthState("signed-out"); return; }
      const { data } = await client.from("admins").select("id").eq("id", userId).maybeSingle();
      if (active) setAuthState(data ? "authorized" : "forbidden");
    }
    client.auth.getSession().then(({ data }) => verify(data.session?.user.id));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { void verify(session?.user.id); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (authState === "loading") return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin"/></div>;
  if (authState === "config") return <AdminMessage title="Supabase is not configured" text="Add the public Supabase URL and anon key in Cloudflare Pages. The website itself remains available with static fallback data."/>;
  if (authState === "signed-out") return <div className="grid min-h-screen place-items-center p-5"><AdminLogin onSignedIn={() => window.location.reload()}/></div>;
  if (authState === "forbidden") return <AdminMessage title="Access denied" text="The signed-in user is not listed in public.admins. Add the user ID in the Supabase SQL Editor, then sign in again." logout/>;
  return <AdminDashboard/>;
}

function AdminMessage({ title, text, logout = false }: { title: string; text: string; logout?: boolean }) {
  async function signOut() { await getSupabaseBrowserClient()?.auth.signOut(); window.location.reload(); }
  return <div className="grid min-h-screen place-items-center p-5"><div className="max-w-xl rounded-3xl bg-white p-8 shadow-lift"><Logo/><h1 className="mt-10 text-3xl font-black">{title}</h1><p className="mt-3 text-black/55">{text}</p>{logout && <button onClick={signOut} className="btn btn-dark mt-6"><LogOut size={17}/>Sign out</button>}</div></div>;
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("cars");
  const [cars, setCars] = useState<Car[]>(demoCars);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [editing, setEditing] = useState<Car | null>(null);
  const [notice, setNotice] = useState("Loading Supabase data…");

  useEffect(() => {
    const db = getSupabaseBrowserClient();
    if (!db) return;
    let active = true;
    Promise.all([
      db.from("cars").select("data").order("updated_at", { ascending: false }),
      db.from("leads").select("*").order("created_at", { ascending: false }),
      db.from("financing_applications").select("*").order("created_at", { ascending: false }),
    ]).then(([carsResult, leadsResult, financeResult]) => {
      if (!active) return;
      if (carsResult.error || leadsResult.error || financeResult.error) { setNotice("Could not load admin data. Check RLS policies and the admin user."); return; }
      if (carsResult.data?.length) setCars(carsResult.data.map((row) => row.data as Car));
      const combined = [
        ...(leadsResult.data || []).map((row) => ({ ...row, kind: "lead" as const })),
        ...(financeResult.data || []).map((row) => ({ ...row, kind: "financing" as const })),
      ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)) as AdminApplication[];
      setApplications(combined);
      setNotice("");
    });
    return () => { active = false; };
  }, []);

  async function logout() {
    await getSupabaseBrowserClient()?.auth.signOut();
  }

  async function saveCar() {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.text.sk.title.trim()) { setNotice("Slug and Slovak title are required."); return; }
    const db = getSupabaseBrowserClient();
    if (!db) return;
    setNotice("Saving…");
    const record = { id: editing.id, slug: editing.slug, data: editing, status: editing.status, price: editing.price, updated_at: new Date().toISOString() };
    const { error } = await db.from("cars").upsert(record);
    if (error) { setNotice(error.message); return; }
    setCars((old) => old.some((car) => car.id === editing.id) ? old.map((car) => car.id === editing.id ? editing : car) : [editing, ...old]);
    setNotice("Saved");
    setEditing(null);
  }

  async function deleteCar(car: Car) {
    if (!confirm(`Delete ${car.text.sk.title || car.slug}?`)) return;
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const storagePaths = [...car.images, ...(car.thumbnails || [])].map(storageObjectPath).filter((path): path is string => Boolean(path));
    if (storagePaths.length) await db.storage.from("cars").remove(storagePaths);
    const { error } = await db.from("cars").delete().eq("id", car.id);
    if (error) { setNotice(error.message); return; }
    setCars((old) => old.filter((item) => item.id !== car.id));
  }

  return <><header className="border-b border-black/10 bg-white"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5"><Logo href="/sk/"/><button onClick={logout} className="flex items-center gap-2 text-sm font-black text-black/50 hover:text-black"><LogOut size={17}/>Log out</button></div></header><div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 lg:grid-cols-[220px_1fr]"><aside className="h-fit rounded-2xl bg-ink p-3 text-white lg:sticky lg:top-6"><p className="px-3 pb-3 pt-2 text-xs font-black uppercase tracking-wider text-white/35">Dashboard</p>{([['cars','Cars',CarFront],['applications','Applications',Users],['translations','Translations',Languages]] as const).map(([key,label,Icon])=><button key={key} onClick={()=>setTab(key)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black ${tab===key?"bg-acid text-ink":"text-white/65 hover:bg-white/10"}`}><Icon size={18}/>{label}</button>)}</aside><section><div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><Database size={18}/>Supabase Auth, database and Storage are connected through protected browser policies.</div>{notice&&<p className="mb-4 rounded-xl bg-white p-3 text-sm font-bold">{notice}</p>}{tab === "cars" && <CarsTab cars={cars} edit={setEditing} remove={deleteCar}/>} {tab === "applications" && <ApplicationsTab applications={applications}/>} {tab === "translations" && <TranslationsTab/>}</section></div>{editing && <CarEditor car={editing} setCar={setEditing} close={()=>setEditing(null)} save={saveCar}/>}</>;
}

function CarsTab({ cars, edit, remove }: { cars: Car[]; edit: (car: Car) => void; remove: (car: Car) => void }) {
  return <><div className="mb-5 flex items-center justify-between"><div><h1 className="text-3xl font-black">Cars</h1><p className="text-sm text-black/50">{cars.length} records</p></div><button onClick={()=>edit(emptyCar())} className="btn btn-dark"><Plus size={18}/>Add car</button></div><div className="overflow-hidden rounded-2xl border border-black/10 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-black/[.035] text-xs uppercase tracking-wider text-black/45"><tr><th className="p-4">Car</th><th className="p-4">Year</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{cars.map((car)=><tr key={car.id} className="border-t border-black/10"><td className="p-4"><div className="flex items-center gap-3"><div className="relative h-14 w-20 overflow-hidden rounded-lg bg-gray-100"><Image src={car.thumbnails?.[0] || car.images[0] || "/cars/bmw-main.svg"} alt="" fill className="object-cover" sizes="80px"/></div><div><p className="font-black">{car.text.sk.title || `${car.brand} ${car.model}`}</p><p className="text-xs text-black/45">{car.slug}</p></div></div></td><td className="p-4">{car.year}</td><td className="p-4 font-black">{car.price.toLocaleString()} €</td><td className="p-4"><span className="rounded-full bg-black/5 px-3 py-1 text-xs font-black uppercase">{car.status}</span></td><td className="p-4"><div className="flex gap-2"><button onClick={()=>edit(structuredClone(car))} className="grid h-10 w-10 place-items-center rounded-lg border border-black/10" aria-label="Edit"><Pencil size={16}/></button><button onClick={()=>remove(car)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-700" aria-label="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></div></>;
}

function CarEditor({ car, setCar, close, save }: { car: Car; setCar: (car: Car) => void; close: () => void; save: () => void }) {
  const [lang, setLang] = useState<Locale>("sk");
  const [uploadStatus, setUploadStatus] = useState("");
  const update = <K extends keyof Car>(key: K, value: Car[K]) => setCar({ ...car, [key]: value });
  const updateText = (key: keyof Car["text"][Locale], value: string | string[]) => setCar({ ...car, text: { ...car.text, [lang]: { ...car.text[lang], [key]: value } } });

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const db = getSupabaseBrowserClient();
    if (!db) return;
    let images = [...car.images];
    let thumbnails = car.images.map((image, index) => car.thumbnails?.[index] || image);
    try {
      for (const [index, file] of files.entries()) {
        setUploadStatus(`Optimizing ${index + 1}/${files.length}…`);
        const optimized = await optimizeCarImage(file);
        const token = crypto.randomUUID();
        const fullPath = `${car.id}/${token}-full.webp`;
        const thumbPath = `${car.id}/${token}-thumb.webp`;
        const [fullResult, thumbResult] = await Promise.all([
          db.storage.from("cars").upload(fullPath, optimized.full, { contentType: "image/webp", cacheControl: "31536000" }),
          db.storage.from("cars").upload(thumbPath, optimized.thumbnail, { contentType: "image/webp", cacheControl: "31536000" }),
        ]);
        if (fullResult.error || thumbResult.error) throw fullResult.error || thumbResult.error;
        images.push(db.storage.from("cars").getPublicUrl(fullPath).data.publicUrl);
        thumbnails.push(db.storage.from("cars").getPublicUrl(thumbPath).data.publicUrl);
      }
      setCar({ ...car, images, thumbnails });
      setUploadStatus("Images optimized and uploaded as WebP.");
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Upload failed");
    } finally {
      event.target.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= car.images.length) return;
    const images = [...car.images];
    const thumbnails = car.images.map((image, itemIndex) => car.thumbnails?.[itemIndex] || image);
    [images[index], images[target]] = [images[target], images[index]];
    [thumbnails[index], thumbnails[target]] = [thumbnails[target], thumbnails[index]];
    setCar({ ...car, images, thumbnails });
  }

  function setMain(index: number) {
    const images = [...car.images];
    const thumbnails = car.images.map((image, itemIndex) => car.thumbnails?.[itemIndex] || image);
    const [image] = images.splice(index, 1);
    const [thumbnail] = thumbnails.splice(index, 1);
    setCar({ ...car, images: [image, ...images], thumbnails: [thumbnail, ...thumbnails] });
  }

  async function removeImage(index: number) {
    const db = getSupabaseBrowserClient();
    const urls = [car.images[index], car.thumbnails?.[index]].filter((url): url is string => Boolean(url));
    const paths = urls.map(storageObjectPath).filter((path): path is string => Boolean(path));
    if (db && paths.length) await db.storage.from("cars").remove(paths);
    setCar({ ...car, images: car.images.filter((_, itemIndex) => itemIndex !== index), thumbnails: car.thumbnails?.filter((_, itemIndex) => itemIndex !== index) });
  }

  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/65 p-3 sm:p-6"><div className="mx-auto max-w-5xl rounded-[24px] bg-paper"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-paper/95 p-5 backdrop-blur"><div><h2 className="text-2xl font-black">{car.text.sk.title || "New car"}</h2><p className="text-xs text-black/45">{car.id}</p></div><div className="flex gap-2"><button onClick={save} className="btn btn-primary min-h-11"><Save size={17}/>Save</button><button onClick={close} className="grid h-11 w-11 place-items-center rounded-xl border border-black/15" aria-label="Close"><X/></button></div></div><div className="grid gap-8 p-5 sm:p-7"><section><h3 className="mb-4 text-lg font-black">Core data</h3><div className="form-grid"><Text label="Brand" value={car.brand} onChange={(value)=>update("brand",value)}/><Text label="Model" value={car.model} onChange={(value)=>update("model",value)}/><Text label="Slug" value={car.slug} onChange={(value)=>update("slug",value)}/><NumberField label="Year" value={car.year} onChange={(value)=>update("year",value)}/><NumberField label="Mileage" value={car.mileage} onChange={(value)=>update("mileage",value)}/><NumberField label="Price (€)" value={car.price} onChange={(value)=>update("price",value)}/><NumberField label="Monthly price (€)" value={car.monthlyPrice} onChange={(value)=>update("monthlyPrice",value)}/><NumberField label="Power (kW)" value={car.powerKw} onChange={(value)=>update("powerKw",value)}/><Text label="Engine" value={car.engine} onChange={(value)=>update("engine",value)}/><Text label="VIN (may be masked)" value={car.vin} onChange={(value)=>update("vin",value)}/><Select label="Status" value={car.status} values={["available","reserved","sold"]} onChange={(value)=>update("status",value as Car["status"])}/><Select label="Fuel" value={car.fuel} values={["diesel","petrol","hybrid","electric"]} onChange={(value)=>update("fuel",value as Car["fuel"])}/><Select label="Transmission" value={car.transmission} values={["automatic","manual"]} onChange={(value)=>update("transmission",value as Car["transmission"])}/><Select label="Body" value={car.body} values={["sedan","wagon","suv","hatchback"]} onChange={(value)=>update("body",value as Car["body"])}/><Select label="Drive" value={car.drive} values={["fwd","rwd","awd"]} onChange={(value)=>update("drive",value as Car["drive"])}/><label className="flex items-center gap-3 font-bold"><input type="checkbox" checked={car.financing} onChange={(event)=>update("financing",event.target.checked)} className="h-5 w-5"/>Financing available</label><label className="flex items-center gap-3 font-bold"><input type="checkbox" checked={car.featured} onChange={(event)=>update("featured",event.target.checked)} className="h-5 w-5"/>Featured on home</label></div></section><section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black">Photos</h3><p className="text-xs text-black/50">JPEG, PNG or WebP, maximum {MAX_SOURCE_IMAGE_BYTES / 1024 / 1024} MB each. Full and card versions are generated automatically.</p></div><label className="btn btn-dark min-h-11 cursor-pointer"><ImagePlus size={17}/>Upload<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={upload}/></label></div>{uploadStatus && <p className="mb-4 rounded-lg bg-white p-3 text-sm font-bold">{uploadStatus}</p>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{car.images.map((image,index)=><div key={`${image}-${index}`} className="rounded-xl border border-black/10 bg-white p-2"><div className="relative aspect-[16/10] overflow-hidden rounded-lg"><Image src={car.thumbnails?.[index] || image} alt="" fill sizes="250px" className="object-cover"/></div><div className="mt-2 flex justify-between"><button title="Set main" onClick={()=>setMain(index)} className={index===0?"text-amber-500":"text-black/35"}><Star size={18} fill={index===0?"currentColor":"none"}/></button><div className="flex gap-2"><button onClick={()=>move(index,-1)} aria-label="Move up"><ArrowUp size={17}/></button><button onClick={()=>move(index,1)} aria-label="Move down"><ArrowDown size={17}/></button><button onClick={()=>void removeImage(index)} className="text-red-700" aria-label="Delete photo"><Trash2 size={17}/></button></div></div></div>)}</div></section><section><div className="mb-4 flex gap-2">{(["sk","ua","ru","en"] as Locale[]).map((item)=><button key={item} onClick={()=>setLang(item)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase ${lang===item?"bg-ink text-white":"bg-white"}`}>{item}</button>)}</div><div className="form-grid"><Text label="Title" value={car.text[lang].title} onChange={(value)=>updateText("title",value)}/><Text label="Short description" value={car.text[lang].short} onChange={(value)=>updateText("short",value)}/><Area label="Description" value={car.text[lang].description} onChange={(value)=>updateText("description",value)}/><Area label="Equipment (one per line)" value={car.text[lang].equipment.join("\n")} onChange={(value)=>updateText("equipment",value.split("\n").filter(Boolean))}/><Area label="Service history" value={car.text[lang].serviceHistory} onChange={(value)=>updateText("serviceHistory",value)}/><Area label="Damage / painted elements" value={car.text[lang].damageInfo} onChange={(value)=>updateText("damageInfo",value)}/><Text label="Origin" value={car.text[lang].origin} onChange={(value)=>updateText("origin",value)}/></div></section></div></div></div>;
}

function ApplicationsTab({ applications }: { applications: AdminApplication[] }) {
  function exportCsv() {
    const keys = [...new Set(applications.flatMap((item) => Object.keys(item)))];
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = `\uFEFF${keys.map(escape).join(",")}\n${applications.map((item) => keys.map((key) => escape(item[key])).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `gta-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return <><div className="mb-5 flex items-center justify-between"><div><h1 className="text-3xl font-black">Applications</h1><p className="text-sm text-black/50">{applications.length} records</p></div><button onClick={exportCsv} disabled={!applications.length} className="btn btn-dark disabled:opacity-50"><Download size={18}/>Export CSV</button></div><div className="grid gap-3">{applications.length ? applications.map((item,index)=><article key={String(item.id || index)} className="rounded-2xl border border-black/10 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black">{String(item.kind || item.type || "application")}</p><time className="text-xs text-black/45">{String(item.created_at || "")}</time></div><dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">{Object.entries(item).filter(([key])=>!["id","kind","created_at","consent"].includes(key)).map(([key,value])=><div key={key}><dt className="text-xs font-bold uppercase text-black/35">{key.replaceAll("_"," ")}</dt><dd className="break-words font-semibold">{String(value ?? "")}</dd></div>)}</dl></article>) : <div className="rounded-2xl border border-dashed border-black/20 p-12 text-center text-black/45"><FileText className="mx-auto"/><p className="mt-3 font-bold">No applications yet.</p></div>}</div></>;
}

function TranslationsTab() {
  const [locale, setLocale] = useState<Locale>("sk");
  const [content, setContent] = useState({ heroTitle: "", heroLead: "" });
  const [status, setStatus] = useState("");
  async function load(next: Locale) {
    setLocale(next);
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const { data, error } = await db.from("site_content").select("content").eq("locale", next).maybeSingle();
    if (error) { setStatus(error.message); return; }
    const value = (data?.content || {}) as Record<string, string>;
    setContent({ heroTitle: value.heroTitle || "", heroLead: value.heroLead || "" });
  }
  async function save() {
    setStatus("Saving…");
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const { error } = await db.from("site_content").upsert({ locale, content, updated_at: new Date().toISOString() });
    setStatus(error ? error.message : "Saved");
  }
  return <div><h1 className="text-3xl font-black">Homepage translations</h1><p className="mt-1 text-sm text-black/50">Optional live overrides. Static translations remain available if Supabase is paused.</p><div className="mt-6 max-w-3xl rounded-2xl border border-black/10 bg-white p-6"><div className="mb-5 flex gap-2">{(["sk","ua","ru","en"] as Locale[]).map((item)=><button key={item} onClick={()=>void load(item)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase ${locale===item?"bg-ink text-white":"bg-paper"}`}>{item}</button>)}</div><div className="grid gap-4"><Text label="Hero title" value={content.heroTitle} onChange={(value)=>setContent({...content,heroTitle:value})}/><Area label="Hero lead" value={content.heroLead} onChange={(value)=>setContent({...content,heroLead:value})}/><div className="flex items-center gap-3"><button onClick={()=>void save()} className="btn btn-primary"><Save size={17}/>Save translation</button><span className="text-sm font-bold">{status}</span></div></div></div></div>;
}

function storageObjectPath(url: string) {
  const marker = "/storage/v1/object/public/cars/";
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length).split("?")[0]) : null;
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="label">{label}<input className="field" value={value} onChange={(event)=>onChange(event.target.value)}/></label>; }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="label">{label}<input className="field" type="number" value={value} onChange={(event)=>onChange(Number(event.target.value))}/></label>; }
function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) { return <label className="label">{label}<select className="field" value={value} onChange={(event)=>onChange(event.target.value)}>{values.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>; }
function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="label md:col-span-2">{label}<textarea className="field min-h-28" value={value} onChange={(event)=>onChange(event.target.value)}/></label>; }
