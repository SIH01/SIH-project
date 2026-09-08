-- STAGE 3 — the missing piece. Run this in Supabase's SQL Editor.
-- Column is named event_date (not "date") to match what disasterModel.js
-- already queries.

create table if not exists disasters (
  id serial primary key,
  name text not null,
  type text not null check (
    type in (
      'Flood', 'Earthquake', 'Cyclone', 'Tsunami', 'Landslide',
      'Wildfire', 'Drought', 'Extreme Heat', 'Extreme Cold',
      'Avalanche', 'Storm', 'Volcanic Eruption', 'Other'
    )
  ),
  status text not null default 'Historical' check (
    status in ('Historical', 'Current', 'Forecast')
  ),
  event_date date not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_name text not null,
  severity text not null check (
    severity in ('Low', 'Moderate', 'High', 'Severe')
  ),
  affected_area text,
  description text,
  safety_information text,
  source text,
  created_by integer references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_disasters_lat_lng on disasters (latitude, longitude);
create index if not exists idx_disasters_type on disasters (type);
