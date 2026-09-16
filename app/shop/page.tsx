import { Metadata } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopPageClient from '@/components/ShopPageClient';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chengdu Gifts & Souvenirs | Voice Culture',
  description: 'Voice Culture creates small-batch objects inspired by Chengdu culture — panda gifts, tea ware, wax seal stamps, and cultural souvenirs shipped worldwide.',
  alternates: { canonical: 'https://www.voiceculture.world/shop' },
};

export default async function ShopPage() {
  const products = await db.products.getAll();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ShopPageClient products={products} />
      </Suspense>
      <Footer />
    </div>
  );
}
