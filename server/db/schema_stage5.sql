-- STAGE 5 — assistance requests ("Get Help"). Run this in Supabase's SQL Editor.
-- Mirrors the disasters table's pattern: enum-style checks, optional link
-- back to a disaster record, lat/lng so nearby requests can reuse the same
-- Haversine util as disasters do.

create table if not exists assistance_requests (
  id serial primary key,
  request_type text not null check (
    request_type in (
      'Food', 'Shelter', 'Medical', 'Mental Health',
      'Missing Person', 'Financial', 'Other'
    )
  ),
  status text not null default 'Pending' check (
    status in ('Pending', 'In Progress', 'Resolved')
  ),
  requester_name text not null,
  contact_phone text,
  contact_email text,
  location_name text not null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  description text not null,
  disaster_id integer references disasters(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assistance_status on assistance_requests (status);
create index if not exists idx_assistance_type on assistance_requests (request_type);
