# Jahongir AI — jahongirai.uz

Premium portfolio experience (Next.js 15 + Supabase) with a protected admin CMS.

## Stack

- Next.js 15 App Router, React 19, Tailwind CSS
- Framer Motion, Lenis, React Three Fiber
- Supabase Auth, Postgres, Storage, RLS
- TipTap rich text for blog

## Local setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Fill Supabase values from your project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Apply SQL migrations in `supabase/migrations/` (oldest → newest) in the Supabase SQL editor.

4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin

- Panel: `/admin`
- Login: `/admin/login`

Create a user in Supabase Auth, then promote:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

Public open signup for admin is disabled. Middleware + client auth both guard `/admin/*`.

## Content modules

Admin CRUD covers:

- Home / hero, profile & logo images
- Skills, experience, education, certificates
- Projects, blog (TipTap), gallery
- Media library, resume PDF
- Social links, SEO settings, contact messages

Apply migration `20260723000100_0005_production_content_admin.sql` for the newer tables and storage buckets (`images`, `media`, `resumes`).

## Deploy to Vercel (jahongirai.uz)

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set Production env vars:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://jahongirai.uz` |

4. Add domain `jahongirai.uz` (and optional `www`) in Vercel → Domains.
5. Deploy. Confirm:

- `/` loads
- `/admin/login` works
- `/sitemap.xml` and `/robots.txt` respond
- OG preview uses `/opengraph-image`

## SEO checklist

- [ ] Search Console: property for `jahongirai.uz`
- [ ] Submit `https://jahongirai.uz/sitemap.xml`
- [ ] Set `site_title`, `site_description`, `og_image` in Admin → SEO
- [ ] Prefer apex or `www` as canonical and redirect the other

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```
