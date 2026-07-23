'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Download, Mail, Globe, FileText, Check, MessageSquare, Truck, Plus, Trash2, Lock, Eye, EyeOff, Image, Upload, X } from 'lucide-react';
import { useSettings, useShippingRates } from '@/hooks/useDataStore';

export interface CustomShippingRate {
  country: string;
  standard: number;
  express: number;
  freeThreshold: number;
}

export default function AdminSettings() {
  const { settings, loading: settingsLoading, saveSettings } = useSettings();
  const { rates: shippingRates, loading: ratesLoading, saveRates } = useShippingRates();
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);

  const [localSettings, setLocalSettings] = useState(settings);
  const [localRates, setLocalRates] = useState<CustomShippingRate[]>(shippingRates);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (shippingRates) {
      setLocalRates(shippingRates);
    }
  }, [shippingRates]);

  const handleSave = async () => {
    await saveSettings(localSettings);
    await saveRates(localRates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordChanging(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordSaved(true);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSaved(false), 5000);
      } else {
        setPasswordError(data.error || '修改密码失败');
      }
    } catch (error) {
      setPasswordError('网络错误，请重试');
    } finally {
      setPasswordChanging(false);
    }
  };

  const updateShippingRate = (index: number, field: keyof CustomShippingRate, value: string | number) => {
    const updatedRates = [...localRates];
    if (field === 'country') {
      updatedRates[index][field] = String(value);
    } else {
      updatedRates[index][field] = typeof value === 'number' ? value : parseFloat(value) || 0;
    }
    setLocalRates(updatedRates);
  };

  const addShippingRate = () => {
    setLocalRates([...localRates, { country: '', standard: 5.99, express: 12.99, freeThreshold: 49.99 }]);
  };

  const removeShippingRate = (index: number) => {
    if (localRates.length > 1) {
      setLocalRates(localRates.filter((_, i) => i !== index));
    }
  };

  if (settingsLoading || ratesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">系统设置</h1>
          <p className="text-gray-600 mt-1">管理网站的系统配置</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">网站基本信息</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
              <input
                type="text"
                value={localSettings.siteName}
                onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="网站名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
              <input
                type="text"
                value={localSettings.siteDescription}
                onChange={(e) => setLocalSettings({ ...localSettings, siteDescription: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="网站描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">网站 URL</label>
              <input
                type="text"
                value={localSettings.appUrl}
                onChange={(e) => setLocalSettings({ ...localSettings, appUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="https://your-domain.com"
              />
              <p className="text-xs text-gray-400 mt-1">用于生成邮件中的链接</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Image className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">首页 Banner 图片</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner 背景图片</label>
              <div className="relative">
                <input
                  type="text"
                  value={localSettings.bannerImage}
                  onChange={(e) => setLocalSettings({ ...localSettings, bannerImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="https://your-image-url.com/banner.jpg"
                />
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-amber-500 transition-colors">
              <div className="flex flex-col items-center justify-center py-8">
                {localSettings.bannerImage && (
                  <div className="relative w-full max-w-md mb-4">
                    <img
                      src={localSettings.bannerImage}
                      alt="Banner Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setLocalSettings({ ...localSettings, bannerImage: '' })}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">点击或拖拽上传图片</p>
                <p className="text-xs text-gray-400">支持 JPG, PNG, WebP 格式，推荐尺寸 1920x1080</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append('file', file);

                  try {
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });

                    const data = await response.json();
                    if (data.url) {
                      setLocalSettings({ ...localSettings, bannerImage: data.url });
                    }
                  } catch (error) {
                    console.error('Upload failed:', error);
                  }
                }}
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>提示：</strong>您可以直接输入图片 URL，或点击上方区域上传图片。上传的图片将自动保存到服务器。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Download className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">下载链接配置</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">《成都声音地图》下载链接</label>
              <input
                type="text"
                value={localSettings.downloadLink}
                onChange={(e) => setLocalSettings({ ...localSettings, downloadLink: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="https://cdn.your-domain.com/chengdu-sound-map.zip"
              />
              <p className="text-xs text-gray-400 mt-1">用户订阅后收到的下载链接</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>提示：</strong>您可以使用国内云存储（如阿里云 OSS、腾讯云 COS）存储文件。
                部署到国外服务器时，用户仍然可以正常访问国内链接下载文件。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Mail className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">邮件配置</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发件人名称</label>
              <input
                type="text"
                value={localSettings.mailFrom}
                onChange={(e) => setLocalSettings({ ...localSettings, mailFrom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Chengdu Voice <hello@chengduvoice.com>"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                SMTP 服务器配置需在 <code className="bg-gray-200 px-2 py-1 rounded">.env</code> 文件中修改：
              </p>
              <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-3 rounded">
                MAIL_HOST=smtp.sendgrid.net
                MAIL_PORT=587
                MAIL_SECURE=false
                MAIL_USER=apikey
                MAIL_PASS=your_sendgrid_api_key
              </pre>
              <p className="text-xs text-blue-600 mt-2">
                推荐使用 SendGrid（海外服务器），注册地址：<a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">Google Analytics</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GA4 测量 ID</label>
              <input
                type="text"
                value={localSettings.gaMeasurementId}
                onChange={(e) => setLocalSettings({ ...localSettings, gaMeasurementId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-gray-400 mt-1">格式：G-XXXXXXXXXX，如 G-1234567890</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>如何获取 GA4 测量 ID：</strong>
              </p>
              <ol className="mt-2 text-xs text-blue-700 space-y-1">
                <li>1. 访问 <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Analytics</a></li>
                <li>2. 创建或选择您的 GA4 媒体资源</li>
                <li>3. 进入「管理」→「数据流」→「Web」</li>
                <li>4. 在「测量 ID」字段中找到您的 ID</li>
                <li>5. 将 ID 复制粘贴到上方输入框</li>
              </ol>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>配置后可追踪：</strong>
              </p>
              <ul className="mt-2 text-xs text-green-700 space-y-1">
                <li>• 网站访问量和用户行为分析</li>
                <li>• 产品页面转化和购物行为</li>
                <li>• 订单完成率和收入统计</li>
                <li>• 邮件订阅和下载转化</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Truck className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">邮费配置</h2>
          </div>

          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">国家/地区</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">标准运费 ($)</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">加急运费 ($)</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">免运费门槛 ($)</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {localRates.map((rate, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={rate.country}
                          onChange={(e) => updateShippingRate(index, 'country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                          placeholder="Country Name"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={rate.standard}
                          onChange={(e) => updateShippingRate(index, 'standard', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={rate.express}
                          onChange={(e) => updateShippingRate(index, 'express', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={rate.freeThreshold}
                          onChange={(e) => updateShippingRate(index, 'freeThreshold', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => removeShippingRate(index)}
                          disabled={localRates.length <= 1}
                          className="flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addShippingRate}
              className="flex items-center px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加国家/地区
            </button>

            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>邮费规则：</strong>
              </p>
              <ul className="mt-2 text-xs text-amber-700 space-y-1">
                <li>• 虚拟产品（如白噪音专辑）不产生邮费</li>
                <li>• 实体产品根据目的地国家计算邮费</li>
                <li>• 当订单金额达到免运费门槛时，自动免邮</li>
                <li>• "Other" 作为默认选项，适用于未列出的国家</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">文件上传</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>支持的文件类型：</strong>
              </p>
              <ul className="mt-2 text-xs text-green-700 space-y-1">
                <li>• 图片：JPG, PNG, GIF, WebP（最大 10MB）</li>
                <li>• 音频：MP3, WAV, OGG（最大 50MB）</li>
                <li>• 视频：MP4, WebM（最大 200MB）</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>跨境部署建议：</strong>
              </p>
              <p className="mt-2 text-xs text-blue-700">
                您可以使用国内云存储服务存储媒体文件，然后在后台上传文件获取链接。
                国外用户访问网站时，通过 CDN 加速或直接访问国内链接均可正常播放。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-800">订单确认邮件模板</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮件标题（英文）</label>
              <input
                type="text"
                value={localSettings.orderEmailSubjectEn}
                onChange={(e) => setLocalSettings({ ...localSettings, orderEmailSubjectEn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Your Order Has Been Confirmed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮件标题（中文）</label>
              <input
                type="text"
                value={localSettings.orderEmailSubjectZh}
                onChange={(e) => setLocalSettings({ ...localSettings, orderEmailSubjectZh: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="您的订单已确认"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮件内容（英文）</label>
              <textarea
                value={localSettings.orderEmailBodyEn}
                onChange={(e) => setLocalSettings({ ...localSettings, orderEmailBodyEn: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                rows={6}
                placeholder="Dear {customerName},..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {'{customerName}'} - 客户姓名
                </span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {'{orderNumber}'} - 订单号
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮件内容（中文）</label>
              <textarea
                value={localSettings.orderEmailBodyZh}
                onChange={(e) => setLocalSettings({ ...localSettings, orderEmailBodyZh: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                rows={6}
                placeholder="尊敬的 {customerName}，..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {'{customerName}'} - 客户姓名
                </span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {'{orderNumber}'} - 订单号
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>使用说明：</strong>在邮件内容中可以使用以下变量，系统会自动替换为实际值：
            </p>
            <ul className="mt-2 text-xs text-amber-700 space-y-1">
              <li>• <code>{'{customerName}'}</code> - 客户姓名</li>
              <li>• <code>{'{orderNumber}'}</code> - 订单号</li>
              <li>• <code>{'{total}'}</code> - 订单总额</li>
              <li>• 邮件会自动包含订单详情表格和配送信息</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Lock className="w-6 h-6 text-amber-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">修改密码</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="输入当前密码"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="输入新密码（至少6位）"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="再次输入新密码"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {passwordError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {passwordError}
          </div>
        )}

        {passwordSaved && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
            <Check className="w-5 h-5 mr-2" />
            密码修改成功！请使用新密码重新登录。
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={passwordChanging}
            className={`flex items-center px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors ${
              passwordChanging ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {passwordChanging ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                修改密码
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center px-8 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors ${
            saved ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          {saved ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              已保存
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              保存设置
            </>
          )}
        </button>
      </div>
    </div>
  );
}