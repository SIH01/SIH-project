-- STAGE 17 - organization case-management updates.
-- Organization updates are append-only; admins retain control of report status.

create table if not exists missing_person_org_updates (
  id serial primary key,
  report_id integer not null references missing_person_reports(id) on delete cascade,
  organization_id integer not null references organizations(id) on delete cascade,
  user_id integer references users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_missing_person_org_updates_report
  on missing_person_org_updates(report_id, created_at desc);