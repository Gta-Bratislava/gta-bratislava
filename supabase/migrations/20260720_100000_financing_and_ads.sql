-- GTA_Bratislava: financing calculator, finance CRM fields and advertisement history.
-- Non-destructive: run after 20260719_210000_admin_crm_analytics.sql.
begin;

alter type public.crm_status add value if not exists 'documents_requested';
alter type public.crm_status add value if not exists 'documents_received';
alter type public.crm_status add value if not exists 'submitted';
alter type public.crm_status add value if not exists 'decision_pending';
alter type public.crm_status add value if not exists 'approved';
alter type public.crm_status add value if not exists 'contract_signed';

alter table public.cars add column if not exists financing_calculator_enabled boolean not null default true;

alter table public.financing_applications add column if not exists selected_car_id text references public.cars(id) on delete set null;
alter table public.financing_applications add column if not exists selected_car_slug text;
alter table public.financing_applications add column if not exists down_payment_percent numeric;
alter table public.financing_applications add column if not exists interest_rate numeric;
alter table public.financing_applications add column if not exists fixed_fee numeric;
alter table public.financing_applications add column if not exists percent_fee numeric;
alter table public.financing_applications add column if not exists financed_amount numeric;
alter table public.financing_applications add column if not exists estimated_monthly_payment numeric;
alter table public.financing_applications add column if not exists estimated_total_payment numeric;
alter table public.financing_applications add column if not exists estimated_overpayment numeric;
alter table public.financing_applications add column if not exists calculator_payload jsonb not null default '{}'::jsonb;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'financing_selected_car_slug_check') then
    alter table public.financing_applications add constraint financing_selected_car_slug_check check (selected_car_slug is null or char_length(selected_car_slug) between 2 and 150) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'financing_calculation_percent_check') then
    alter table public.financing_applications add constraint financing_calculation_percent_check check (
      (down_payment_percent is null or down_payment_percent between 0 and 100) and
      (interest_rate is null or interest_rate between 0 and 100) and
      (percent_fee is null or percent_fee between 0 and 100)
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'financing_calculation_amounts_check') then
    alter table public.financing_applications add constraint financing_calculation_amounts_check check (
      (fixed_fee is null or fixed_fee >= 0) and
      (financed_amount is null or financed_amount >= 0) and
      (estimated_monthly_payment is null or estimated_monthly_payment >= 0) and
      (estimated_total_payment is null or estimated_total_payment >= 0) and
      (estimated_overpayment is null or estimated_overpayment >= 0)
    ) not valid;
  end if;
end $$;
alter table public.financing_applications validate constraint financing_selected_car_slug_check;
alter table public.financing_applications validate constraint financing_calculation_percent_check;
alter table public.financing_applications validate constraint financing_calculation_amounts_check;

create table if not exists public.financing_settings (
  id boolean primary key default true check (id = true),
  enabled boolean not null default true,
  min_amount numeric not null default 500 check (min_amount >= 0),
  max_amount numeric not null default 19500 check (max_amount >= min_amount),
  min_term integer not null default 12 check (min_term between 1 and 120),
  max_term integer not null default 96 check (max_term between min_term and 120),
  allowed_terms integer[] not null default array[12,24,36,48,60,72,84,96],
  default_interest_rate numeric not null default 7.9 check (default_interest_rate between 0 and 100),
  min_down_payment_eur numeric not null default 0 check (min_down_payment_eur >= 0),
  min_down_payment_percent numeric not null default 0 check (min_down_payment_percent between 0 and 100),
  fixed_fee numeric not null default 0 check (fixed_fee >= 0),
  percent_fee numeric not null default 0 check (percent_fee between 0 and 100),
  localized jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.financing_settings (id, localized)
values (true, jsonb_build_object(
  'sk', jsonb_build_object(
    'title','Financovanie vozidla bez zbytočných komplikácií',
    'description','Vyberte si auto, vypočítajte si orientačnú mesačnú splátku a pošlite nám nezáväznú žiadosť.',
    'warning','Výpočet je orientačný a nepredstavuje ponuku ani záruku schválenia. Konečné podmienky určí finančná spoločnosť po posúdení žiadosti.',
    'documents',jsonb_build_array('Doklad totožnosti alebo pobytová karta','Doklad o príjme alebo pracovná zmluva','Výpis z účtu za posledné 1–3 mesiace','Údaje o vybranom vozidle'),
    'steps',jsonb_build_array('Vyberiete vozidlo a nastavíte orientačný výpočet.','Odošlete kontaktné údaje bez citlivých dokumentov.','Skontrolujeme s vami potrebné podklady.','Finančná spoločnosť oznámi konečné podmienky.'),
    'faq',jsonb_build_array(jsonb_build_object('question','Je výsledok kalkulačky záväzný?','answer','Nie. Ide o orientačný výpočet a konečné podmienky určí finančná spoločnosť.')),
    'applyButton','Odoslať žiadosť'
  ),
  'ru', jsonb_build_object(
    'title','Финансирование автомобиля без лишних сложностей',
    'description','Выберите автомобиль, рассчитайте ориентировочный ежемесячный платёж и отправьте предварительную заявку.',
    'warning','Расчёт является ориентировочным и не является предложением или гарантией одобрения. Окончательные условия определяются финансовой компанией после рассмотрения заявки.',
    'documents',jsonb_build_array('Удостоверение личности или карта ВНЖ','Подтверждение дохода или трудовой договор','Выписка по счёту за последние 1–3 месяца','Данные выбранного автомобиля'),
    'steps',jsonb_build_array('Вы выбираете автомобиль и настраиваете предварительный расчёт.','Отправляете контактные данные без чувствительных документов.','Мы вместе проверяем необходимые сведения.','Финансовая компания сообщает окончательные условия.'),
    'faq',jsonb_build_array(jsonb_build_object('question','Результат калькулятора окончательный?','answer','Нет. Это ориентировочный расчёт, окончательные условия определяет финансовая компания.')),
    'applyButton','Отправить заявку'
  ),
  'ua', jsonb_build_object(
    'title','Фінансування автомобіля без зайвих складнощів',
    'description','Оберіть авто, розрахуйте орієнтовний щомісячний платіж і надішліть попередню заявку.',
    'warning','Розрахунок є орієнтовним і не є пропозицією або гарантією схвалення. Остаточні умови визначає фінансова компанія після розгляду заявки.',
    'documents',jsonb_build_array('Посвідчення особи або карта ВНП','Підтвердження доходу або трудовий договір','Виписка з рахунку за останні 1–3 місяці','Дані обраного автомобіля'),
    'steps',jsonb_build_array('Ви обираєте автомобіль і налаштовуєте попередній розрахунок.','Надсилаєте контактні дані без чутливих документів.','Ми разом перевіряємо необхідні відомості.','Фінансова компанія повідомляє остаточні умови.'),
    'faq',jsonb_build_array(jsonb_build_object('question','Результат калькулятора остаточний?','answer','Ні. Це орієнтовний розрахунок, остаточні умови визначає фінансова компанія.')),
    'applyButton','Надіслати заявку'
  ),
  'en', jsonb_build_object(
    'title','Straightforward vehicle financing',
    'description','Choose a vehicle, estimate your monthly payment and send a preliminary application.',
    'warning','The calculation is an estimate and does not constitute an offer or a guarantee of approval. Final terms are determined by the finance company after reviewing the application.',
    'documents',jsonb_build_array('Identity document or residence card','Proof of income or employment contract','Bank statement for the last 1–3 months','Selected vehicle details'),
    'steps',jsonb_build_array('Choose a vehicle and configure an initial estimate.','Send contact details without sensitive documents.','We check the required information with you.','The finance company provides the final terms.'),
    'faq',jsonb_build_array(jsonb_build_object('question','Is the calculator result final?','answer','No. It is an estimate and the finance company determines the final terms.')),
    'applyButton','Send application'
  )
)) on conflict (id) do nothing;

create table if not exists public.generated_ads (
  id uuid primary key default gen_random_uuid(),
  car_id text not null references public.cars(id) on delete cascade,
  language text not null check (language in ('sk','ru','ua','en')),
  platform text not null check (platform in ('bazos','facebook','instagram','tiktok','whatsapp','telegram','universal')),
  style text not null check (style in ('business','friendly','sales','neutral','premium')),
  length text not null check (length in ('short','standard','detailed')),
  title text not null check (char_length(title) between 2 and 300),
  text text not null check (char_length(text) between 2 and 15000),
  hashtags text[] not null default '{}',
  author_id uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists financing_selected_car_idx on public.financing_applications(selected_car_id, created_at desc);
create index if not exists generated_ads_car_idx on public.generated_ads(car_id, created_at desc);

create or replace function public.enforce_car_role_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_admin_role() = 'content_manager'::public.admin_role then
    if tg_op = 'INSERT' and (
      new.price <> 0 or new.status <> 'draft' or new.financing_calculator_enabled <> true or
      coalesce(new.data->>'price','0') <> '0' or
      coalesce(new.data->>'monthlyPrice','0') <> '0' or
      coalesce(new.data->>'status','draft') <> 'draft' or
      coalesce(new.data->>'financing','false') <> 'false' or
      coalesce(new.data->>'financingCalculatorEnabled','true') <> 'true'
    ) then
      raise exception 'Content managers can only create zero-price drafts';
    end if;
    if tg_op = 'UPDATE' and (
      old.price is distinct from new.price or
      old.status is distinct from new.status or
      old.financing_calculator_enabled is distinct from new.financing_calculator_enabled or
      coalesce(old.data->>'price','') is distinct from coalesce(new.data->>'price','') or
      coalesce(old.data->>'monthlyPrice','') is distinct from coalesce(new.data->>'monthlyPrice','') or
      coalesce(old.data->>'status','') is distinct from coalesce(new.data->>'status','') or
      coalesce(old.data->>'financing','') is distinct from coalesce(new.data->>'financing','') or
      coalesce(old.data->>'financingCalculatorEnabled','') is distinct from coalesce(new.data->>'financingCalculatorEnabled','')
    ) then
      raise exception 'Content managers cannot change price, status or financing terms';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists financing_settings_set_updated_at on public.financing_settings;
create trigger financing_settings_set_updated_at before update on public.financing_settings for each row execute function public.set_updated_at();
drop trigger if exists generated_ads_set_updated_at on public.generated_ads;
create trigger generated_ads_set_updated_at before update on public.generated_ads for each row execute function public.set_updated_at();

create or replace view public.admin_applications with (security_invoker = true) as
select
  l.id, 'lead'::text as source_type, l.type::text as application_type, l.created_at, l.updated_at,
  l.crm_status, l.assigned_to, l.manager_notes, l.name, l.phone, l.email, l.car_slug,
  l.message, l.locale, to_jsonb(l) - array['id','created_at','updated_at','crm_status','assigned_to','manager_notes','name','phone','email','car_slug','message','locale'] as payload
from public.leads l
union all
select
  f.id, 'financing'::text, 'financing'::text, f.created_at, f.updated_at,
  f.crm_status, f.assigned_to, f.manager_notes, concat_ws(' ',f.first_name,f.last_name), f.phone, f.email, f.selected_car_slug,
  f.comment, f.locale, to_jsonb(f) - array['id','created_at','updated_at','crm_status','assigned_to','manager_notes','first_name','last_name','phone','email','selected_car_slug','comment','locale']
from public.financing_applications f;

alter table public.financing_settings enable row level security;
alter table public.generated_ads enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='financing_settings' and policyname='public can read financing settings') then
    create policy "public can read financing settings" on public.financing_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='financing_settings' and policyname='finance roles can update settings') then
    create policy "finance roles can update settings" on public.financing_settings for update to authenticated
      using (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role))
      with check (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='generated_ads' and policyname='admins can read generated ads') then
    create policy "admins can read generated ads" on public.generated_ads for select to authenticated using (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='generated_ads' and policyname='content roles can insert generated ads') then
    create policy "content roles can insert generated ads" on public.generated_ads for insert to authenticated
      with check (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role,'content_manager'::public.admin_role));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='generated_ads' and policyname='content roles can update generated ads') then
    create policy "content roles can update generated ads" on public.generated_ads for update to authenticated
      using (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role,'content_manager'::public.admin_role))
      with check (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role,'content_manager'::public.admin_role));
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='generated_ads' and policyname='content roles can delete generated ads') then
    create policy "content roles can delete generated ads" on public.generated_ads for delete to authenticated
      using (public.has_admin_role('owner'::public.admin_role,'manager'::public.admin_role,'content_manager'::public.admin_role));
  end if;
end $$;

revoke select on public.financing_settings from anon;
grant select (
  id, enabled, min_amount, max_amount, min_term, max_term, allowed_terms,
  default_interest_rate, min_down_payment_eur, min_down_payment_percent,
  fixed_fee, percent_fee, localized, created_at, updated_at
) on public.financing_settings to anon;
grant select on public.financing_settings to authenticated;
grant update on public.financing_settings to authenticated;
grant select, insert, update, delete on public.generated_ads to authenticated;
grant select on public.admin_applications to authenticated;

commit;
