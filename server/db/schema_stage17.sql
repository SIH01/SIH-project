-- STAGE 17 - photos for missing people reports.

alter table missing_person_reports
  add column if not exists photo_url text;