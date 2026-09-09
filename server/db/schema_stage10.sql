-- STAGE 10 — notifications + admin audit logs.

create table if not exists notifications (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications (user_id, read);

create table if not exists audit_logs (
  id serial primary key,
  admin_id integer references users(id),
  action text not null,
  target_type text not null,
  target_id integer,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_admin on audit_logs (admin_id);
