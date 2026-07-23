'use client';

import { type ReactNode, useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll on desktop only.
 * On phones, native scroll is required so Safari/Chrome can use
 * translucent top/bottom chrome (Google Search style) while content scrolls underneath.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nativeMobileChrome = window.matchMedia('(hover: none), (max-width: 1024px)').matches;
    if (reduceMotion || nativeMobileChrome) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.1,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return children;
}
