'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Download, MoveUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';

export function Footer() {
  const { t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['footer_logo_url', 'resume_url'])
      .then(({ data }) => {
        data?.forEach(setting => {
          if (setting.key === 'footer_logo_url' && setting.value) setLogoUrl(setting.value);
          if (setting.key === 'resume_url' && setting.value) setResumeUrl(setting.value);
        });
      });
  }, []);

  return (
    <footer className="future-footer">
      <motion.div
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="future-footer-inner"
      >
        <div className="future-footer-topline">
          <span>JMM / 2026</span>
          <span>Finance · Data · AI</span>
        </div>

        <a href="mailto:johamurtazaev@gmail.com" className="future-footer-statement">
          <span>LET’S CREATE</span>
          <span className="future-footer-outline">THE INTELLIGENT</span>
          <span>FUTURE <ArrowUpRight /></span>
        </a>

        <div className="future-footer-bottom">
          <div>
            {logoUrl && <img src={logoUrl} alt="Partner logo" className="mb-4 max-h-12 max-w-40 object-contain" />}
            <p>{t('footer.copyright')}</p>
          </div>
          <div className="flex items-center gap-3">
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="future-resume-link" data-magnetic>
                <Download className="h-4 w-4" />
                Resume
              </a>
            )}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="future-footer-up"
              aria-label={t('footer.backToTop')}
              data-magnetic
            >
              <MoveUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
