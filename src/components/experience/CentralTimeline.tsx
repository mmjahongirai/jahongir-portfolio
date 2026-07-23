'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Home,
  Layers3,
  Send,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { cn } from '@/lib/utils';

type TimelineItem = {
  id: 'home' | 'about' | 'projects' | 'blog' | 'contact';
  label: string;
  icon: LucideIcon;
  position: string;
};

const items: TimelineItem[] = [
  { id: 'home', label: 'Home', icon: Home, position: '2%' },
  { id: 'about', label: 'About', icon: UserRound, position: '26%' },
  { id: 'projects', label: 'Projects', icon: Layers3, position: '50%' },
  { id: 'blog', label: 'Blog', icon: BookOpen, position: '74%' },
  { id: 'contact', label: 'Contact', icon: Send, position: '98%' },
];

const TIMELINE_PATH = 'M 50 0 L 50 100';

export function CentralTimeline() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
  });
  const pulseTop = useTransform(progress, [0, 1], ['1%', '99%']);
  const pathLength = useTransform(progress, [0, 1], [0.02, 1]);
  const [active, setActive] = useState<TimelineItem['id']>('home');
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const previous = useRef(0);
  const frame = useRef<number | null>(null);
  const activationFrame = useRef<number | null>(null);

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (Math.abs(latest - previous.current) > 0.0005) {
        setDirection(latest > previous.current ? 'down' : 'up');
        previous.current = latest;
      }
    });
  });

  useEffect(() => {
    const pathSection = items.find(item => pathname.startsWith(`/${item.id}`));
    if (pathname !== '/' && pathSection) setActive(pathSection.id);

    const sections = items
      .map(item => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateActiveSection = () => {
      const anchor = window.innerHeight * 0.5;
      const current = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= anchor && rect.bottom >= anchor;
      });

      if (current) setActive(current.id as TimelineItem['id']);
    };

    const handleScroll = () => {
      if (activationFrame.current !== null) return;
      activationFrame.current = requestAnimationFrame(() => {
        activationFrame.current = null;
        updateActiveSection();
      });
    };

    updateActiveSection();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (activationFrame.current !== null) cancelAnimationFrame(activationFrame.current);
    };
  }, [pathname]);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="energy-timeline" aria-label="Section timeline">
      <svg
        className="energy-timeline-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className="energy-timeline-path-base" d={TIMELINE_PATH} />
        <motion.path
          className="energy-timeline-path-progress"
          d={TIMELINE_PATH}
          style={{ pathLength }}
        />
      </svg>

      <motion.div
        className={cn('energy-timeline-pulse', `energy-timeline-pulse-${direction}`)}
        style={{ top: pulseTop }}
      />

      {items.map(({ id, label, icon: Icon, position }) => {
        const isActive = active === id;
        return (
          <div
            key={id}
            className={cn('energy-timeline-stop', isActive && 'is-active')}
            style={{ top: position }}
          >
            <span className="timeline-connector timeline-connector-left" aria-hidden="true" />
            <Link
              href={`/#${id}`}
              onClick={event => navigate(event, id)}
              className="energy-timeline-node"
              aria-label={`Go to ${label}`}
              aria-current={isActive ? 'step' : undefined}
              data-magnetic
            >
              <span className="energy-node-ripple" />
              <Icon className="energy-node-icon" />
            </Link>
          </div>
        );
      })}
    </aside>
  );
}
