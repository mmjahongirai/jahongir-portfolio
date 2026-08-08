'use client';

import { type ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { scrollToHash } from '@/lib/scroll';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
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

  // After route changes (e.g. /blog/[slug] → /#home), apply the hash scroll.
  useEffect(() => {
    if (pathname !== '/') return;

    const run = () => scrollToHash('smooth');
    const timer = window.setTimeout(run, 80);
    const onHashChange = () => scrollToHash('smooth');
    window.addEventListener('hashchange', onHashChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  return children;
}
