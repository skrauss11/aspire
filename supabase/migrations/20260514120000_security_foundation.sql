-- Aspire Sprint 1 security foundation.
-- Transition note: the live site already uses public.scenarios. This migration
-- extends that table in place instead of dropping it, so current functions keep
-- working until the score/scenario refactor lands.

create extension if not exists pgcrypto with schema public;

create schema if not exists vault;
create schema if not exists aspire_private;

create extension if not exists supabase_vault with schema vault;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calculator_states (
  user_id uuid primary key references public.users(id) on delete cascade,
  life_chip text,
  geography text,
  timeline int,
  total_assets bytea,
  allocation_json bytea,
  monthly_contribution bytea,
  aspire_rate numeric,
  aspire_gap numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.scenarios
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists levers bytea,
  add column if not exists derived jsonb,
  add column if not exists is_public boolean not null default false,
  add column if not exists share_id text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists access_token text unique default encode(gen_random_bytes(24), 'hex'),
  add column if not exists email text,
  add column if not exists basket jsonb,
  add column if not exists score integer,
  add column if not exists aspiration_rate numeric,
  add column if not exists portfolio_rate numeric,
  add column if not exists gap numeric,
  add column if not exists rate_snapshot jsonb,
  add column if not exists last_accessed_at timestamptz;

alter table public.scenarios
  alter column access_token set default encode(gen_random_bytes(24), 'hex'),
  alter column email drop not null,
  alter column basket drop not null,
  alter column score drop not null,
  alter column is_public set default false;

create table if not exists public.baseline_overrides (
  user_id uuid primary key references public.users(id) on delete cascade,
  levers bytea,
  set_at timestamptz not null default now()
);

create table if not exists public.account_deletions (
  id uuid primary key default gen_random_uuid(),
  email_sha256 text not null,
  deleted_at timestamptz not null default now()
);

create or replace function aspire_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function aspire_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function aspire_private.handle_new_auth_user();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function aspire_private.set_updated_at();

drop trigger if exists calculator_states_set_updated_at on public.calculator_states;
create trigger calculator_states_set_updated_at
  before update on public.calculator_states
  for each row execute function aspire_private.set_updated_at();

drop trigger if exists scenarios_set_updated_at on public.scenarios;
create trigger scenarios_set_updated_at
  before update on public.scenarios
  for each row execute function aspire_private.set_updated_at();

create unique index if not exists scenarios_share_id_key
  on public.scenarios (share_id)
  where share_id is not null;

create index if not exists scenarios_user_updated_at_idx
  on public.scenarios (user_id, updated_at desc);

create index if not exists scenarios_access_token_idx
  on public.scenarios (access_token);

create index if not exists scenarios_email_created_at_idx
  on public.scenarios (email, created_at desc);

create index if not exists account_deletions_deleted_at_idx
  on public.account_deletions (deleted_at);

alter table public.users enable row level security;
alter table public.calculator_states enable row level security;
alter table public.scenarios enable row level security;
alter table public.baseline_overrides enable row level security;
alter table public.account_deletions enable row level security;

drop policy if exists users_read_own on public.users;
create policy users_read_own
  on public.users for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists calc_states_own on public.calculator_states;
create policy calc_states_own
  on public.calculator_states for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists scenarios_owner_all on public.scenarios;
create policy scenarios_owner_all
  on public.scenarios for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists scenarios_public_read on public.scenarios;
create policy scenarios_public_read
  on public.scenarios for select
  to anon, authenticated
  using (is_public = true);

drop policy if exists baselines_own on public.baseline_overrides;
create policy baselines_own
  on public.baseline_overrides for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.users from anon, authenticated;
revoke all on public.calculator_states from anon, authenticated;
revoke all on public.scenarios from anon, authenticated;
revoke all on public.baseline_overrides from anon, authenticated;
revoke all on public.account_deletions from anon, authenticated;

grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.calculator_states to authenticated;
grant select, insert, update, delete on public.scenarios to authenticated;
grant select on public.scenarios to anon;
grant select, insert, update, delete on public.baseline_overrides to authenticated;

comment on table public.scenarios is
  'V2 secure scenarios plus temporary legacy columns for the May 2026 score.js transition. Remove legacy access_token/email/basket/score fields after PR 2 is live and old rows are handled.';
