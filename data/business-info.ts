import type { Locale } from "@/lib/types";

export type ServicePackage = { title: string; price: string; note: string };
export type FinancingInfo = {
  documentsTitle: string;
  documents: string[];
  termsTitle: string;
  terms: { label: string; value: string }[];
  importantTitle: string;
  important: string[];
  supportTitle: string;
  support: string[];
};

export const servicePackages: Record<Locale, ServicePackage[]> = {
  sk: [
    { title: "Výber a dovoz auta z Nemecka a Holandska", price: "700 €", note: "Samostatne sa hradí čistá cena vozidla, logistické náklady a dane." },
    { title: "Výber auta na kľúč na Slovensku", price: "400 €", note: "Kompletné právne a technické sprevádzanie od vyhľadania až po podpis zmluvy." },
    { title: "Jednorazová obhliadka auta v Bratislave", price: "50 €", note: "Výjazd mimo Bratislavy je spoplatnený 0,30 €/km po Slovensku." },
    { title: "Zaradenie auta do predaja pre majiteľov", price: "100 €", note: "Fungujeme ako digitálna platforma. Platba až po úspešnom predaji, záloha 0 €." },
    { title: "Pomoc s prihlásením na slovenské značky", price: "Na vyžiadanie", note: "Cena sa určuje individuálne podľa technických parametrov vozidla." },
  ],
  ua: [
    { title: "Підбір і пригін авто з Німеччини та Нідерландів", price: "700 €", note: "Окремо сплачуються чиста вартість авто, логістика та податки." },
    { title: "Підбір авто під ключ у Словаччині", price: "400 €", note: "Повний юридичний і технічний супровід від пошуку до підписання договору." },
    { title: "Разовий огляд авто у Братиславі", price: "50 €", note: "Виїзд за межі Братислави оплачується 0,30 €/км по Словаччині." },
    { title: "Розміщення авто на продаж для власників", price: "100 €", note: "Працюємо як цифровий майданчик. Оплата лише після успішного продажу, аванс 0 €." },
    { title: "Допомога з постановкою на словацький облік", price: "За запитом", note: "Вартість розраховується індивідуально за технічними параметрами авто." },
  ],
  ru: [
    { title: "Подбор и пригон авто из Германии и Нидерландов", price: "700 €", note: "Дополнительно оплачиваются чистая стоимость автомобиля, логистика и налоги." },
    { title: "Подбор авто под ключ в Словакии", price: "400 €", note: "Полное юридическое и техническое сопровождение: от поиска до подписания договора." },
    { title: "Разовый осмотр авто в Братиславе", price: "50 €", note: "Выезд за пределы Братиславы оплачивается 0,30 €/км по Словакии." },
    { title: "Размещение авто на продажу для владельцев", price: "100 €", note: "Работаем как цифровая площадка. Оплата только после успешной продажи, аванс 0 €." },
    { title: "Помощь с постановкой на словацкий учёт", price: "По запросу", note: "Стоимость рассчитывается индивидуально по техническим параметрам автомобиля." },
  ],
  en: [
    { title: "Vehicle sourcing and import from Germany or the Netherlands", price: "700 €", note: "The net vehicle price, logistics costs and taxes are charged separately." },
    { title: "Turnkey vehicle sourcing in Slovakia", price: "400 €", note: "Complete legal and technical support from the search through signing the contract." },
    { title: "One-off vehicle inspection in Bratislava", price: "50 €", note: "Travel outside Bratislava is charged at 0.30 €/km within Slovakia." },
    { title: "Vehicle sale listing for owners", price: "100 €", note: "We work as a digital marketplace. Payment is due only after a successful sale; deposit 0 €." },
    { title: "Help with Slovak vehicle registration", price: "On request", note: "The price is calculated individually according to the vehicle’s technical specifications." },
  ],
};

export const financingInfo: Record<Locale, FinancingInfo> = {
  sk: {
    documentsTitle: "Čo je potrebné pripraviť",
    documents: [
      "Doklad totožnosti: občiansky preukaz alebo pobytová karta",
      "Doklad o príjme: potvrdenie, pracovná zmluva, živnosť alebo výpis z banky",
      "Výpis z bankového účtu za posledné 1–3 mesiace",
      "Telefónne číslo a e-mail",
      "Adresa pobytu na Slovensku",
      "Informácie o aktuálnych úveroch alebo splátkach",
      "Údaje o aute: značka, model, rok, VIN a cena",
      "Odkaz na inzerát alebo fotografie vozidla",
    ],
    termsTitle: "Základné podmienky",
    terms: [
      { label: "Suma financovania", value: "do 19 500 €" },
      { label: "Doba splácania", value: "od 1 do 8 rokov" },
      { label: "Vozidlá", value: "nové, jazdené aj dovezené" },
      { label: "Predčasné splatenie", value: "bez pokuty" },
      { label: "Úrok / RPMN", value: "počíta sa individuálne" },
      { label: "Konečné podmienky", value: "závisia od profilu klienta" },
    ],
    importantTitle: "Dôležité vedieť",
    important: ["Schválenie nie je možné garantovať vopred.", "Rozhodnutie závisí od príjmu, úverovej histórie a aktuálnych záväzkov.", "Čím úplnejšie dokumenty, tým rýchlejšie je možné podať žiadosť."],
    supportTitle: "GTA_Bratislava pomáha",
    support: ["Skontrolovať dokumenty", "Pripraviť žiadosť", "Sprevádzať klienta až do výsledku"],
  },
  ua: {
    documentsTitle: "Що потрібно підготувати",
    documents: [
      "Документ: ID / občiansky preukaz або посвідка на проживання / pobytová karta",
      "Підтвердження доходу: довідка, трудовий договір, živnosť або виписка з банку",
      "Виписка з банку за останні 1–3 місяці",
      "Номер телефону та e-mail",
      "Адреса проживання у Словаччині",
      "Інформація про поточні кредити або розстрочки",
      "Дані про авто: марка, модель, рік, VIN і ціна",
      "Посилання на оголошення або фотографії авто",
    ],
    termsTitle: "Основні умови",
    terms: [
      { label: "Сума фінансування", value: "до 19 500 €" },
      { label: "Строк", value: "від 1 до 8 років" },
      { label: "Автомобілі", value: "нові, вживані та пригнані" },
      { label: "Дострокове погашення", value: "без штрафу" },
      { label: "Відсоток / RPMN", value: "розраховується індивідуально" },
      { label: "Точні умови", value: "залежать від профілю клієнта" },
    ],
    importantTitle: "Важливо знати",
    important: ["Схвалення не гарантується заздалегідь.", "Рішення залежить від доходу, кредитної історії та поточних зобов’язань.", "Що повніші документи, то швидше можна подати заявку."],
    supportTitle: "GTA_Bratislava допомагає",
    support: ["Перевірити документи", "Підготувати заявку", "Супроводжувати клієнта до результату"],
  },
  ru: {
    documentsTitle: "Что нужно подготовить",
    documents: [
      "Документ: ID / občiansky preukaz или ВНЖ / pobytová karta",
      "Подтверждение дохода: справка, трудовой договор, živnosť или выписка из банка",
      "Выписка из банка за последние 1–3 месяца",
      "Номер телефона и e-mail",
      "Адрес проживания в Словакии",
      "Информация о текущих кредитах или рассрочках",
      "Данные по авто: марка, модель, год, VIN и цена",
      "Ссылка на объявление или фотографии авто",
    ],
    termsTitle: "Основные условия",
    terms: [
      { label: "Сумма финансирования", value: "до 19 500 €" },
      { label: "Срок", value: "от 1 до 8 лет" },
      { label: "Автомобили", value: "новые, б/у и пригнанные" },
      { label: "Досрочное погашение", value: "без штрафа" },
      { label: "Процент / RPMN", value: "рассчитывается индивидуально" },
      { label: "Точные условия", value: "зависят от профиля клиента" },
    ],
    importantTitle: "Важно знать",
    important: ["Одобрение не гарантируется заранее.", "Решение зависит от дохода, кредитной истории и текущих обязательств.", "Чем полнее документы, тем быстрее можно подать заявку."],
    supportTitle: "GTA_Bratislava помогает",
    support: ["Проверить документы", "Подготовить заявку", "Сопроводить клиента до результата"],
  },
  en: {
    documentsTitle: "What you need to prepare",
    documents: [
      "Identification: ID card / občiansky preukaz or residence card / pobytová karta",
      "Proof of income: certificate, employment contract, trade licence / živnosť or bank statement",
      "Bank statement for the last 1–3 months",
      "Phone number and email address",
      "Residential address in Slovakia",
      "Information about current loans or instalments",
      "Vehicle details: make, model, year, VIN and price",
      "A link to the advert or photographs of the vehicle",
    ],
    termsTitle: "Main terms",
    terms: [
      { label: "Financing amount", value: "up to 19,500 €" },
      { label: "Term", value: "from 1 to 8 years" },
      { label: "Vehicles", value: "new, used and imported" },
      { label: "Early repayment", value: "without a penalty" },
      { label: "Interest / APR", value: "calculated individually" },
      { label: "Final terms", value: "depend on the client profile" },
    ],
    importantTitle: "Important to know",
    important: ["Approval cannot be guaranteed in advance.", "The decision depends on income, credit history and current financial commitments.", "A complete set of information helps the application move faster."],
    supportTitle: "GTA_Bratislava can help",
    support: ["Check the information", "Prepare the application", "Support the client through to the result"],
  },
};

export const inspectionInfo: Record<Locale, { title: string; items: string[]; warrantyTitle: string; warranty: string }> = {
  sk: { title: "Komplexná kontrola vozidla", items: ["Diagnostika karosérie a laku", "Počítačový a technický audit", "Právna a historická kontrola VIN"], warrantyTitle: "Transparentná garančná politika", warranty: "Kontrola fixuje stav vozidla v čase obhliadky. GTA_Bratislava garantuje kvalitu vykonanej diagnostiky, nie absolútnu bezporuchovosť ojazdeného vozidla." },
  ua: { title: "Комплексна перевірка автомобіля", items: ["Діагностика кузова й лакофарбового покриття", "Комп’ютерний і технічний аудит", "Юридична та історична перевірка VIN"], warrantyTitle: "Прозора гарантійна політика", warranty: "Перевірка фіксує стан авто на момент огляду. GTA_Bratislava гарантує якість діагностики, але не абсолютну безвідмовність уживаного авто." },
  ru: { title: "Комплексная проверка автомобиля", items: ["Диагностика кузова и лакокрасочного покрытия", "Компьютерный и технический аудит", "Юридическая и историческая проверка VIN"], warrantyTitle: "Прозрачная гарантийная политика", warranty: "Проверка фиксирует состояние авто на момент осмотра. GTA_Bratislava гарантирует качество диагностики, но не абсолютную безотказность подержанного автомобиля." },
  en: { title: "Comprehensive vehicle inspection", items: ["Bodywork and paint inspection", "Computer and technical audit", "Legal and historical VIN check"], warrantyTitle: "Transparent inspection policy", warranty: "The inspection records the vehicle’s condition at the time of the check. GTA_Bratislava guarantees the quality of the inspection, not the absolute future reliability of a used vehicle." },
};
