-- STAGE 1 ONLY. Run this in Supabase's SQL Editor.
-- More tables (disasters, organizations, assistance_requests, etc.) are
-- added in later stages as each one needs them — we don't create empty
-- tables ahead of time.

-- If you're reusing the Supabase project from the earlier TravelSafe
-- project, run this first to start clean for DisasterShield:
--   drop table if exists users cascade;

create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'organization', 'admin')),
  created_at timestamptz not null default now()
);
