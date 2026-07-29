'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline, List, ListOrdered, Link2, Undo, Redo, Heading1, Heading2, Heading3, ImagePlus, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, label, maxLength }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      BulletList,
      OrderedList,
      ListItem,
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full min-h-[160px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors prose prose-lg max-w-none',
      },
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      // 压缩图片
      const { compressImageToFile } = await import('@/lib/imageUtils');
      const compressedFile = await compressImageToFile(file, 1920);

      // 上传到服务器
      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success && result.url) {
        // 在光标位置插入图片
        editor.chain().focus().setImage({ src: result.url }).run();
      } else {
        alert('图片上传失败：' + (result.error || '未知错误'));
      }
    } catch (error: any) {
      alert('图片上传失败：' + (error.message || '请重试'));
    } finally {
      setUploading(false);
      // 重置 input 以便可以重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-lg mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('underline') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().toggleLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded transition-colors ${editor.isActive('link') ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="插入图片"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}