'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo, Minus, Quote, Link } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const isInternalChange = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: placeholder || '在此输入内容...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
  });

  // 同步外部 value 变化到编辑器（例如打开弹窗加载已有数据）
  useEffect(() => {
    if (editor && !isInternalChange.current) {
      const currentHTML = editor.getHTML();
      if (value !== currentHTML) {
        editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
      }
    }
    isInternalChange.current = false;
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50 flex items-center justify-center text-gray-400">
        加载编辑器中...
      </div>
    );
  }

  const toolbarButtons = [
    {
      icon: <Heading1 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: '标题 1',
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: '标题 2',
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: '标题 3',
    },
    { type: 'divider' },
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: '粗体',
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: '斜体',
    },
    { type: 'divider' },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: '无序列表',
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: '有序列表',
    },
    {
      icon: <Quote className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: '引用',
    },
    { type: 'divider' },
    {
      icon: <Minus className="w-4 h-4" />,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
      title: '分割线',
    },
    { type: 'divider' },
    {
      icon: <Link className="w-4 h-4" />,
      onClick: () => {
        const url = prompt('输入链接地址：');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive('link'),
      title: '链接',
    },
    { type: 'divider' },
    {
      icon: <Undo className="w-4 h-4" />,
      onClick: () => editor.chain().focus().undo().run(),
      isActive: false,
      title: '撤销',
    },
    {
      icon: <Redo className="w-4 h-4" />,
      onClick: () => editor.chain().focus().redo().run(),
      isActive: false,
      title: '重做',
    },
  ];

  const colors = ['#000000', '#8B4513', '#D4A574', '#2563EB', '#DC2626', '#16A34A', '#9333EA'];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn, index) => {
          if (btn.type === 'divider') {
            return <div key={index} className="w-px h-5 bg-gray-300 mx-1" />;
          }
          return (
            <button
              key={index}
              onClick={btn.onClick}
              title={btn.title}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                btn.isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-600'
              }`}
            >
              {btn.icon}
            </button>
          );
        })}
        
        {/* 颜色选择器 */}
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-300">
          <span className="text-xs text-gray-500">颜色:</span>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 编辑区域 */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}
