'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Contact,
  Home,
  Languages,
  Layers3,
  Moon,
  Newspaper,
  PanelLeftClose,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/#home', icon: Home, id: 'home' },
  { label: 'About', href: '/#about', icon: UserRound, id: 'about' },
  { label: 'Projects', href: '/#projects', icon: Layers3, id: 'projects' },
  { label: 'Blog', href: '/#blog', icon: Newspaper, id: 'blog' },
  { label: 'Contact', href: '/#contact', icon: Contact, id: 'contact' },
];

const languages = ['en', 'ru', 'uz'] as const;

export function LeftEdgeNavigation() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = pathname.startsWith('/admin');

  const reveal = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const scheduleHide = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setLanguagesOpen(false);
    }, 320);
  };

  if (isAdmin) return null;

  return (
    <>
      <div
        className="vision-edge-sensor fixed left-0 top-16 z-[90] hidden h-[34rem] w-7 lg:block"
        onMouseEnter={reveal}
        aria-hidden="true"
      >
        <span className="vision-edge-trigger" />
      </div>

      <motion.aside
        initial={false}
        animate={{
          x: open ? 18 : -92,
          opacity: open ? 1 : 0,
          scale: open ? 1 : 0.94,
        }}
        transition={{ type: 'spring', stiffness: 310, damping: 27, mass: 0.72 }}
        onMouseEnter={reveal}
        onMouseLeave={scheduleHide}
        className="vision-nav fixed left-0 top-[5.5rem] z-[100] hidden origin-top-left flex-col gap-2 p-2.5 lg:flex"
        aria-label="Primary navigation"
      >
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-white/[0.07] text-cyan-300 shadow-inner shadow-white/10">
          <Sparkles className="h-4.5 w-4.5" />
        </div>

        {navItems.map(({ label, href, icon: Icon, id }) => {
          const active = pathname === '/' ? id === 'home' : pathname.startsWith(`/${id}`);
          return (
            <Link
              key={id}
              href={href}
              className={cn('vision-nav-item group', active && 'vision-nav-item-active')}
              aria-label={label}
            >
              <motion.span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                whileHover={{ scale: 1.08, x: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </motion.span>
              <span className="vision-nav-label">{label}</span>
            </Link>
          );
        })}

        <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative">
          <button
            type="button"
            className="vision-nav-item group"
            onClick={() => setLanguagesOpen(value => !value)}
            aria-label="Language switcher"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Languages className="h-[18px] w-[18px]" />
            </span>
            <span className="vision-nav-label uppercase">{lang}</span>
          </button>
          <AnimatePresence>
            {languagesOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.95 }}
                className="vision-language-popover"
              >
                {languages.map(language => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      setLang(language);
                      setLanguagesOpen(false);
                    }}
                    className={cn('vision-language-button', lang === language && 'text-cyan-300')}
                  >
                    {language.toUpperCase()}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button type="button" className="vision-nav-item group" onClick={toggle} aria-label="Toggle theme">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ opacity: 0, rotate: -80, scale: 0.55 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 80, scale: 0.55 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="flex items-center justify-center"
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="vision-nav-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </motion.aside>

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="vision-mobile-trigger lg:hidden"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            className="vision-mobile-dock lg:hidden"
          >
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            <div className="my-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="vision-mobile-dock-lang">
              <div className="mb-2 flex items-center justify-center px-2" aria-hidden="true">
                <Languages className="h-4 w-4 text-cyan-200/90" />
              </div>
              <div className="flex items-center gap-1" role="group" aria-label="Language">
                {languages.map(language => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => setLang(language)}
                    className={cn('vision-mobile-lang-btn flex-1', lang === language && 'is-active')}
                    aria-pressed={lang === language}
                  >
                    {language.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={toggle}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm"
            >
              <motion.span
                key={isDark ? 'mobile-sun' : 'mobile-moon'}
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                className="flex items-center justify-center"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
