import type { MetadataRoute } from 'next';
import { getPublicSeoSettings } from '@/lib/seo';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = await getPublicSeoSettings();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: 'yearly', priority: 0.6 },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return staticRoutes;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true&order=updated_at.desc`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        next: { revalidate: 300, tags: ['sitemap-posts'] },
      },
    );
    if (!response.ok) return staticRoutes;
    const posts = await response.json() as Array<{ slug: string; updated_at: string }>;
    return [
      ...staticRoutes,
      ...posts.map(post => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.updated_at,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
