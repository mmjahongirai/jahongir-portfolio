import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../lib/theme';

export function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { isDark } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const glowOpacity = isDark ? 0.03 : 0.012;
  const gridOpacity = isDark ? 0.015 : 0.006;
  const orbOpacity = isDark ? 0.02 : 0.008;
  const vignetteColor = isDark ? '0, 0, 0' : '245, 245, 247';

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-[0] ${isDark ? 'opacity-100' : 'opacity-40'}`}
    >
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(ellipse 40% 40% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, ${glowOpacity}), transparent),
            radial-gradient(ellipse 30% 50% at ${(1 - mousePos.x) * 100}% ${(1 - mousePos.y) * 100}%, rgba(255, 255, 255, ${glowOpacity * 0.7}), transparent)
          `,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translate(${(mousePos.x - 0.5) * -16}px, ${(mousePos.y - 0.5) * -16}px)`,
        }}
      />

      <div
        className="absolute w-96 h-96 rounded-full transition-all duration-2000 ease-out"
        style={{
          left: '10%',
          top: '20%',
          transform: `translate(${(mousePos.x - 0.5) * 80}px, ${(mousePos.y - 0.5) * 80}px)`,
          background: `radial-gradient(circle, rgba(255, 255, 255, ${orbOpacity}) 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute w-80 h-80 rounded-full transition-all duration-2000 ease-out"
        style={{
          right: '15%',
          bottom: '30%',
          transform: `translate(${(mousePos.x - 0.5) * -60}px, ${(mousePos.y - 0.5) * -60}px)`,
          background: `radial-gradient(circle, rgba(255, 255, 255, ${orbOpacity * 0.75}) 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, rgba(${vignetteColor}, 0.35) 100%),
            radial-gradient(ellipse 80% 60% at 50% 100%, transparent 0%, rgba(${vignetteColor}, 0.35) 100%),
            radial-gradient(ellipse 50% 80% at 0% 50%, transparent 0%, rgba(${vignetteColor}, 0.2) 100%),
            radial-gradient(ellipse 50% 80% at 100% 50%, transparent 0%, rgba(${vignetteColor}, 0.2) 100%)
          `,
        }}
      />
    </div>
  );
}
