"use client";

import { Copy, GripVertical, ImagePlus, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { can } from "@/lib/admin-permissions";
import { MAX_SOURCE_IMAGE_BYTES, optimizeCarImage } from "@/lib/image-optimization";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { AdminRole, Car, Locale } from "@/lib/types";
import { NumberField, PageTitle, SelectField, StatusBadge, TextArea, TextField, Toggle, formatAdminDate } from "./admin-ui";

const blankText = { title: "", short: "", description: "", equipment: [] as string[], serviceHistory: "", damageInfo: "", origin: "" };

export function createEmptyCar(role: AdminRole): Car {
  const id = crypto.randomUUID();
  const canPublish = can(role, "cars:edit_commercial");
  return {
    id,
    slug: `new-car-${id.slice(0, 8)}`,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    body: "sedan",
    drive: "fwd",
    powerKw: 0,
    engine: "",
    price: 0,
    monthlyPrice: 0,
    financing: false,
    status: "draft",
    vin: "",
    featured: false,
    isNew: false,
    goodPrice: false,
    sortOrder: 0,
    images: [],
    thumbnails: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    text: { sk: { ...blankText }, ua: { ...blankText }, ru: { ...blankText }, en: { ...blankText } },
    ...(canPublish ? {} : { price: 0, status: "draft" as const }),
  };
}

type CarsAdminProps = {
  cars: Car[];
  role: AdminRole;
  busy: boolean;
  onSave: (car: Car) => Promise<boolean>;
  onDelete: (car: Car) => Promise<void>;
  onDuplicate: (car: Car) => Promise<void>;
  onQuickPrice: (car: Car, price: number) => Promise<void>;
  onReorder: (sourceId: string, targetId: string) => Promise<void>;
};

export function CarsAdmin({ cars, role, busy, onSave, onDelete, onDuplicate, onQuickPrice, onReorder }: CarsAdminProps) {
  const [editing, setEditing] = useState<Car | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const editable = can(role, "cars:edit_content");
  const commercial = can(role, "cars:edit_commercial");

  async function save() {
    if (!editing) return;
    if (await onSave(editing)) setEditing(null);
  }

  return <>
    <PageTitle title="Automobily" subtitle={`${cars.length} záznamov · potiahnutím zmeníte poradie`} action={editable && <button className="btn btn-dark" onClick={() => setEditing(createEmptyCar(role))}><Plus size={18} />Pridať auto</button>} />
    <div className="grid gap-3 lg:hidden">
      {cars.map((car) => <article key={car.id} draggable={editable} onDragStart={() => setDraggedId(car.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedId && draggedId !== car.id) void onReorder(draggedId, car.id); setDraggedId(null); }} className="rounded-2xl border border-black/10 bg-white p-4">
        <div className="flex gap-3">
          <GripVertical className="mt-5 shrink-0 text-black/25" size={18} />
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-black/5"><Image src={car.thumbnails?.[0] || car.images[0] || "/cars/bmw-main.svg"} alt="" fill sizes="112px" className="object-cover" /></div>
          <div className="min-w-0 flex-1"><p className="truncate font-black">{car.text.sk.title || `${car.brand} ${car.model}`}</p><p className="text-sm font-black">{car.price.toLocaleString("sk-SK")} €</p><div className="mt-2"><StatusBadge value={car.status} /></div></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><CarActions car={car} role={role} edit={() => setEditing(structuredClone(car))} duplicate={() => void onDuplicate(car)} remove={() => void onDelete(car)} quickPrice={onQuickPrice} /></div>
      </article>)}
    </div>
    <div className="hidden overflow-hidden rounded-2xl border border-black/10 bg-white lg:block"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-black/[.035] text-xs uppercase tracking-wider text-black/45"><tr><th className="w-12 p-4">#</th><th className="p-4">Auto</th><th className="p-4">Cena</th><th className="p-4">Stav</th><th className="p-4">Aktualizované</th><th className="p-4">Akcie</th></tr></thead><tbody>{cars.map((car) => <tr key={car.id} draggable={editable} onDragStart={() => setDraggedId(car.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedId && draggedId !== car.id) void onReorder(draggedId, car.id); setDraggedId(null); }} className="border-t border-black/10 hover:bg-black/[.018]"><td className="p-4 text-black/25"><GripVertical size={18} /></td><td className="p-4"><div className="flex items-center gap-3"><div className="relative h-14 w-20 overflow-hidden rounded-lg bg-black/5"><Image src={car.thumbnails?.[0] || car.images[0] || "/cars/bmw-main.svg"} alt="" fill sizes="80px" className="object-cover" /></div><div><p className="font-black">{car.text.sk.title || `${car.brand} ${car.model}`}</p><p className="text-xs text-black/45">{car.slug}</p><div className="mt-1 flex gap-1">{car.featured && <span className="text-[10px] font-black uppercase text-lime-700">featured</span>}{car.isNew && <span className="text-[10px] font-black uppercase text-blue-700">new</span>}{car.goodPrice && <span className="text-[10px] font-black uppercase text-amber-700">good price</span>}</div></div></div></td><td className="p-4 font-black">{car.price.toLocaleString("sk-SK")} €</td><td className="p-4"><StatusBadge value={car.status} /></td><td className="p-4 text-xs text-black/50">{formatAdminDate(car.updatedAt)}</td><td className="p-4"><div className="flex gap-2"><CarActions car={car} role={role} edit={() => setEditing(structuredClone(car))} duplicate={() => void onDuplicate(car)} remove={() => void onDelete(car)} quickPrice={onQuickPrice} /></div></td></tr>)}</tbody></table></div></div>
    {editing && <CarEditor car={editing} setCar={setEditing} role={role} busy={busy} close={() => setEditing(null)} save={() => void save()} />}
  </>;
}

function CarActions({ car, role, edit, duplicate, remove, quickPrice }: { car: Car; role: AdminRole; edit: () => void; duplicate: () => void; remove: () => void; quickPrice: (car: Car, price: number) => Promise<void> }) {
  const editable = can(role, "cars:edit_content");
  const commercial = can(role, "cars:edit_commercial");
  function askPrice() {
    const result = window.prompt("Nová cena v €", String(car.price));
    if (result === null) return;
    const price = Number(result.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) return window.alert("Zadajte platnú cenu.");
    void quickPrice(car, price);
  }
  return <>
    <button onClick={edit} className="grid h-10 w-10 place-items-center rounded-lg border border-black/10" aria-label={editable ? "Upraviť" : "Zobraziť"}><Pencil size={16} /></button>
    {commercial && <button onClick={askPrice} className="h-10 rounded-lg border border-black/10 px-3 text-xs font-black" title="Rýchla zmena ceny">€</button>}
    {editable && <button onClick={duplicate} className="grid h-10 w-10 place-items-center rounded-lg border border-black/10" aria-label="Duplikovať"><Copy size={16} /></button>}
    {can(role, "cars:delete") && <button onClick={remove} className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 text-red-700" aria-label="Odstrániť"><Trash2 size={16} /></button>}
  </>;
}

function CarEditor({ car, setCar, role, busy, close, save }: { car: Car; setCar: (car: Car) => void; role: AdminRole; busy: boolean; close: () => void; save: () => void }) {
  const [lang, setLang] = useState<Locale>("sk");
  const [uploadStatus, setUploadStatus] = useState("");
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const editable = can(role, "cars:edit_content");
  const commercial = can(role, "cars:edit_commercial");
  const update = <K extends keyof Car>(key: K, value: Car[K]) => setCar({ ...car, [key]: value });
  const updateText = (key: keyof Car["text"][Locale], value: string | string[]) => setCar({ ...car, text: { ...car.text, [lang]: { ...car.text[lang], [key]: value } } });

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length || !editable) return;
    const db = getSupabaseBrowserClient();
    if (!db) return;
    const images = [...car.images];
    const thumbnails = car.images.map((image, index) => car.thumbnails?.[index] || image);
    try {
      for (const [index, file] of files.entries()) {
        setUploadStatus(`Optimalizácia ${index + 1}/${files.length}…`);
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
      setUploadStatus("Fotografie boli zmenšené a uložené vo WebP.");
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : "Nahrávanie zlyhalo");
    } finally { event.target.value = ""; }
  }

  function moveImage(source: number, target: number) {
    if (source === target || source < 0 || target < 0 || target >= car.images.length) return;
    const images = [...car.images];
    const thumbnails = car.images.map((image, index) => car.thumbnails?.[index] || image);
    const [image] = images.splice(source, 1); images.splice(target, 0, image);
    const [thumbnail] = thumbnails.splice(source, 1); thumbnails.splice(target, 0, thumbnail);
    setCar({ ...car, images, thumbnails });
  }

  function setMain(index: number) { moveImage(index, 0); }

  async function removeImage(index: number) {
    if (!editable || !window.confirm("Odstrániť túto fotografiu?")) return;
    const db = getSupabaseBrowserClient();
    const urls = [car.images[index], car.thumbnails?.[index]].filter((url): url is string => Boolean(url));
    const paths = urls.map(storageObjectPath).filter((path): path is string => Boolean(path));
    if (db && paths.length) {
      const { error } = await db.storage.from("cars").remove(paths);
      if (error) return setUploadStatus(error.message);
    }
    setCar({ ...car, images: car.images.filter((_, itemIndex) => itemIndex !== index), thumbnails: car.thumbnails?.filter((_, itemIndex) => itemIndex !== index) });
  }

  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-2 sm:p-6"><div className="mx-auto max-w-5xl rounded-[24px] bg-paper"><div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-black/10 bg-[#ecebe5]/95 p-4 text-[#111310] backdrop-blur sm:p-5"><div className="min-w-0"><h2 className="truncate text-xl font-black sm:text-2xl">{car.text.sk.title || "Nové auto"}</h2><p className="truncate text-xs text-black/45">Vytvorené {formatAdminDate(car.createdAt)} · upravené {formatAdminDate(car.updatedAt)}</p></div><div className="flex shrink-0 gap-2">{editable && <button onClick={save} disabled={busy} className="btn btn-primary min-h-11 disabled:opacity-50"><Save size={17} /><span className="hidden sm:inline">Uložiť</span></button>}<button onClick={close} className="grid h-11 w-11 place-items-center rounded-xl border border-black/15" aria-label="Zavrieť"><X /></button></div></div>
    <div className="grid gap-8 p-4 sm:p-7"><section><h3 className="mb-4 text-lg font-black">Základné údaje</h3><div className="form-grid"><TextField label="Značka" value={car.brand} disabled={!editable} onChange={(value) => update("brand", value)} /><TextField label="Model" value={car.model} disabled={!editable} onChange={(value) => update("model", value)} /><TextField label="URL slug" value={car.slug} disabled={!editable} onChange={(value) => update("slug", value)} /><NumberField label="Rok" value={car.year} disabled={!editable} onChange={(value) => update("year", value)} /><NumberField label="Nájazd (km)" value={car.mileage} disabled={!editable} onChange={(value) => update("mileage", value)} /><NumberField label="Cena (€)" value={car.price} disabled={!commercial} min={0} onChange={(value) => update("price", value)} /><NumberField label="Mesačne (€)" value={car.monthlyPrice} disabled={!commercial} min={0} onChange={(value) => update("monthlyPrice", value)} /><NumberField label="Výkon (kW)" value={car.powerKw} disabled={!editable} onChange={(value) => update("powerKw", value)} /><TextField label="Motor" value={car.engine} disabled={!editable} onChange={(value) => update("engine", value)} /><TextField label="VIN (môže byť skrytý)" value={car.vin} disabled={!editable} onChange={(value) => update("vin", value)} /><SelectField label="Stav" value={car.status} disabled={!commercial} values={["draft", "available", "reserved", "sold", "hidden"]} onChange={(value) => update("status", value as Car["status"])} /><SelectField label="Palivo" value={car.fuel} disabled={!editable} values={["diesel", "petrol", "hybrid", "electric"]} onChange={(value) => update("fuel", value as Car["fuel"])} /><SelectField label="Prevodovka" value={car.transmission} disabled={!editable} values={["automatic", "manual"]} onChange={(value) => update("transmission", value as Car["transmission"])} /><SelectField label="Karoséria" value={car.body} disabled={!editable} values={["sedan", "wagon", "suv", "hatchback"]} onChange={(value) => update("body", value as Car["body"])} /><SelectField label="Pohon" value={car.drive} disabled={!editable} values={["fwd", "rwd", "awd"]} onChange={(value) => update("drive", value as Car["drive"])} /><Toggle label="Financovanie" checked={car.financing} disabled={!commercial} onChange={(value) => update("financing", value)} /><Toggle label="Featured" checked={car.featured} disabled={!editable} onChange={(value) => update("featured", value)} /><Toggle label="New" checked={Boolean(car.isNew)} disabled={!editable} onChange={(value) => update("isNew", value)} /><Toggle label="Good price" checked={Boolean(car.goodPrice)} disabled={!editable} onChange={(value) => update("goodPrice", value)} /></div>{!commercial && editable && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">Vaša rola môže upravovať obsah a fotografie. Cenu, stav a financovanie mení owner alebo manager.</p>}</section>
    <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black">Fotografie</h3><p className="text-xs text-black/50">Hromadné nahrávanie · max. {MAX_SOURCE_IMAGE_BYTES / 1024 / 1024} MB · automatický WebP a náhľad.</p></div>{editable && <label className="btn btn-dark min-h-11 cursor-pointer"><ImagePlus size={17} />Nahrať<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={upload} /></label>}</div>{uploadStatus && <p className="mb-4 rounded-lg bg-white p-3 text-sm font-bold">{uploadStatus}</p>}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{car.images.map((image, index) => <div key={`${image}-${index}`} draggable={editable} onDragStart={() => setDraggedImage(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedImage !== null) moveImage(draggedImage, index); setDraggedImage(null); }} className="rounded-xl border border-black/10 bg-white p-2"><div className="relative aspect-[16/10] overflow-hidden rounded-lg"><Image src={car.thumbnails?.[index] || image} alt={`${car.brand} ${car.model} ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" /></div><div className="mt-2 flex items-center justify-between"><button type="button" title="Nastaviť ako hlavnú" disabled={!editable} onClick={() => setMain(index)} className={index === 0 ? "text-amber-500" : "text-black/35"}><Star size={18} fill={index === 0 ? "currentColor" : "none"} /></button><span className="flex items-center gap-1 text-xs font-bold text-black/35"><GripVertical size={15} />{index + 1}</span>{editable && <button type="button" onClick={() => { void removeImage(index); }} className="text-red-700" aria-label="Odstrániť fotografiu"><Trash2 size={17} /></button>}</div></div>)}</div></section>
    <section><div className="mb-4 flex gap-2 overflow-x-auto">{(["sk", "ua", "ru", "en"] as Locale[]).map((item) => <button key={item} onClick={() => setLang(item)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase ${lang === item ? "bg-ink text-white" : "bg-white"}`}>{item}</button>)}</div><div className="form-grid"><TextField label="Názov" value={car.text[lang].title} disabled={!editable} onChange={(value) => updateText("title", value)} /><TextField label="Krátky popis" value={car.text[lang].short} disabled={!editable} onChange={(value) => updateText("short", value)} /><TextArea label="Podrobný popis" value={car.text[lang].description} disabled={!editable} onChange={(value) => updateText("description", value)} /><TextArea label="Výbava (jeden bod na riadok)" value={car.text[lang].equipment.join("\n")} disabled={!editable} onChange={(value) => updateText("equipment", value.split("\n").filter(Boolean))} /><TextArea label="Servisná história" value={car.text[lang].serviceHistory} disabled={!editable} onChange={(value) => updateText("serviceHistory", value)} /><TextArea label="Poškodenia / lakované diely" value={car.text[lang].damageInfo} disabled={!editable} onChange={(value) => updateText("damageInfo", value)} /><TextField label="Pôvod" value={car.text[lang].origin} disabled={!editable} onChange={(value) => updateText("origin", value)} /></div></section></div></div></div>;
}

export function storageObjectPath(url: string) {
  const marker = "/storage/v1/object/public/cars/";
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length).split("?")[0]) : null;
}
