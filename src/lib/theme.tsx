'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'portfolio-theme-v2';

/**
 * ONE solid canvas color per mode (Telegram / Instagram style).
 * Must equal html/body/--chrome-bg/theme-color exactly — no middle tint.
 */
export const THEME_COLORS = {
  light: '#e7ebf0',
  dark: '#0e1621',
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

function paintCanvas(color: string, theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.style.backgroundColor = color;
  root.style.setProperty('--chrome-bg', color);
  root.style.setProperty('--bg-primary', color);
  if (document.body) document.body.style.backgroundColor = color;
}

/** Lock Safari + Chrome chrome to the single site canvas color. */
export function syncThemeColorMeta(theme: Theme) {
  const color = THEME_COLORS[theme];
  const head = document.head;
  const flag = window as Window & { __chromeSyncing?: boolean };
  if (flag.__chromeSyncing) return;
  flag.__chromeSyncing = true;

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

    const ensure = (name: string, content: string) => {
      let el = head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    ensure('apple-mobile-web-app-capable', 'yes');
    ensure('mobile-web-app-capable', 'yes');
    // Translucent status bar → clock sits ON the same canvas color (Telegram-style)
    ensure('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensure('msapplication-TileColor', color);

    paintCanvas(color, theme);

    requestAnimationFrame(() => {
      const live = head.querySelector('meta[name="theme-color"]');
      if (live?.parentNode) live.parentNode.appendChild(live);
      flag.__chromeSyncing = false;
    });
  } catch {
    flag.__chromeSyncing = false;
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

  useEffect(() => {
    const resync = () => applyTheme(currentThemeFromDom());
    const timers = [0, 100, 400].map(ms => window.setTimeout(resync, ms));

    const onShow = () => resync();
    window.addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onShow);

    const observer = new MutationObserver(() => {
      if ((window as Window & { __chromeSyncing?: boolean }).__chromeSyncing) return;
      const color = THEME_COLORS[currentThemeFromDom()];
      const metas = document.head.querySelectorAll('meta[name="theme-color"]');
      const ok =
        metas.length === 1 &&
        !metas[0].hasAttribute('media') &&
        metas[0].getAttribute('content')?.toLowerCase() === color;
      if (!ok) resync();
    });
    observer.observe(document.head, { childList: true, subtree: true, attributes: true });

    return () => {
      timers.forEach(id => window.clearTimeout(id));
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
