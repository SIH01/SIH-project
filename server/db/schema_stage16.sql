-- STAGE 16 - organization inbox for public Get Help requests.
-- Run after schema_stage12 and schema_stage14.

alter table help_requests add column if not exists assigned_organization_id integer
  references organizations(id) on delete set null;
alter table help_requests add column if not exists internal_notes text;

create table if not exists organization_help_messages (
  id serial primary key,
  help_request_id integer not null references help_requests(id) on delete cascade,
  organization_id integer not null references organizations(id) on delete cascade,
  sender_role text not null check (sender_role in ('organization', 'citizen')),
  sender_user_id integer references users(id) on delete set null,
  body text not null,
  attachment_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_help_requests_org_assignment on help_requests(assigned_organization_id, status, updated_at desc);
create index if not exists idx_org_help_messages_request on organization_help_messages(help_request_id, created_at);
