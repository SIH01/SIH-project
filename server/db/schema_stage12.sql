-- STAGE 12 - public Get Help requests and triage fields.

create table if not exists help_requests (
  id serial primary key,
  request_id text unique,
  type text not null check (type in ('food','shelter','medical','mental_health','missing_person','financial','other')),
  name text not null,
  phone text,
  email text,
  location_text text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  description text not null,
  urgency text not null default 'medium' check (urgency in ('low','medium','critical')),
  status text not null default 'new' check (status in ('new','in_review','in_progress','resolved','closed')),
  assigned_to integer references users(id) on delete set null,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_help_requests_triage on help_requests(status, urgency, created_at desc);