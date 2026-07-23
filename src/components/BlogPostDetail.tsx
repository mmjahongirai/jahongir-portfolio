'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const EASING = [0.16, 1, 0.3, 1] as const;

function sanitizeArticleHtml(html: string) {
  if (typeof window === 'undefined') return '';
  const documentNode = new DOMParser().parseFromString(html, 'text/html');
  documentNode.querySelectorAll('script, style, iframe, object, embed, form').forEach(node => node.remove());
  documentNode.querySelectorAll('*').forEach(node => {
    [...node.attributes].forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && value.startsWith('javascript:'))) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return documentNode.body.innerHTML;
}

export function BlogPostDetail({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const articleHtml = useMemo(() => sanitizeArticleHtml(post?.content || ''), [post?.content]);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-accent-yellow animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="text-center space-y-5">
          <h1 className="text-2xl font-bold text-content-primary">Article Not Found</h1>
          <p className="text-content-tertiary">This article doesn't exist or has been removed.</p>
          <Button variant="ghost" to="/blog" className="inline-flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASING }}
        className="relative max-container section-padding pt-28 md:pt-32"
      >
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-content-tertiary hover:text-accent-yellow transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          {t('blog.title')}
        </Link>

        <article className="max-w-2xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center gap-4 text-sm text-content-tertiary mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {Math.ceil(post.content.length / 1000)} min read
              </span>
            </div>
            <h1 className="text-display-sm md:text-display-md font-bold text-content-primary tracking-tight mb-5">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-content-secondary leading-relaxed">{post.excerpt}</p>
            )}
          </header>

          <Card className="p-8 md:p-10">
            <div
              className="tiptap-content text-lg"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          </Card>
        </article>
      </motion.div>
    </div>
  );
}
