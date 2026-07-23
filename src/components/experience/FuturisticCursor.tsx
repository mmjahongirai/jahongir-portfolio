'use client';

import { useEffect, useRef } from 'react';

/** Instant custom cursor — no lerp, no rAF lag, no blur. */
export function FuturisticCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let visible = false;
    let lastInteractive = false;

    const move = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;

      // Direct left/top — same frame as system pointer
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      if (!visible) {
        ring.classList.add('is-visible');
        dot.classList.add('is-visible');
        visible = true;
      }

      const target = event.target as HTMLElement | null;
      const interactive = Boolean(
        target?.closest?.(
          'a, button, input, textarea, [role="button"], [data-magnetic], [data-cursor-hover]',
        ),
      );
      if (interactive !== lastInteractive) {
        ring.classList.toggle('is-interactive', interactive);
        dot.classList.toggle('is-interactive', interactive);
        lastInteractive = interactive;
      }
    };

    const down = () => ring.classList.add('is-pressed');
    const up = () => ring.classList.remove('is-pressed');
    const leave = () => {
      ring.classList.remove('is-visible');
      dot.classList.remove('is-visible');
      visible = false;
    };

    document.documentElement.classList.add('has-custom-cursor');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('mouseleave', leave);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="future-cursor" aria-hidden="true" />
      <div ref={dotRef} className="future-cursor-dot" aria-hidden="true" />
    </>
  );
}
