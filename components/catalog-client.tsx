"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CarCard } from "@/components/car-card";
import { getDictionary } from "@/lib/i18n";
import { loadPublicCars } from "@/lib/supabase-browser";
import type { Car, Locale } from "@/lib/types";

const initialFilters = { brand: "", model: "", maxPrice: "", minYear: "", maxMileage: "", fuel: "", transmission: "", body: "", drive: "" };

export function CatalogClient({ cars, locale }: { cars: Car[]; locale: Locale }) {
  const d = getDictionary(locale);
  const [displayCars, setDisplayCars] = useState(cars);
  const [liveData, setLiveData] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("newest");
  useEffect(() => {
    let active = true;
    loadPublicCars().then((liveCars) => {
      if (active && liveCars.length) { setDisplayCars(liveCars); setLiveData(true); }
    }).catch(() => { /* Static demo cars remain visible while Supabase is unavailable. */ });
    return () => { active = false; };
  }, []);
  const brands = [...new Set(displayCars.map((car) => car.brand))];
  const models = [...new Set(displayCars.filter((car) => !filters.brand || car.brand === filters.brand).map((car) => car.model))];
  const update = (key: keyof typeof filters, value: string) => setFilters((old) => ({ ...old, [key]: value, ...(key === "brand" ? { model: "" } : {}) }));
  const filtered = useMemo(() => displayCars.filter((car) => {
    return (!filters.brand || car.brand === filters.brand) && (!filters.model || car.model === filters.model) && (!filters.maxPrice || car.price <= Number(filters.maxPrice)) && (!filters.minYear || car.year >= Number(filters.minYear)) && (!filters.maxMileage || car.mileage <= Number(filters.maxMileage)) && (!filters.fuel || car.fuel === filters.fuel) && (!filters.transmission || car.transmission === filters.transmission) && (!filters.body || car.body === filters.body) && (!filters.drive || car.drive === filters.drive);
  }).sort((a, b) => sort === "priceAsc" ? a.price - b.price : sort === "priceDesc" ? b.price - a.price : sort === "mileage" ? a.mileage - b.mileage : sort === "year" ? b.year - a.year : +new Date(b.createdAt) - +new Date(a.createdAt)), [displayCars, filters, sort]);
  const select = (key: keyof typeof filters, label: string, options: [string, string][]) => <label className="label">{label}<select className="field" value={filters[key]} onChange={(event) => update(key, event.target.value)}><option value="">{d.catalog.all}</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="neon-panel h-fit rounded-2xl p-5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-black"><SlidersHorizontal className="text-acid" size={19}/>{d.catalog.filters}</h2><button className="flex items-center gap-1 text-xs font-bold text-white/50 hover:text-acid" onClick={() => setFilters(initialFilters)}><RotateCcw size={14}/>{d.catalog.reset}</button></div>
        <div className="grid gap-4">{select("brand", d.catalog.brand, brands.map((v) => [v, v]))}{select("model", d.catalog.model, models.map((v) => [v, v]))}<label className="label">{d.catalog.maxPrice}<input className="field" type="number" min="0" placeholder="40 000 €" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)}/></label><label className="label">{d.catalog.minYear}<input className="field" type="number" min="1990" max="2030" placeholder="2018" value={filters.minYear} onChange={(e) => update("minYear", e.target.value)}/></label><label className="label">{d.catalog.maxMileage}<input className="field" type="number" min="0" placeholder="150 000 km" value={filters.maxMileage} onChange={(e) => update("maxMileage", e.target.value)}/></label>{select("fuel", d.catalog.fuel, (["diesel","petrol","hybrid","electric"] as const).map((v) => [v, d.specs[v]]))}{select("transmission", d.catalog.transmission, (["automatic","manual"] as const).map((v) => [v, d.specs[v]]))}{select("body", d.catalog.body, (["sedan","wagon","suv","hatchback"] as const).map((v) => [v, d.specs[v]]))}{select("drive", d.catalog.drive, (["fwd","rwd","awd"] as const).map((v) => [v, d.specs[v]]))}</div>
      </aside>
      <div><div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="font-bold"><span className="text-2xl font-black text-acid">{filtered.length}</span> {d.catalog.found}</p><label className="flex items-center gap-3 text-sm font-bold">{d.catalog.sort}<select className="field !min-h-11 !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">{d.catalog.newest}</option><option value="priceAsc">{d.catalog.priceAsc}</option><option value="priceDesc">{d.catalog.priceDesc}</option><option value="mileage">{d.catalog.mileage}</option><option value="year">{d.catalog.year}</option></select></label></div>{filtered.length ? <div className="grid gap-5 xl:grid-cols-2">{filtered.map((car) => <CarCard key={car.id} car={car} locale={locale} dynamicRoute={liveData}/>)}</div> : <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center text-white/50">{d.catalog.empty}</div>}</div>
    </div>
  );
}
