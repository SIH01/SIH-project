-- STAGE 15 - verified organization contact portal threads and messages.

create table if not exists contact_threads (
  id serial primary key,
  tracking_id text unique not null,
  organization_id integer not null references organizations(id) on delete cascade,
  requester_user_id integer references users(id) on delete set null,
  requester_name text not null,
  requester_phone text,
  requester_email text,
  location_text text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  category text not null check (category in ('Food','Water','Medical','Shelter','Rescue','Other')),
  urgency text not null default 'Medium' check (urgency in ('Low','Medium','High','Critical')),
  status text not null default 'Pending' check (status in ('Pending','Seen','In Progress','Resolved')),
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id serial primary key,
  thread_id integer not null references contact_threads(id) on delete cascade,
  sender_role text not null check (sender_role in ('citizen','organization')),
  sender_user_id integer references users(id) on delete set null,
  body text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_threads_org on contact_threads(organization_id, status, updated_at desc);
create index if not exists idx_contact_threads_requester on contact_threads(requester_user_id, updated_at desc);
create index if not exists idx_contact_messages_thread on contact_messages(thread_id, created_at);
