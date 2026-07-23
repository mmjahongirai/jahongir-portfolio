'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Orbit } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { TextRotator } from './ui/TextRotator';

const EASE = [0.16, 1, 0.3, 1] as const;

export function HomeSection() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .in('key', ['hero_title', 'hero_intro'])
      .then(({ data }) => {
        const next: Record<string, string> = {};
        data?.forEach(setting => {
          if (setting.value) next[setting.key] = setting.value;
        });
        setSettings(next);
      });
  }, []);

  const roles = useMemo(
    () => [t('hero.role1'), t('hero.role2'), t('hero.role3')],
    [t],
  );

  const titleLines = useMemo(() => {
    const title = settings.hero_title || 'JAHONGIR MURTAZAEV MUKHTORKHON OGLI';
    return title.trim().split(/\s+/).filter(Boolean);
  }, [settings.hero_title]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="future-hero">
      <div className="future-hero-copy">
        <motion.p
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
          className="future-hero-overline"
        >
          Independent portfolio / 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.18, ease: EASE }}
          className="future-hero-title"
        >
          {titleLines.map(line => (
            <span key={line} className="future-hero-title-line">
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="future-role"
        >
          <span className="future-role-dot" />
          <TextRotator texts={roles} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.58, ease: EASE }}
          className="future-hero-foot"
        >
          <p className="future-hero-description">
            {settings.hero_intro ||
              'Transforming ideas into intelligent digital solutions through finance, analytics and artificial intelligence.'}
          </p>

          <div className="future-hero-actions">
            <button
              type="button"
              onClick={() => goTo('projects')}
              className="future-button future-button-primary"
              data-magnetic
            >
              <span>Explore projects</span>
              <ArrowUpRight className="h-4 w-4" />
              <span className="future-button-ripple" />
            </button>
            <button
              type="button"
              onClick={() => goTo('contact')}
              className="future-button future-button-secondary"
              data-magnetic
            >
              <Orbit className="h-4 w-4" />
              <span>Start a conversation</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
