import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client.
 * Uses JWT anon key (eyJ...). Do not use sb_publishable_ here.
 * Avoid throwing at import-time so `next build` / Vercel can succeed
 * even when env is injected only at runtime.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

if (process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
    );
  } else if (supabaseKey.startsWith('sb_publishable_')) {
    console.warn(
      '[supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY must be the JWT anon key (eyJ...), not sb_publishable_...',
    );
  }
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  image_url: string | null;
  link: string | null;
  tags: string[] | null;
  featured: boolean;
  published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  description: string | null;
  icon: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  location: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  image_url: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};
