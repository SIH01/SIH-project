-- STAGE 11 — relief requests and organization-submitted shelters.

create table if not exists relief_requests (
  id serial primary key,
  disaster_id integer references disasters(id) on delete set null,
  name text not null,
  contact text not null,
  need_type text not null check (need_type in ('food','water','medical','shelter','rescue','other')),
  description text not null,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  status text not null default 'pending' check (status in ('pending','in_progress','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists shelters (
  id serial primary key,
  name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  capacity integer not null check (capacity > 0),
  current_occupancy integer not null default 0 check (current_occupancy >= 0),
  contact text,
  facilities text[] not null default '{}',
  added_by integer not null references organizations(id) on delete cascade,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected')),
  operational_status text not null default 'active' check (operational_status in ('active','full','closed')),
  reviewed_by integer references users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_relief_requests_status on relief_requests(status);
create index if not exists idx_shelters_approval on shelters(approval_status, operational_status);