-- GTA_Bratislava schema for Cloudflare Pages + Supabase Free.
-- Run the complete file in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cars (
  id text primary key,
  slug text unique not null check (char_length(slug) between 2 and 150),
  data jsonb not null,
  status text not null check (status in ('available','reserved','sold')),
  price numeric not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact','service','test_drive')),
  locale text not null check (locale in ('sk','ua','ru','en')),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text check (email is null or char_length(email) <= 200),
  message text check (message is null or char_length(message) <= 3000),
  car_slug text check (car_slug is null or char_length(car_slug) <= 150),
  service text check (service is null or char_length(service) <= 150),
  consent boolean not null default false check (consent = true),
  created_at timestamptz not null default now()
);

create table if not exists public.financing_applications (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('sk','ua','ru','en')),
  first_name text not null check (char_length(first_name) between 2 and 100),
  last_name text not null check (char_length(last_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text not null check (char_length(email) <= 200),
  citizenship text not null check (char_length(citizenship) between 2 and 100),
  employment text not null check (char_length(employment) between 2 and 100),
  monthly_income numeric not null check (monthly_income between 0 and 1000000),
  down_payment numeric not null check (down_payment between 0 and 1000000),
  car_price numeric not null check (car_price between 1 and 10000000),
  term_months integer not null check (term_months between 12 and 120),
  comment text check (comment is null or char_length(comment) <= 3000),
  consent boolean not null default false check (consent = true),
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  locale text primary key check (locale in ('sk','ua','ru','en')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists cars_updated_at_idx on public.cars(updated_at desc);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists financing_created_at_idx on public.financing_applications(created_at desc);

alter table public.admins enable row level security;
alter table public.cars enable row level security;
alter table public.leads enable row level security;
alter table public.financing_applications enable row level security;
alter table public.site_content enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists(select 1 from public.admins where id = auth.uid()) $$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins can view own record" on public.admins;
create policy "admins can view own record" on public.admins for select to authenticated using (id = auth.uid());

drop policy if exists "public can read cars" on public.cars;
create policy "public can read cars" on public.cars for select to anon, authenticated using (true);
drop policy if exists "admins can insert cars" on public.cars;
create policy "admins can insert cars" on public.cars for insert to authenticated with check (public.is_admin());
drop policy if exists "admins can update cars" on public.cars;
create policy "admins can update cars" on public.cars for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins can delete cars" on public.cars;
create policy "admins can delete cars" on public.cars for delete to authenticated using (public.is_admin());

drop policy if exists "public can submit leads" on public.leads;
create policy "public can submit leads" on public.leads for insert to anon, authenticated with check (consent = true and char_length(name) between 2 and 100 and char_length(phone) between 7 and 20);
drop policy if exists "admins can read leads" on public.leads;
create policy "admins can read leads" on public.leads for select to authenticated using (public.is_admin());
drop policy if exists "admins can delete leads" on public.leads;
create policy "admins can delete leads" on public.leads for delete to authenticated using (public.is_admin());

drop policy if exists "public can submit financing" on public.financing_applications;
create policy "public can submit financing" on public.financing_applications for insert to anon, authenticated with check (consent = true);
drop policy if exists "admins can read financing" on public.financing_applications;
create policy "admins can read financing" on public.financing_applications for select to authenticated using (public.is_admin());
drop policy if exists "admins can delete financing" on public.financing_applications;
create policy "admins can delete financing" on public.financing_applications for delete to authenticated using (public.is_admin());

drop policy if exists "public can read site content" on public.site_content;
create policy "public can read site content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "admins can insert site content" on public.site_content;
create policy "admins can insert site content" on public.site_content for insert to authenticated with check (public.is_admin());
drop policy if exists "admins can update site content" on public.site_content;
create policy "admins can update site content" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.cars, public.site_content to anon, authenticated;
grant insert on public.leads, public.financing_applications to anon, authenticated;
grant select, insert, update, delete on public.cars, public.site_content to authenticated;
grant select, delete on public.leads, public.financing_applications to authenticated;
grant select on public.admins to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cars', 'cars', true, 10485760, array['image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read car images" on storage.objects;
create policy "public can read car images" on storage.objects for select to anon, authenticated using (bucket_id = 'cars');
drop policy if exists "admins can upload car images" on storage.objects;
create policy "admins can upload car images" on storage.objects for insert to authenticated with check (bucket_id = 'cars' and public.is_admin());
drop policy if exists "admins can update car images" on storage.objects;
create policy "admins can update car images" on storage.objects for update to authenticated using (bucket_id = 'cars' and public.is_admin()) with check (bucket_id = 'cars' and public.is_admin());
drop policy if exists "admins can delete car images" on storage.objects;
create policy "admins can delete car images" on storage.objects for delete to authenticated using (bucket_id = 'cars' and public.is_admin());

-- After creating an email/password user in Authentication -> Users, make it an admin:
-- insert into public.admins (id)
-- select id from auth.users where email = 'owner@example.com'
-- on conflict (id) do nothing;

