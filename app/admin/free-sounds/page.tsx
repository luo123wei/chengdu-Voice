'use client';

import { useState, useEffect } from 'react';
import { Music, Plus, Edit, Trash2, Search, X, Save, Upload, Link, CheckCircle } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';

interface FreeSound {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  duration: string;
  audio: string;
  culturalStory?: string;
}

export default function AdminFreeSounds() {
  const [sounds, setSounds] = useState<FreeSound[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSound, setEditingSound] = useState<FreeSound | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    audio: '',
    description: '',
    culturalStory: '',
  });

  const fetchSounds = async () => {
    const res = await fetch('/api/free-sounds?limit=100&page=1');
    const data = await res.json();
    if (data.success) {
      setSounds(data.data);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  const filteredSounds = sounds.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.titleEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (sound?: FreeSound) => {
    if (sound) {
      setEditingSound(sound);
      setUploadMode(sound.audio.startsWith('/') ? 'file' : 'url');
      setFormData({
        title: sound.titleEn,
        duration: sound.duration,
        audio: sound.audio,
        description: sound.description || '',
        culturalStory: sound.culturalStory || '',
      });
    } else {
      setEditingSound(null);
      setUploadMode('file');
      setFormData({
        title: '',
        duration: '',
        audio: '',
        description: '',
        culturalStory: '',
      });
    }
    setUploading(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSound(null);
    setUploading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload-audio', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await res.json();
      if (result.success) {
        setFormData({ ...formData, audio: result.data.url });
      } else {
        alert(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.audio) {
      alert('请上传音频文件或输入音频链接');
      return;
    }

    setSaving(true);

    try {
      let res;
      const payload = {
        title: formData.title,
        titleEn: formData.title,
        duration: formData.duration,
        audio: formData.audio,
        description: formData.description,
        culturalStory: formData.culturalStory,
      };

      if (editingSound) {
        res = await fetch('/api/free-sounds', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSound.id, ...payload }),
        });
      } else {
        res = await fetch('/api/free-sounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || '保存失败');
      }

      fetchSounds();
      handleCloseModal();
    } catch (error: any) {
      console.error('保存失败:', error);
      alert('保存失败: ' + (error.message || '请重试'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个声音吗？')) {
      await fetch(`/api/free-sounds?id=${id}`, { method: 'DELETE' });
      fetchSounds();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Free Sounds 管理</h1>
            <p className="text-sm text-gray-500">管理免费声音列表</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加声音</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索声音..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时长</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSounds.map((sound) => (
              <tr key={sound.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-800">{sound.titleEn}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-500">{sound.duration}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(sound)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sound.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSounds.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无声音数据</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {editingSound ? '编辑声音' : '添加声音'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form id="sound-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  English Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="例如：Birdsong at Qingcheng Mountain"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  时长 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="例如：03:45"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  音频 <span className="text-red-500">*</span>
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      uploadMode === 'file' ? 'bg-white shadow text-black' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>上传文件</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      uploadMode === 'url' ? 'bg-white shadow text-black' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>输入链接</span>
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploading ? (
                      <div>
                        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-600">上传中...</p>
                      </div>
                    ) : formData.audio.startsWith('/') ? (
                      <div>
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600">{formData.audio.split('/').pop()}</p>
                        <p className="text-sm text-gray-400 mt-1">点击重新上传</p>
                      </div>
                    ) : (
                      <div>
                        <Music className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">点击上传音频文件</p>
                        <p className="text-xs text-gray-400 mt-1">支持 MP3、WAV、OGG（最大50MB）</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.audio}
                    onChange={(e) => setFormData({ ...formData, audio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="例如：https://example.com/audio.mp3"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述 <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="输入声音描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Story / 文化故事 <span className="text-gray-400 text-xs">(可选)</span>
                </label>
                <RichTextEditor
                  value={formData.culturalStory}
                  onChange={(content) => setFormData({ ...formData, culturalStory: content })}
                  placeholder="详细介绍这个声音背后的文化故事..."
                />
              </div>
            </form>

            <div className="flex space-x-3 p-6 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                form="sound-form"
                disabled={uploading || saving}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '保存中...' : editingSound ? '保存修改' : '添加声音'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}