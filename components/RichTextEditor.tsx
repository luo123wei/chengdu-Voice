'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Undo, Redo, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label: string;
  maxLength?: number;
}

export default function RichTextEditor({ value, onChange, label, maxLength = 5000 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html.length <= maxLength) {
        onChange(html);
      }
    },
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bold') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="加粗"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('italic') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('underline') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="下划线"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 1 }) ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="标题1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 2 }) ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="标题2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('heading', { level: 3 }) ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="标题3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('bulletList') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('orderedList') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="有序列表"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              disabled={!editor?.isEditable}
              className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${editor?.isActive('blockquote') ? 'bg-amber-100 text-amber-600' : 'text-gray-600'}`}
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.isEditable || !editor?.can().undo()}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
              title="撤销"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.isEditable || !editor?.can().redo()}
              className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
              title="重做"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="min-h-[200px] p-4">
          <EditorContent editor={editor} className="prose prose-sm max-w-none" />
        </div>
      </div>

      <p className="text-right text-xs text-gray-400">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
