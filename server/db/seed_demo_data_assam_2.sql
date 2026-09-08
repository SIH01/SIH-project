-- OPTIONAL: more disaster-type diversity for Assam — landslide and storm
-- records, sourced the same way as the earlier seed files.

insert into disasters
  (name, type, status, event_date, latitude, longitude, location_name, severity, affected_area, description, safety_information, source)
values
(
  '2022 Dima Hasao Landslides', 'Landslide', 'Historical', '2022-05-14',
  25.1470, 93.0330, 'Haflong, Dima Hasao District, Assam, India', 'High',
  'Dima Hasao district, particularly the Haflong–Maibong–Ditokcherra stretch',
  'A week of exceptionally heavy pre-monsoon rainfall (11–18 May 2022) triggered thousands of landslides across Dima Hasao district. New Haflong railway station was buried by debris flows, derailing train coaches, and both road and rail links to the district were cut off for days. At least 3 deaths were reported, with extensive damage to infrastructure.',
  'In landslide-prone hill areas, avoid travel during or immediately after heavy rainfall, and watch for cracks in the ground or tilting trees/poles as warning signs before evacuating.',
  'DEMO DATA — Landslides (Springer Nature) & The Landslide Blog (AGU): "Cluster landslides in Dima Hasao district" (2022)'
),
(
  'April 2026 Assam Storm', 'Storm', 'Historical', '2026-04-21',
  24.8333, 92.7789, 'Cachar District, Assam, India', 'Moderate',
  '13 districts including Dhubri, Bongaigaon, Cachar, and Kamrup — roughly 4,000 people in 153 villages',
  'A powerful pre-monsoon storm swept across 13 districts of Assam, killing one person, injuring two others, and destroying homes and power infrastructure. Nine animals also died in the storm.',
  'During severe thunderstorms, stay indoors and away from windows; secure loose outdoor items in advance if a storm warning is issued for your area.',
  'DEMO DATA — Pratidin Time: "Assam Storm Leaves 1 Dead, Widespread Damage" (2026)'
);