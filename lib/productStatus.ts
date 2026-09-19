import type { Product } from '@/data/mockData';

// 预售状态统一判定(前台展示与按钮状态同源)
// open: 预售中,可登记; waiting: 预售截止,等待开售; onsale: 已到开售时间
export type PreorderState = 'open' | 'waiting' | 'onsale';

export function getPreorderState(product: Product, now: number = Date.now()): PreorderState {
  const preEnd = product.preorderEnd ? new Date(product.preorderEnd).getTime() : 0;
  const onSale = product.onSaleAt ? new Date(product.onSaleAt).getTime() : 0;
  if (!preEnd || !onSale) return 'open';
  if (now < preEnd) return 'open';
  if (now < onSale) return 'waiting';
  return 'onsale';
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

// 倒计时:X天Y小时(小于1天显示小时)
export function countdown(iso?: string, now: number = Date.now()): string {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'Closed';
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

// 产品生命周期徽章
export function statusBadge(product: Product, now: number = Date.now()): { label: string; cls: string } {
  if (product.status === 'design') {
    return { label: 'VOTING', cls: 'bg-white text-black border border-black' };
  }
  if (product.status === 'preorder') {
    return getPreorderState(product, now) === 'waiting'
      ? { label: 'COMING SOON', cls: 'bg-black text-white' }
      : { label: 'PRE-ORDER', cls: 'bg-black text-white' };
  }
  return { label: 'IN STOCK', cls: 'bg-cream text-gray-500 border border-gray-200' };
}
