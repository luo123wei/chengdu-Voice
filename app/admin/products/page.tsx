'use client';
import { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, X, Save, Image } from 'lucide-react';
import type { Product } from '@/data/mockData';
import { useProducts } from '@/hooks/useDataStore';
import RichTextEditor from '@/components/RichTextEditor';

const categoryMap: Record<string, string> = {
  stationery: '文具纸品',
  home: '家居生活',
  decor: '装饰摆件',
  toy: '玩偶潮玩',
};

const categories = [
  { value: 'stationery', label: '文具纸品' },
  { value: 'home', label: '家居生活' },
  { value: 'decor', label: '装饰摆件' },
  { value: 'toy', label: '玩偶潮玩' },
];

const statusOptions = [
  { value: 'design', label: '投票中 · 设计中' },
  { value: 'preorder', label: '预售' },
  { value: 'on-sale', label: '在售' },
];

const statusMap: Record<string, string> = {
  design: '投票中',
  preorder: '预售',
  'on-sale': '在售',
};

const types = [
  { value: 'physical', label: '实体产品' },
  { value: 'digital', label: '数字产品' },
];

// ISO 时间 → datetime-local 输入框值(本地时区)
function isoToLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: 0,
    originalPrice: 0,
    category: 'decor' as 'stationery' | 'home' | 'decor' | 'toy',
    type: 'physical' as 'physical' | 'digital',
    images: [] as string[],
    stock: 0,
    rating: 0,
    reviews: 0,
    tags: [] as string[],
    unit: 0 as number | undefined,
    unitType: '',
    story: '',
    culture: '',
    howToUse: '',
    status: 'on-sale' as 'design' | 'preorder' | 'on-sale',
    votesCount: 0,
    preorderEndLocal: '',   // datetime-local 输入值
    onSaleAtLocal: '',
  });

  const { products: productList, addProduct, updateProduct, deleteProduct } = useProducts(false);

  const filteredProducts = productList.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        nameEn: product.nameEn,
        description: product.description,
        descriptionEn: product.descriptionEn,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        category: product.category,
        type: product.type,
        images: product.images,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        tags: [...product.tags],
        unit: product.unit,
        unitType: product.unitType || '',
        story: product.story || '',
        culture: product.culture || '',
        howToUse: product.howToUse || '',
        status: product.status || 'on-sale',
        votesCount: product.votesCount || 0,
        preorderEndLocal: isoToLocalInput(product.preorderEnd),
        onSaleAtLocal: isoToLocalInput(product.onSaleAt),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        price: 0,
        originalPrice: 0,
        category: 'decor',
        type: 'physical',
        images: [],
        stock: 0,
        rating: 0,
        reviews: 0,
        tags: [],
        unit: undefined,
        unitType: '',
        story: '',
        culture: '',
        howToUse: '',
        status: 'on-sale',
        votesCount: 0,
        preorderEndLocal: '',
        onSaleAtLocal: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.nameEn || !formData.price) {
      alert('请填写必填字段');
      return;
    }

    // 预售时间校验与转换(datetime-local → ISO)
    let preorderEnd: string | undefined;
    let onSaleAt: string | undefined;
    if (formData.status === 'preorder') {
      const preEnd = formData.preorderEndLocal ? new Date(formData.preorderEndLocal).getTime() : NaN;
      const onSale = formData.onSaleAtLocal ? new Date(formData.onSaleAtLocal).getTime() : NaN;
      if (isNaN(preEnd) || isNaN(onSale)) {
        alert('预售产品必须设置「预售截止时间」和「开始销售时间」');
        return;
      }
      if (onSale <= preEnd) {
        alert('开始销售时间必须晚于预售截止时间');
        return;
      }
      preorderEnd = new Date(preEnd).toISOString();
      onSaleAt = new Date(onSale).toISOString();
    }

    const productData: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      ...formData,
      rating: parseFloat(formData.rating.toString()) || 0,
      unit: formData.unit === undefined || formData.unit === null || isNaN(formData.unit) ? undefined : formData.unit,
      unitType: formData.unitType || undefined,
      story: formData.story,
      culture: formData.culture,
      howToUse: formData.howToUse,
      status: formData.status,
      votesCount: editingProduct?.votesCount ?? formData.votesCount ?? 0, // 保留真实票数,不被表单覆盖
      preorderEnd,
      onSaleAt,
    } as Product;

    try {
      if (editingProduct) {
        await updateProduct(productData);
      } else {
        await addProduct(productData);
      }
      handleCloseModal();
    } catch (error: any) {
      alert(`保存失败：${error?.message || error}`);
      console.error('Save failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { compressImageToFile } = await import('@/lib/imageUtils');
      const compressedFile = await compressImageToFile(file, 1920);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, result.url],
        }));
      } else {
        alert(result.error || '上传失败');
      }
    } catch (error) {
      alert('上传失败，请重试');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const commonTags = ['organic', 'premium', 'authentic', 'traditional', 'handmade', 'art', 'spicy', 'easy-cook', 'gift', 'cute', 'digital', 'audio'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-800">产品管理</h1>
          <p className="text-gray-600 mt-1">查看和管理您的产品库存</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加产品</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索产品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            <span>筛选</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">库存</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态/票数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.images[0]}
                        alt={product.nameEn}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{product.nameEn}</p>
                        <p className="text-sm text-gray-500">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-black">${product.price}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-800">{product.stock}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {categoryMap[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'design' ? 'bg-white border border-black text-black'
                        : product.status === 'preorder' ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {statusMap[product.status || 'on-sale']}
                    </span>
                    {product.status === 'design' && (
                      <span className="ml-2 text-xs text-gray-500">🗳 {product.votesCount || 0}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? '编辑产品' : '添加产品'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品名称（中文）*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="例如：蒙顶山茶"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品名称（英文）*</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="例如：Mengding Mountain Tea"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品描述（中文）</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  rows={3}
                  placeholder="请输入产品描述"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品描述（英文）</label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">价格 ($)*</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">原价 ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">规格单位</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={formData.unit === undefined ? '' : formData.unit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setFormData({ ...formData, unit: undefined });
                        } else {
                          const num = parseFloat(val);
                          setFormData({ ...formData, unit: isNaN(num) ? formData.unit : num });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="150"
                    />
                    <input
                      type="text"
                      value={formData.unitType}
                      onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                      placeholder="g / ml / 个"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'physical' | 'digital' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  >
                    {types.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 产品生命周期 */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'design' | 'preorder' | 'on-sale' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                {formData.status === 'preorder' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">预售截止时间 *</label>
                      <input
                        type="datetime-local"
                        value={formData.preorderEndLocal}
                        onChange={(e) => setFormData({ ...formData, preorderEndLocal: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">开始销售时间 *</label>
                      <input
                        type="datetime-local"
                        value={formData.onSaleAtLocal}
                        onChange={(e) => setFormData({ ...formData, onSaleAtLocal: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </>
                )}
                {formData.status === 'design' && (
                  <div className="md:col-span-2 flex items-center">
                    <p className="text-sm text-gray-500">
                      投票中产品不显示价格与购买按钮,前台展示票数与「我想要它」按钮。票数:
                      <b className="text-black ml-1">{editingProduct?.votesCount ?? 0}</b>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品图片</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Image ${index}`} className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center space-x-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-black hover:bg-gray-100 transition-colors cursor-pointer">
                  <Image className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">点击上传图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">The Story（故事）</label>
                <RichTextEditor
                  value={formData.story}
                  onChange={(content) => setFormData({ ...formData, story: content })}
                  placeholder="请输入产品故事..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cultural Significance（文化意义）</label>
                <RichTextEditor
                  value={formData.culture}
                  onChange={(content) => setFormData({ ...formData, culture: content })}
                  placeholder="请输入文化意义描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How to Use（使用方法）</label>
                <RichTextEditor
                  value={formData.howToUse}
                  onChange={(content) => setFormData({ ...formData, howToUse: content })}
                  placeholder="请输入使用方法..."
                />
              </div>
            </div>

            <div className="flex justify-end p-6 border-t space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                {editingProduct ? '保存修改' : '添加产品'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}