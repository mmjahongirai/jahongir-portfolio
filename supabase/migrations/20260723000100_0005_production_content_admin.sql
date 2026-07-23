-- Production content model, secure RLS, admin bootstrap and storage policies.
-- Run after migrations 0001-0004 in the Supabase SQL editor or CLI.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
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

-- Never auto-promote a public signup. Promote the owner manually after signup:
-- update public.profiles set role = 'admin' where email = 'owner@example.com';
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

alter table public.projects
  add column if not exists published boolean not null default true,
  add column if not exists order_index integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.blog_posts
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists author_name text not null default 'Jahongir Murtazaev';

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
  updated_at timestamptz not null default now(),
  constraint experience_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
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
  updated_at timestamptz not null default now(),
  constraint education_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
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

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  alt_text text not null,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  storage_path text not null unique,
  file_type text not null check (file_type in ('image', 'document', 'video', 'other')),
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  alt_text text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  storage_path text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_active_resume
  on public.resumes (is_active)
  where is_active = true;
create index if not exists skills_order_idx on public.skills (order_index, created_at);
create index if not exists experiences_order_idx on public.experiences (order_index, start_date desc);
create index if not exists education_order_idx on public.education (order_index, start_date desc);
create index if not exists certificates_order_idx on public.certificates (order_index, issue_date desc);
create index if not exists gallery_order_idx on public.gallery (order_index, created_at);
create index if not exists projects_order_idx on public.projects (order_index, created_at desc);

drop trigger if exists skills_updated_at on public.skills;
create trigger skills_updated_at before update on public.skills
  for each row execute function public.set_updated_at();
drop trigger if exists experiences_updated_at on public.experiences;
create trigger experiences_updated_at before update on public.experiences
  for each row execute function public.set_updated_at();
drop trigger if exists education_updated_at on public.education;
create trigger education_updated_at before update on public.education
  for each row execute function public.set_updated_at();
drop trigger if exists certificates_updated_at on public.certificates;
create trigger certificates_updated_at before update on public.certificates
  for each row execute function public.set_updated_at();
drop trigger if exists gallery_updated_at on public.gallery;
create trigger gallery_updated_at before update on public.gallery
  for each row execute function public.set_updated_at();
drop trigger if exists resumes_updated_at on public.resumes;
create trigger resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();
drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.education enable row level security;
alter table public.certificates enable row level security;
alter table public.gallery enable row level security;
alter table public.media enable row level security;
alter table public.resumes enable row level security;

-- Replace permissive/recursive legacy policies.
drop policy if exists "profiles_public_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_or_admin_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_posts_public_select" on public.blog_posts;
drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using (published = true or public.is_admin());
create policy "blog_posts_admin_write" on public.blog_posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "projects_public_select" on public.projects;
drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon, authenticated
  using (published = true or public.is_admin());
create policy "projects_admin_write" on public.projects
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_settings_public_select" on public.site_settings;
drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_admin_write" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "contact_messages_insert" on public.contact_messages;
drop policy if exists "contact_messages_admin_select" on public.contact_messages;
drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 320
    and char_length(subject) between 1 and 200
    and char_length(message) between 1 and 10000
  );
create policy "contact_messages_admin_manage" on public.contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

do $$
declare
  table_name text;
begin
  foreach table_name in array array['skills', 'experiences', 'education', 'certificates', 'gallery']
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_public_read', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_admin_write', table_name);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (published = true or public.is_admin())',
      table_name || '_public_read',
      table_name
    );
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name || '_admin_write',
      table_name
    );
  end loop;
end $$;

drop policy if exists "media_admin_manage" on public.media;
create policy "media_admin_manage" on public.media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "resumes_public_read" on public.resumes;
drop policy if exists "resumes_admin_write" on public.resumes;
create policy "resumes_public_read" on public.resumes
  for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "resumes_admin_write" on public.resumes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('images', 'images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('media', 'media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf', 'video/mp4']),
  ('resumes', 'resumes', true, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Auth Upload" on storage.objects;
drop policy if exists "Auth Update" on storage.objects;
drop policy if exists "Auth Delete" on storage.objects;
drop policy if exists "portfolio_public_storage_read" on storage.objects;
drop policy if exists "portfolio_admin_storage_insert" on storage.objects;
drop policy if exists "portfolio_admin_storage_update" on storage.objects;
drop policy if exists "portfolio_admin_storage_delete" on storage.objects;

create policy "portfolio_public_storage_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('images', 'media', 'resumes'));
create policy "portfolio_admin_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('images', 'media', 'resumes') and public.is_admin());
create policy "portfolio_admin_storage_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('images', 'media', 'resumes') and public.is_admin())
  with check (bucket_id in ('images', 'media', 'resumes') and public.is_admin());
create policy "portfolio_admin_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('images', 'media', 'resumes') and public.is_admin());

insert into public.site_settings (key, value)
values
  ('site_url', 'https://jahongirai.uz'),
  ('site_title', 'Jahongir Murtazaev — Finance, Data & AI'),
  ('site_description', 'Transforming ideas into intelligent digital solutions through finance, analytics and artificial intelligence.'),
  ('hero_title', 'JAHONGIR MURTAZAEV MUKHTORKHON OGLI'),
  ('hero_intro', 'Transforming ideas into intelligent digital solutions through finance, analytics and artificial intelligence.'),
  ('twitter_handle', null),
  ('google_site_verification', null),
  ('resume_url', null)
on conflict (key) do nothing;

-- Remove demo records introduced by the starter migrations when untouched.
delete from public.blog_posts
where title = 'Welcome to My Blog'
  and slug = 'welcome-to-my-blog'
  and content like 'This is the first blog post.%';
delete from public.projects
where title = 'Global Application'
  and description like 'A large-scale global digital platform%';
update public.site_settings set value = null
where (key = 'social_instagram' and value = 'https://instagram.com')
   or (key = 'social_telegram' and value = 'https://telegram.org')
   or (key = 'social_facebook' and value = 'https://facebook.com')
   or (key = 'social_twitter' and value = 'https://twitter.com');
