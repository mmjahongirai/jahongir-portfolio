import { useEffect, useRef } from 'react';
import { useTheme } from '../lib/theme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number;
  life: number;
  maxLife: number;
}

interface MouseState {
  x: number;
  y: number;
  pressed: boolean;
}

export function FloatingParticles({ count = 20, className = '' }: { count?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, pressed: false });
  const rafRef = useRef(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(width, height));
    }
    particlesRef.current = particles;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseDown = () => { mouseRef.current.pressed = true; };
    const handleMouseUp = () => { mouseRef.current.pressed = false; };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const { x: mx, y: my, pressed } = mouseRef.current;
      const baseOpacity = isDark ? 1 : 0.35;
      const particleColor = isDark ? '255, 255, 255' : '29, 29, 31';

      const sortedParticles = [...particlesRef.current].sort((a, b) => a.depth - b.depth);

      for (const p of sortedParticles) {
        p.x += p.vx;
        p.y += p.vy;

        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = pressed ? 180 : 90;

        if (dist < interactionRadius && dist > 0) {
          const force = (interactionRadius - dist) / interactionRadius;
          const angle = Math.atan2(dy, dx);

          if (pressed) {
            p.vx -= Math.cos(angle) * force * 0.4;
            p.vy -= Math.sin(angle) * force * 0.4;
          } else {
            p.vx += Math.cos(angle) * force * 0.04;
            p.vy += Math.sin(angle) * force * 0.04;
          }
        }

        p.vy += Math.sin(Date.now() * 0.001 + p.x * 0.01) * 0.008;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const parallaxX = (mx / width - 0.5) * p.depth * 24;
        const parallaxY = (my / height - 0.5) * p.depth * 24;

        const drawX = p.x + parallaxX;
        const drawY = p.y + parallaxY;
        const drawSize = p.size * (0.4 + p.depth * 0.4);

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, drawSize * 2);
        gradient.addColorStop(0, `rgba(${particleColor}, ${p.opacity * 0.3 * baseOpacity})`);
        gradient.addColorStop(0.5, `rgba(${particleColor}, ${p.opacity * 0.08 * baseOpacity})`);
        gradient.addColorStop(1, `rgba(${particleColor}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(drawX, drawY, drawSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity * 0.6 * baseOpacity})`;
        ctx.arc(drawX, drawY, drawSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];

          const p1x = p1.x + (mx / width - 0.5) * p1.depth * 24;
          const p1y = p1.y + (my / height - 0.5) * p1.depth * 24;
          const p2x = p2.x + (mx / width - 0.5) * p2.depth * 24;
          const p2y = p2.y + (my / height - 0.5) * p2.depth * 24;

          const dx = p1x - p2x;
          const dy = p1y - p2y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * Math.min(p1.opacity, p2.opacity) * 0.15 * baseOpacity;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [count, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none opacity-80 dark:opacity-100 ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    size: Math.random() * 1.5 + 0.8,
    opacity: Math.random() * 0.3 + 0.08,
    depth: Math.random() * 0.8 + 0.2,
    life: 0,
    maxLife: Math.random() * 500 + 500,
  };
}
