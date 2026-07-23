import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jahongir Murtazaev — Finance, Data & AI',
    short_name: 'Jahongir',
    description: 'A premium interactive portfolio at the intersection of finance, analytics and artificial intelligence.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080c18',
    theme_color: '#080c18',
  };
}
