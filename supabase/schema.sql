create extension if not exists "pgcrypto";

drop table if exists public.api_rate_limit_observations;

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  service text,
  endpoint text not null,
  method text not null default 'GET',
  status_code integer not null,
  limit_count integer,
  remaining_count integer,
  used_count integer,
  reset_at timestamptz,
  reset_after_ms integer,
  quota_type text,
  quota_unit text,
  rate_limited boolean not null default false,
  rate_limit_reason text,
  request_id text,
  provider_status text,
  response_headers jsonb not null default '{}'::jsonb,
  response_body jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_logs_provider_created_at_idx
  on public.usage_logs (provider, created_at desc);

alter table public.usage_logs enable row level security;
