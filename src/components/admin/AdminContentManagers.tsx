'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clipboard,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ContentKind = 'skills' | 'experiences' | 'education' | 'certificates' | 'gallery';
type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'checkbox';
type FieldConfig = { name: string; label: string; type: FieldType; required?: boolean };
type Row = Record<string, unknown> & { id?: string; created_at?: string; updated_at?: string };

const configurations: Record<ContentKind, { title: string; fields: FieldConfig[] }> = {
  skills: {
    title: 'Skills',
    fields: [
      { name: 'name', label: 'Skill', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'level', label: 'Level (0–100)', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon name', type: 'text' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
  experiences: {
    title: 'Experience',
    fields: [
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'start_date', label: 'Start date', type: 'date' },
      { name: 'end_date', label: 'End date', type: 'date' },
      { name: 'current', label: 'Current role', type: 'checkbox' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
  education: {
    title: 'Education',
    fields: [
      { name: 'degree', label: 'Degree', type: 'text', required: true },
      { name: 'institution', label: 'Institution', type: 'text', required: true },
      { name: 'field', label: 'Field', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'start_date', label: 'Start date', type: 'date' },
      { name: 'end_date', label: 'End date', type: 'date' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
  certificates: {
    title: 'Certificates',
    fields: [
      { name: 'title', label: 'Certificate', type: 'text', required: true },
      { name: 'issuer', label: 'Issuer', type: 'text', required: true },
      { name: 'issue_date', label: 'Issue date', type: 'date' },
      { name: 'credential_url', label: 'Credential URL', type: 'url' },
      { name: 'image_url', label: 'Image URL from Media Library', type: 'url' },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
  gallery: {
    title: 'Gallery',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'image_url', label: 'Image URL from Media Library', type: 'url', required: true },
      { name: 'alt_text', label: 'Accessible image description', type: 'text', required: true },
      { name: 'order_index', label: 'Order', type: 'number' },
      { name: 'published', label: 'Published', type: 'checkbox' },
    ],
  },
};

const initialRow = (kind: ContentKind): Row => {
  const row: Row = { published: true, order_index: 0 };
  if (kind === 'skills') row.level = 80;
  if (kind === 'experiences') row.current = false;
  return row;
};

const rowTitle = (row: Row) =>
  String(row.title || row.name || row.role || row.degree || row.company || 'Untitled');

export function StructuredContentManager({ kind }: { kind: ContentKind }) {
  const config = configurations[kind];
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from(kind)
      .select('*')
      .order('order_index', { ascending: true });
    setRows((data as Row[] | null) || []);
    setError(loadError?.message || '');
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    const missing = config.fields.find(field => field.required && !String(editing[field.name] || '').trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    setSaving(true);
    setError('');
    const payload = { ...editing };
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const result = editing.id
      ? await supabase.from(kind).update(payload).eq('id', editing.id)
      : await supabase.from(kind).insert(payload);

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setEditing(null);
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${config.title.toLowerCase()} record?`)) return;
    const { error: removeError } = await supabase.from(kind).delete().eq('id', id);
    if (removeError) setError(removeError.message);
    else await load();
  };

  if (editing) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-content-primary">
            {editing.id ? 'Edit' : 'Add'} {config.title}
          </h3>
          <button type="button" onClick={() => setEditing(null)} className="admin-editor-tool" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {config.fields.map(field => {
            const value = editing[field.name];
            if (field.type === 'checkbox') {
              return (
                <label key={field.name} className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm text-content-secondary">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={event => setEditing(current => ({ ...current, [field.name]: event.target.checked }))}
                  />
                  {field.label}
                </label>
              );
            }
            if (field.type === 'textarea') {
              return (
                <label key={field.name} className="md:col-span-2">
                  <span className="mb-2 block text-sm text-content-secondary">{field.label}</span>
                  <textarea
                    className="form-input min-h-28"
                    value={String(value || '')}
                    onChange={event => setEditing(current => ({ ...current, [field.name]: event.target.value }))}
                  />
                </label>
              );
            }
            return (
              <label key={field.name}>
                <span className="mb-2 block text-sm text-content-secondary">{field.label}</span>
                <input
                  className="form-input"
                  type={field.type}
                  min={field.name === 'level' ? 0 : undefined}
                  max={field.name === 'level' ? 100 : undefined}
                  value={value === null || value === undefined ? '' : String(value)}
                  onChange={event => setEditing(current => ({
                    ...current,
                    [field.name]: field.type === 'number'
                      ? Number(event.target.value)
                      : event.target.value,
                  }))}
                  required={field.required}
                />
              </label>
            );
          })}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-premium">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </button>
          <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-content-primary">{config.title}</h3>
        <button type="button" onClick={() => setEditing(initialRow(kind))} className="btn-premium text-sm">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-content-tertiary">No records yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <article key={String(row.id)} className="glass-card flex items-center gap-4 rounded-xl p-4">
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-content-primary">{rowTitle(row)}</h4>
                <p className="text-xs text-content-tertiary">
                  {row.published === false ? 'Draft' : 'Published'} · Order {String(row.order_index || 0)}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(row)} className="admin-editor-tool" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => remove(String(row.id))} className="admin-editor-tool hover:!text-red-400" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

type MediaRow = {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  file_type: string;
  mime_type: string | null;
  size_bytes: number | null;
  alt_text: string | null;
};

export function MediaLibraryManager() {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    setMedia((data as MediaRow[] | null) || []);
    setError(loadError?.message || '');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    setUploading(true);
    setError('');

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const storagePath = `library/${crypto.randomUUID()}.${extension}`;
      const { error: storageError } = await supabase.storage.from('media').upload(storagePath, file);
      if (storageError) {
        setError(storageError.message);
        continue;
      }

      const { data: publicData } = supabase.storage.from('media').getPublicUrl(storagePath);
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : file.type === 'application/pdf' ? 'document' : 'other';
      const { error: insertError } = await supabase.from('media').insert({
        file_name: file.name,
        file_url: publicData.publicUrl,
        storage_path: storagePath,
        file_type: fileType,
        mime_type: file.type,
        size_bytes: file.size,
      });
      if (insertError) setError(insertError.message);
    }

    setUploading(false);
    event.target.value = '';
    await load();
  };

  const remove = async (item: MediaRow) => {
    if (!window.confirm(`Delete ${item.file_name}?`)) return;
    await supabase.storage.from('media').remove([item.storage_path]);
    await supabase.from('media').delete().eq('id', item.id);
    await load();
  };

  const addToGallery = async (item: MediaRow) => {
    const altText = window.prompt('Accessible image description', item.alt_text || item.file_name);
    if (!altText) return;
    const { error: galleryError } = await supabase.from('gallery').insert({
      title: item.file_name,
      image_url: item.file_url,
      alt_text: altText,
      published: true,
    });
    setError(galleryError?.message || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-content-primary">Media Library</h3>
          <p className="mt-1 text-sm text-content-tertiary">Images, PDFs and optimized video assets.</p>
        </div>
        <label className="btn-premium cursor-pointer text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" multiple accept="image/*,application/pdf,video/mp4" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {media.map(item => (
          <article key={item.id} className="glass-card overflow-hidden rounded-2xl">
            <div className="flex aspect-video items-center justify-center bg-surface-secondary">
              {item.file_type === 'image' ? (
                <img src={item.file_url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-8 w-8 text-content-tertiary" />
              )}
            </div>
            <div className="space-y-3 p-4">
              <p className="truncate text-sm font-medium text-content-primary">{item.file_name}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(item.file_url)} className="admin-editor-tool" aria-label="Copy URL">
                  <Clipboard className="h-4 w-4" />
                </button>
                {item.file_type === 'image' && (
                  <button type="button" onClick={() => addToGallery(item)} className="admin-editor-tool" aria-label="Add to gallery">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => remove(item)} className="admin-editor-tool hover:!text-red-400" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type ResumeRow = {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  is_active: boolean;
};

export function ResumeManager() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const activeResume = useMemo(() => resumes.find(item => item.is_active), [resumes]);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
    setResumes((data as ResumeRow[] | null) || []);
    setError(loadError?.message || '');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Resume must be a PDF file.');
      return;
    }
    setUploading(true);
    setError('');
    const storagePath = `resume/${crypto.randomUUID()}.pdf`;
    const { error: storageError } = await supabase.storage.from('resumes').upload(storagePath, file);
    if (storageError) {
      setError(storageError.message);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from('resumes').getPublicUrl(storagePath);
    await supabase.from('resumes').update({ is_active: false }).eq('is_active', true);
    const { error: insertError } = await supabase.from('resumes').insert({
      file_name: file.name,
      file_url: publicData.publicUrl,
      storage_path: storagePath,
      is_active: true,
    });
    if (!insertError) {
      await supabase.from('site_settings').upsert({ key: 'resume_url', value: publicData.publicUrl }, { onConflict: 'key' });
    }
    setError(insertError?.message || '');
    setUploading(false);
    event.target.value = '';
    await load();
  };

  const activate = async (item: ResumeRow) => {
    await supabase.from('resumes').update({ is_active: false }).neq('id', item.id);
    await supabase.from('resumes').update({ is_active: true }).eq('id', item.id);
    await supabase.from('site_settings').upsert({ key: 'resume_url', value: item.file_url }, { onConflict: 'key' });
    await load();
  };

  const remove = async (item: ResumeRow) => {
    if (!window.confirm(`Delete ${item.file_name}?`)) return;
    await supabase.storage.from('resumes').remove([item.storage_path]);
    await supabase.from('resumes').delete().eq('id', item.id);
    if (item.is_active) {
      await supabase.from('site_settings').upsert({ key: 'resume_url', value: null }, { onConflict: 'key' });
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-content-primary">Resume</h3>
          <p className="mt-1 text-sm text-content-tertiary">
            {activeResume ? `Active: ${activeResume.file_name}` : 'No active resume.'}
          </p>
        </div>
        <label className="btn-premium cursor-pointer text-sm">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={upload} disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {resumes.map(item => (
          <article key={item.id} className="glass-card flex items-center gap-4 rounded-xl p-4">
            <FileText className="h-5 w-5 text-content-tertiary" />
            <span className="min-w-0 flex-1 truncate text-sm text-content-primary">{item.file_name}</span>
            {item.is_active ? (
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">Active</span>
            ) : (
              <button type="button" onClick={() => activate(item)} className="btn-ghost !min-h-8 !px-3 text-xs">Activate</button>
            )}
            <button type="button" onClick={() => remove(item)} className="admin-editor-tool hover:!text-red-400" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
