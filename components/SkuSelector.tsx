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
  onSelect: (sku: SKU | undefined) => void;
  disabled?: boolean;
}

export default function SkuSelector({ variants, specs, onSelect, disabled }: SkuSelectorProps) {
  // 当前选择的规格
  const [selected, setSelected] = useState<Record<string, string>>({});

  // 根据已选规格找到匹配的 SKU
  const matchedSku = useMemo(() => {
    if (!variants || variants.length === 0) return undefined;

    // Nothing picked yet: default to first variant so the Preview image
    // and price show immediately on page load.
    if (Object.keys(selected).length === 0) return variants[0];

    // 找到第一个所有已选规格都匹配的 SKU
    return variants.find((sku) => {
      return Object.entries(selected).every(
        ([key, val]) =>
          key === '__name' ? sku.name === val : sku.attributes?.[key] === val
      );
    });
  }, [variants, selected]);

  // Always propagate the matched SKU — defaults to first variant on load.
  // Also sync internal `selected` state so the SKU buttons show as active.
  useEffect(() => {
    if (!matchedSku) return;
    if (Object.keys(selected).length === 0) {
      // Page load: pick first variant AND mark its attributes as selected
      // so the SKU buttons render with active state.
      const defaultSel: Record<string, string> = {};
      if (matchedSku.attributes?.color) defaultSel.color = matchedSku.attributes.color;
      if (matchedSku.attributes?.size) defaultSel.size = matchedSku.attributes.size;
      if (matchedSku.attributes?.material) defaultSel.material = matchedSku.attributes.material;
      if (matchedSku.attributes?.packaging) defaultSel.packaging = matchedSku.attributes.packaging;
      if (Object.keys(defaultSel).length === 0) defaultSel.__name = matchedSku.name;
      setSelected(defaultSel);
    }
    onSelect(matchedSku);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedSku]);

  // 规格维度配置
  const dimensions = useMemo(() => {
    const dims: { key: string; label: string; values: string[] }[] = [];
    if (specs?.colors?.length) dims.push({ key: 'color', label: 'Color', values: specs.colors });
    if (specs?.sizes?.length) dims.push({ key: 'size', label: 'Size', values: specs.sizes });
    if (specs?.materials?.length) dims.push({ key: 'material', label: 'Material', values: specs.materials });
    if (specs?.packagings?.length) dims.push({ key: 'packaging', label: 'Packaging', values: specs.packagings });
    // 兜底：SKU 没有填写颜色/尺寸等标准维度时，用 SKU 名称作为「款式」维度
    if (dims.length === 0 && variants.length > 1) {
      const names = variants.map((v) => v.name).filter(Boolean);
      if (names.length) dims.push({ key: '__name', label: 'Style', values: names });
    }
    return dims;
  }, [specs, variants]);

  // 维度值匹配（__name 维度按 SKU 名称匹配，其余按 attributes 匹配）
  const skuMatchesDim = (sku: SKU, key: string, val: string) =>
    key === '__name' ? sku.name === val : sku.attributes?.[key] === val;

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

  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div key={dim.key}>
          <div className="text-xs text-gray-500 mb-2">{dim.label}</div>
          <div className="flex flex-wrap gap-2">
            {dim.values.map((val) => {
              const isSelected = selected[dim.key] === val;
              const sku = variants.find((v) => skuMatchesDim(v, dim.key, val));
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
                  {sku && sku.price > 0 && dim.key !== '__name' && (
                    <span className="ml-1 opacity-70">+${(sku.price - (matchedSku?.price || sku.price)).toFixed(2)}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
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
