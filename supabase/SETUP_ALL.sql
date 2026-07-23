-- =============================================================================
-- ONE-SHOT production setup for jahongirai.uz
-- Safe to re-run (idempotent). Paste into Supabase → SQL Editor → Run
-- Project: togrudbqxfhuqagmrabu
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- Core tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_image text,
  published boolean default false,
  seo_title text,
  seo_description text,
  canonical_url text,
  author_name text not null default 'Jahongir Murtazaev',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text default 'draft',
  image_url text,
  link text,
  tags text[],
  featured boolean default false,
  published boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  updated_at timestamptz default now()
);

alter table public.projects add column if not exists published boolean not null default true;
alter table public.projects add column if not exists order_index integer not null default 0;
alter table public.projects add column if not exists updated_at timestamptz not null default now();
alter table public.blog_posts add column if not exists seo_title text;
alter table public.blog_posts add column if not exists seo_description text;
alter table public.blog_posts add column if not exists canonical_url text;
alter table public.blog_posts add column if not exists author_name text not null default 'Jahongir Murtazaev';

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  level smallint not null default 80 check (level between 0 and 100),
  description text,
  icon text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  description text,
  start_date date,
  end_date date,
  current boolean not null default false,
  location text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_date date,
  end_date date,
  description text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date date,
  credential_url text,
  image_url text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image_url text not null,
  caption text,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  file_type text not null default 'image',
  filename text,
  size_bytes bigint,
  alt text,
  created_at timestamptz not null default now()
);

-- ---------- Helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'user')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_messages enable row level security;
alter table public.projects enable row level security;
alter table public.site_settings enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.certificates enable row level security;
alter table public.gallery_items enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "profiles_public_select" on public.profiles;
create policy "profiles_public_select" on public.profiles for select to public using (true);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "blog_posts_public_select" on public.blog_posts;
create policy "blog_posts_public_select" on public.blog_posts for select to public using (published = true);

drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_admin_all" on public.blog_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_messages_insert" on public.contact_messages;
create policy "contact_messages_insert" on public.contact_messages for insert to public with check (true);

drop policy if exists "contact_messages_admin_select" on public.contact_messages;
create policy "contact_messages_admin_select" on public.contact_messages for select to authenticated
  using (public.is_admin());

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete" on public.contact_messages for delete to authenticated
  using (public.is_admin());

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects_public_select" on public.projects;
create policy "projects_public_select" on public.projects for select to public using (published = true or true);

drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all" on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_settings_public_select" on public.site_settings;
create policy "site_settings_public_select" on public.site_settings for select to public using (true);

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all" on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "skills_public_select" on public.skills;
create policy "skills_public_select" on public.skills for select to public using (published = true);
drop policy if exists "skills_admin_all" on public.skills;
create policy "skills_admin_all" on public.skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "experiences_public_select" on public.experiences;
create policy "experiences_public_select" on public.experiences for select to public using (published = true);
drop policy if exists "experiences_admin_all" on public.experiences;
create policy "experiences_admin_all" on public.experiences for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "education_public_select" on public.education;
create policy "education_public_select" on public.education for select to public using (published = true);
drop policy if exists "education_admin_all" on public.education;
create policy "education_admin_all" on public.education for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "certificates_public_select" on public.certificates;
create policy "certificates_public_select" on public.certificates for select to public using (published = true);
drop policy if exists "certificates_admin_all" on public.certificates;
create policy "certificates_admin_all" on public.certificates for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery_public_select" on public.gallery_items;
create policy "gallery_public_select" on public.gallery_items for select to public using (published = true);
drop policy if exists "gallery_admin_all" on public.gallery_items;
create policy "gallery_admin_all" on public.gallery_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media_public_select" on public.media_assets;
create policy "media_public_select" on public.media_assets for select to public using (true);
drop policy if exists "media_admin_all" on public.media_assets;
create policy "media_admin_all" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using (bucket_id in ('images', 'media', 'resumes'));

drop policy if exists "Auth Upload" on storage.objects;
create policy "Auth Upload" on storage.objects for insert to authenticated
  with check (bucket_id in ('images', 'media', 'resumes') and public.is_admin());

drop policy if exists "Auth Update" on storage.objects;
create policy "Auth Update" on storage.objects for update to authenticated
  using (bucket_id in ('images', 'media', 'resumes') and public.is_admin());

drop policy if exists "Auth Delete" on storage.objects;
create policy "Auth Delete" on storage.objects for delete to authenticated
  using (bucket_id in ('images', 'media', 'resumes') and public.is_admin());

-- ---------- Seed settings ----------
insert into public.site_settings (key, value) values
  ('social_instagram', 'https://instagram.com'),
  ('social_telegram', 'https://telegram.org'),
  ('social_facebook', 'https://facebook.com'),
  ('social_twitter', 'https://twitter.com'),
  ('profile_image_url', null),
  ('footer_logo_url', null),
  ('hero_title', 'JAHONGIR MURTAZAEV'),
  ('hero_intro', 'Transforming ideas into intelligent digital solutions through finance, analytics, and artificial intelligence.'),
  ('site_title', 'Jahongir Murtazaev — Accountant • Data Analyst • AI Developer'),
  ('site_description', 'Transforming ideas into intelligent digital solutions through finance, analytics, and artificial intelligence.'),
  ('og_image', null),
  ('resume_url', null)
on conflict (key) do nothing;

insert into public.blog_posts (title, slug, content, excerpt, published)
select 'Welcome to My Blog', 'welcome-to-my-blog',
  'This is the first blog post. Stay tuned for more articles about AI, data analytics, and technology.',
  'First blog post introduction', true
where not exists (select 1 from public.blog_posts where slug = 'welcome-to-my-blog');

insert into public.projects (title, description, status, featured, tags, published)
select 'Global Application',
  'A large-scale global digital platform currently being designed and developed with innovative technologies and AI-powered solutions.',
  'in_progress', true, array['AI','Global','Platform'], true
where not exists (select 1 from public.projects where title = 'Global Application');

-- Backfill profiles for existing auth users
insert into public.profiles (id, email, role)
select u.id, coalesce(u.email, ''), 'user'
from auth.users u
on conflict (id) do update set email = excluded.email;

-- Promote site owner to admin
update public.profiles
set role = 'admin'
where lower(email) = lower('mmjahongirai@gmail.com');

-- If that email has not signed up yet, first matching user becomes admin when they exist
-- (safe no-op when already promoted above)
update public.profiles
set role = 'admin'
where id = (
  select id from public.profiles order by created_at asc nulls last limit 1
)
and not exists (select 1 from public.profiles where role = 'admin');
