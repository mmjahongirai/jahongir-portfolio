INSERT INTO site_settings (key, value) VALUES
('profile_image_url', NULL),
('footer_logo_url', NULL),
('hero_title', 'JAHONGIR MURTAZAEV'),
('hero_intro', 'Transforming ideas into intelligent digital solutions through finance, analytics, and artificial intelligence.'),
('site_title', 'Jahongir Murtazaev — Accountant • Data Analyst • AI Developer'),
('site_description', 'Transforming ideas into intelligent digital solutions through finance, analytics, and artificial intelligence.'),
('og_image', NULL)
ON CONFLICT (key) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS site_settings_key_idx ON site_settings (key);