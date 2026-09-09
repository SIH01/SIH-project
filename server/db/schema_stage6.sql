-- STAGE 6 — organizations (registration + admin verification).
-- An organization is a users row (role='organization') plus a linked
-- profile row here holding everything admin needs to verify it.

create table if not exists organizations (
  id serial primary key,
  user_id integer references users(id) unique,
  name text not null,
  type text not null check (
    type in (
      'NGO', 'Charity', 'Volunteer Group', 'Food Distribution',
      'Medical', 'Shelter Provider', 'Search and Rescue',
      'Mental Health', 'Other'
    )
  ),
  description text,
  website text,
  email text not null,
  phone text,
  address text,
  operating_areas text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  assistance_categories text[] not null default '{}',
  verification_status text not null default 'Pending' check (
    verification_status in ('Pending', 'Under Review', 'Verified', 'Rejected', 'Suspended')
  ),
  documents text,
  representative_name text,
  representative_contact text,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists idx_organizations_status on organizations (verification_status);
