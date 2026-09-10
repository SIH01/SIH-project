-- STAGE 17 - organization portal extensions.
-- Additive migration; safe to run after any previous schema stage.

alter table help_requests add column if not exists preferred_organization_id integer
  references organizations(id) on delete set null;
create index if not exists idx_help_requests_preferred_org
  on help_requests(preferred_organization_id, status, created_at desc);

alter table missing_person_reports add column if not exists findings text;
alter table missing_person_reports add column if not exists tips text;
alter table missing_person_reports add column if not exists escalation_status text not null default 'none';
alter table missing_person_reports add column if not exists escalation_notes text;
alter table missing_person_reports add column if not exists managed_by_organization_id integer
  references organizations(id) on delete set null;
alter table missing_person_reports add column if not exists managed_updated_at timestamptz;
alter table missing_person_reports drop constraint if exists missing_person_reports_escalation_status_check;
alter table missing_person_reports add constraint missing_person_reports_escalation_status_check
  check (escalation_status in ('none', 'escalated', 'resolved'));
create index if not exists idx_missing_person_org_queue
  on missing_person_reports(status, managed_by_organization_id, created_at desc);

alter table organizations add column if not exists pending_profile_changes jsonb;
alter table organizations add column if not exists profile_update_status text not null default 'Current';
alter table organizations drop constraint if exists organizations_profile_update_status_check;
alter table organizations add constraint organizations_profile_update_status_check
  check (profile_update_status in ('Current', 'Pending Review', 'Rejected'));

alter table fundraising_campaigns add column if not exists end_date date;
alter table fundraising_campaigns drop constraint if exists fundraising_campaigns_status_check;
alter table fundraising_campaigns add constraint fundraising_campaigns_status_check
  check (status in ('Pending Verification', 'Pending Review', 'Active', 'Approved', 'Live',
                    'Completed', 'Rejected', 'Suspended', 'Closed'));
create index if not exists idx_campaigns_end_date on fundraising_campaigns(end_date);
