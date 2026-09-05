import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Product } from '@/data/mockData';
import { VoteButton, PreorderBlock } from './IntentButtons';
import { statusBadge } from '@/lib/productStatus';

// 产品卡片:按生命周期状态渲染(投票中/预售/在售),首页与 Shop 页共用
export default function ProductCard({ product }: { product: Product }) {
  const badge = statusBadge(product);
  const status = product.status || 'on-sale';

  return (
    <div className="group bg-white border border-gray-200 hover:border-black transition-colors flex flex-col">
      <Link
        href={`/shop/${product.id}`}
        className="block relative aspect-square overflow-hidden bg-cream"
      >
        <img
          src={product.images[0]}
          alt={product.nameEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-3 left-3 text-[11px] px-2.5 py-1 tracking-wide ${badge.cls}`}>
          {badge.label}
        </span>
      </Link>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <Link href={`/shop/${product.id}`}>
          <h3 className="font-semibold text-sm text-gray-900 group-hover:text-black transition-colors line-clamp-1">
            {product.nameEn}
          </h3>
        </Link>
        <p className="text-xs text-gray-400">{product.name}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {product.descriptionEn}
        </p>

        {status === 'design' && (
          <div className="mt-2.5">
            <VoteButton productId={product.id} initialVotes={product.votesCount || 0} />
          </div>
        )}

        {status === 'preorder' && (
          <div className="mt-2.5">
            <div className="font-serif text-lg font-bold text-black mb-1">${product.price}</div>
            <PreorderBlock product={product} />
          </div>
        )}

        {status === 'on-sale' && (
          <div className="mt-2.5">
            {product.reviews > 0 && (
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-black fill-black' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="font-serif text-lg font-bold text-black">${product.price}</span>
              <Link
                href={`/shop/${product.id}`}
                className="text-xs px-3 py-1.5 border border-black hover:bg-black hover:text-white transition-colors"
              >
                加入购物车
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
