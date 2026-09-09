-- STAGE 7 — organization dashboard + 50km organization/request matching.
-- Adds triage fields to assistance_requests and a table to track each
-- organization's response to a request (an org can update status over time).

alter table assistance_requests add column if not exists urgency text
  check (urgency in ('Low', 'Medium', 'High', 'Critical')) default 'Medium';
alter table assistance_requests add column if not exists people_affected integer;
alter table assistance_requests add column if not exists assigned_organization_id integer
  references organizations(id) on delete set null;

create table if not exists organization_responses (
  id serial primary key,
  organization_id integer not null references organizations(id) on delete cascade,
  assistance_request_id integer not null references assistance_requests(id) on delete cascade,
  response text,
  status text not null default 'New' check (
    status in ('New', 'Accepted', 'Assistance in Progress', 'Assistance Provided', 'Unable to Assist', 'Closed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_org_responses_org on organization_responses (organization_id);
create index if not exists idx_org_responses_request on organization_responses (assistance_request_id);
