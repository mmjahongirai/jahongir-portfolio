import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/language';
import { supabase } from '../lib/supabase';
import { Mail, Send, Check, AlertCircle, Camera, MessageCircle, Users, MessageSquare, Radio } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FormInput, FormTextarea } from './ui/FormInput';

const EASING = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASING, delay } },
});

const socialIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  telegram: MessageCircle,
  facebook: Users,
  twitter: MessageSquare,
};

export function ContactSection() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .like('key', 'social_%')
      .then(({ data }) => {
        const links: Record<string, string> = {};
        data?.forEach(s => { if (s.value) links[s.key.replace('social_', '')] = s.value; });
        setSocialLinks(links);
      });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.name.trim()) errs.name = t('contact.required') as string;
    if (!formState.email.trim()) {
      errs.email = t('contact.required') as string;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errs.email = t('contact.invalidEmail') as string;
    }
    if (!formState.subject.trim()) errs.subject = t('contact.required') as string;
    if (!formState.message.trim()) errs.message = t('contact.required') as string;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus('sending');
    const { error } = await supabase.from('contact_messages').insert(formState);
    if (error) { setStatus('error'); } else {
      setStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const socials = Object.entries(socialLinks).map(([name, href]) => ({
    icon: socialIcons[name] || Mail, label: name.charAt(0).toUpperCase() + name.slice(1), href,
  }));

  return (
    <section id="contact" className="story-section contact-story">
      <div className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp()}
          className="story-heading"
        >
          <span className="story-eyebrow">
            <Radio className="h-4 w-4" />
            {t('contact.subtitle')}
          </span>
          <h2>{t('contact.title')}</h2>
          <p>Have an idea, a challenge or an opportunity? Let’s turn it into a meaningful result.</p>
        </motion.div>

        <div className="contact-composition">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp(0.05)}
          >
            <Card className="contact-form-card p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput
                    name="name"
                    label={t('contact.name') as string}
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Jahongir Murtazaev"
                    error={errors.name}
                  />
                  <FormInput
                    name="email"
                    type="email"
                    label={t('contact.email') as string}
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    error={errors.email}
                  />
                </div>
                <FormInput
                  name="subject"
                  label={t('contact.subject') as string}
                  value={formState.subject}
                  onChange={handleChange}
                  placeholder="Project inquiry"
                  error={errors.subject}
                />
                <FormTextarea
                  name="message"
                  label={t('contact.message') as string}
                  value={formState.message}
                  onChange={handleChange}
                  className="min-h-[160px] resize-y"
                  placeholder="Your message..."
                  error={errors.message}
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={status === 'sending'}
                  className={`w-full ${status === 'sending' ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('contact.success')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('contact.send')}</span>
                    </>
                  )}
                </Button>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {t('contact.error')}
                  </div>
                )}
              </form>
            </Card>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp(0.15)}
            className="contact-side space-y-6"
          >
            <Card className="p-8">
              <a href="mailto:mega.murtazayev@mail.ru" className="flex items-center gap-4 mb-6 group">
                <div className="w-12 h-12 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center group-hover:bg-accent-yellow/20 transition-all duration-300 flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent-yellow" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-content-tertiary uppercase tracking-wide font-semibold mb-1">Email</div>
                  <div className="text-content-primary font-semibold text-sm sm:text-base break-all group-hover:text-accent-yellow transition-colors duration-300">
                    mega.murtazayev@mail.ru
                  </div>
                </div>
              </a>

              <div className="pt-6 border-t border-border">
                <div className="text-xs text-content-tertiary uppercase tracking-wide font-semibold mb-4">Follow</div>
                <div className="flex flex-wrap gap-2">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-btn" data-magnetic data-cursor-hover aria-label={label}>
                      <Icon className="w-4.5 h-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="status-dot" />
                <span className="text-sm text-content-secondary">Available for new projects</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
