-- Run BEFORE 20260720_100000_financing_and_ads.sql if you want an in-database
-- structural snapshot of the tables changed by that migration.
-- This copies table definitions, constraints and indexes, but never copies or
-- deletes customer data. A full remote backup can additionally be made with
-- Supabase Dashboard backups or pg_dump when those tools are available.
begin;

create schema if not exists backup_pre_financing_20260720;

create table if not exists backup_pre_financing_20260720.cars
  (like public.cars including all);
create table if not exists backup_pre_financing_20260720.financing_applications
  (like public.financing_applications including all);
create table if not exists backup_pre_financing_20260720.leads
  (like public.leads including all);
create table if not exists backup_pre_financing_20260720.admins
  (like public.admins including all);
create table if not exists backup_pre_financing_20260720.site_settings
  (like public.site_settings including all);
create table if not exists backup_pre_financing_20260720.application_status_history
  (like public.application_status_history including all);

comment on schema backup_pre_financing_20260720 is
  'GTA Bratislava structural snapshot created before financing and advertisement migration 20260720.';

commit;
