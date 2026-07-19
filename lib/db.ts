import { demoCars } from "@/data/cars";
import type { Locale } from "@/lib/types";

// Static, always-available data used during the Cloudflare Pages build and whenever
// Supabase is paused or unreachable. Live data is loaded in the browser after render.
export async function listCars() {
  return demoCars;
}

export async function findCar(slug: string) {
  return demoCars.find((car) => car.slug === slug);
}

export async function getSiteContent(_locale: Locale): Promise<Record<string, string>> {
  return {};
}
