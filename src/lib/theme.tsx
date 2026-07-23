'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'portfolio-theme-v2';
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

function syncThemeColorMeta(theme: Theme) {
  const color = THEME_COLORS[theme];
  const head = document.head;

  // One live theme-color meta — browsers paint chrome from this
  let primary = head.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (!primary) {
    primary = document.createElement('meta');
    primary.setAttribute('name', 'theme-color');
    head.appendChild(primary);
  }
  primary.setAttribute('content', color);

  // Keep media variants in sync so OS preference cannot paint a mismatched bar
  head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"][media]').forEach(meta => {
    meta.setAttribute('content', color);
  });

  let appleCapable = head.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-capable"]');
  if (!appleCapable) {
    appleCapable = document.createElement('meta');
    appleCapable.setAttribute('name', 'apple-mobile-web-app-capable');
    head.appendChild(appleCapable);
  }
  appleCapable.setAttribute('content', 'yes');

  let apple = head.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!apple) {
    apple = document.createElement('meta');
    apple.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
    head.appendChild(apple);
  }
  // Always translucent so the site background (same as theme) shows behind the status icons
  apple.setAttribute('content', 'black-translucent');

  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = color;
  document.documentElement.style.setProperty('--chrome-bg', color);
  if (document.body) {
    document.body.style.backgroundColor = color;
  }
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
