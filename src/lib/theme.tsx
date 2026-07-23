'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'portfolio-theme-v2';

/**
 * Canvas + browser chrome must share these exact hex values.
 * Light = cool paper (matches page). Dark = navy (not near-black).
 * Safari/Chrome theme-color paints status + address bars from this.
 */
export const THEME_COLORS = {
  light: '#eef2f7',
  dark: '#0b1220',
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

function currentThemeFromDom(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Keep Safari + Chrome (Android/iOS) toolbars locked to the site canvas color.
 * Dual color-scheme / media theme-color metas make chrome follow the phone OS instead.
 */
export function syncThemeColorMeta(theme: Theme) {
  const color = THEME_COLORS[theme];
  const head = document.head;
  const syncing = (window as Window & { __chromeSyncing?: boolean });
  if (syncing.__chromeSyncing) return;
  syncing.__chromeSyncing = true;

  try {
    head.querySelectorAll('meta[name="theme-color"]').forEach(node => node.remove());
    head.querySelectorAll('meta[name="color-scheme"]').forEach(node => node.remove());

    const themeColor = document.createElement('meta');
    themeColor.setAttribute('name', 'theme-color');
    themeColor.setAttribute('content', color);
    head.appendChild(themeColor);

    const scheme = document.createElement('meta');
    scheme.setAttribute('name', 'color-scheme');
    scheme.setAttribute('content', theme);
    head.appendChild(scheme);

    let appleCapable = head.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-capable"]');
    if (!appleCapable) {
      appleCapable = document.createElement('meta');
      appleCapable.setAttribute('name', 'apple-mobile-web-app-capable');
      head.appendChild(appleCapable);
    }
    appleCapable.setAttribute('content', 'yes');

    let mobileCapable = head.querySelector<HTMLMetaElement>('meta[name="mobile-web-app-capable"]');
    if (!mobileCapable) {
      mobileCapable = document.createElement('meta');
      mobileCapable.setAttribute('name', 'mobile-web-app-capable');
      head.appendChild(mobileCapable);
    }
    mobileCapable.setAttribute('content', 'yes');

    let appleBar = head.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleBar) {
      appleBar = document.createElement('meta');
      appleBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      head.appendChild(appleBar);
    }
    appleBar.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');

    let tile = head.querySelector<HTMLMetaElement>('meta[name="msapplication-TileColor"]');
    if (!tile) {
      tile = document.createElement('meta');
      tile.setAttribute('name', 'msapplication-TileColor');
      head.appendChild(tile);
    }
    tile.setAttribute('content', color);

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.style.backgroundColor = color;
    root.style.setProperty('--chrome-bg', color);
    root.style.setProperty('--bg-primary', color);

    if (document.body) {
      document.body.style.backgroundColor = color;
    }

    requestAnimationFrame(() => {
      const live = head.querySelector('meta[name="theme-color"]');
      if (live?.parentNode) live.parentNode.appendChild(live);
      syncing.__chromeSyncing = false;
    });
  } catch {
    syncing.__chromeSyncing = false;
  }
}

function applyTheme(theme: Theme) {
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

  // Re-assert after hydration / bfcache / tab focus (Next may reinject metas)
  useEffect(() => {
    const resync = () => applyTheme(getInitialTheme());

    const t0 = window.setTimeout(resync, 0);
    const t1 = window.setTimeout(() => applyTheme(currentThemeFromDom()), 150);
    const t2 = window.setTimeout(() => applyTheme(currentThemeFromDom()), 600);

    const onShow = () => applyTheme(currentThemeFromDom());
    window.addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onShow);

    const observer = new MutationObserver(() => {
      const metas = document.head.querySelectorAll('meta[name="theme-color"]');
      const schemes = document.head.querySelectorAll('meta[name="color-scheme"]');
      const color = THEME_COLORS[currentThemeFromDom()];
      const themeMetaOk =
        metas.length === 1 &&
        !metas[0].hasAttribute('media') &&
        metas[0].getAttribute('content')?.toLowerCase() === color;
      const schemeOk =
        schemes.length === 1 && schemes[0].getAttribute('content') === currentThemeFromDom();
      if (!themeMetaOk || !schemeOk) applyTheme(currentThemeFromDom());
    });
    observer.observe(document.head, { childList: true, subtree: true, attributes: true });

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', onShow);
      observer.disconnect();
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
