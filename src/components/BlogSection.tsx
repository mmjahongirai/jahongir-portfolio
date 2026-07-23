'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/language';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/supabase';
import { BookOpen, Loader2, Sparkles, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';

const EASING = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASING, delay } },
});

export function BlogSection() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { setPosts(data || []); setLoading(false); });
  }, []);

  return (
    <section id="blog" className="story-section blog-story">
      <div className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp()}
          className="story-heading"
        >
          <span className="story-eyebrow">
            <BookOpen className="h-4 w-4" />
            {t('blog.subtitle')}
          </span>
          <h2>{t('blog.title')}</h2>
          <p>Ideas, observations and practical thinking from the intersection of business and technology.</p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-accent-yellow animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-12">
            {posts.length === 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp()}
                className="max-w-2xl mx-auto"
              >
                <Card glow className="p-10 md:p-16 text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-6 h-6 text-accent-yellow animate-pulse" />
                  </div>
                  <h3 className="text-display-sm font-bold text-content-primary mb-4">{t('blog.launching')}</h3>
                  <p className="text-content-tertiary max-w-lg mx-auto leading-relaxed">{t('blog.description')}</p>
                </Card>
              </motion.div>
            )}

            {posts.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                className="blog-stream"
              >
                {posts.map((post, index) => (
                  <motion.div key={post.id} variants={fadeUp()} className={`blog-story-item blog-story-item-${index + 1}`}>
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <Card hover className="blog-story-card overflow-hidden h-full">
                        <div className="p-7">
                          <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-6 group-hover:bg-accent-yellow/10 group-hover:border-accent-yellow/20 transition-all duration-300">
                            <BookOpen className="w-4.5 h-4.5 text-accent-blue group-hover:text-accent-yellow transition-colors duration-300" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-content-tertiary mb-3">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                          <h4 className="text-base font-semibold text-content-primary mb-3 group-hover:text-accent-yellow transition-colors duration-300">
                            {post.title}
                          </h4>
                          <p className="text-sm text-content-tertiary line-clamp-2 mb-4 leading-relaxed">
                            {post.excerpt || post.content.slice(0, 120)}...
                          </p>
                          <div className="flex items-center gap-1 text-content-tertiary text-sm group-hover:text-accent-yellow transition-colors duration-300">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">Read</span>
                            <ChevronRight className="w-4 h-4 -translate-x-2 group-hover:translate-x-0 transition-transform duration-300" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}

              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
