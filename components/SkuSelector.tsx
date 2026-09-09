'use client';

import { useMemo, useState, useEffect } from 'react';
import type { SKU } from '@/data/mockData';

interface SkuSelectorProps {
  productId: string;
  variants: SKU[];
  specs?: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
    packagings?: string[];
  };
  onSelect: (sku: SKU) => void;
  disabled?: boolean;
}

export default function SkuSelector({ variants, specs, onSelect, disabled }: SkuSelectorProps) {
  // 当前选择的规格
  const [selected, setSelected] = useState<Record<string, string>>({});

  // 根据已选规格找到匹配的 SKU
  const matchedSku = useMemo(() => {
    if (!variants || variants.length === 0) return undefined;
    if (variants.length === 1) return variants[0];

    // 找到第一个所有已选规格都匹配的 SKU
    return variants.find((sku) => {
      return Object.entries(selected).every(
        ([key, val]) => sku.attributes[key] === val
      );
    });
  }, [variants, selected]);

  // 自动选中第一个 SKU
  useEffect(() => {
    if (variants.length > 0 && !matchedSku) {
      onSelect(variants[0]);
    } else if (matchedSku) {
      onSelect(matchedSku);
    }
  }, [matchedSku, variants]);

  // 规格维度配置
  const dimensions = useMemo(() => {
    if (!specs) return [];
    const dims: { key: string; label: string; values: string[] }[] = [];
    if (specs.colors?.length) dims.push({ key: 'color', label: '颜色 Color', values: specs.colors });
    if (specs.sizes?.length) dims.push({ key: 'size', label: '尺寸 Size', values: specs.sizes });
    if (specs.materials?.length) dims.push({ key: 'material', label: '材质 Material', values: specs.materials });
    if (specs.packagings?.length) dims.push({ key: 'packaging', label: '包装 Packaging', values: specs.packagings });
    return dims;
  }, [specs]);

  if (variants.length <= 1) return null;

  const handleSelect = (dimKey: string, value: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[dimKey] === value) {
        delete next[dimKey]; // 取消选中
      } else {
        next[dimKey] = value;
      }
      return next;
    });
  };

  // 计算价格区间
  const priceRange = useMemo(() => {
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }, [variants]);

  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div key={dim.key}>
          <div className="text-xs text-gray-500 mb-2">{dim.label}</div>
          <div className="flex flex-wrap gap-2">
            {dim.values.map((val) => {
              const isSelected = selected[dim.key] === val;
              const sku = variants.find(
                (v) => v.attributes[dim.key] === val
              );
              const outOfStock = sku && sku.stock === 0;

              return (
                <button
                  key={val}
                  onClick={() => handleSelect(dim.key, val)}
                  disabled={disabled || outOfStock}
                  className={`px-4 py-2 text-sm border transition-all ${
                    outOfStock
                      ? 'border-gray-200 text-gray-300 line-through cursor-not-allowed'
                      : isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  {val}
                  {sku && sku.price > 0 && (
                    <span className="ml-1 opacity-70">+${(sku.price - (matchedSku?.price || sku.price)).toFixed(2)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 价格/库存提示 */}
      <div className="flex items-center justify-between pt-2 text-sm">
        {matchedSku ? (
          <>
            <span>
              价格：<span className="font-semibold text-red-600">${matchedSku.price.toFixed(2)}</span>
            </span>
            <span className={matchedSku.stock === 0 ? 'text-red-500' : 'text-gray-500'}>
              {matchedSku.stock === 0 ? '暂时缺货' : `库存 ${matchedSku.stock}`}
            </span>
          </>
        ) : (
          <span className="text-gray-400">
            价格区间：{priceRange} · 请选择规格
          </span>
        )}
      </div>
    </div>
  );
}

// 工具：从 variants 数组推断 specs
export function inferSpecsFromVariants(variants: SKU[]): SkuSelectorProps['specs'] {
  if (!variants?.length) return undefined;
  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();
  const packagings = new Set<string>();
  variants.forEach((v) => {
    if (v.attributes.color) colors.add(v.attributes.color);
    if (v.attributes.size) sizes.add(v.attributes.size);
    if (v.attributes.material) materials.add(v.attributes.material);
    if (v.attributes.packaging) packagings.add(v.attributes.packaging);
  });
  return {
    colors: colors.size ? Array.from(colors) : undefined,
    sizes: sizes.size ? Array.from(sizes) : undefined,
    materials: materials.size ? Array.from(materials) : undefined,
    packagings: packagings.size ? Array.from(packagings) : undefined,
  };
}
