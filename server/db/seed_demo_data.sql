-- OPTIONAL. Run after schema_stage3.sql for a few sample rows to test with.
-- Real, well-known historical events with approximate figures — verify
-- exact details from an official source before treating as authoritative.
-- Marked "Historical" and labeled DEMO DATA.

insert into disasters
  (name, type, status, event_date, latitude, longitude, location_name, severity, affected_area, description, safety_information, source, created_by)
values
  (
    'Assam Floods (Demo)', 'Flood', 'Historical', '2022-06-17',
    26.1445, 91.7362, 'Assam, India', 'High',
    'Multiple districts along the Brahmaputra basin',
    'DEMO DATA: Seasonal monsoon flooding affected a large part of Assam in 2022, driven by the Brahmaputra river system overflowing its banks.',
    'Monitor local flood advisories during monsoon season (roughly June to September) and avoid low-lying areas near the riverbank during heavy rain.',
    'https://reliefweb.int/updates?advanced-search=%28PC114%29', null
  ),
  (
    'Nepal Earthquake (Demo)', 'Earthquake', 'Historical', '2015-04-25',
    28.2380, 84.7314, 'Gorkha, Nepal', 'Severe',
    'Central Nepal, including the Kathmandu Valley',
    'DEMO DATA: A major earthquake struck central Nepal in April 2015, causing widespread structural damage across the region.',
    'Familiarize yourself with earthquake drop-cover-hold procedures and identify sturdy structures near your accommodation.',
    'https://earthquake.usgs.gov/', null
  ),
  (
    'Cyclone Amphan (Demo)', 'Cyclone', 'Historical', '2020-05-20',
    21.6469, 88.1451, 'West Bengal, India / Bangladesh coast', 'Severe',
    'Coastal West Bengal and southwestern Bangladesh',
    'DEMO DATA: A powerful cyclone made landfall near the India-Bangladesh coastal border in May 2020.',
    'Follow evacuation orders from local authorities during cyclone season and keep track of official weather bulletins.',
    'https://mausam.imd.gov.in/', null
  );
