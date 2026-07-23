import type { Metadata, Viewport } from 'next';
import '@/index.css';
import 'lenis/dist/lenis.css';
import { ExperienceProviders } from '@/components/ExperienceProviders';
import { ExperienceChrome } from '@/components/experience/ExperienceChrome';
import { getPublicSeoSettings } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSeoSettings();
  return {
    metadataBase: new URL(settings.siteUrl),
    title: {
      default: settings.title,
      template: `%s · ${settings.title}`,
    },
    description: settings.description,
    applicationName: 'Jahongir Murtazaev Portfolio',
    keywords: ['Jahongir Murtazaev', 'Accountant', 'Data Analyst', 'AI Developer', 'Finance', 'Artificial Intelligence'],
    authors: [{ name: 'Jahongir Murtazaev', url: settings.siteUrl }],
    creator: 'Jahongir Murtazaev',
    alternates: { canonical: settings.siteUrl },
    openGraph: {
      title: settings.title,
      description: settings.description,
      url: settings.siteUrl,
      siteName: settings.title,
      type: 'website',
      locale: 'en_US',
      images: [{ url: settings.ogImage, width: 1200, height: 630, alt: settings.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.title,
      description: settings.description,
      images: [settings.ogImage],
      creator: settings.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    verification: settings.googleVerification ? { google: settings.googleVerification } : undefined,
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'JahongirAI',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  // Runtime locks a single theme-color to the active canvas (no dual OS media).
  themeColor: '#0e1621',
};

const themeScript = `
  (function () {
    try {
      var LIGHT = '#e7ebf0';
      var DARK = '#0e1621';
      var stored = localStorage.getItem('portfolio-theme-v2');
      var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = dark ? 'dark' : 'light';
      var color = dark ? DARK : LIGHT;
      var head = document.head;
      var root = document.documentElement;
      root.classList.toggle('dark', dark);
      root.style.colorScheme = theme;
      root.style.backgroundColor = color;
      root.style.setProperty('--chrome-bg', color);
      root.style.setProperty('--bg-primary', color);

      head.querySelectorAll('meta[name="theme-color"]').forEach(function (node) { node.remove(); });
      head.querySelectorAll('meta[name="color-scheme"]').forEach(function (node) { node.remove(); });

      var themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      themeColor.setAttribute('content', color);
      head.appendChild(themeColor);

      var scheme = document.createElement('meta');
      scheme.setAttribute('name', 'color-scheme');
      scheme.setAttribute('content', theme);
      head.appendChild(scheme);

      var apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!apple) {
        apple = document.createElement('meta');
        apple.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
        head.appendChild(apple);
      }
      apple.setAttribute('content', 'black-translucent');
    } catch (_) {}
  })();
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSeoSettings();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${settings.siteUrl}/#person`,
        name: 'Jahongir Murtazaev Mukhtorkhon Ogli',
        url: settings.siteUrl,
        jobTitle: ['Accountant', 'Data Analyst', 'AI Developer'],
        knowsAbout: ['Accounting', 'Data Analytics', 'Artificial Intelligence'],
      },
      {
        '@type': 'WebSite',
        '@id': `${settings.siteUrl}/#website`,
        url: settings.siteUrl,
        name: settings.title,
        description: settings.description,
        publisher: { '@id': `${settings.siteUrl}/#person` },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>
        <ExperienceProviders>
          <ExperienceChrome />
          <main className="relative z-10">{children}</main>
        </ExperienceProviders>
      </body>
    </html>
  );
}
