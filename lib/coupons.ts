// 服务端折扣码定义与计算（仅在 API 路由中引用，切勿在客户端导入）
import { createClient } from '@supabase/supabase-js';

export type CouponCode = 'WELCOME10';

interface CouponDef {
  percent: number;          // 折扣百分比，10 = 9 折
  subscriberOnly: boolean;  // 必须是邮件订阅者
  label: string;
}

const COUPONS: Record<string, CouponDef> = {
  WELCOME10: { percent: 10, subscriberOnly: true, label: 'Newsletter welcome discount (10% off)' },
};

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function normalizeCode(code?: string | null): string {
  return String(code || '').trim().toUpperCase();
}

export function getCoupon(code?: string | null): CouponDef | null {
  return COUPONS[normalizeCode(code)] || null;
}

/** 计算折扣金额（仅按商品金额打折，不含运费/税） */
export function couponDiscount(code: string | undefined, subtotal: number): number {
  const def = getCoupon(code);
  if (!def || subtotal <= 0) return 0;
  return round2(Math.min(subtotal, subtotal * (def.percent / 100)));
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type CouponCheck =
  | { ok: true; code: string; percent: number; discount: number; label: string }
  | { ok: false; message: string };

/**
 * 校验折扣码：存在性 → 订阅者身份 → 是否已被该邮箱使用
 * 不在这里计算金额上限，discount 由调用方传入 subtotal 后回算
 */
export async function checkCoupon(
  rawCode: string | undefined,
  email: string | undefined,
  subtotal: number
): Promise<CouponCheck> {
  const code = normalizeCode(rawCode);
  const def = getCoupon(code);
  if (!def) {
    return { ok: false, message: 'Invalid discount code.' };
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, message: 'Enter your email above before applying the code.' };
  }

  const supabase = serviceClient();

  if (def.subscriberOnly) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', cleanEmail)
      .maybeSingle();
    if (!data) {
      return { ok: false, message: 'This code is for newsletter subscribers. Subscribe below (or at the bottom of the homepage) first.' };
    }
  }

  const { data: used } = await supabase
    .from('coupon_redemptions')
    .select('id')
    .eq('code', code)
    .eq('email', cleanEmail)
    .maybeSingle();
  if (used) {
    return { ok: false, message: 'This code has already been used with your email.' };
  }

  return {
    ok: true,
    code,
    percent: def.percent,
    discount: couponDiscount(code, subtotal),
    label: def.label,
  };
}

/** 核销折扣码（unique(code,email) 保证每邮箱一次；并发时第二次会失败） */
export async function redeemCoupon(
  code: string,
  email: string,
  orderNumber: string,
  amount: number
): Promise<{ ok: boolean; message?: string }> {
  const supabase = serviceClient();
  const { error } = await supabase
    .from('coupon_redemptions')
    .insert({
      code: normalizeCode(code),
      email: String(email).trim().toLowerCase(),
      order_number: orderNumber,
      amount: String(round2(amount)),
    });
  if (error) {
    return { ok: false, message: 'This discount code has already been used with your email.' };
  }
  return { ok: true };
}

/** 释放核销（PayPal 下单失败时回滚） */
export async function releaseCoupon(code: string, email: string): Promise<void> {
  const supabase = serviceClient();
  await supabase
    .from('coupon_redemptions')
    .delete()
    .eq('code', normalizeCode(code))
    .eq('email', String(email).trim().toLowerCase());
}
