'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Binary, Loader2, Orbit, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { supabase, type Project } from '@/lib/supabase';

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProjectsSection() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="projects" className="story-section project-story">
      <motion.header
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="story-heading"
      >
        <span className="story-eyebrow">
          <Orbit className="h-4 w-4" />
          {t('projects.subtitle')}
        </span>
        <h2>{t('projects.title')}</h2>
        <p>Selected systems and ideas shaped across finance, analytics and intelligent technology.</p>
      </motion.header>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
        </div>
      ) : projects.length > 0 ? (
        <div className="project-constellation">
          <div className="project-orbit-line project-orbit-line-one" />
          <div className="project-orbit-line project-orbit-line-two" />
          {projects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 70, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.85, delay: index * 0.1, ease: EASE }}
              whileHover={{
                y: -12,
                rotateX: index % 2 === 0 ? 2.5 : -2,
                rotateY: index % 2 === 0 ? -2.5 : 2,
                scale: 1.018,
              }}
              className={`floating-project-card floating-project-card-${(index % 4) + 1}`}
            >
              <div className="project-card-reflection" />
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt=""
                  aria-hidden="true"
                  className="project-card-image"
                  loading="lazy"
                />
              )}
              <div className="flex items-start justify-between gap-6">
                <div className="project-symbol">
                  {project.featured ? <Sparkles className="h-5 w-5" /> : <Binary className="h-5 w-5" />}
                </div>
                <div className="project-status">
                  <span />
                  {project.status}
                </div>
              </div>

              <div className="mt-auto pt-16">
                <span className="text-xs tracking-[0.2em] text-cyan-300/70">
                  PROJECT / {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.tags && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="project-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                  aria-label={`Open ${project.title}`}
                >
                  <ArrowUpRight className="h-5 w-5" />
                </a>
              ) : (
                <span className="project-link opacity-45">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              )}
            </motion.article>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="project-empty-state"
        >
          <Sparkles className="h-7 w-7 text-cyan-300" />
          <div>
            <h3>{t('projects.comingSoon')}</h3>
            <p>{t('projects.inProgress')}</p>
          </div>
        </motion.div>
      )}
    </section>
  );
}
