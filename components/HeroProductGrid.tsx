'use client';

import { useState } from 'react';

interface ProductData {
  id: string;
  name: string;
  nameEn: string;
  images: string[];
  status?: string;
}

export default function HeroProductGrid({ products }: { products: ProductData[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = products[activeIndex];

  if (!active) return null;

  return (
    <div>
      <div className="relative bg-cream">
        <img
          src={active.images[0]}
          alt={active.nameEn}
          className="w-full aspect-[3/4] object-contain"
        />
        <div className="absolute left-4 bottom-4 bg-white border border-gray-200 px-3.5 py-2 text-xs">
          {activeIndex + 1 === 1 ? '① 首款作品' : `预售作品 ${activeIndex + 1}`} · {active.nameEn} {active.name} · 预售中
        </div>
      </div>

      {products.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {products.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden border-2 bg-cream transition-all ${
                i === activeIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={p.images[0]}
                alt={p.nameEn}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
