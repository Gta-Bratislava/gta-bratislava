-- Run once in Supabase SQL Editor for projects created before the English version.
alter table public.leads drop constraint if exists leads_locale_check;
alter table public.leads add constraint leads_locale_check check (locale in ('sk','ua','ru','en'));

alter table public.financing_applications drop constraint if exists financing_applications_locale_check;
alter table public.financing_applications add constraint financing_applications_locale_check check (locale in ('sk','ua','ru','en'));

alter table public.site_content drop constraint if exists site_content_locale_check;
alter table public.site_content add constraint site_content_locale_check check (locale in ('sk','ua','ru','en'));
