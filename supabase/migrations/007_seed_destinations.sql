-- ============================================================
-- SEED: destinations
-- Populates the 8 primary hill station destinations for GoMiGo
-- Run once against production Supabase
-- ============================================================

INSERT INTO destinations (
  region_name,
  slug,
  sub_destinations,
  is_active,
  description_en,
  seo_title_en,
  meta_description_en,
  seasonal_rules,
  languages_spoken
) VALUES
  (
    'Ooty',
    'ooty',
    ARRAY['Emerald Lake', 'Avalanche', 'Pykara', 'Mudumalai', 'Gudalur'],
    TRUE,
    'The Queen of Hill Stations in Tamil Nadu, famous for tea gardens, the Nilgiri Mountain Railway (UNESCO Heritage), Botanical Gardens, Ooty Lake, and cool misty weather year-round.',
    'Ooty — Cabs, Hotels & Tour Guides | GoMiGo',
    'Book verified local cabs, budget hotels, and expert tour guides in Ooty. India''s favourite hill station on GoMiGo.',
    '{"peak": {"months": [4, 5, 6, 10, 11, 12], "multiplier": 1.5}, "offpeak": {"months": [1, 2, 3, 7, 8, 9], "multiplier": 1.0}}',
    ARRAY['en', 'ta', 'hi']
  ),
  (
    'Coonoor',
    'coonoor',
    ARRAY['Sim''s Park', 'Dolphin''s Nose', 'Lamb''s Rock', 'Droog Fort', 'Law''s Falls'],
    TRUE,
    'A serene hill station in the Nilgiris, known for Sim''s Park, Dolphin''s Nose viewpoint, stunning tea estates, and a quieter, cooler atmosphere than Ooty.',
    'Coonoor — Cabs, Hotels & Tour Guides | GoMiGo',
    'Book verified cabs, stays, and local guides in Coonoor. Explore Nilgiri tea estates with GoMiGo.',
    '{"peak": {"months": [4, 5, 6, 10, 11, 12], "multiplier": 1.3}, "offpeak": {"months": [1, 2, 3, 7, 8, 9], "multiplier": 1.0}}',
    ARRAY['en', 'ta']
  ),
  (
    'Kotagiri',
    'kotagiri',
    ARRAY['Kodanad Viewpoint', 'Catherine Falls', 'Elk Falls', 'Rangasamy Peak'],
    TRUE,
    'The oldest hill station in the Nilgiris with panoramic valley views, Catherine Falls, and a quieter alternative to Ooty. Ideal for nature lovers and trekkers.',
    'Kotagiri — Cabs, Hotels & Tour Guides | GoMiGo',
    'Discover Kotagiri with GoMiGo. Book local cabs, eco-stays, and guided nature treks in the Nilgiris.',
    '{"peak": {"months": [4, 5, 6, 11, 12], "multiplier": 1.2}, "offpeak": {"months": [1, 2, 3, 7, 8, 9, 10], "multiplier": 1.0}}',
    ARRAY['en', 'ta']
  ),
  (
    'Kodaikanal',
    'kodaikanal',
    ARRAY['Kodai Lake', 'Pillar Rocks', 'Green Valley Views', 'Bear Shola Falls', 'Berijam Lake'],
    TRUE,
    'The Princess of Hill Stations in the Palani Hills, Tamil Nadu. Famous for Kodai Lake, Bryant Park, star-shaped roads, Pillar Rocks, and the cool climate at 2,133m altitude.',
    'Kodaikanal — Cabs, Hotels & Tour Guides | GoMiGo',
    'Explore Kodaikanal with GoMiGo. Book verified cabs, mountain stays, and local guides in the Palani Hills.',
    '{"peak": {"months": [4, 5, 6, 10, 11], "multiplier": 1.4}, "offpeak": {"months": [1, 2, 3, 7, 8, 9, 12], "multiplier": 1.0}}',
    ARRAY['en', 'ta', 'hi']
  ),
  (
    'Munnar',
    'munnar',
    ARRAY['Top Station', 'Eravikulam National Park', 'Mattupetty Dam', 'Chinnar', 'Devikulam'],
    TRUE,
    'A mesmerising hill station in Kerala''s Western Ghats, famous for rolling tea plantations, Eravikulam National Park (home to Nilgiri Tahr), and misty mountain views.',
    'Munnar — Cabs, Hotels & Tour Guides | GoMiGo',
    'Book verified local cabs, plantation stays, and guides in Munnar. Explore God''s Own Country with GoMiGo.',
    '{"peak": {"months": [10, 11, 12, 1, 2], "multiplier": 1.5}, "offpeak": {"months": [3, 4, 5, 6, 7, 8, 9], "multiplier": 1.0}}',
    ARRAY['en', 'ml', 'hi']
  ),
  (
    'Coorg',
    'coorg',
    ARRAY['Madikeri', 'Abbey Falls', 'Raja''s Seat', 'Dubare Elephant Camp', 'Nagarhole'],
    TRUE,
    'The Scotland of India — a lush coffee-growing district in Karnataka''s Western Ghats, known for misty hills, Kaveri river rafting, Tibetan monasteries, and spice estates.',
    'Coorg — Cabs, Hotels & Tour Guides | GoMiGo',
    'Explore Coorg with GoMiGo. Book local cabs, coffee estate stays, and guides for Madikeri and beyond.',
    '{"peak": {"months": [10, 11, 12, 1, 2, 3], "multiplier": 1.4}, "offpeak": {"months": [4, 5, 6, 7, 8, 9], "multiplier": 1.0}}',
    ARRAY['en', 'kn', 'hi']
  ),
  (
    'Manali',
    'manali',
    ARRAY['Solang Valley', 'Rohtang Pass', 'Old Manali', 'Naggar', 'Kullu'],
    TRUE,
    'A high-altitude Himalayan resort town in Himachal Pradesh, famous for snow-capped peaks, Rohtang Pass, adventure sports, and the gateway to Spiti and Lahaul valleys.',
    'Manali — Cabs, Hotels & Tour Guides | GoMiGo',
    'Book verified cabs, mountain stays, and adventure guides in Manali with GoMiGo.',
    '{"peak": {"months": [5, 6, 7, 8, 10], "multiplier": 1.6}, "offpeak": {"months": [1, 2, 3, 4, 9, 11, 12], "multiplier": 1.0}}',
    ARRAY['en', 'hi']
  ),
  (
    'Darjeeling',
    'darjeeling',
    ARRAY['Tiger Hill', 'Batasia Loop', 'Mirik', 'Kalimpong', 'Kurseong'],
    TRUE,
    'The Queen of Hills in West Bengal, world-famous for Darjeeling tea, the Toy Train (UNESCO Heritage), Tiger Hill sunrise over Kangchenjunga, and colonial-era charm.',
    'Darjeeling — Cabs, Hotels & Tour Guides | GoMiGo',
    'Explore Darjeeling with GoMiGo. Book verified local cabs, heritage hotels, and guides for sunrise at Tiger Hill.',
    '{"peak": {"months": [4, 5, 6, 10, 11], "multiplier": 1.5}, "offpeak": {"months": [1, 2, 3, 7, 8, 9, 12], "multiplier": 1.0}}',
    ARRAY['en', 'hi']
  )
ON CONFLICT (slug) DO UPDATE SET
  region_name        = EXCLUDED.region_name,
  sub_destinations   = EXCLUDED.sub_destinations,
  is_active          = EXCLUDED.is_active,
  description_en     = EXCLUDED.description_en,
  seo_title_en       = EXCLUDED.seo_title_en,
  meta_description_en = EXCLUDED.meta_description_en,
  seasonal_rules     = EXCLUDED.seasonal_rules,
  languages_spoken   = EXCLUDED.languages_spoken,
  updated_at         = NOW();
