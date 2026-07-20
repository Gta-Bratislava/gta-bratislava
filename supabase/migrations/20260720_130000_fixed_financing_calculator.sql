-- GTA_Bratislava: fixed internal financing calculation defaults.
-- Run after 20260720_100000_financing_and_ads.sql.
-- Non-destructive: existing columns and applications remain unchanged.
begin;

alter table public.financing_settings alter column max_amount set default 25000;
alter table public.financing_settings alter column min_term set default 12;
alter table public.financing_settings alter column max_term set default 96;
alter table public.financing_settings alter column default_interest_rate set default 14;
alter table public.financing_settings alter column fixed_fee set default 0;
alter table public.financing_settings alter column percent_fee set default 0;

update public.financing_settings
set
  max_amount = 25000,
  min_term = 12,
  max_term = 96,
  allowed_terms = case
    when exists (select 1 from unnest(allowed_terms) as allowed(term) where term between 12 and 96)
      then array(select distinct term from unnest(allowed_terms) as allowed(term) where term between 12 and 96 order by term)
    else array[12,24,36,48,60,72,84,96]
  end,
  default_interest_rate = 14,
  fixed_fee = 0,
  percent_fee = 0,
  localized = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          localized,
          '{sk,warning}',
          to_jsonb('Výpočet je orientačný. Podmienky financovania sa posudzujú individuálne pre každého klienta a po posúdení žiadosti sa môžu líšiť.'::text),
          true
        ),
        '{ru,warning}',
        to_jsonb('Расчёт является примерным. Условия финансирования обсуждаются индивидуально для каждого клиента и могут отличаться после рассмотрения заявки.'::text),
        true
      ),
      '{ua,warning}',
      to_jsonb('Розрахунок є приблизним. Умови фінансування обговорюються індивідуально для кожного клієнта та можуть відрізнятися після розгляду заявки.'::text),
      true
    ),
    '{en,warning}',
    to_jsonb('The calculation is an estimate. Financing terms are assessed individually for each client and may differ after the application is reviewed.'::text),
    true
  ),
  updated_at = now()
where id = true;

commit;
