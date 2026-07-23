import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

async function CheckoutContent() {
  const CheckoutPage = (await import('@/components/CheckoutPage')).default;
  return <CheckoutPage />;
}

export default function CheckoutPageWrapper() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}