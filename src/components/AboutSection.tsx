'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  Calculator,
  Cpu,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ScanFace,
  BriefcaseBusiness,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/language';
import { supabase, type Certificate, type Education, type Experience, type Skill } from '@/lib/supabase';

const EASE = [0.16, 1, 0.3, 1] as const;

const contactItems = [
  { icon: Phone, label: 'Phone', value: '+998-90-898-07-86', href: 'tel:+998908980786' },
  { icon: Mail, label: 'Email', value: 'johamurtazaev@gmail.com', href: 'mailto:johamurtazaev@gmail.com' },
  { icon: MapPin, label: 'Location', value: 'Kashkadarya r., Shahrisabz d., 181307', href: null },
];

const educationItems = [
  { degree: 'Economics with Finance', institution: 'Westminster International University in Tashkent', period: '2017 — 2020' },
  { degree: 'CIFS Certificate', institution: 'Westminster International University in Tashkent', period: '2016 — 2017' },
];

const expertiseItems = [
  { icon: Calculator, index: '01', title: 'Accounting', description: 'Financial management, budgeting, reporting, strategic planning and business operations.' },
  { icon: BarChart3, index: '02', title: 'Data Analytics', description: 'Data visualization, business intelligence, dashboard development and analytical problem solving.' },
  { icon: Cpu, index: '03', title: 'AI Development', description: 'Artificial intelligence solutions, automation systems, machine learning and innovative software products.' },
];

export function AboutSection() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [profileImage, setProfileImage] = useState('https://i.ibb.co/qLBXnVdk/image.jpg');

  useEffect(() => {
    Promise.all([
      supabase.from('skills').select('*').eq('published', true).order('order_index'),
      supabase.from('experiences').select('*').eq('published', true).order('order_index'),
      supabase.from('education').select('*').eq('published', true).order('order_index'),
      supabase.from('certificates').select('*').eq('published', true).order('order_index'),
      supabase.from('site_settings').select('value').eq('key', 'profile_image_url').maybeSingle(),
    ]).then(([skillsResult, experienceResult, educationResult, certificatesResult, imageResult]) => {
      setSkills((skillsResult.data as Skill[] | null) || []);
      setExperiences((experienceResult.data as Experience[] | null) || []);
      setEducation((educationResult.data as Education[] | null) || []);
      setCertificates((certificatesResult.data as Certificate[] | null) || []);
      if (imageResult.data?.value) setProfileImage(imageResult.data.value);
    });
  }, []);

  const displayedEducation = education.length
    ? education.map(item => ({
        degree: item.degree,
        institution: item.institution,
        period: `${item.start_date?.slice(0, 4) || '—'} — ${item.end_date?.slice(0, 4) || 'Present'}`,
      }))
    : educationItems;

  const displayedExpertise = skills.length
    ? skills.map((item, index) => ({
        icon: item.category.toLowerCase().includes('data')
          ? BarChart3
          : item.category.toLowerCase().includes('account')
            ? Calculator
            : Cpu,
        index: String(index + 1).padStart(2, '0'),
        title: item.name,
        description: item.description || item.category,
      }))
    : expertiseItems;

  return (
    <section id="about" className="story-section about-story">
      <motion.header
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.9, ease: EASE }}
        className="story-heading"
      >
        <span className="story-eyebrow">
          <ScanFace className="h-4 w-4" />
          {t('about.subtitle')}
        </span>
        <h2>{t('about.title')}</h2>
        <p>One perspective shaped by finance, analytical thinking and intelligent technology.</p>
      </motion.header>

      <div className="about-composition">
        <motion.article
          initial={{ opacity: 0, x: -50, rotate: -2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: EASE }}
          className="about-portrait-card"
        >
          <Image
            src={profileImage}
            alt="Portrait of Jahongir Murtazaev"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover object-top"
            priority={false}
          />
          <div className="about-portrait-overlay" />
          <div className="about-portrait-label">
            <span>JAHONGIR</span>
            <small>FINANCE · DATA · AI</small>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
          className="about-contact-card"
        >
          <div className="about-card-header">
            <Mail className="h-5 w-5" />
            <span>Identity / Contact</span>
          </div>
          <div className="space-y-7">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="about-data-row">
                <Icon className="h-4 w-4" />
                <div>
                  <span>{label}</span>
                  {href ? <a href={href}>{value}</a> : <p>{value}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="about-education-card"
        >
          <div className="about-card-header">
            <GraduationCap className="h-5 w-5" />
            <span>Academic trajectory</span>
          </div>
          <div className="space-y-9">
            {displayedEducation.map(item => (
              <div key={item.degree} className="education-entry">
                <span>{item.period}</span>
                <h3>{item.degree}</h3>
                <p><Building2 className="h-3.5 w-3.5" />{item.institution}</p>
              </div>
            ))}
          </div>
        </motion.article>
      </div>

      <div className="expertise-strip">
        {displayedExpertise.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: EASE }}
              whileHover={{ y: -10, rotateZ: index === 1 ? 0.6 : -0.6 }}
              className="expertise-card"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-cyan-300" />
                <span>{item.index}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.article>
          );
        })}
      </div>

      {experiences.length > 0 && (
        <div className="about-dynamic-section">
          <div className="about-card-header">
            <BriefcaseBusiness className="h-5 w-5" />
            <span>Professional experience</span>
          </div>
          <div className="about-dynamic-grid">
            {experiences.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: EASE }}
                className="about-dynamic-card"
              >
                <span>{item.start_date?.slice(0, 4) || '—'} — {item.current ? 'Present' : item.end_date?.slice(0, 4) || '—'}</span>
                <h3>{item.role}</h3>
                <h4>{item.company}</h4>
                {item.description && <p>{item.description}</p>}
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {certificates.length > 0 && (
        <div className="about-dynamic-section">
          <div className="about-card-header">
            <Award className="h-5 w-5" />
            <span>Certificates</span>
          </div>
          <div className="about-dynamic-grid">
            {certificates.map(item => (
              <article key={item.id} className="about-dynamic-card">
                <span>{item.issue_date?.slice(0, 4) || 'Credential'}</span>
                <h3>{item.title}</h3>
                <h4>{item.issuer}</h4>
                {item.credential_url && (
                  <a href={item.credential_url} target="_blank" rel="noopener noreferrer">
                    Verify <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
