import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/language';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { BlogPost, ContactMessage, Project, SiteSetting } from '../lib/supabase';
import {
  LayoutDashboard, FileText, MessageSquare, Settings, LogOut,
  Plus, Pencil, Trash2, Check, X, Eye, EyeOff, Shield,
  Mail, Globe, Loader2, ChevronRight, Upload, Search, Home,
  Wrench, BriefcaseBusiness, GraduationCap, Award, Images, FileUser
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RichTextEditor } from './admin/RichTextEditor';
import {
  MediaLibraryManager,
  ResumeManager,
  StructuredContentManager,
} from './admin/AdminContentManagers';

type Section =
  | 'dashboard'
  | 'home'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certificates'
  | 'blog'
  | 'gallery'
  | 'media'
  | 'resume'
  | 'messages'
  | 'settings'
  | 'seo';

function ImageUploader({ label, settingKey, onUpload }: { label: string; settingKey: string; onUpload?: (url: string) => void }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', settingKey)
      .single()
      .then(({ data }) => {
        if (data?.value) setCurrentUrl(data.value);
      });
  }, [settingKey]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${settingKey}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

    await supabase
      .from('site_settings')
      .upsert({ key: settingKey, value: publicUrl }, { onConflict: 'key' });

    setCurrentUrl(publicUrl);
    onUpload?.(publicUrl);
    setUploading(false);
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-content-secondary">{label}</h4>
        {currentUrl && (
          <button
            onClick={async () => {
              await supabase.from('site_settings').upsert({ key: settingKey, value: null }, { onConflict: 'key' });
              setCurrentUrl(null);
            }}
            className="text-xs text-content-tertiary hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {currentUrl ? (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-secondary">
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <div className="btn-ghost text-sm">Replace</div>
            </label>
          </div>
        </div>
      ) : (
        <label className="block aspect-video image-placeholder rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="w-full h-full flex flex-col items-center justify-center">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-content-tertiary animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-content-tertiary mb-2" />
                <span className="text-sm text-content-tertiary">Click to upload</span>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}

function SEOManger() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .in('key', [
        'site_title',
        'site_description',
        'site_url',
        'og_image',
        'twitter_handle',
        'google_site_verification',
      ])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach(s => { if (s.value) map[s.key] = s.value; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-content-primary">{t('admin.seo')}</h3>
        <button onClick={save} disabled={saving} className="btn-premium text-sm">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-content-secondary mb-2">Site Title</label>
            <input
              className="form-input"
              value={settings.site_title || ''}
              onChange={e => setSettings(s => ({ ...s, site_title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-content-secondary mb-2">Site Description</label>
            <textarea
              className="form-input min-h-[100px]"
              value={settings.site_description || ''}
              onChange={e => setSettings(s => ({ ...s, site_description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-content-secondary mb-2">Canonical Site URL</label>
            <input
              className="form-input"
              type="url"
              value={settings.site_url || 'https://jahongirai.uz'}
              onChange={e => setSettings(s => ({ ...s, site_url: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-content-secondary mb-2">Twitter / X Handle</label>
              <input
                className="form-input"
                value={settings.twitter_handle || ''}
                onChange={e => setSettings(s => ({ ...s, twitter_handle: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-content-secondary mb-2">Google Site Verification</label>
              <input
                className="form-input"
                value={settings.google_site_verification || ''}
                onChange={e => setSettings(s => ({ ...s, google_site_verification: e.target.value }))}
              />
            </div>
          </div>
          <ImageUploader label="OG Image (Social Preview)" settingKey="og_image" />
        </div>
      )}
    </div>
  );
}

function HomeManager() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .in('key', ['hero_title', 'hero_intro'])
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data?.forEach(s => { if (s.value) map[s.key] = s.value; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-content-primary">{t('admin.home')}</h3>
        <button onClick={save} disabled={saving} className="btn-premium text-sm">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-content-secondary mb-2">Hero Title</label>
            <input
              className="form-input"
              value={settings.hero_title || ''}
              onChange={e => setSettings(s => ({ ...s, hero_title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-content-secondary mb-2">Hero Introduction</label>
            <textarea
              className="form-input min-h-[120px]"
              value={settings.hero_intro || ''}
              onChange={e => setSettings(s => ({ ...s, hero_intro: e.target.value }))}
            />
          </div>
          <ImageUploader label={t('admin.profilePhoto')} settingKey="profile_image_url" />
        </div>
      )}
    </div>
  );
}

function BlogManager() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('blog_posts').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id);
    } else {
      const slug = editing.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || Date.now().toString();
      await supabase.from('blog_posts').insert({ ...editing, slug, content: editing.content || '', title: editing.title || '' });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id);
    load();
  };

  const deletePost = async (id: string) => {
    if (!confirm(t('admin.confirm') as string)) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    load();
  };

  if (editing !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-content-primary">{editing.id ? t('admin.edit') : t('admin.add')} Post</h3>
          <button onClick={() => setEditing(null)} className="text-content-tertiary hover:text-content-secondary"><X className="w-5 h-5" /></button>
        </div>
        <input className="form-input" placeholder="Title" value={editing.title || ''} onChange={e => setEditing(prev => ({ ...prev, title: e.target.value }))} />
        <input className="form-input" placeholder="Excerpt" value={editing.excerpt || ''} onChange={e => setEditing(prev => ({ ...prev, excerpt: e.target.value }))} />
        <input className="form-input" placeholder="Cover image URL from Media Library" value={editing.cover_image || ''} onChange={e => setEditing(prev => ({ ...prev, cover_image: e.target.value }))} />
        <RichTextEditor
          value={editing.content || ''}
          onChange={content => setEditing(prev => ({ ...prev, content }))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="form-input" placeholder="SEO title" value={editing.seo_title || ''} onChange={e => setEditing(prev => ({ ...prev, seo_title: e.target.value }))} />
          <input className="form-input" placeholder="Canonical URL" value={editing.canonical_url || ''} onChange={e => setEditing(prev => ({ ...prev, canonical_url: e.target.value }))} />
          <textarea className="form-input min-h-24 md:col-span-2" placeholder="SEO description" value={editing.seo_description || ''} onChange={e => setEditing(prev => ({ ...prev, seo_description: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
          <input type="checkbox" checked={editing.published || false} onChange={e => setEditing(prev => ({ ...prev, published: e.target.checked }))} className="rounded" />
          Published
        </label>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-premium inline-flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t('admin.save')}
          </button>
          <button onClick={() => setEditing(null)} className="btn-ghost">{t('admin.cancel')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-content-primary">{t('admin.blog')}</h3>
        <button onClick={() => setEditing({})} className="btn-premium inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('admin.add')}
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-content-secondary animate-spin" /></div>
      ) : posts.length === 0 ? (
        <p className="text-content-tertiary text-center py-8">{t('admin.noData')}</p>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="glass-card rounded-xl border border-border p-4 flex items-center gap-4">
              <FileText className="w-5 h-5 text-content-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-content-primary truncate">{post.title}</div>
                <div className="text-xs text-content-tertiary">{new Date(post.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {post.published ? 'Published' : 'Draft'}
              </span>
              <div className="flex gap-2">
                <button onClick={() => togglePublish(post)} className="p-1.5 text-content-tertiary hover:text-content-secondary transition-colors">
                  {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(post)} className="p-1.5 text-content-tertiary hover:text-content-secondary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deletePost(post.id)} className="p-1.5 text-content-tertiary hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesManager() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, []);

  const deleteMsg = async (id: string) => {
    if (!confirm(t('admin.confirm') as string)) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(m => m.filter(msg => msg.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-content-tertiary hover:text-content-secondary">
          <X className="w-4 h-4" /> Back
        </button>
        <div className="glass-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-content-primary">{selected.subject}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-content-tertiary mb-1">From</div><div className="text-content-primary">{selected.name}</div></div>
            <div><div className="text-content-tertiary mb-1">Email</div><div className="text-sky-400">{selected.email}</div></div>
          </div>
          <div><div className="text-content-tertiary mb-2 text-sm">Message</div><div className="text-content-secondary leading-relaxed">{selected.message}</div></div>
          <button onClick={() => deleteMsg(selected.id)} className="btn-ghost text-red-400 text-sm inline-flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-content-primary">{t('admin.messages')}</h3>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-content-secondary animate-spin" /></div>
      ) : messages.length === 0 ? (
        <p className="text-content-tertiary text-center py-8">{t('admin.noData')}</p>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className="glass-card rounded-xl border border-border p-4 flex items-center gap-4 cursor-pointer hover:border-border-hover transition-all"
              onClick={() => setSelected(msg)}
            >
              <Mail className="w-5 h-5 text-content-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-content-primary">{msg.name}</div>
                <div className="text-sm text-content-tertiary truncate">{msg.subject}</div>
              </div>
              <div className="text-xs text-content-tertiary flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</div>
              <ChevronRight className="w-4 h-4 text-content-tertiary" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsManager() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('projects').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('projects').insert({ ...editing, title: editing.title || '', description: editing.description || '' });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const deleteProject = async (id: string) => {
    if (!confirm(t('admin.confirm') as string)) return;
    await supabase.from('projects').delete().eq('id', id);
    load();
  };

  if (editing !== null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-content-primary">{editing.id ? t('admin.edit') : t('admin.add')} Project</h3>
          <button onClick={() => setEditing(null)} className="text-content-tertiary hover:text-content-secondary"><X className="w-5 h-5" /></button>
        </div>
        <input className="form-input" placeholder="Title" value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
        <textarea className="form-input min-h-[100px]" placeholder="Description" value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
        <input className="form-input" placeholder="Link (optional)" value={editing.link || ''} onChange={e => setEditing(p => ({ ...p, link: e.target.value }))} />
        <input className="form-input" placeholder="Image URL from Media Library" value={editing.image_url || ''} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))} />
        <input className="form-input" placeholder="Tags (comma separated)" value={(editing.tags || []).join(', ')} onChange={e => setEditing(p => ({ ...p, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
        <select className="form-input" value={editing.status || 'draft'} onChange={e => setEditing(p => ({ ...p, status: e.target.value }))}>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
          <input type="checkbox" checked={editing.featured || false} onChange={e => setEditing(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-content-secondary cursor-pointer">
          <input type="checkbox" checked={editing.published ?? true} onChange={e => setEditing(p => ({ ...p, published: e.target.checked }))} className="rounded" />
          Published
        </label>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn-premium inline-flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {t('admin.save')}
          </button>
          <button onClick={() => setEditing(null)} className="btn-ghost">{t('admin.cancel')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-content-primary">{t('admin.projects')}</h3>
        <button onClick={() => setEditing({})} className="btn-premium inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {t('admin.add')}
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-content-secondary animate-spin" /></div>
      ) : projects.length === 0 ? (
        <p className="text-content-tertiary text-center py-8">{t('admin.noData')}</p>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="glass-card rounded-xl border border-border p-4 flex items-center gap-4">
              <Globe className="w-5 h-5 text-content-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-content-primary truncate">{p.title}</div>
                <div className="text-xs text-content-tertiary capitalize">{p.status}{p.featured ? ' • Featured' : ''}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="p-1.5 text-content-tertiary hover:text-content-secondary transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProject(p.id)} className="p-1.5 text-content-tertiary hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsManager() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .like('key', 'social_%')
      .then(({ data }) => {
        setSettings(data || []);
        setLoading(false);
      });
  }, []);

  const updateLocal = (id: string, value: string) => {
    setSettings(s => s.map(item => item.id === id ? { ...item, value } : item));
  };

  const saveSetting = async (setting: SiteSetting) => {
    await supabase
      .from('site_settings')
      .update({ value: setting.value, updated_at: new Date().toISOString() })
      .eq('id', setting.id);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-content-primary">{t('admin.settings')}</h3>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-content-secondary">Social Links</h4>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-content-secondary animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {settings.map(s => (
              <div key={s.id} className="flex gap-3 items-center">
                <div className="w-28 text-sm text-content-tertiary capitalize">{s.key.replace('social_', '')}</div>
                <input
                  className="form-input flex-1"
                  value={s.value || ''}
                  onChange={e => updateLocal(s.id, e.target.value)}
                  onBlur={() => saveSetting(s)}
                  placeholder={`https://${s.key.replace('social_', '')}.com`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <ImageUploader label={t('admin.footerLogo')} settingKey="footer_logo_url" />
      </div>
    </div>
  );
}

function Dashboard({ stats }: { stats: { posts: number; messages: number; projects: number } }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-content-primary">Dashboard</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl border border-border p-6 text-center">
          <FileText className="w-5 h-5 text-content-tertiary mx-auto mb-2" />
          <div className="text-2xl font-bold text-content-primary">{stats.posts}</div>
          <div className="text-xs text-content-tertiary">Blog Posts</div>
        </div>
        <div className="glass-card rounded-xl border border-border p-6 text-center">
          <Mail className="w-5 h-5 text-content-tertiary mx-auto mb-2" />
          <div className="text-2xl font-bold text-content-primary">{stats.messages}</div>
          <div className="text-xs text-content-tertiary">Messages</div>
        </div>
        <div className="glass-card rounded-xl border border-border p-6 text-center">
          <Globe className="w-5 h-5 text-content-tertiary mx-auto mb-2" />
          <div className="text-2xl font-bold text-content-primary">{stats.projects}</div>
          <div className="text-xs text-content-tertiary">Projects</div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn(email, password);
    if (res.error) setError(res.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="glass-card rounded-2xl border border-border p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center">
            <Shield className="w-5 h-5 text-content-tertiary" />
          </div>
          <h1 className="text-lg font-bold text-content-primary">{t('admin.title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-content-secondary mb-2">{t('admin.email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-content-secondary mb-2">{t('admin.password')}</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="text-sm text-red-400 text-center">{error}</div>}

          <button type="submit" disabled={loading} className="btn-premium w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.login')}
          </button>
          <p className="text-xs leading-relaxed text-content-tertiary text-center">
            Admin accounts are provisioned securely through Supabase.
          </p>
        </form>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const [section, setSection] = useState<Section>('dashboard');
  const [stats, setStats] = useState({ posts: 0, messages: 0, projects: 0 });
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Safety net: if auth loading takes >5s, show login instead of spinning forever
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => clearTimeout(id);
  }, [loading]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
    ]).then(([a, b, c]) => {
      setStats({ posts: a.count || 0, messages: b.count || 0, projects: c.count || 0 });
    });
  }, [isAdmin]);

  if (loading && !loadingTimedOut) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-content-secondary animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <div className="glass-card rounded-2xl border border-red-500/20 p-8 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-content-primary mb-2">{t('admin.accessDenied')}</h2>
          <p className="text-content-tertiary mb-4 text-sm">Your account needs admin role.</p>
          <button onClick={() => signOut()} className="btn-ghost text-sm">{t('admin.logout')}</button>
        </div>
      </div>
    );
  }

  const navItems: { id: Section; icon: LucideIcon; label: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('admin.dashboard') as string },
    { id: 'home', icon: Home, label: t('admin.home') as string },
    { id: 'projects', icon: Globe, label: t('admin.projects') as string },
    { id: 'skills', icon: Wrench, label: 'Skills' },
    { id: 'experience', icon: BriefcaseBusiness, label: 'Experience' },
    { id: 'education', icon: GraduationCap, label: 'Education' },
    { id: 'certificates', icon: Award, label: 'Certificates' },
    { id: 'blog', icon: FileText, label: t('admin.blog') as string },
    { id: 'gallery', icon: Images, label: 'Gallery' },
    { id: 'media', icon: Images, label: 'Media' },
    { id: 'resume', icon: FileUser, label: 'Resume' },
    { id: 'messages', icon: MessageSquare, label: t('admin.messages') as string },
    { id: 'settings', icon: Settings, label: t('admin.settings') as string },
    { id: 'seo', icon: Search, label: t('admin.seo') as string },
  ];

  return (
    <div className="min-h-screen bg-surface-primary grid-bg">
      <div className="max-container section-padding">
        <div className="flex gap-8">
          <aside className="w-52 flex-shrink-0 hidden md:block">
            <div className="glass-card max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-border p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-6 p-2">
                <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-border flex items-center justify-center">
                  <Shield className="w-4 h-4 text-content-tertiary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-content-secondary">Admin</div>
                  <div className="text-xs text-content-tertiary truncate max-w-[100px]">{user.email}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setSection(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      section === id
                        ? 'bg-surface-elevated text-content-primary'
                        : 'text-content-tertiary hover:text-content-secondary hover:bg-surface-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-content-tertiary hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  {t('admin.logout')}
                </button>
              </div>
            </div>
          </aside>

          <div className="md:hidden w-full mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {navItems.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    section === id
                      ? 'bg-surface-elevated text-content-primary border border-border'
                      : 'text-content-tertiary border border-border hover:text-content-secondary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <div className="glass-card rounded-2xl border border-border p-6">
              {section === 'dashboard' && <Dashboard stats={stats} />}
              {section === 'home' && <HomeManager />}
              {section === 'skills' && <StructuredContentManager kind="skills" />}
              {section === 'experience' && <StructuredContentManager kind="experiences" />}
              {section === 'education' && <StructuredContentManager kind="education" />}
              {section === 'certificates' && <StructuredContentManager kind="certificates" />}
              {section === 'blog' && <BlogManager />}
              {section === 'gallery' && <StructuredContentManager kind="gallery" />}
              {section === 'media' && <MediaLibraryManager />}
              {section === 'resume' && <ResumeManager />}
              {section === 'messages' && <MessagesManager />}
              {section === 'projects' && <ProjectsManager />}
              {section === 'settings' && <SettingsManager />}
              {section === 'seo' && <SEOManger />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
