-- OPTIONAL: additional real, sourced disasters specific to Assam, so
-- testing near Guwahati and Silchar actually returns meaningful results.
-- Every entry below is a real historical event with a cited source.

insert into disasters
  (name, type, status, event_date, latitude, longitude, location_name, severity, affected_area, description, safety_information, source)
values
(
  '2022 Assam Floods (Brahmaputra Valley)', 'Flood', 'Historical', '2022-06-17',
  26.1445, 91.7362, 'Guwahati, Assam, India', 'Severe',
  '32 of 35 districts of Assam, roughly 5.5 million people affected',
  'One of the most severe flood years on record for Assam, driven by heavy monsoon rainfall causing the Brahmaputra and its tributaries to breach their banks across most of the state. Around 190 deaths were recorded, with massive erosion, displacement, and damage to homes, roads, and bridges.',
  'Monitor Assam State Disaster Management Authority (ASDMA) advisories during monsoon season and evacuate low-lying areas when instructed by local authorities.',
  'DEMO DATA — Economic and Political Weekly: "A Historical Understanding of Assam''s Floods" (2022)'
),
(
  '2022 Silchar Floods (Barak Valley)', 'Flood', 'Historical', '2022-06-19',
  24.8333, 92.7789, 'Silchar, Cachar District, Assam, India', 'Severe',
  'Cachar district and surrounding Barak Valley; part of a wider flood event across 32 districts of North East India',
  'A breach in the Barak River embankment at Bethukandi, near Silchar, flooded the town — with around 90% of Silchar underwater at the peak. Flooding lasted for over a week in many areas, displacing residents and disrupting the city for weeks. Over 200 deaths were recorded across the affected region.',
  'Avoid returning to flooded homes until authorities confirm it is safe; boil or treat drinking water after floodwaters recede due to contamination risk.',
  'DEMO DATA — Wikipedia: "2022 Silchar Floods"'
),
(
  '1897 Great Assam Earthquake', 'Earthquake', 'Historical', '1897-06-12',
  26.0000, 90.7000, 'Shillong Plateau, Meghalaya (Assam border)', 'Severe',
  'Assam Valley, Shillong, Cherrapunji, and as far as Calcutta',
  'A magnitude 8.1–8.3 earthquake centered on the Shillong Plateau, one of the largest earthquakes ever recorded in the region. It caused roughly 1,542 deaths, including around 600 in a landslide at Cherrapunji, and severely damaged buildings as far away as Calcutta.',
  'During an earthquake: drop, cover, and hold on. After shaking stops, move to open ground away from damaged structures and watch for aftershocks.',
  'DEMO DATA — Wikipedia: "1897 Assam earthquake"'
);