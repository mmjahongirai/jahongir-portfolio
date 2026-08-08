'use client';

import { type ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { consumePendingSection, scrollToSection, scrollToSectionWhenReady } from '@/lib/scroll';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
      autoRaf: false,
    });
    window.__lenis = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      if (window.__lenis === lenis) delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  // After a real route change to `/` (from /blog/[slug], etc.), scroll to the pending section.
  useEffect(() => {
    if (pathname !== '/') return;

    const pending = consumePendingSection();
    const hash = window.location.hash.replace(/^#/, '');
    const target = pending || hash || 'home';

    const run = (behavior: ScrollBehavior = 'smooth') => {
      scrollToSection(target, behavior);
    };

    run('auto');
    const timers = [80, 200, 450, 800].map(delay =>
      window.setTimeout(() => run(delay < 200 ? 'auto' : 'smooth'), delay),
    );

    const onHashChange = () => {
      const next = window.location.hash.replace(/^#/, '');
      if (next) scrollToSectionWhenReady(next, 'smooth');
    };
    window.addEventListener('hashchange', onHashChange);

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return children;
}
