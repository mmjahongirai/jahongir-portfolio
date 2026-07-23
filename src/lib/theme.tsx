'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'portfolio-theme-v2';

/** Exact colors Safari/Chrome use for status + address bar chrome */
export const THEME_COLORS = {
  light: '#f5f3ee',
  dark: '#080c18',
} as const;

type ThemeContextType = {
  isDark: boolean;
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return getSystemTheme();
}

function upsertMeta(name: string, content: string, attributes?: Record<string, string>) {
  const head = document.head;
  let meta = head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    head.appendChild(meta);
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => meta!.setAttribute(key, value));
  }
  meta.setAttribute('content', content);
  return meta;
}

/**
 * Force mobile browser chrome (status bar + bottom toolbar) to match site theme.
 * Critical: do NOT leave media-based theme-color / dual color-scheme — Safari follows OS then.
 */
export function syncThemeColorMeta(theme: Theme) {
  const color = THEME_COLORS[theme];
  const head = document.head;

  // Wipe every theme-color (including media variants Next may inject)
  head.querySelectorAll('meta[name="theme-color"]').forEach(node => node.remove());

  const themeColor = document.createElement('meta');
  themeColor.setAttribute('name', 'theme-color');
  themeColor.setAttribute('content', color);
  head.appendChild(themeColor);

  // Single scheme only — dual "dark light" makes Safari chrome follow the phone OS
  head.querySelectorAll('meta[name="color-scheme"]').forEach(node => node.remove());
  upsertMeta('color-scheme', theme);

  upsertMeta('apple-mobile-web-app-capable', 'yes');
  upsertMeta('mobile-web-app-capable', 'yes');
  // opaque status bar in standalone; in-tab Safari still uses theme-color above
  upsertMeta('apple-mobile-web-app-status-bar-style', theme === 'dark' ? 'black' : 'default');

  const root = document.documentElement;
  root.style.colorScheme = theme;
  root.style.backgroundColor = color;
  root.style.setProperty('--chrome-bg', color);
  root.style.setProperty('--bg-primary', color);

  if (document.body) {
    document.body.style.backgroundColor = color;
  }

  // Safari sometimes caches theme-color — nudge by re-append
  requestAnimationFrame(() => {
    const live = head.querySelector('meta[name="theme-color"]');
    if (live?.parentNode) {
      live.parentNode.appendChild(live);
    }
  });
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  syncThemeColorMeta(theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);

    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next = e.matches ? 'dark' : 'light';
      setThemeState(next);
      applyTheme(next);
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  // Re-sync after Next hydration (it may re-inject dual color-scheme / theme-color)
  useEffect(() => {
    const id = window.setTimeout(() => applyTheme(getInitialTheme()), 0);
    const id2 = window.setTimeout(() => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const current =
        stored === 'light' || stored === 'dark'
          ? stored
          : document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
      applyTheme(current);
    }, 120);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(id2);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: theme === 'dark', theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
