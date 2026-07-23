export const DEFAULT_SITE_URL = 'https://jahongirai.uz';

export type PublicSeoSettings = {
  siteUrl: string;
  title: string;
  description: string;
  ogImage: string;
  twitterHandle?: string;
  googleVerification?: string;
};

const defaults: PublicSeoSettings = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  title: 'Jahongir Murtazaev — Finance, Data & AI',
  description:
    'Jahongir Murtazaev transforms ideas into intelligent digital solutions through finance, analytics and artificial intelligence.',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL}/opengraph-image`,
};

export async function getPublicSeoSettings(): Promise<PublicSeoSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return defaults;

  try {
    const keys = [
      'site_url',
      'site_title',
      'site_description',
      'og_image',
      'twitter_handle',
      'google_site_verification',
    ].join(',');
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=key,value&key=in.(${keys})`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300, tags: ['site-settings'] },
      },
    );
    if (!response.ok) return defaults;

    const rows = await response.json() as Array<{ key: string; value: string | null }>;
    const settings = Object.fromEntries(rows.map(row => [row.key, row.value]));
    const siteUrl = (settings.site_url || defaults.siteUrl).replace(/\/$/, '');
    return {
      siteUrl,
      title: settings.site_title || defaults.title,
      description: settings.site_description || defaults.description,
      ogImage: settings.og_image || `${siteUrl}/opengraph-image`,
      twitterHandle: settings.twitter_handle || undefined,
      googleVerification: settings.google_site_verification || undefined,
    };
  } catch {
    return defaults;
  }
}

export async function getPublishedBlogPost(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const encodedSlug = encodeURIComponent(slug);
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=title,excerpt,cover_image,seo_title,seo_description,canonical_url,created_at,updated_at,author_name&slug=eq.${encodedSlug}&published=eq.true&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 300, tags: [`blog-${slug}`] },
      },
    );
    if (!response.ok) return null;
    const rows = await response.json() as Array<Record<string, string | null>>;
    return rows[0] || null;
  } catch {
    return null;
  }
}
