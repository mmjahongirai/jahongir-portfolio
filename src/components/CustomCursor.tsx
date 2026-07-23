import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../lib/theme';

interface Position {
  x: number;
  y: number;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef<Position>({ x: 0, y: 0 });
  const cursorPos = useRef<Position>({ x: 0, y: 0 });
  const trailPos = useRef<Position>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const rafRef = useRef<number>(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    const glow = glowRef.current;
    if (!cursor || !trail || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      const magneticEl = target.closest('[data-magnetic]') as HTMLElement;

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(mousePos.current.x - centerX, 2) +
          Math.pow(mousePos.current.y - centerY, 2)
        );
        const maxDistance = Math.max(rect.width, rect.height) * 0.8;

        if (distance < maxDistance) {
          const strength = 1 - distance / maxDistance;
          const pullX = (centerX - mousePos.current.x) * strength * 0.25;
          const pullY = (centerY - mousePos.current.y) * strength * 0.25;
          mousePos.current.x += pullX;
          mousePos.current.y += pullY;
        }
      }
    };

    const handleMouseEnter = () => {
      document.body.style.cursor = 'none';
      if (cursor) cursor.style.opacity = '1';
      if (trail) trail.style.opacity = '1';
      if (glow) glow.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      document.body.style.cursor = 'auto';
      if (cursor) cursor.style.opacity = '0';
      if (trail) trail.style.opacity = '0';
      if (glow) glow.style.opacity = '0';
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, input, textarea, [role="button"], [data-cursor-hover]');
      setIsHovering(!!interactive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const animate = () => {
      const easeFactor = 0.18;
      const trailEase = 0.1;

      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * easeFactor;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * easeFactor;

      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * trailEase;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * trailEase;

      cursor.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px) translate(-50%, -50%)`;
      trail.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%)`;
      glow.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%) scale(${isHovering ? 1.3 : 1})`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [isHovering]);

  const cursorColor = isDark ? 'white' : '#1d1d1f';

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] transition-all duration-200 opacity-0"
        style={{
          width: isHovering ? '40px' : isClicking ? '6px' : '10px',
          height: isHovering ? '40px' : isClicking ? '6px' : '10px',
          mixBlendMode: isDark ? 'difference' : 'normal',
        }}
      >
        <div
          className="w-full h-full rounded-full transition-all duration-300"
          style={{
            background: isHovering ? 'transparent' : cursorColor,
            border: isHovering ? `1.5px solid ${cursorColor}` : 'none',
          }}
        />
      </div>

      <div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] transition-all duration-300 opacity-0"
        style={{
          width: isHovering ? '52px' : '32px',
          height: isHovering ? '52px' : '32px',
        }}
      >
        <div
          className="w-full h-full rounded-full transition-all duration-300"
          style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(29,29,31,0.12)'}` }}
        />
      </div>

      <div
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997] opacity-0 transition-opacity duration-500"
        style={{ width: '80px', height: '80px' }}
      >
        <div
          className="w-full h-full rounded-full blur-xl"
          style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(29,29,31,0.03)' }}
        />
      </div>
    </>
  );
}
