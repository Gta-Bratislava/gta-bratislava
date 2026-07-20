export const locales = ["sk", "ua", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export type CarStatus = "draft" | "available" | "reserved" | "sold" | "hidden";
export type AdminRole = "owner" | "manager" | "content_manager" | "viewer";
export type CrmStatus = "new" | "contacted" | "appointment" | "thinking" | "financing" | "reserved" | "documents_requested" | "documents_received" | "submitted" | "decision_pending" | "approved" | "rejected" | "contract_signed" | "completed";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";
export type AdPlatform = "bazos" | "facebook" | "instagram" | "tiktok" | "whatsapp" | "telegram" | "universal";
export type AdLength = "short" | "standard" | "detailed";
export type AdStyle = "business" | "friendly" | "sales" | "neutral" | "premium";

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
  version?: string;
  engineDisplacement?: string;
  color?: string;
  condition?: string;
  ownersCount?: number;
  paintedElements?: string;
  price: number;
  monthlyPrice: number;
  financing: boolean;
  financingCalculatorEnabled?: boolean;
  status: CarStatus;
  vin: string;
  featured: boolean;
  isNew?: boolean;
  goodPrice?: boolean;
  sortOrder?: number;
  images: string[];
  thumbnails?: string[];
  createdAt: string;
  updatedAt?: string;
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
  selected_car_id?: string | null;
  selected_car_slug?: string | null;
  down_payment_percent?: number;
  interest_rate?: number;
  fixed_fee?: number;
  percent_fee?: number;
  financed_amount?: number;
  estimated_monthly_payment?: number;
  estimated_total_payment?: number;
  estimated_overpayment?: number;
  calculator_payload?: Record<string, unknown>;
  consent: boolean;
  created_at?: string;
}

export interface FinancingLocaleContent {
  title: string;
  description: string;
  warning: string;
  documents: string[];
  steps: string[];
  faq: { question: string; answer: string }[];
  applyButton: string;
}

export interface FinancingSettings {
  id: true;
  enabled: boolean;
  min_amount: number;
  max_amount: number;
  min_term: number;
  max_term: number;
  allowed_terms: number[];
  default_interest_rate: number;
  min_down_payment_eur: number;
  min_down_payment_percent: number;
  fixed_fee: number;
  percent_fee: number;
  localized: Record<Locale, FinancingLocaleContent>;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FinancingCalculationInput {
  carPrice: number;
  downPaymentEur: number;
  termMonths: number;
  annualInterestRate: number;
  fixedFee: number;
  percentFee: number;
}

export interface FinancingCalculation {
  carPrice: number;
  downPaymentEur: number;
  downPaymentPercent: number;
  financedAmount: number;
  fees: number;
  monthlyPayment: number;
  totalPayments: number;
  overpayment: number;
  termMonths: number;
  annualInterestRate: number;
  fixedFee: number;
  percentFee: number;
}

export interface GeneratedAd {
  id: string;
  car_id: string;
  language: Locale;
  platform: AdPlatform;
  style: AdStyle;
  length: AdLength;
  title: string;
  text: string;
  hashtags: string[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  role: AdminRole;
  display_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CrmApplication {
  id: string;
  source_type: "lead" | "financing";
  application_type: string;
  created_at: string;
  updated_at: string;
  crm_status: CrmStatus;
  assigned_to: string | null;
  manager_notes: string | null;
  name: string;
  phone: string;
  email: string | null;
  car_slug: string | null;
  message: string | null;
  locale: Locale;
  payload: Record<string, unknown>;
}

export interface ApplicationStatusEvent {
  id: number;
  application_source: "lead" | "financing";
  application_id: string;
  old_status: CrmStatus | null;
  new_status: CrmStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  application_source: "lead" | "financing" | null;
  application_id: string | null;
  client_name: string;
  client_phone: string;
  car_id: string | null;
  starts_at: string;
  duration_minutes: number;
  location: string;
  comment: string | null;
  status: AppointmentStatus;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CarMetric {
  car_slug: string;
  view_count: number;
  whatsapp_click_count: number;
  lead_count: number;
  updated_at: string;
}

export interface PriceHistoryEntry {
  id: number;
  car_id: string;
  old_price: number | null;
  new_price: number;
  changed_by: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: true;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  socials: { instagram: string; tiktok: string; facebook: string; telegram: string };
  hero_image_url: string;
  timezone: string;
  stale_car_days: number;
  updated_by?: string | null;
  updated_at?: string;
}
