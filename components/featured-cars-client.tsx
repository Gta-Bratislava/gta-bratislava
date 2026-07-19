"use client";

import { useEffect, useState } from "react";
import { CarCard } from "@/components/car-card";
import { loadPublicCars } from "@/lib/supabase-browser";
import type { Car, Locale } from "@/lib/types";

export function FeaturedCarsClient({ fallbackCars, locale }: { fallbackCars: Car[]; locale: Locale }) {
  const [cars, setCars] = useState(fallbackCars);
  const [liveData, setLiveData] = useState(false);

  useEffect(() => {
    let active = true;
    loadPublicCars().then((liveCars) => {
      if (!active || !liveCars.length) return;
      setCars(liveCars.filter((car) => car.featured).slice(0, 3));
      setLiveData(true);
    }).catch(() => { /* The static selection is the offline fallback. */ });
    return () => { active = false; };
  }, []);

  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cars.map((car) => <CarCard key={car.id} car={car} locale={locale} dynamicRoute={liveData}/>)}</div>;
}
