import type { MetadataRoute } from 'next';
import { getPublicSeoSettings } from '@/lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getPublicSeoSettings();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
