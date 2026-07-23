'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

const particles = [
  [8, 18, 0, 16], [17, 72, -5, 20], [28, 42, -11, 18], [39, 84, -3, 24],
  [48, 14, -8, 19], [57, 63, -14, 23], [69, 31, -6, 17], [77, 79, -10, 22],
  [86, 48, -2, 20], [93, 16, -12, 25], [12, 91, -7, 21], [64, 94, -16, 26],
] as const;

export function AmbientEnvironment() {
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(35);
  const x = useSpring(pointerX, { stiffness: 35, damping: 18 });
  const y = useSpring(pointerY, { stiffness: 35, damping: 18 });

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    };
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointer);
  }, [pointerX, pointerY]);

  return (
    <div className="ambient-environment" aria-hidden="true">
      <div className="ambient-grid" />
      <motion.div
        className="ambient-pointer-light"
        style={{
          left: x,
          top: y,
        }}
      />
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="ambient-orb ambient-orb-c" />
      <div className="ambient-particles">
        {particles.map(([left, top, delay, duration], index) => (
          <span
            key={`${left}-${top}`}
            className="ambient-particle"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              width: index % 3 === 0 ? 3 : 2,
              height: index % 3 === 0 ? 3 : 2,
            }}
          />
        ))}
      </div>
      <div className="ambient-noise" />
      <div className="ambient-vignette" />
    </div>
  );
}
