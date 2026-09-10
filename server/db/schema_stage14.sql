-- STAGE 14 — organization dashboard + 50km matching (spec sections 18-20).
-- Purely additive: nullable columns on the two existing request tables so
-- an organization can claim a request. No existing column, constraint, or
-- row is touched — help_requests.status and relief_requests.status keep
-- working exactly as they already do for the admin screens.

alter table help_requests add column if not exists claimed_by_org_id integer
  references organizations(id) on delete set null;
alter table relief_requests add column if not exists claimed_by_org_id integer
  references organizations(id) on delete set null;

create index if not exists idx_help_requests_claimed on help_requests(claimed_by_org_id);
create index if not exists idx_relief_requests_claimed on relief_requests(claimed_by_org_id);
