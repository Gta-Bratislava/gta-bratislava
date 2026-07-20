import { locales, type Locale } from "@/lib/types";

export const routeMap = {
  sk: { cars: "auta", services: "sluzby", financing: "financovanie", about: "o-nas", contacts: "kontakt", privacy: "ochrana-sukromia", cookies: "cookies", data: "osobne-udaje", terms: "podmienky" },
  ua: { cars: "avtomobili", services: "poslugy", financing: "finansuvannia", about: "pro-nas", contacts: "kontakty", privacy: "konfidentsiinist", cookies: "cookies", data: "personalni-dani", terms: "umovy" },
  ru: { cars: "avtomobili", services: "uslugi", financing: "finansirovanie", about: "o-nas", contacts: "kontakty", privacy: "konfidentsialnost", cookies: "cookies", data: "personalnye-dannye", terms: "usloviya" },
  en: { cars: "cars", services: "services", financing: "financing", about: "about-us", contacts: "contacts", privacy: "privacy-policy", cookies: "cookies", data: "personal-data", terms: "terms" },
} as const;

const common = {
  brand: "GTA_Bratislava",
  phone: process.env.NEXT_PUBLIC_PHONE || "+421 949 711 370",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "421949711370",
  email: process.env.NEXT_PUBLIC_EMAIL || "info@gta-bratislava.sk",
  address: process.env.NEXT_PUBLIC_ADDRESS || "Bratislava, Slovensko",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK || "https://tiktok.com/",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK || "https://facebook.com/",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM || "https://t.me/",
};

export const dictionaries = {
  sk: {
    ...common,
    localeName: "Slovenčina",
    nav: { home: "Domov", cars: "Autá", services: "Služby", financing: "Financovanie", about: "O nás", contacts: "Kontakt" },
    a11y: { navigation: "Hlavná navigácia", language: "Jazyk", menu: "Menu" },
    hero: { eyebrow: "Predaj · Výber · Kontrola áut v Bratislave", title: "Auto, ktoré poznáte skôr, než ho kúpite.", lead: "Preverené vozidlá, otvorená história a pomoc od prvého telefonátu až po registráciu.", primary: "Pozrieť autá", secondary: "Kontaktovať nás", note: "Komunikujeme po slovensky, ukrajinsky, rusky a anglicky." },
    trust: ["Transparentný stav vozidla", "Pomoc s financovaním", "Podpora pri registrácii", "Osobný prístup"],
    sections: { featuredEyebrow: "Aktuálna ponuka", featured: "Autá pripravené na obhliadku", featuredLead: "Každé vozidlo popisujeme tak, ako by sme ho kupovali pre seba.", benefitsEyebrow: "Prečo GTA", benefits: "Pokojnejšie rozhodnutie", servicesEyebrow: "Všetko na jednom mieste", services: "Pomoc pred, počas aj po kúpe", processEyebrow: "Jednoduchý proces", process: "Od výberu po kľúče v ruke", financeEyebrow: "Financovanie", finance: "Zrozumiteľná cesta k vášmu autu", reviewsEyebrow: "Skúsenosti klientov", reviews: "Dôvera vzniká z detailov", contactEyebrow: "Napíšte nám", contact: "Povedzte, aké auto hľadáte" },
    stats: [{value:"4+",label:"autá v ukážkovej ponuke"},{value:"4",label:"jazyky komunikácie"},{value:"1",label:"kontakt počas celého procesu"}],
    benefits: [
      { title: "Fakty bez tlaku", text: "Povieme vám výhody aj riziká. Rozhodnutie zostáva vo vašich rukách." },
      { title: "Kontrola histórie", text: "Overujeme pôvod, servisné záznamy, kilometre a dostupnú históriu poškodení." },
      { title: "Lokálne v Bratislave", text: "Obhliadky, testovacie jazdy a pomoc s dokumentmi riešite na jednom mieste." },
    ],
    services: ["Predaj preverených áut", "Predaj auta klienta", "Výber auta na mieru", "Predkúpna kontrola", "Počítačová diagnostika", "Preverenie histórie", "Pomoc s financovaním", "Konzultácia pri kúpe", "Registrácia a dokumenty"],
    process: [
      { n: "01", title: "Krátka konzultácia", text: "Rozpočet, potreby, spôsob používania a termín." },
      { n: "02", title: "Auto a transparentné údaje", text: "Ukážeme stav, históriu, servis a známe nedostatky." },
      { n: "03", title: "Obhliadka a jazda", text: "Vyskúšate si vozidlo a dostanete odpovede bez nátlaku." },
      { n: "04", title: "Zmluva a odovzdanie", text: "Pomôžeme s financovaním, dokumentmi a registráciou." },
    ],
    finance: { text: "Žiadosť vyplníte online za pár minút. Predbežne vysvetlíme možnosti a bezpečne odovzdáme údaje finančnému partnerovi.", button: "Zistiť možnosti financovania", disclaimer: "Schválenie a podmienky určuje finančná spoločnosť." },
    reviews: [
      { name: "Oleksandr, Bratislava", text: "Všetko bolo vysvetlené pokojne a zrozumiteľne. Vedel som presne, čo kupujem." },
      { name: "Martin, Senec", text: "Oceňujem reálne fotografie, jasnú cenu a pomoc s celou administratívou." },
      { name: "Iryna, Trnava", text: "Komunikácia v ukrajinčine mi veľmi pomohla. Auto sme vybavili bez stresu." },
    ],
    catalog: { eyebrow: "Ponuka vozidiel", title: "Nájdite si svoje auto", lead: "Filtrujte podľa parametrov, ktoré sú pre vás dôležité.", filters: "Filtre", reset: "Vymazať filtre", found: "nájdené", empty: "Týmto filtrom nezodpovedá žiadne auto.", brand: "Značka", model: "Model", maxPrice: "Cena do", minYear: "Rok od", maxMileage: "Nájazd do", fuel: "Palivo", transmission: "Prevodovka", body: "Karoséria", drive: "Pohon", all: "Všetky", sort: "Zoradiť", newest: "Najnovšie", priceAsc: "Cena vzostupne", priceDesc: "Cena zostupne", mileage: "Najazdené km", year: "Rok výroby" },
    car: { year: "Rok", mileage: "Nájazd", fuel: "Palivo", transmission: "Prevodovka", power: "Výkon", engine: "Motor", body: "Karoséria", drive: "Pohon", financing: "Financovanie", perMonth: "od / mes.", detail: "Detail vozidla", description: "O vozidle", equipment: "Výbava", service: "Servisná história", damage: "Poškodenia a lakovanie", vin: "VIN", origin: "Pôvod vozidla", similar: "Podobné autá", whatsapp: "Napísať cez WhatsApp", call: "Zavolať", apply: "Mám záujem", testDrive: "Objednať testovaciu jazdu", zoom: "Zväčšiť fotografiu", draft: "Koncept", available: "Skladom", reserved: "Rezervované", sold: "Predané", hidden: "Skryté", yes: "Áno", no: "Nie" },
    specs: { diesel: "Diesel", petrol: "Benzín", hybrid: "Hybrid", electric: "Elektrina", automatic: "Automat", manual: "Manuál", sedan: "Sedan", wagon: "Kombi", suv: "SUV", hatchback: "Hatchback", fwd: "Predný", rwd: "Zadný", awd: "4×4" },
    servicesPage: { eyebrow: "Služby", title: "Praktická pomoc pri každom aute", lead: "Vyberte si konkrétnu službu alebo nám opíšte situáciu. Navrhneme ďalší krok.", request: "Požiadať o službu" },
    financingPage: { eyebrow: "Financovanie auta", title: "Žiadosť bez zbytočnej neistoty", lead: "Pomôžeme vám pripraviť údaje a odovzdať žiadosť finančnej spoločnosti.", whoTitle: "Kto môže požiadať", who: "Dospelá osoba s preukázateľným príjmom a pobytom alebo oprávnením podľa podmienok konkrétneho partnera.", docsTitle: "Čo si pripraviť", docs: "Doklad totožnosti, doklad o príjme alebo podnikaní a základné údaje o pobyte. Dokumenty neposielajte cez túto bežnú formu.", processTitle: "Ako to prebieha", steps: ["Vyplníte nezáväznú žiadosť.", "Overíme základné údaje a ozveme sa.", "Finančná spoločnosť si bezpečne vyžiada potrebné doklady.", "Po schválení podpíšete zmluvy a prevezmete auto."], warning: "Výpočet je orientačný. Podmienky financovania sa posudzujú individuálne pre každého klienta a po posúdení žiadosti sa môžu líšiť." },
    about: { eyebrow: "O nás", title: "Autá predávame tak, ako ich radi kupujeme", lead: "GTA_Bratislava je lokálny automobilový tím v Bratislave. Staviame na jasných informáciách, dostupnej komunikácii a rešpekte k rozpočtu klienta.", approach: "Náš prístup", approachText: "Najprv počúvame, potom odporúčame. Technické informácie prekladáme do bežnej reči a otvorene ukazujeme aj nedostatky vozidla.", team: "Miesto pre fotografiu tímu", place: "Miesto pre fotografiu prevádzky" },
    contacts: { eyebrow: "Kontakt", title: "Sme tu, keď chcete hovoriť o aute", lead: "Zavolajte, napíšte cez WhatsApp alebo nám pošlite krátku správu.", phone: "Telefón", email: "E-mail", address: "Adresa", hours: "Otváracie hodiny", hoursValue: "Po–Pi 09:00–18:00 · So po dohode", map: "Miesto pre mapu", mapNote: "Presnú adresu a mapu doplňte pred zverejnením." },
    form: { name: "Meno", surname: "Priezvisko", phone: "Telefón", email: "E-mail", message: "Správa", citizenship: "Štátna príslušnosť", employment: "Typ zamestnania", income: "Približný mesačný príjem", downPayment: "Akontácia", carPrice: "Cena vozidla", term: "Doba financovania", comment: "Komentár", consent: "Súhlasím so spracovaním osobných údajov na účel vybavenia žiadosti.", send: "Odoslať", sending: "Odosielam…", success: "Ďakujeme. Žiadosť sme prijali a čoskoro sa ozveme.", error: "Žiadosť sa nepodarilo odoslať. Skúste to znova alebo nám zavolajte.", required: "Vyplňte toto pole.", invalidEmail: "Zadajte platný e-mail.", invalidPhone: "Zadajte platné telefónne číslo.", select: "Vyberte možnosť", months: "mesiacov", employmentOptions: ["Zamestnanec", "SZČO / podnikateľ", "Dôchodca", "Iné"] },
    legal: { privacy: "Ochrana súkromia", cookies: "Používanie cookies", data: "Spracovanie osobných údajov", terms: "Podmienky používania", updated: "Aktualizované: 19. júla 2026" },
    cookies: { text: "Používame nevyhnutné cookies na fungovanie stránky. Voliteľné analytické cookies zapneme len s vaším súhlasom.", accept: "Prijať voliteľné", reject: "Len nevyhnutné", more: "Viac informácií" },
    footer: { line: "Predaj, výber a kontrola automobilov v Bratislave.", rights: "Všetky práva vyhradené.", legal: "Právne informácie", menu: "Menu" },
    whatsappMessage: (car?: string) => car ? `Dobrý deň! Zaujalo ma vozidlo ${car}. Je ešte aktuálne?` : "Dobrý deň! Mám záujem o ponuku GTA_Bratislava. Môžete mi poradiť?",
  },
  ua: {
    ...common,
    localeName: "Українська",
    nav: { home: "Головна", cars: "Автомобілі", services: "Послуги", financing: "Фінансування", about: "Про нас", contacts: "Контакти" },
    a11y: { navigation: "Головна навігація", language: "Мова", menu: "Меню" },
    hero: { eyebrow: "Продаж · Підбір · Перевірка авто у Братиславі", title: "Авто, про яке ви знаєте все ще до покупки.", lead: "Перевірені автомобілі, відкрита історія та допомога від першого дзвінка до реєстрації.", primary: "Переглянути авто", secondary: "Зв’язатися з нами", note: "Спілкуємося словацькою, українською, російською та англійською." },
    trust: ["Прозорий стан авто", "Допомога з фінансуванням", "Супровід реєстрації", "Особистий підхід"],
    sections: { featuredEyebrow: "Актуальна пропозиція", featured: "Авто, готові до огляду", featuredLead: "Кожен автомобіль описуємо так, ніби купуємо його для себе.", benefitsEyebrow: "Чому GTA", benefits: "Спокійніше рішення", servicesEyebrow: "Усе в одному місці", services: "Допомога до, під час і після покупки", processEyebrow: "Простий процес", process: "Від вибору до ключів у руках", financeEyebrow: "Фінансування", finance: "Зрозумілий шлях до вашого авто", reviewsEyebrow: "Досвід клієнтів", reviews: "Довіра народжується з деталей", contactEyebrow: "Напишіть нам", contact: "Розкажіть, яке авто шукаєте" },
    stats: [{value:"4+",label:"авто у демо-каталозі"},{value:"4",label:"мови спілкування"},{value:"1",label:"контакт протягом усього процесу"}],
    benefits: [
      { title: "Факти без тиску", text: "Розповімо про переваги й ризики. Остаточне рішення завжди за вами." },
      { title: "Перевірка історії", text: "Перевіряємо походження, сервіс, пробіг і доступну історію пошкоджень." },
      { title: "Локально у Братиславі", text: "Огляд, тест-драйв і допомога з документами — в одному місці." },
    ],
    services: ["Продаж перевірених авто", "Допомога з продажем авто клієнта", "Підбір авто", "Перевірка перед купівлею", "Комп’ютерна діагностика", "Перевірка історії", "Допомога з фінансуванням", "Консультація щодо купівлі", "Реєстрація та документи"],
    process: [
      { n: "01", title: "Коротка консультація", text: "Бюджет, потреби, сценарій використання та термін." },
      { n: "02", title: "Авто та прозорі дані", text: "Показуємо стан, історію, сервіс і відомі недоліки." },
      { n: "03", title: "Огляд і тест-драйв", text: "Ви перевіряєте авто та отримуєте відповіді без тиску." },
      { n: "04", title: "Договір і передача", text: "Допомагаємо з фінансуванням, документами та реєстрацією." },
    ],
    finance: { text: "Заявка заповнюється онлайн за кілька хвилин. Ми пояснимо можливості та безпечно передамо дані фінансовому партнеру.", button: "Дізнатися про фінансування", disclaimer: "Рішення та умови визначає фінансова компанія." },
    reviews: [
      { name: "Олександр, Братислава", text: "Усе пояснили спокійно й зрозуміло. Я точно знав, що купую." },
      { name: "Мартін, Сенець", text: "Реальні фото, чітка ціна й допомога з усіма документами." },
      { name: "Ірина, Трнава", text: "Спілкування українською дуже допомогло. Оформили авто без стресу." },
    ],
    catalog: { eyebrow: "Автомобілі у продажу", title: "Знайдіть своє авто", lead: "Фільтруйте за параметрами, які важливі саме для вас.", filters: "Фільтри", reset: "Скинути фільтри", found: "знайдено", empty: "За цими фільтрами автомобілів немає.", brand: "Марка", model: "Модель", maxPrice: "Ціна до", minYear: "Рік від", maxMileage: "Пробіг до", fuel: "Паливо", transmission: "Коробка", body: "Кузов", drive: "Привід", all: "Усі", sort: "Сортування", newest: "Спочатку нові", priceAsc: "Ціна за зростанням", priceDesc: "Ціна за спаданням", mileage: "Пробіг", year: "Рік випуску" },
    car: { year: "Рік", mileage: "Пробіг", fuel: "Паливо", transmission: "Коробка", power: "Потужність", engine: "Двигун", body: "Кузов", drive: "Привід", financing: "Фінансування", perMonth: "від / міс.", detail: "Переглянути авто", description: "Про автомобіль", equipment: "Комплектація", service: "Історія обслуговування", damage: "Пошкодження та фарбування", vin: "VIN", origin: "Походження авто", similar: "Схожі авто", whatsapp: "Написати у WhatsApp", call: "Зателефонувати", apply: "Залишити заявку", testDrive: "Записатися на тест-драйв", zoom: "Збільшити фото", draft: "Чернетка", available: "В наявності", reserved: "Зарезервовано", sold: "Продано", hidden: "Приховано", yes: "Так", no: "Ні" },
    specs: { diesel: "Дизель", petrol: "Бензин", hybrid: "Гібрид", electric: "Електро", automatic: "Автомат", manual: "Механіка", sedan: "Седан", wagon: "Універсал", suv: "SUV", hatchback: "Хетчбек", fwd: "Передній", rwd: "Задній", awd: "4×4" },
    servicesPage: { eyebrow: "Послуги", title: "Практична допомога з кожним авто", lead: "Оберіть послугу або опишіть ситуацію — ми запропонуємо наступний крок.", request: "Залишити заявку" },
    financingPage: { eyebrow: "Фінансування авто", title: "Заявка без зайвої невизначеності", lead: "Допоможемо підготувати дані та передати заявку фінансовій компанії.", whoTitle: "Хто може подати заявку", who: "Повнолітня особа з підтвердженим доходом і статусом проживання відповідно до умов партнера.", docsTitle: "Що підготувати", docs: "Посвідчення особи, підтвердження доходу або підприємництва й дані про проживання. Не надсилайте документи через цю звичайну форму.", processTitle: "Як це відбувається", steps: ["Заповнюєте попередню заявку.", "Ми перевіряємо базові дані та зв’язуємося з вами.", "Фінансова компанія безпечно запитує необхідні документи.", "Після схвалення підписуєте договір і отримуєте авто."], warning: "Розрахунок є приблизним. Умови фінансування обговорюються індивідуально для кожного клієнта та можуть відрізнятися після розгляду заявки." },
    about: { eyebrow: "Про нас", title: "Продаємо авто так, як самі хотіли б купувати", lead: "GTA_Bratislava — локальна автомобільна команда у Братиславі. Ми за чітку інформацію, доступне спілкування й повагу до бюджету клієнта.", approach: "Наш підхід", approachText: "Спочатку слухаємо, потім радимо. Перекладаємо технічні деталі простою мовою й відкрито показуємо недоліки авто.", team: "Місце для фото команди", place: "Місце для фото майданчика" },
    contacts: { eyebrow: "Контакти", title: "Ми поруч, коли ви хочете поговорити про авто", lead: "Телефонуйте, пишіть у WhatsApp або надішліть коротке повідомлення.", phone: "Телефон", email: "Електронна пошта", address: "Адреса", hours: "Години роботи", hoursValue: "Пн–Пт 09:00–18:00 · Сб за домовленістю", map: "Місце для карти", mapNote: "Додайте точну адресу й карту перед публікацією." },
    form: { name: "Ім’я", surname: "Прізвище", phone: "Телефон", email: "E-mail", message: "Повідомлення", citizenship: "Громадянство", employment: "Тип зайнятості", income: "Приблизний щомісячний дохід", downPayment: "Перший внесок", carPrice: "Вартість авто", term: "Строк фінансування", comment: "Коментар", consent: "Погоджуюся на обробку персональних даних для розгляду заявки.", send: "Надіслати", sending: "Надсилаємо…", success: "Дякуємо. Ми отримали заявку й скоро зв’яжемося з вами.", error: "Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.", required: "Заповніть це поле.", invalidEmail: "Вкажіть коректний e-mail.", invalidPhone: "Вкажіть коректний номер телефону.", select: "Оберіть варіант", months: "місяців", employmentOptions: ["Найманий працівник", "Підприємець", "Пенсіонер", "Інше"] },
    legal: { privacy: "Політика конфіденційності", cookies: "Використання cookies", data: "Обробка персональних даних", terms: "Умови використання", updated: "Оновлено: 19 липня 2026" },
    cookies: { text: "Ми використовуємо необхідні cookies для роботи сайту. Необов’язкову аналітику вмикаємо лише за вашою згодою.", accept: "Прийняти необов’язкові", reject: "Лише необхідні", more: "Докладніше" },
    footer: { line: "Продаж, підбір і перевірка автомобілів у Братиславі.", rights: "Усі права захищено.", legal: "Правова інформація", menu: "Меню" },
    whatsappMessage: (car?: string) => car ? `Вітаю! Мене зацікавив автомобіль ${car}. Підкажіть, будь ласка, чи актуальний він?` : "Вітаю! Мене цікавить пропозиція GTA_Bratislava. Підкажіть, будь ласка, деталі.",
  },
  ru: {
    ...common,
    localeName: "Русский",
    nav: { home: "Главная", cars: "Автомобили", services: "Услуги", financing: "Финансирование", about: "О нас", contacts: "Контакты" },
    a11y: { navigation: "Основная навигация", language: "Язык", menu: "Меню" },
    hero: { eyebrow: "Продажа · Подбор · Проверка авто в Братиславе", title: "Автомобиль, о котором вы знаете всё до покупки.", lead: "Проверенные автомобили, открытая история и помощь от первого звонка до регистрации.", primary: "Посмотреть автомобили", secondary: "Связаться с нами", note: "Общаемся на словацком, украинском, русском и английском." },
    trust: ["Прозрачное состояние авто", "Помощь с финансированием", "Сопровождение регистрации", "Личный подход"],
    sections: { featuredEyebrow: "Актуальное предложение", featured: "Автомобили, готовые к осмотру", featuredLead: "Каждый автомобиль описываем так, будто покупаем его для себя.", benefitsEyebrow: "Почему GTA", benefits: "Более спокойное решение", servicesEyebrow: "Всё в одном месте", services: "Помощь до, во время и после покупки", processEyebrow: "Простой процесс", process: "От выбора до ключей в руках", financeEyebrow: "Финансирование", finance: "Понятный путь к вашему автомобилю", reviewsEyebrow: "Опыт клиентов", reviews: "Доверие складывается из деталей", contactEyebrow: "Напишите нам", contact: "Расскажите, какой автомобиль ищете" },
    stats: [{value:"4+",label:"автомобиля в демо-каталоге"},{value:"4",label:"языка общения"},{value:"1",label:"контакт на всём пути"}],
    benefits: [
      { title: "Факты без давления", text: "Расскажем о плюсах и рисках. Окончательное решение всегда остаётся за вами." },
      { title: "Проверка истории", text: "Проверяем происхождение, сервис, пробег и доступную историю повреждений." },
      { title: "Локально в Братиславе", text: "Осмотр, тест-драйв и помощь с документами — в одном месте." },
    ],
    services: ["Продажа проверенных авто", "Помощь в продаже авто клиента", "Подбор автомобиля", "Проверка перед покупкой", "Компьютерная диагностика", "Проверка истории", "Помощь с финансированием", "Консультация по покупке", "Регистрация и документы"],
    process: [
      { n: "01", title: "Короткая консультация", text: "Бюджет, потребности, сценарий использования и сроки." },
      { n: "02", title: "Авто и прозрачные данные", text: "Покажем состояние, историю, сервис и известные недостатки." },
      { n: "03", title: "Осмотр и тест-драйв", text: "Вы проверяете авто и получаете ответы без давления." },
      { n: "04", title: "Договор и передача", text: "Помогаем с финансированием, документами и регистрацией." },
    ],
    finance: { text: "Заявка заполняется онлайн за несколько минут. Мы объясним варианты и безопасно передадим данные финансовому партнёру.", button: "Узнать о финансировании", disclaimer: "Решение и условия определяет финансовая компания." },
    reviews: [
      { name: "Александр, Братислава", text: "Всё объяснили спокойно и понятно. Я точно знал, что покупаю." },
      { name: "Мартин, Сенец", text: "Реальные фото, ясная цена и помощь со всеми документами." },
      { name: "Ирина, Трнава", text: "Общение на русском очень помогло. Оформили автомобиль без стресса." },
    ],
    catalog: { eyebrow: "Автомобили в продаже", title: "Найдите свой автомобиль", lead: "Фильтруйте по параметрам, которые важны именно вам.", filters: "Фильтры", reset: "Сбросить фильтры", found: "найдено", empty: "По этим фильтрам автомобилей нет.", brand: "Марка", model: "Модель", maxPrice: "Цена до", minYear: "Год от", maxMileage: "Пробег до", fuel: "Топливо", transmission: "Коробка", body: "Кузов", drive: "Привод", all: "Все", sort: "Сортировка", newest: "Сначала новые", priceAsc: "Цена по возрастанию", priceDesc: "Цена по убыванию", mileage: "Пробег", year: "Год выпуска" },
    car: { year: "Год", mileage: "Пробег", fuel: "Топливо", transmission: "Коробка", power: "Мощность", engine: "Двигатель", body: "Кузов", drive: "Привод", financing: "Финансирование", perMonth: "от / мес.", detail: "Посмотреть автомобиль", description: "Об автомобиле", equipment: "Комплектация", service: "История обслуживания", damage: "Повреждения и окрашенные элементы", vin: "VIN", origin: "Происхождение автомобиля", similar: "Похожие автомобили", whatsapp: "Написать в WhatsApp", call: "Позвонить", apply: "Оставить заявку", testDrive: "Записаться на тест-драйв", zoom: "Увеличить фото", draft: "Черновик", available: "В наличии", reserved: "Зарезервирован", sold: "Продан", hidden: "Скрыт", yes: "Да", no: "Нет" },
    specs: { diesel: "Дизель", petrol: "Бензин", hybrid: "Гибрид", electric: "Электро", automatic: "Автомат", manual: "Механика", sedan: "Седан", wagon: "Универсал", suv: "SUV", hatchback: "Хэтчбек", fwd: "Передний", rwd: "Задний", awd: "4×4" },
    servicesPage: { eyebrow: "Услуги", title: "Практическая помощь с каждым автомобилем", lead: "Выберите услугу или опишите ситуацию — мы предложим следующий шаг.", request: "Оставить заявку" },
    financingPage: { eyebrow: "Финансирование автомобиля", title: "Заявка без лишней неопределённости", lead: "Поможем подготовить данные и передать заявку финансовой компании.", whoTitle: "Кто может подать заявку", who: "Совершеннолетний человек с подтверждённым доходом и статусом проживания согласно условиям партнёра.", docsTitle: "Что подготовить", docs: "Удостоверение личности, подтверждение дохода или предпринимательства и данные о проживании. Не отправляйте документы через эту обычную форму.", processTitle: "Как это происходит", steps: ["Заполняете предварительную заявку.", "Мы проверяем основные данные и связываемся с вами.", "Финансовая компания безопасно запрашивает нужные документы.", "После одобрения подписываете договор и получаете автомобиль."], warning: "Расчёт является примерным. Условия финансирования обсуждаются индивидуально для каждого клиента и могут отличаться после рассмотрения заявки." },
    about: { eyebrow: "О нас", title: "Продаём автомобили так, как сами хотели бы покупать", lead: "GTA_Bratislava — локальная автомобильная команда в Братиславе. Мы за ясную информацию, доступное общение и уважение к бюджету клиента.", approach: "Наш подход", approachText: "Сначала слушаем, потом советуем. Переводим технические детали на обычный язык и открыто показываем недостатки автомобиля.", team: "Место для фотографии команды", place: "Место для фотографии площадки" },
    contacts: { eyebrow: "Контакты", title: "Мы рядом, когда вы хотите поговорить об автомобиле", lead: "Позвоните, напишите в WhatsApp или отправьте короткое сообщение.", phone: "Телефон", email: "Электронная почта", address: "Адрес", hours: "Часы работы", hoursValue: "Пн–Пт 09:00–18:00 · Сб по договорённости", map: "Место для карты", mapNote: "Добавьте точный адрес и карту перед публикацией." },
    form: { name: "Имя", surname: "Фамилия", phone: "Телефон", email: "E-mail", message: "Сообщение", citizenship: "Гражданство", employment: "Тип занятости", income: "Примерный ежемесячный доход", downPayment: "Первоначальный взнос", carPrice: "Стоимость автомобиля", term: "Срок финансирования", comment: "Комментарий", consent: "Согласен на обработку персональных данных для рассмотрения заявки.", send: "Отправить", sending: "Отправляем…", success: "Спасибо. Мы получили заявку и скоро свяжемся с вами.", error: "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.", required: "Заполните это поле.", invalidEmail: "Укажите корректный e-mail.", invalidPhone: "Укажите корректный номер телефона.", select: "Выберите вариант", months: "месяцев", employmentOptions: ["Наёмный работник", "Предприниматель", "Пенсионер", "Другое"] },
    legal: { privacy: "Политика конфиденциальности", cookies: "Использование cookies", data: "Обработка персональных данных", terms: "Условия использования", updated: "Обновлено: 19 июля 2026" },
    cookies: { text: "Мы используем необходимые cookies для работы сайта. Необязательную аналитику включаем только с вашего согласия.", accept: "Принять необязательные", reject: "Только необходимые", more: "Подробнее" },
    footer: { line: "Продажа, подбор и проверка автомобилей в Братиславе.", rights: "Все права защищены.", legal: "Правовая информация", menu: "Меню" },
    whatsappMessage: (car?: string) => car ? `Здравствуйте! Меня заинтересовал автомобиль ${car}. Подскажите, пожалуйста, актуален ли он?` : "Здравствуйте! Меня интересует предложение GTA_Bratislava. Подскажите, пожалуйста, детали.",
  },
  en: {
    ...common,
    localeName: "English",
    nav: { home: "Home", cars: "Cars", services: "Services", financing: "Financing", about: "About us", contacts: "Contacts" },
    a11y: { navigation: "Main navigation", language: "Language", menu: "Menu" },
    hero: { eyebrow: "Sales · Sourcing · Vehicle checks in Bratislava", title: "Know your car before you buy it.", lead: "Inspected vehicles, transparent history and support from the first call through registration.", primary: "View cars", secondary: "Contact us", note: "We communicate in Slovak, Ukrainian, Russian and English." },
    trust: ["Transparent vehicle condition", "Financing support", "Registration assistance", "Personal approach"],
    sections: { featuredEyebrow: "Current selection", featured: "Cars ready to view", featuredLead: "We describe every vehicle as carefully as if we were buying it ourselves.", benefitsEyebrow: "Why GTA", benefits: "A calmer way to decide", servicesEyebrow: "Everything in one place", services: "Support before, during and after your purchase", processEyebrow: "Simple process", process: "From the shortlist to the keys", financeEyebrow: "Financing", finance: "A clear path to your next car", reviewsEyebrow: "Client experience", reviews: "Trust is built in the details", contactEyebrow: "Talk to us", contact: "Tell us what kind of car you need" },
    stats: [{value:"4+",label:"cars in the demo catalogue"},{value:"4",label:"communication languages"},{value:"1",label:"contact throughout the process"}],
    benefits: [
      { title: "Facts without pressure", text: "We explain the benefits and the risks. The final decision always remains yours." },
      { title: "History verification", text: "We check origin, service records, mileage and available damage history." },
      { title: "Local in Bratislava", text: "Viewings, test drives and document support are handled in one place." },
    ],
    services: ["Sale of inspected cars", "Help selling a client’s car", "Vehicle sourcing", "Pre-purchase inspection", "Computer diagnostics", "Vehicle history check", "Financing assistance", "Purchase consultation", "Registration and documents"],
    process: [
      { n: "01", title: "Short consultation", text: "We discuss your budget, needs, usage and timeframe." },
      { n: "02", title: "Car and clear facts", text: "We show the condition, history, service records and known imperfections." },
      { n: "03", title: "Viewing and test drive", text: "You inspect the car and get straightforward answers without pressure." },
      { n: "04", title: "Contract and handover", text: "We assist with financing, documents and registration." },
    ],
    finance: { text: "The preliminary application takes only a few minutes. We explain the options and pass your details securely to the financing partner.", button: "Explore financing", disclaimer: "The financing company makes the final decision and sets the terms." },
    reviews: [
      { name: "Alexander, Bratislava", text: "Everything was explained calmly and clearly. I knew exactly what I was buying." },
      { name: "Martin, Senec", text: "Real photos, a clear price and help with all the documents." },
      { name: "Iryna, Trnava", text: "Communication was easy and the car was registered without stress." },
    ],
    catalog: { eyebrow: "Cars for sale", title: "Find your next car", lead: "Filter the catalogue by the details that matter to you.", filters: "Filters", reset: "Reset filters", found: "found", empty: "No cars match these filters.", brand: "Make", model: "Model", maxPrice: "Price up to", minYear: "Year from", maxMileage: "Mileage up to", fuel: "Fuel", transmission: "Transmission", body: "Body type", drive: "Drive", all: "All", sort: "Sort", newest: "Newest first", priceAsc: "Price: low to high", priceDesc: "Price: high to low", mileage: "Mileage", year: "Year" },
    car: { year: "Year", mileage: "Mileage", fuel: "Fuel", transmission: "Transmission", power: "Power", engine: "Engine", body: "Body", drive: "Drive", financing: "Financing", perMonth: "from / month", detail: "View car", description: "About the car", equipment: "Equipment", service: "Service history", damage: "Damage and painted panels", vin: "VIN", origin: "Vehicle origin", similar: "Similar cars", whatsapp: "Message on WhatsApp", call: "Call", apply: "Send enquiry", testDrive: "Book a test drive", zoom: "Enlarge photo", draft: "Draft", available: "Available", reserved: "Reserved", sold: "Sold", hidden: "Hidden", yes: "Yes", no: "No" },
    specs: { diesel: "Diesel", petrol: "Petrol", hybrid: "Hybrid", electric: "Electric", automatic: "Automatic", manual: "Manual", sedan: "Saloon", wagon: "Estate", suv: "SUV", hatchback: "Hatchback", fwd: "Front-wheel drive", rwd: "Rear-wheel drive", awd: "4×4" },
    servicesPage: { eyebrow: "Services", title: "Practical support for every vehicle", lead: "Choose a service or describe your situation and we will suggest the next step.", request: "Send an enquiry" },
    financingPage: { eyebrow: "Vehicle financing", title: "A clear preliminary application", lead: "We help you prepare the information and submit the application to a financing company.", whoTitle: "Who can apply", who: "An adult with verifiable income and residence status that meets the partner’s requirements.", docsTitle: "What to prepare", docs: "Identification, proof of income or business activity, and residence details. Do not send sensitive documents through this standard form.", processTitle: "How it works", steps: ["Complete the preliminary application.", "We review the basic information and contact you.", "The financing company requests the required documents through a secure channel.", "After approval, you sign the agreement and collect the vehicle."], warning: "The calculation is an estimate. Financing terms are assessed individually for each client and may differ after the application is reviewed." },
    about: { eyebrow: "About us", title: "We sell cars the way we would want to buy them", lead: "GTA_Bratislava is a local automotive team in Bratislava. We value clear information, accessible communication and respect for every client’s budget.", approach: "Our approach", approachText: "We listen first and advise second. We translate technical details into plain language and openly show the vehicle’s imperfections.", team: "Team photo placeholder", place: "Location photo placeholder" },
    contacts: { eyebrow: "Contacts", title: "We are here when you want to talk about a car", lead: "Call, message us on WhatsApp or send a short enquiry.", phone: "Phone", email: "Email", address: "Address", hours: "Opening hours", hoursValue: "Mon–Fri 09:00–18:00 · Sat by appointment", map: "Map placeholder", mapNote: "Add the exact address and map before publishing." },
    form: { name: "First name", surname: "Last name", phone: "Phone", email: "Email", message: "Message", citizenship: "Citizenship", employment: "Employment type", income: "Approximate monthly income", downPayment: "Down payment", carPrice: "Selected car price", term: "Financing term", comment: "Comment", consent: "I consent to the processing of my personal data for the purpose of handling this application.", send: "Send", sending: "Sending…", success: "Thank you. We have received your request and will contact you soon.", error: "We could not send your request. Please try again or call us.", required: "Please complete this field.", invalidEmail: "Enter a valid email address.", invalidPhone: "Enter a valid phone number.", select: "Select an option", months: "months", employmentOptions: ["Employee", "Self-employed / business owner", "Pensioner", "Other"] },
    legal: { privacy: "Privacy policy", cookies: "Cookie policy", data: "Personal data processing", terms: "Terms of use", updated: "Updated: 19 July 2026" },
    cookies: { text: "We use essential cookies to operate the website. Optional analytics are enabled only with your consent.", accept: "Accept optional cookies", reject: "Essential only", more: "Learn more" },
    footer: { line: "Vehicle sales, sourcing and inspections in Bratislava.", rights: "All rights reserved.", legal: "Legal information", menu: "Menu" },
    whatsappMessage: (car?: string) => car ? `Hello! I am interested in the ${car}. Could you please confirm whether it is still available?` : "Hello! I am interested in GTA_Bratislava services. Could you please send me more information?",
  },
} as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function localizedPath(locale: Locale, key: keyof (typeof routeMap)[Locale]) {
  return `/${locale}/${routeMap[locale][key]}`;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  const oldLocale = isLocale(parts[0] || "") ? (parts[0] as Locale) : "sk";
  const rest = parts.slice(1);
  const routeKey = (Object.entries(routeMap[oldLocale]).find(([, value]) => value === rest[0])?.[0] || null) as keyof (typeof routeMap)[Locale] | null;
  if (routeKey) rest[0] = routeMap[locale][routeKey];
  return `/${locale}${rest.length ? `/${rest.join("/")}` : ""}`;
}
