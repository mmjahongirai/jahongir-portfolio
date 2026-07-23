'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Code2,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write the article…' }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-content min-h-[280px] px-5 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[330px] animate-pulse rounded-2xl bg-surface-secondary" />;
  }

  const setLink = () => {
    const current = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Link URL', current || 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const addImage = () => {
    const src = window.prompt('Public image URL');
    if (!src?.trim()) return;
    const alt = window.prompt('Image description') || '';
    editor.chain().focus().setImage({ src, alt }).run();
  };

  const tools = [
    { label: 'Bold', icon: Bold, active: editor.isActive('bold'), action: () => editor.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: Italic, active: editor.isActive('italic'), action: () => editor.chain().focus().toggleItalic().run() },
    { label: 'Strike', icon: Strikethrough, active: editor.isActive('strike'), action: () => editor.chain().focus().toggleStrike().run() },
    { label: 'Heading', icon: Heading2, active: editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Bullet list', icon: List, active: editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Ordered list', icon: ListOrdered, active: editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', icon: Quote, active: editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Code', icon: Code2, active: editor.isActive('codeBlock'), action: () => editor.chain().focus().toggleCodeBlock().run() },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-secondary/40">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {tools.map(({ label, icon: Icon, active, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`admin-editor-tool ${active ? 'is-active' : ''}`}
            aria-label={label}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button type="button" onClick={setLink} className={`admin-editor-tool ${editor.isActive('link') ? 'is-active' : ''}`} aria-label="Add link">
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={addImage} className="admin-editor-tool" aria-label="Add image">
          <ImagePlus className="h-4 w-4" />
        </button>
        <span className="mx-1 w-px bg-border" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="admin-editor-tool" aria-label="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="admin-editor-tool" aria-label="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
