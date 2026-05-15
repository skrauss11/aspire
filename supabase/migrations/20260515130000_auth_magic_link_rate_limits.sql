-- Server-side magic-link request throttling.
-- The table stores only hashed normalized emails and timestamps. It is in public
-- for Supabase REST service-role access, but anon/authenticated roles receive no
-- grants and RLS has no user policies.

create table if not exists public.auth_magic_link_requests (
  id uuid primary key default gen_random_uuid(),
  email_sha256 text not null,
  requested_at timestamptz not null default now()
);

create index if not exists auth_magic_link_requests_email_requested_at_idx
  on public.auth_magic_link_requests (email_sha256, requested_at desc);

create index if not exists auth_magic_link_requests_requested_at_idx
  on public.auth_magic_link_requests (requested_at);

alter table public.auth_magic_link_requests enable row level security;

revoke all on public.auth_magic_link_requests from anon, authenticated;
grant select, insert, delete on public.auth_magic_link_requests to service_role;

comment on table public.auth_magic_link_requests is
  'Server-side audit table for Aspire magic-link request rate limiting. Stores SHA-256 hashes of normalized emails, not raw email addresses.';
