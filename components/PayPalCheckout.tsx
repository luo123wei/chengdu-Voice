'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    paypal?: any;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

// PayPal JS SDK 沙箱和正式环境都从 www.paypal.com 加载，环境由 client-id 决定
function loadPayPalScript(clientId: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.paypal) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById('paypal-sdk-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('PayPal SDK failed to load'));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

interface PaidDetails {
  orderId: string;
  transactionId?: string;
  orderNumber?: string;
}

interface PayPalCheckoutProps {
  // 点击 PayPal 按钮时调用：请求后端创建订单，返回 PayPal orderId / 内部订单号
  createOrder: () => Promise<{ orderId: string; orderNumber?: string }>;
  // 买家在 PayPal 弹窗内完成付款后调用
  onPaid: (details: PaidDetails) => void;
  // 任何环节失败时调用（用于在页面上展示错误）
  onError: (message: string) => void;
  disabled?: boolean;
  disabledHint?: string;
}

export default function PayPalCheckout({
  createOrder,
  onPaid,
  onError,
  disabled = false,
  disabledHint,
}: PayPalCheckoutProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<any>(null);
  const [sdkLoading, setSdkLoading] = useState(true);
  const [sdkError, setSdkError] = useState('');

  // 用 ref 持有最新回调，避免回调变化导致按钮整体重建
  const createOrderRef = useRef(createOrder);
  const onPaidRef = useRef(onPaid);
  const onErrorRef = useRef(onError);
  createOrderRef.current = createOrder;
  onPaidRef.current = onPaid;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || disabled) {
      setSdkLoading(false);
      return;
    }

    let cancelled = false;
    setSdkLoading(true);
    setSdkError('');

    loadPayPalScript(clientId)
      .then(() => {
        if (cancelled || !window.paypal || !buttonContainerRef.current) return;
        setSdkLoading(false);

        buttonsRef.current = window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          createOrder: async () => {
            try {
              const result = await createOrderRef.current();
              return result.orderId;
            } catch (err) {
              // 创建订单失败（表单校验/网络/PayPal 拒绝），阻止弹窗打开
              console.error('PayPal createOrder error:', err);
              throw err;
            }
          },
          onApprove: async (data: { orderID?: string; orderId?: string }) => {
            const paypalOrderId = data.orderID || data.orderId || '';
            try {
              const res = await fetch('/api/payment/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: paypalOrderId }),
              });
              const json = await res.json();
              if (!res.ok || !json.success) {
                throw new Error(json.error || 'CAPTURE_FAILED');
              }
              onPaidRef.current({
                orderId: paypalOrderId,
                transactionId: json.transactionId,
              });
            } catch (err) {
              console.error('PayPal capture request error:', err);
              onErrorRef.current(
                err instanceof Error && err.message !== 'CAPTURE_FAILED'
                  ? err.message
                  : 'Payment could not be completed. Please try again or contact customer service.'
              );
            }
          },
          onError: (err: unknown) => {
            console.error('PayPal SDK onError:', err);
            onErrorRef.current('PayPal encountered an error. Please try again or choose another payment method.');
          },
          onCancel: () => {
            // 买家主动关闭弹窗，无需提示错误
          },
        });

        if (buttonsRef.current.isEligible()) {
          buttonsRef.current.render(buttonContainerRef.current);
        } else {
          setSdkError('PayPal is not available in this browser. Please contact customer service.');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSdkLoading(false);
          setSdkError(err?.message || 'Failed to load PayPal.');
        }
      });

    return () => {
      cancelled = true;
      if (buttonsRef.current) {
        try {
          buttonsRef.current.close?.();
        } catch {
          // ignore
        }
        buttonsRef.current = null;
      }
    };
  }, [clientId, disabled]);

  if (!clientId) {
    // 未配置 PayPal 时不渲染（父组件显示客服辅助结账兜底）
    return null;
  }

  if (disabled) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 text-center">
        {disabledHint || 'Please complete your information above to enable PayPal checkout.'}
      </div>
    );
  }

  return (
    <div>
      {sdkLoading && (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading PayPal...
        </div>
      )}
      {sdkError && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-3">{sdkError}</div>
      )}
      <div ref={buttonContainerRef} />
    </div>
  );
}
