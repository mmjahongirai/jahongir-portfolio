CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'draft',
  image_url text,
  link text,
  tags text[],
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_select" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE TO authenticated USING (EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "blog_posts_public_select" ON blog_posts FOR SELECT TO public USING (published = true);
CREATE POLICY "blog_posts_admin_all" ON blog_posts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "contact_messages_insert" ON contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "contact_messages_admin_select" ON contact_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "contact_messages_admin_delete" ON contact_messages FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "projects_public_select" ON projects FOR SELECT TO public USING (true);
CREATE POLICY "projects_admin_all" ON projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "site_settings_public_select" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

INSERT INTO blog_posts (title, slug, content, excerpt, published) VALUES
('Welcome to My Blog', 'welcome-to-my-blog', 'This is the first blog post. Stay tuned for more articles about AI, data analytics, and technology.', 'First blog post introduction', true);

INSERT INTO projects (title, description, status, featured, tags) VALUES
('Global Application', 'A large-scale global digital platform currently being designed and developed with innovative technologies and AI-powered solutions.', 'in_progress', true, ARRAY['AI','Global','Platform']);

INSERT INTO site_settings (key, value) VALUES
('social_instagram', 'https://instagram.com'),
('social_telegram', 'https://telegram.org'),
('social_facebook', 'https://facebook.com'),
('social_twitter', 'https://twitter.com');
