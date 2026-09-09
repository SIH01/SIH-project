-- STAGE 8 — missing persons (shelter/medical/mental-health reuse the
-- existing assistance_requests categories from Stage 5/7; missing persons
-- get their own table since they carry more sensitive fields and a
-- different review workflow, per the spec).

create table if not exists missing_person_reports (
  id serial primary key,
  reporter_name text not null,
  reporter_contact text not null,
  disaster_id integer references disasters(id) on delete set null,
  person_name text not null,
  age integer check (age >= 0 and age < 150),
  last_known_location text not null,
  date_last_seen date not null,
  description text,
  additional_information text,
  status text not null default 'Reported' check (
    status in ('Reported', 'Under Review', 'Searching', 'Located', 'Closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_missing_person_status on missing_person_reports (status);
