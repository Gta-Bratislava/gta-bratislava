export const locales = ["sk", "ua", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export type CarStatus = "available" | "reserved" | "sold";

export interface LocalizedCarText {
  title: string;
  short: string;
  description: string;
  equipment: string[];
  serviceHistory: string;
  damageInfo: string;
  origin: string;
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: "diesel" | "petrol" | "hybrid" | "electric";
  transmission: "automatic" | "manual";
  body: "sedan" | "wagon" | "suv" | "hatchback";
  drive: "fwd" | "rwd" | "awd";
  powerKw: number;
  engine: string;
  price: number;
  monthlyPrice: number;
  financing: boolean;
  status: CarStatus;
  vin: string;
  featured: boolean;
  images: string[];
  thumbnails?: string[];
  createdAt: string;
  text: Record<Locale, LocalizedCarText>;
}

export interface LeadRecord {
  id?: string;
  type: "contact" | "service" | "test_drive";
  locale: Locale;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  carSlug?: string;
  service?: string;
  consent: boolean;
  created_at?: string;
}

export interface FinancingRecord {
  id?: string;
  locale: Locale;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  citizenship: string;
  employment: string;
  monthly_income: number;
  down_payment: number;
  car_price: number;
  term_months: number;
  comment?: string;
  consent: boolean;
  created_at?: string;
}
