'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Image, Music, Video, Save, X, FileText, Link as LinkIcon, RefreshCw, Clock, Calendar, Send } from 'lucide-react';
import Link from 'next/link';
import { categoryLabels } from '@/data/mockData';
import type { BlogPost } from '@/data/mockData';
import { useBlogs } from '@/hooks/useDataStore';
import RichTextEditor from '@/components/RichTextEditor';
import { generateSlug, ensureUniqueSlug } from '@/lib/slug';

type PublishMode = 'now' | 'scheduled';

export default function AdminBlogs() {
  const { blogs: posts, saveBlog, addBlog, deleteBlog } = useBlogs(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [publishMode, setPublishMode] = useState<PublishMode>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('14:25');
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    slug: '',
    content: '',
    contentEn: '',
    category: 'culture' as 'culture' | 'food' | 'travel' | 'art',
    images: [] as string[],
    audio: '',
    audioUploading: false,
    video: '',
    videoUploading: false,
    author: 'Chengdu-Voice',
  });

  const categories = [
    { value: 'all', label: { en: '全部', zh: '全部' } },
    { value: 'culture', label: { en: '文化 Culture', zh: '文化' } },
    { value: 'food', label: { en: '美食 Food', zh: '美食' } },
    { value: 'travel', label: { en: '旅行 Travel', zh: '旅行' } },
    { value: 'art', label: { en: '艺术 Art', zh: '艺术' } },
  ];

  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (autoSlug && formData.titleEn && !editingPost) {
      const generated = generateSlug(formData.titleEn);
      if (generated) {
        setFormData(prev => ({ ...prev, slug: generated }));
      }
    }
  }, [formData.titleEn, autoSlug, editingPost]);

  const handleAutoSlug = () => {
    if (formData.titleEn) {
      const existingSlugs = posts.filter(p => p.id !== editingPost?.id).map(p => p.slug);
      const generated = ensureUniqueSlug(generateSlug(formData.titleEn), existingSlugs);
      setFormData(prev => ({ ...prev, slug: generated }));
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setAutoSlug(false);
      setFormData({
        title: post.title,
        titleEn: post.titleEn,
        slug: post.slug,
        content: post.content || '<p></p>',
        contentEn: post.contentEn || '<p></p>',
        category: post.category,
        images: post.images,
        audio: post.audio || '',
        audioUploading: false,
        video: post.video || '',
        videoUploading: false,
        author: post.author || 'Chengdu-Voice',
      });
      if (post.scheduledAt) {
        const d = new Date(post.scheduledAt);
        setPublishMode('scheduled');
        setScheduleDate(d.toISOString().split('T')[0]);
        setScheduleTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      } else {
        setPublishMode('now');
        setScheduleDate('');
        setScheduleTime('14:25');
      }
    } else {
      setEditingPost(null);
      setAutoSlug(true);
      setFormData({
        title: '',
        titleEn: '',
        slug: '',
        content: '<p></p>',
        contentEn: '<p></p>',
        category: 'culture',
        images: [],
        audio: '',
        audioUploading: false,
        video: '',
        videoUploading: false,
        author: 'Chengdu-Voice',
      });
      setPublishMode('now');
      setScheduleDate('');
      setScheduleTime('14:25');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getMaxDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const buildScheduledAt = (): string | undefined => {
    if (publishMode !== 'scheduled') return undefined;
    if (!scheduleDate) return undefined;
    return new Date(`${scheduleDate}T${scheduleTime || '14:25'}:00`).toISOString();
  };

  const handleSave = () => {
    if (!formData.slug.trim()) {
      alert('Please set a URL slug for this article');
      return;
    }
    const scheduledAt = buildScheduledAt();
    const publishDate = publishMode === 'scheduled' && scheduledAt
      ? scheduledAt.split('T')[0]
      : new Date().toISOString().split('T')[0];
    if (editingPost) {
      saveBlog({ ...editingPost, ...formData, scheduledAt });
    } else {
      const existingSlugs = posts.map(p => p.slug);
      const uniqueSlug = ensureUniqueSlug(formData.slug, existingSlugs);
      addBlog({
        ...formData,
        slug: uniqueSlug,
        publishDate,
        views: 0,
        scheduledAt,
      });
    }
    handleCloseModal();
  };

  const getPostStatus = (post: BlogPost): { label: string; color: string } => {
    if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
      return { label: '已排期', color: 'bg-amber-100 text-gray-800' };
    }
    return { label: '已发布', color: 'bg-green-100 text-green-700' };
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteBlog(id);
    }
  };

  const MAX_IMAGES = 6;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = MAX_IMAGES - formData.images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      const { compressImageToFile } = await import('@/lib/imageUtils');

      for (const file of filesToUpload) {
        try {
          const compressedFile = await compressImageToFile(file, 1920);
          const formDataToSend = new FormData();
          formDataToSend.append('file', compressedFile);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formDataToSend,
          });
          const result = await response.json();
          if (result.success) {
            setFormData({ ...formData, images: [...formData.images, result.url] });
          }
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      }
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, audioUploading: true });

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, audio: result.url, audioUploading: false });
      }
    } catch (error) {
      console.error('Audio upload failed:', error);
      setFormData({ ...formData, audioUploading: false });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({ ...formData, videoUploading: true });

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, video: result.url, videoUploading: false });
      }
    } catch (error) {
      console.error('Video upload failed:', error);
      setFormData({ ...formData, videoUploading: false });
    }
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">博客管理</h1>
          <p className="text-gray-600 mt-1">管理您的博客文章</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加新文章
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none bg-white cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-medium">标题</th>
              <th className="px-6 py-4 text-left font-medium">分类</th>
              <th className="px-6 py-4 text-left font-medium">状态</th>
              <th className="px-6 py-4 text-left font-medium">媒体</th>
              <th className="px-6 py-4 text-left font-medium">日期</th>
              <th className="px-6 py-4 text-left font-medium">浏览量</th>
              <th className="px-6 py-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPosts.map((post) => {
              const status = getPostStatus(post);
              return (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{post.titleEn}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-amber-100 text-gray-800 text-sm rounded-full">
                      {categories.find(c => c.value === post.category)?.label.en}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {post.images.length > 0 && (
                        <span className="flex items-center text-xs text-gray-600">
                          <Image className="w-4 h-4 mr-1" />
                          图片
                        </span>
                      )}
                      {post.audio && (
                        <span className="flex items-center text-xs text-red-600">
                          <Music className="w-4 h-4 mr-1" />
                          音频
                        </span>
                      )}
                      {post.video && (
                        <span className="flex items-center text-xs text-green-600">
                          <Video className="w-4 h-4 mr-1" />
                          视频
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {post.scheduledAt && new Date(post.scheduledAt) > new Date()
                      ? post.scheduledAt.split('T')[0]
                      : post.publishDate}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{post.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleOpenModal(post)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到文章</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-serif font-bold text-gray-800">
                {editingPost ? '编辑文章' : '添加新文章'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题 (英文) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="Article Title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                  {autoSlug && !editingPost && (
                    <span className="text-xs text-green-600">Auto-generated from title</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/blog/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => {
                        setAutoSlug(false);
                        setFormData({ ...formData, slug: e.target.value });
                      }}
                      className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors font-mono text-sm"
                      placeholder="article-url-slug"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-black"
                    title="Regenerate from title"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                {formData.slug && (
                  <a
                    href={`/blog/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Preview: /blog/{formData.slug}
                  </a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none bg-white cursor-pointer"
                >
                  {categories.filter((c) => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="作者名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">发布设置</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setPublishMode('now')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      publishMode === 'now'
                        ? 'border-black bg-gray-50 text-gray-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    立即发布
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishMode('scheduled')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      publishMode === 'scheduled'
                        ? 'border-black bg-gray-50 text-gray-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    定时发布
                  </button>
                </div>
                {publishMode === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        日期 (30天内)
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        min={getTodayStr()}
                        max={getMaxDateStr()}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        时间
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                      />
                    </div>
                    {scheduleDate && (
                      <p className="col-span-2 text-xs text-gray-500">
                        将于 {scheduleDate} {scheduleTime} 自动上线
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">图片 ({formData.images.length}/{MAX_IMAGES})</label>
                <div className="flex flex-wrap gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img src={img} alt={`Image ${index}`} className="w-full h-full object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < MAX_IMAGES && (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                      <Image className="w-6 h-6 text-gray-400" />
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">音频上传</label>
                {formData.audio ? (
                  <div className="flex items-center space-x-3">
                    <span className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 truncate">
                      {formData.audio}
                    </span>
                    <button
                      onClick={() => setFormData({ ...formData, audio: '' })}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    {formData.audioUploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-500">上传中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Music className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-500">点击上传音频文件</span>
                      </div>
                    )}
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频上传</label>
                {formData.video ? (
                  <div className="flex items-center space-x-3">
                    <span className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 truncate">
                      {formData.video}
                    </span>
                    <button
                      onClick={() => setFormData({ ...formData, video: '' })}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-colors"
                    >
                      移除
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    {formData.videoUploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-500">上传中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Video className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-500">点击上传视频文件</span>
                      </div>
                    )}
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容 (英文) <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.contentEn}
                  onChange={(content) => setFormData({ ...formData, contentEn: content })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
