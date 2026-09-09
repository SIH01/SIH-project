-- STAGE 13 - active alert lifecycle metadata.

alter table disasters drop constraint if exists disasters_status_check;
alter table disasters add constraint disasters_status_check check (
  status in ('Historical', 'Current', 'Forecast', 'Resolved')
);

alter table disasters add column if not exists active_until timestamptz;
alter table disasters add column if not exists last_confirmed_by integer references users(id) on delete set null;
alter table disasters add column if not exists last_confirmed_at timestamptz;

create index if not exists idx_disasters_active_until on disasters(status, active_until);