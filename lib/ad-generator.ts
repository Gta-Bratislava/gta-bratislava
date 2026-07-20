import type { AdLength, AdPlatform, AdStyle, Car, Locale } from "./types";

type Options = { language: Locale; platform: AdPlatform; length: AdLength; style: AdStyle; contact: string; website?: string; variant?: number };

const words = {
  sk: { year: "Rok", mileage: "Nájazd", fuel: "Palivo", transmission: "Prevodovka", power: "Výkon", drive: "Pohon", engine: "Motor", body: "Karoséria", color: "Farba", condition: "Stav", owners: "Počet majiteľov", vin: "VIN", painted: "Lakované diely", equipment: "Výbava", service: "Servisná história", damage: "Stav a známe nedostatky", origin: "Pôvod", price: "Cena", financing: "Možnosť financovania", contact: "Kontakt", more: "Viac informácií", cta: ["Napíšte nám a dohodnite si obhliadku.", "Kontaktujte nás pre overenie dostupnosti a termín obhliadky.", "Radi odpovieme na otázky a pripravíme vozidlo na obhliadku."], intros: { business: "Ponúkame na predaj", friendly: "Pozrite si", sales: "Pripravené pre nového majiteľa", neutral: "Na predaj", premium: "Starostlivo vybrané vozidlo" } },
  ru: { year: "Год", mileage: "Пробег", fuel: "Топливо", transmission: "Коробка", power: "Мощность", drive: "Привод", engine: "Двигатель", body: "Кузов", color: "Цвет", condition: "Состояние", owners: "Количество владельцев", vin: "VIN", painted: "Окрашенные элементы", equipment: "Комплектация", service: "История обслуживания", damage: "Состояние и известные недостатки", origin: "Происхождение", price: "Цена", financing: "Доступно финансирование", contact: "Контакт", more: "Подробнее", cta: ["Напишите нам, чтобы уточнить актуальность и договориться об осмотре.", "Свяжитесь с нами — ответим на вопросы и согласуем время просмотра.", "Готовы рассказать подробнее и организовать просмотр автомобиля."], intros: { business: "Предлагаем к продаже", friendly: "Обратите внимание на", sales: "Готов к новому владельцу", neutral: "В продаже", premium: "Тщательно отобранный автомобиль" } },
  ua: { year: "Рік", mileage: "Пробіг", fuel: "Паливо", transmission: "Коробка", power: "Потужність", drive: "Привід", engine: "Двигун", body: "Кузов", color: "Колір", condition: "Стан", owners: "Кількість власників", vin: "VIN", painted: "Пофарбовані елементи", equipment: "Комплектація", service: "Історія обслуговування", damage: "Стан і відомі недоліки", origin: "Походження", price: "Ціна", financing: "Доступне фінансування", contact: "Контакт", more: "Докладніше", cta: ["Напишіть нам, щоб уточнити актуальність і домовитися про огляд.", "Зв’яжіться з нами — відповімо на запитання та погодимо час перегляду.", "Готові розповісти докладніше й організувати перегляд автомобіля."], intros: { business: "Пропонуємо до продажу", friendly: "Зверніть увагу на", sales: "Готовий до нового власника", neutral: "У продажу", premium: "Ретельно відібраний автомобіль" } },
  en: { year: "Year", mileage: "Mileage", fuel: "Fuel", transmission: "Transmission", power: "Power", drive: "Drive", engine: "Engine", body: "Body", color: "Colour", condition: "Condition", owners: "Number of owners", vin: "VIN", painted: "Painted panels", equipment: "Equipment", service: "Service history", damage: "Condition and known imperfections", origin: "Origin", price: "Price", financing: "Financing available", contact: "Contact", more: "More information", cta: ["Message us to confirm availability and arrange a viewing.", "Contact us with your questions and to arrange a viewing.", "We will be happy to provide more details and organise a viewing."], intros: { business: "Offered for sale", friendly: "Take a look at", sales: "Ready for its next owner", neutral: "For sale", premium: "A carefully selected vehicle" } },
} as const;

const valueLabels: Record<Locale, Record<string, string>> = {
  sk: { diesel: "diesel", petrol: "benzín", hybrid: "hybrid", electric: "elektrický", automatic: "automatická", manual: "manuálna", fwd: "predný", rwd: "zadný", awd: "4×4", sedan: "sedan", wagon: "kombi", suv: "SUV", hatchback: "hatchback" },
  ru: { diesel: "дизель", petrol: "бензин", hybrid: "гибрид", electric: "электро", automatic: "автомат", manual: "механика", fwd: "передний", rwd: "задний", awd: "полный", sedan: "седан", wagon: "универсал", suv: "SUV", hatchback: "хэтчбек" },
  ua: { diesel: "дизель", petrol: "бензин", hybrid: "гібрид", electric: "електро", automatic: "автомат", manual: "механіка", fwd: "передній", rwd: "задній", awd: "повний", sedan: "седан", wagon: "універсал", suv: "SUV", hatchback: "хетчбек" },
  en: { diesel: "diesel", petrol: "petrol", hybrid: "hybrid", electric: "electric", automatic: "automatic", manual: "manual", fwd: "front-wheel", rwd: "rear-wheel", awd: "all-wheel", sedan: "saloon", wagon: "estate", suv: "SUV", hatchback: "hatchback" },
};

export function generateCarAd(car: Car, options: Options) {
  const { language, platform, length, style } = options;
  const t = car.text[language];
  const w = words[language];
  const labels = valueLabels[language];
  const variant = Math.abs(options.variant || 0) % w.cta.length;
  const title = `${car.brand} ${car.model}${car.version ? ` ${car.version}` : ""} ${car.year} — ${formatEuro(car.price, language)}`;
  const specs = [
    `${w.year}: ${car.year}`,
    `${w.mileage}: ${car.mileage.toLocaleString(language === "en" ? "en-GB" : "sk-SK")} km`,
    `${w.engine}: ${[car.engine, car.engineDisplacement].filter(Boolean).join(" · ")}`,
    `${w.fuel}: ${labels[car.fuel]}`,
    `${w.transmission}: ${labels[car.transmission]}`,
    `${w.power}: ${car.powerKw} kW`,
    `${w.drive}: ${labels[car.drive]}`,
    `${w.body}: ${labels[car.body] || car.body}`,
    car.color ? `${w.color}: ${car.color}` : "",
    car.condition ? `${w.condition}: ${car.condition}` : "",
    car.ownersCount != null ? `${w.owners}: ${car.ownersCount}` : "",
    car.vin ? `${w.vin}: ${car.vin}` : "",
  ].filter(Boolean);
  const intro = `${w.intros[style]} ${t.title}. ${t.short}`;
  const equipment = t.equipment.slice(0, length === "detailed" ? 12 : 6);
  const blocks = [intro, specs.map((item) => `• ${item}`).join("\n")];
  if (length !== "short") {
    blocks.push(`${w.equipment}:\n${equipment.map((item) => `✓ ${item}`).join("\n")}`);
    if (length === "detailed") blocks.push(t.description);
    blocks.push(`${w.service}: ${t.serviceHistory}`);
    blocks.push(`${w.damage}: ${t.damageInfo}${car.paintedElements ? `\n${w.painted}: ${car.paintedElements}` : ""}`);
    blocks.push(`${w.origin}: ${t.origin}`);
  }
  blocks.push(`${w.price}: ${formatEuro(car.price, language)}${car.financing ? `\n${w.financing}${car.monthlyPrice ? ` — ${formatEuro(car.monthlyPrice, language)}` : ""}` : ""}`);
  blocks.push(`${w.cta[variant]}\n${w.contact}: ${options.contact}${options.website ? `\n${w.more}: ${options.website}` : ""}`);
  let body = blocks.filter(Boolean).join("\n\n");
  if (platform === "whatsapp" || platform === "telegram") body = `${title}\n\n${body}`;
  if (platform === "tiktok") body = [intro, `${w.price}: ${formatEuro(car.price, language)}`, w.cta[variant], options.contact].join("\n");
  const hashtags = makeHashtags(car, language, platform);
  if (["facebook", "instagram", "tiktok", "telegram"].includes(platform)) body += `\n\n${hashtags.join(" ")}`;
  return { title, text: body, hashtags };
}

function formatEuro(value: number, language: Locale) { return new Intl.NumberFormat(language === "en" ? "en-GB" : "sk-SK", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value); }

function makeHashtags(car: Car, language: Locale, platform: AdPlatform) {
  if (platform === "bazos" || platform === "whatsapp") return [];
  const local = language === "sk" ? "AutoBratislava" : language === "ua" ? "АвтоСловаччина" : language === "ru" ? "АвтоСловакия" : "CarsSlovakia";
  return [`#${clean(car.brand)}`, `#${clean(car.model)}`, `#${local}`, "#GTABratislava", car.financing ? "#Financing" : "#Bratislava"].slice(0, 5);
}

function clean(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]/gu, ""); }
