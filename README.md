# GTA_Bratislava

## Обновление административной панели (19.07.2026)

Админ-панель находится по адресу `/admin/`. В ней доступны dashboard, управление автомобилями и фотографиями, CRM заявок, календарь просмотров, настройки сайта, роли администраторов и аналитика. Интерфейс адаптирован для телефона и компьютера.

### Как применить SQL-миграцию

Перед изменением базы сохранён снимок исходной схемы: `supabase/backups/schema_pre_admin_extension_20260719.sql`. Он нужен для сравнения и восстановления структуры, но не заменяет резервную копию реальных данных проекта Supabase.

Для существующего проекта:

1. В Supabase откройте SQL Editor.
2. На всякий случай сделайте резервную копию удалённой базы через Supabase Dashboard или CLI.
3. Откройте `supabase/migrations/20260719_210000_admin_crm_analytics.sql`.
4. Скопируйте файл целиком в SQL Editor и нажмите Run.
5. Убедитесь, что команда завершилась без ошибки, затем заново откройте `/admin/`.

Миграция выполняется в транзакции, не удаляет существующие таблицы и строки и расширяет действующую авторизацию. Если возникает ошибка, транзакция откатывается целиком. Для нового проекта сначала выполните `supabase/schema.sql`, затем эту миграцию.

Если администратор уже находился в `public.admins` до миграции, он получает роль `owner`. Для создания первого owner после миграции сначала создайте пользователя в Supabase Authentication → Users, затем выполните:

```sql
insert into public.admins (id, role, email, display_name)
select id, 'owner'::public.admin_role, lower(email), 'GTA Owner'
from auth.users
where lower(email) = lower('owner@example.com')
on conflict (id) do update set role = 'owner', is_active = true;
```

Остальных администраторов owner добавляет в разделе «Administrátori». Пользователь должен уже существовать в Supabase Auth; сайт не создаёт и не хранит его пароль.

### Роли и права

- `owner` — полный доступ, управление администраторами, удаление автомобилей и критических данных, журнал аудита;
- `manager` — автомобили, цены и статусы, CRM, календарь и аналитика, но без удаления критических данных и управления администраторами;
- `content_manager` — тексты, характеристики, фотографии и настройки контента; база запрещает этой роли менять цену, статус и финансирование;
- `viewer` — только просмотр dashboard, автомобилей и аналитики без персональных данных заявителей.

Последнего активного owner нельзя удалить, деактивировать или понизить. Ограничения действуют не только в интерфейсе, но и через RLS-политики и PostgreSQL-триггеры. `SUPABASE_SERVICE_ROLE_KEY` на клиенте не используется.

### Новые таблицы

- `appointments` — просмотры и тест-драйвы;
- `application_status_history` — история статусов заявок;
- `car_price_history` — история изменения цен;
- `analytics_events` — события просмотра, WhatsApp и отправки заявки;
- `car_metrics` — агрегированные показатели автомобилей;
- `site_settings` — контакты, соцсети, баннер и служебные настройки;
- `admin_audit_log` — аудит изменений администраторов.

Создано представление `admin_applications`, объединяющее обычные и финансовые заявки для CRM.

### Новые поля существующих таблиц

- `admins`: `role`, `display_name`, `email`, `is_active`, `updated_at`;
- `cars`: `sort_order`, `featured`, `is_new`, `good_price`, `published_at`; статусы расширены до `draft`, `available`, `reserved`, `sold`, `hidden`;
- `leads` и `financing_applications`: `crm_status`, `assigned_to`, `manager_notes`, `last_contacted_at`, `updated_at`;
- `site_content`: `seo_title`, `seo_description`, `updated_by`.

### Основные RLS-политики

- посетитель читает только автомобили со статусом `available`, `reserved` или `sold`;
- посетитель может отправить новую форму, но не может читать заявки;
- аналитика записывается только через ограниченную RPC-функцию и только после согласия на необязательную аналитику;
- персональные данные CRM доступны только `owner` и `manager`;
- контент автомобилей и Storage доступны редакторским ролям;
- удаление автомобилей, заявок и записей календаря разрешено только `owner`;
- настройки сайта публичны только для чтения, изменять их могут `owner` и `content_manager`;
- журнал аудита и управление администраторами доступны только `owner`.

### Работа с новой админкой

- «Dashboard» показывает автомобили по статусам, новые заявки, ближайшие просмотры, популярные и давно не обновлявшиеся автомобили.
- «Automobily» позволяет создать черновик, дублировать автомобиль, быстро изменить цену, вручную изменить порядок, поставить метки, загрузить сразу несколько фото, выбрать главное и менять порядок перетаскиванием.
- «CRM» фильтрует заявки по дате, типу, статусу и автомобилю, сохраняет заметки и ответственного, открывает телефон/WhatsApp и экспортирует выбранный список в CSV.
- «Kalendár» содержит списочный и месячный режимы, создание просмотров и отметки завершения/отмены.
- «Nastavenia» хранит контакты, соцсети, баннер, тексты и SEO для `sk`, `ua`, `ru`, `en`. Изменение статического SEO требует новой публикации сайта.
- «Analytika» показывает просмотры, WhatsApp, заявки, популярность автомобилей и историю цен.

### Переменные окружения

Новых обязательных переменных для расширенной админки нет. Используются существующие:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Anon key разрешено использовать в браузере: доступ ограничен RLS. Никогда не добавляйте service role key в `.env`, GitHub или Cloudflare Pages.


Многоязычный автомобильный сайт для Братиславы на Next.js, TypeScript и Tailwind CSS. Словацкий язык основной; также доступны украинский, русский и английский.

Проект подготовлен для инфраструктуры с минимальными затратами:

- GitHub — исходный код и история изменений;
- Cloudflare Pages — статический сайт, бесплатный адрес `gta-bratislava.pages.dev`, автоматические публикации и SSL;
- Supabase Free — база данных, вход администратора и Storage;
- статические демонстрационные данные — резервный вариант при временной недоступности Supabase.

Сайт не использует обязательный платный сервер, service-role ключ Supabase или пароль администратора в исходном коде.

## Быстрый локальный запуск

Нужны Node.js 22 и pnpm 10.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Откройте `http://localhost:3000`. Основные адреса:

- `http://localhost:3000/sk/`
- `http://localhost:3000/ua/avtomobili/`
- `http://localhost:3000/ru/avtomobili/`
- `http://localhost:3000/en/cars/`
- `http://localhost:3000/admin/`

Проверка перед публикацией:

```bash
pnpm lint
pnpm typecheck
pnpm pages:build
```

Готовый статический сайт появится в папке `out`.

## Переменные окружения

Создайте `.env.local` для локальной работы. В Cloudflare Pages добавьте те же переменные в Settings → Environment variables для Production и Preview.

```env
NEXT_PUBLIC_SITE_URL=https://gta-bratislava.pages.dev
NEXT_PUBLIC_PHONE=+421 949 711 370
NEXT_PUBLIC_WHATSAPP=421949711370
NEXT_PUBLIC_EMAIL=info@gta-bratislava.sk
NEXT_PUBLIC_ADDRESS=Bratislava, Slovensko
NEXT_PUBLIC_INSTAGRAM=https://instagram.com/
NEXT_PUBLIC_TIKTOK=https://tiktok.com/
NEXT_PUBLIC_FACEBOOK=https://facebook.com/
NEXT_PUBLIC_TELEGRAM=https://t.me/
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` является публичным ключом браузера. Защиту обеспечивают RLS-политики из `supabase/schema.sql`. Никогда не добавляйте `SUPABASE_SERVICE_ROLE_KEY` в GitHub или Cloudflare Pages.

Если Supabase-переменные не заполнены или бесплатный проект временно приостановлен, главная, услуги, контакты, финансирование и демонстрационный каталог всё равно открываются. Формы и административные изменения в этот момент недоступны, чтобы персональные данные не сохранялись небезопасно в браузере.

## Подключение Supabase Free

1. Создайте бесплатный проект на [supabase.com](https://supabase.com/).
2. Откройте SQL Editor, вставьте весь файл `supabase/schema.sql` и выполните его.
3. Откройте Authentication → Providers → Email и отключите публичную регистрацию, если она включена. Администратора создавайте только вручную.
4. В Authentication → Users нажмите Add user и создайте пользователя с email и надёжным паролем.
5. В SQL Editor выполните, заменив email:

```sql
insert into public.admins (id)
select id from auth.users where email = 'owner@example.com'
on conflict (id) do nothing;
```

6. В Project Settings → API скопируйте Project URL и anon public key в переменные окружения.
7. Пересоберите сайт или запустите новую публикацию Cloudflare Pages.

После этого вход работает по адресу `/admin/`. Пользователь должен одновременно существовать в Supabase Auth и в таблице `public.admins`. Даже авторизованный пользователь без записи в `admins` не сможет читать заявки или изменять автомобили.

Схема создаёт:

- `cars` — автомобили и переводы;
- `leads` — контактные заявки и тест-драйвы;
- `financing_applications` — заявки на финансирование;
- `site_content` — редактируемые заголовки главной страницы;
- `admins` — разрешённые администраторы;
- публичный Storage bucket `cars` с записью только для администраторов.

Публичный посетитель может читать автомобили и отправлять новую заявку, но не может просматривать заявки, редактировать данные или загружать файлы. SQL-ограничения дополнительно проверяют длину полей, согласие и допустимые числовые значения.

## Автомобили и фотографии

Добавлять и редактировать автомобили можно в `/admin/`:

1. Откройте Cars → Add car.
2. Заполните характеристики, статус и цену.
3. Заполните тексты на `sk`, `ua`, `ru` и `en`.
4. Загрузите фотографии и выберите главное фото звёздочкой.
5. Нажмите Save.

При загрузке браузер автоматически:

- отклоняет исходники больше 10 МБ и изображения больше 50 мегапикселей;
- создаёт WebP до 1920 px для галереи;
- создаёт WebP до 640 px для карточки каталога;
- загружает обе версии в Supabase Storage;
- сохраняет длительное кеширование;
- использует уменьшенную версию в каталоге и загружает карточки лениво при прокрутке.

Supabase Free не включает серверные Image Transformations, поэтому варианты создаются заранее бесплатно в браузере администратора. Bucket также принимает только WebP и ограничен 10 МБ на файл.

Демонстрационные автомобили лежат в `data/cars.ts` и всегда доступны как резервный каталог. Автомобили из Supabase появляются без новой сборки. Для новых записей используется статический маршрут вида `/en/cars/vehicle/?slug=car-slug`. Чтобы новый автомобиль получил отдельный предварительно сгенерированный SEO-адрес, добавьте его также в `data/cars.ts` и отправьте изменение в `main` — Cloudflare пересоберёт страницы автоматически.

## Формы и защита от спама

Контактная и финансовая формы сохраняют данные непосредственно в Supabase через anon key и RLS. В проекте есть:

- проверка обязательных полей, телефона, email и чисел;
- скрытое honeypot-поле;
- минимальное время заполнения;
- локальная пауза между повторными отправками;
- ограничения длины и диапазонов на уровне PostgreSQL;
- запрет чтения заявок для публичного пользователя.

Для сайта с большим рекламным трафиком можно дополнительно подключить Cloudflare Turnstile и проверять его токен в бесплатной Supabase Edge Function. Не загружайте паспорта, банковские выписки и другие чувствительные документы через обычную форму.

Уведомления можно настроить без изменения сайта через Supabase Database Webhooks для таблиц `leads` и `financing_applications`, направив событие в собственную Edge Function или выбранный бесплатный канал. Заявки доступны в админ-панели и экспортируются в CSV прямо в браузере.

## Изменение контактов, WhatsApp и логотипа

- Контакты и социальные сети меняются через переменные окружения.
- Номер WhatsApp указывается без `+` и пробелов, например `421949711370`.
- На странице автомобиля сообщение автоматически содержит название текущей машины и переводится на выбранный язык.
- Логотип находится в `public/brand/gta-bratislava-logo.jpg`. Замените файл, сохранив имя, либо измените путь в `components/logo.tsx` и `components/pages/home-page.tsx`.

После изменения переменных в Cloudflare запустите Retry deployment или отправьте новый commit.

## Загрузка кода в GitHub

Создайте пустой репозиторий без автоматически добавленного README, затем в папке проекта выполните:

```bash
git init
git add .
git commit -m "Prepare GTA Bratislava for Cloudflare Pages"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/gta-bratislava.git
git push -u origin main
```

Файлы `.env` и `.env.local`, папки `node_modules`, `.next` и `out` исключены из Git. В `.github/workflows/quality.yml` есть бесплатная проверка lint, TypeScript и статической сборки для основной ветки и pull request.

## Публикация в Cloudflare Pages

1. Зарегистрируйтесь в Cloudflare и откройте Workers & Pages.
2. Выберите Create application → Pages → Import an existing Git repository.
3. Подключите GitHub и выберите репозиторий.
4. Укажите имя проекта `gta-bratislava`. Тогда бесплатный адрес будет `https://gta-bratislava.pages.dev` при условии, что имя свободно.
5. Production branch: `main`.
6. Framework preset: `Next.js (Static HTML Export)`.
7. Build command: `pnpm pages:build`.
8. Build output directory: `out`.
9. Root directory оставьте пустой, если проект находится в корне репозитория.
10. Добавьте переменные окружения из раздела выше и дополнительно `NODE_VERSION=22`.
11. Нажмите Save and Deploy.

Cloudflare подключает GitHub напрямую: каждый push в `main` запускает новую production-публикацию, а pull request получает отдельный preview URL. Сертификат SSL и поддомен `pages.dev` создаются автоматически.

## Подключение собственного домена

1. В проекте Cloudflare Pages откройте Custom domains → Set up a custom domain.
2. Введите домен, например `gta-bratislava.sk` или `www.gta-bratislava.sk`.
3. Если DNS домена уже управляется Cloudflare, нужная запись создастся автоматически. Для внешнего DNS следуйте показанной инструкции и добавьте CNAME для поддомена.
4. Дождитесь статуса Active и выпуска бесплатного SSL-сертификата.
5. Измените `NEXT_PUBLIC_SITE_URL` в Cloudflare на `https://ваш-домен.sk` и повторите публикацию, чтобы canonical URL, Open Graph, sitemap и robots.txt использовали новый домен.
6. При необходимости настройте перенаправление между версией с `www` и без неё в Cloudflare Redirect Rules.

## Почему сайт продолжит открываться без Supabase

Cloudflare Pages раздаёт готовые HTML, CSS, JavaScript, логотип, контакты, услуги, условия финансирования и демонстрационные автомобили из глобальной сети. Supabase подключается уже после первого отображения страницы. Если запрос завершится ошибкой, интерфейс сохраняет встроенные данные и не показывает пустую страницу. Это снижает нагрузку на бесплатную базу и сохраняет доступность основных страниц.

Официальные инструкции: [Cloudflare Pages для статического Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/), [Supabase Storage limits](https://supabase.com/docs/guides/storage/uploads/file-limits), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
